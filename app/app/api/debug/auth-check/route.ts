import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
    if (process.env.NODE_ENV === "production" && process.env.DEBUG_SECRET !== req.headers.get("x-debug-secret")) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const results: Record<string, string | Record<string, string>> = {};

    results.env = {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "SET" : "MISSING",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "MISSING",
        RESEND_API_KEY: process.env.RESEND_API_KEY ? "SET" : "MISSING",
        EMAIL_FROM: process.env.EMAIL_FROM ? "SET" : "MISSING",
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
    };

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        results.dbError = "Missing Supabase environment variables";
        return NextResponse.json(results, { status: 200 });
    }

    try {
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } }
        );

        const { error: ue } = await supabase.from("users").select("id").limit(1);
        results["public.users"] = ue ? `❌ ${ue.message}` : `✅ OK`;

        const { error: ae } = await supabase
            .from("accounts")
            .select("id, userid, provideraccountid")
            .limit(1);
        results["public.accounts"] = ae ? `❌ ${ae.message}` : `✅ OK`;

        const { error: se } = await supabase
            .from("sessions")
            .select("id, userid, sessiontoken")
            .limit(1);
        results["public.sessions"] = se ? `❌ ${se.message}` : `✅ OK`;

        const { error: ve } = await supabase.from("verification_tokens").select("identifier").limit(1);
        results["public.verification_tokens"] = ve ? `❌ ${ve.message}` : `✅ OK`;

        const { error: evErr } = await supabase.from("users").select("emailVerified").limit(0);
        results["users.emailVerified_column"] = evErr ? `❌ ${evErr.message}` : `✅ OK`;
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown database check error";
        results.dbError = `❌ ${message}`;
    }

    return NextResponse.json(results, { status: 200 });
}
