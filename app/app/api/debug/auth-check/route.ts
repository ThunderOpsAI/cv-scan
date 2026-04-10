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

    // 2. Check all public schema tables
    try {
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        ) as any;

        // Check public.users
        const { data: u, error: ue } = await supabase.from("users").select("id").limit(1);
        results["public.users"] = ue ? `❌ ${ue.message}` : `✅ OK`;

        // Check public.accounts
        const { data: a, error: ae } = await supabase.from("accounts").select("id").limit(1);
        results["public.accounts"] = ae ? `❌ ${ae.message}` : `✅ OK`;

        // Check public.sessions
        const { data: s, error: se } = await supabase.from("sessions").select("id").limit(1);
        results["public.sessions"] = se ? `❌ ${se.message}` : `✅ OK`;

        // Check public.verification_tokens
        const { data: v, error: ve } = await supabase.from("verification_tokens").select("identifier").limit(1);
        results["public.verification_tokens"] = ve ? `❌ ${ve.message}` : `✅ OK`;

        // Check emailVerified column on users
        const { error: evErr } = await supabase.from("users").select("emailVerified").limit(0);
        results["users.emailVerified_column"] = evErr ? `❌ ${evErr.message}` : `✅ OK`;
    } catch (e: any) {
        results.dbError = `❌ ${e.message}`;
    }

    return NextResponse.json(results, { status: 200 });
}
