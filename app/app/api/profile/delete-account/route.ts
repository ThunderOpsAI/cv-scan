import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { logCriticalError } from '@/lib/analytics/server';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    // Delete user from the database. Due to Supabase's default layout,
    // deleting from public.users should be allowed or should trigger cascading
    // deletes across related tables if foreign keys are set up correctly.
    // Auth.users references are typically managed by Supabase, but our
    // public.users row is within our control.
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', session.user.id);

    if (error) {
      console.error('Failed to delete account:', error);
      await logCriticalError({
        workflow: 'account_deletion',
        userId: session.user.id,
        supabase,
        error: error,
      });
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
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
