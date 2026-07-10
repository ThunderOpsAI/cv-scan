import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { logCriticalError } from '@/lib/analytics/server';
import Stripe from 'stripe';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    // Fetch user before deletion to get Stripe customer ID
    const { data: userRecord } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (userRecord?.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2024-06-20" as any,
        });
        await stripe.customers.del(userRecord.stripe_customer_id);
      } catch (stripeErr) {
        console.error('Failed to delete Stripe customer:', stripeErr);
        await logCriticalError({
          workflow: 'account_deletion_stripe_cleanup',
          userId: session.user.id,
          supabase,
          error: stripeErr,
        });
      }
    }

    // Delete user storage items first since they do not cascade
    try {
      const { data: files } = await supabase.storage
        .from('resume_uploads')
        .list(session.user.id);
        
      if (files && files.length > 0) {
        const filePaths = files.map(file => `${session.user.id}/${file.name}`);
        const { error: storageError } = await supabase.storage
          .from('resume_uploads')
          .remove(filePaths);
          
        if (storageError) {
          console.error('Failed to delete user storage:', storageError);
          // Non-fatal, proceed with account deletion but log it
        }
      }
    } catch (storageErr) {
      console.error('Storage deletion error:', storageErr);
    }

    // Step 1: Delete public.users — cascades to all child app data tables
    // (credit_transactions, credit_ledger, generations, analytics_events,
    //  profile_facts, resume_versions, jobs, fit_analyses, generated_assets,
    //  profiles, experiences, bullets, education, skills, star_stories)
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', session.user.id);

    if (dbError) {
      console.error('Failed to delete account from public.users:', dbError);
      await logCriticalError({
        workflow: 'account_deletion',
        userId: session.user.id,
        supabase,
        error: dbError,
      });
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    // Step 2: Delete auth.users record (GDPR-aligned full erasure — resolves BA-2)
    // The service-role client is required for this call and is already in use above.
    const { error: authError } = await supabase.auth.admin.deleteUser(
      session.user.id
    );

    if (authError) {
      // Log the failure but do not return an error to the user — the app data
      // is already deleted. An ops team member can manually purge the orphaned
      // auth record if needed.
      console.error(
        'WARNING: public.users deleted but auth.users deletion failed. Orphaned auth record for user:',
        session.user.id,
        authError
      );
      await logCriticalError({
        workflow: 'account_deletion_auth_cleanup',
        userId: session.user.id,
        supabase,
        error: authError,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    await logCriticalError({
      workflow: 'account_deletion',
      error: error,
    });
    return NextResponse.json(
      { error: error.message || 'An error occurred while deleting your account' },
      { status: 500 }
    );
  }
}
