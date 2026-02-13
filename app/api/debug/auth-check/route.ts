import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET() {
    const results: Record<string, any> = {};

    // 1. Check environment variables
    results.env = {
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ MISSING",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ MISSING",
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID ? "✅ SET" : "❌ MISSING",
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET ? "✅ SET" : "❌ MISSING",
        RESEND_API_KEY: !!process.env.RESEND_API_KEY ? "✅ SET" : "❌ MISSING",
        EMAIL_FROM: process.env.EMAIL_FROM || "❌ MISSING",
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ MISSING",
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ SET" : "❌ MISSING",
    };

    // 2. Check Supabase connection + public.users table
    try {
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        const { data, error } = await supabase.from("users").select("id").limit(1);
        results.publicUsers = error
            ? `❌ Error: ${error.message}`
            : `✅ OK (found ${data?.length ?? 0} rows)`;

        // Check public.users columns
        const { data: cols, error: colErr } = await supabase
            .from("users")
            .select("id, email, name, image, credits")
            .limit(0);
        results.publicUsersColumns = colErr
            ? `❌ Column check failed: ${colErr.message}`
            : "✅ All columns exist (id, email, name, image, credits)";
    } catch (e: any) {
        results.publicUsers = `❌ Exception: ${e.message}`;
    }

    // 3. Check next_auth schema tables
    try {
        const supabaseNextAuth = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                db: { schema: "next_auth" },
                auth: { persistSession: false },
            }
        );

        // Check next_auth.users
        const { data: naUsers, error: naUsersErr } = await supabaseNextAuth
            .from("users")
            .select("id")
            .limit(1);
        results.nextAuthUsers = naUsersErr
            ? `❌ Error: ${naUsersErr.message}`
            : `✅ OK (found ${naUsers?.length ?? 0} rows)`;

        // Check next_auth.accounts
        const { data: naAccounts, error: naAccountsErr } = await supabaseNextAuth
            .from("accounts")
            .select("id")
            .limit(1);
        results.nextAuthAccounts = naAccountsErr
            ? `❌ Error: ${naAccountsErr.message}`
            : `✅ OK (found ${naAccounts?.length ?? 0} rows)`;

        // Check next_auth.sessions
        const { data: naSessions, error: naSessionsErr } = await supabaseNextAuth
            .from("sessions")
            .select("id")
            .limit(1);
        results.nextAuthSessions = naSessionsErr
            ? `❌ Error: ${naSessionsErr.message}`
            : `✅ OK (found ${naSessions?.length ?? 0} rows)`;

        // Check next_auth.verification_tokens
        const { data: naTokens, error: naTokensErr } = await supabaseNextAuth
            .from("verification_tokens")
            .select("id")
            .limit(1);
        results.nextAuthVerificationTokens = naTokensErr
            ? `❌ Error: ${naTokensErr.message}`
            : `✅ OK (found ${naTokens?.length ?? 0} rows)`;
    } catch (e: any) {
        results.nextAuthSchema = `❌ Exception: ${e.message}`;
    }

    // 4. Check NextAuth route handler exists
    results.info = {
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json(results, { status: 200 });
}
