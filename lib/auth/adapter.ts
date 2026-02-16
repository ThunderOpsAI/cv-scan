/**
 * Custom NextAuth Adapter for Supabase (public schema).
 *
 * Uses the existing createClient() from @/lib/supabase/server
 * which connects to the `public` schema with the service role key.
 *
 * We cast the supabase client to `any` throughout because the
 * Database type doesn't include accounts/sessions/verification_tokens.
 * These tables exist at runtime after running the SQL migration.
 */
import type { Adapter, AdapterUser, AdapterSession, VerificationToken } from "next-auth/adapters";
import { createClient } from "@/lib/supabase/server";

export function CustomSupabaseAdapter(): Adapter {
    const supabase = createClient() as any;

    return {
        async createUser(user: any) {
            const { data, error } = await supabase
                .from("users")
                .insert({
                    email: user.email,
                    name: user.name ?? null,
                    image: user.image ?? null,
                    emailVerified: user.emailVerified?.toISOString() ?? null,
                })
                .select()
                .single();

            if (error) throw error;
            return formatUser(data);
        },

        async getUser(id: string) {
            const { data, error } = await supabase
                .from("users")
                .select()
                .eq("id", id)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;
            return formatUser(data);
        },

        async getUserByEmail(email: string) {
            const { data, error } = await supabase
                .from("users")
                .select()
                .eq("email", email)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;
            return formatUser(data);
        },

        async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
            const { data: account, error: accErr } = await supabase
                .from("accounts")
                .select("userId")
                .match({ provider, providerAccountId })
                .maybeSingle();

            if (accErr) throw accErr;
            if (!account) return null;

            const { data: user, error: userErr } = await supabase
                .from("users")
                .select()
                .eq("id", account.userId)
                .maybeSingle();

            if (userErr) throw userErr;
            if (!user) return null;
            return formatUser(user);
        },

        async updateUser(user: any) {
            const { data, error } = await supabase
                .from("users")
                .update({
                    name: user.name ?? undefined,
                    email: user.email ?? undefined,
                    image: user.image ?? undefined,
                    emailVerified: user.emailVerified?.toISOString() ?? undefined,
                })
                .eq("id", user.id)
                .select()
                .single();

            if (error) throw error;
            return formatUser(data);
        },

        async deleteUser(userId: string) {
            await supabase.from("users").delete().eq("id", userId);
        },

        async linkAccount(account: any) {
            const { error } = await supabase.from("accounts").insert({
                userId: account.userId,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token ?? null,
                access_token: account.access_token ?? null,
                expires_at: account.expires_at ?? null,
                token_type: account.token_type ?? null,
                scope: account.scope ?? null,
                id_token: account.id_token ?? null,
                session_state: (account.session_state as string) ?? null,
            });

            if (error) throw error;
        },

        async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
            await supabase
                .from("accounts")
                .delete()
                .match({ provider, providerAccountId });
        },

        async createSession({ sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }) {
            const { data, error } = await supabase
                .from("sessions")
                .insert({
                    sessionToken,
                    userId,
                    expires: expires.toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return formatSession(data);
        },

        async getSessionAndUser(sessionToken: string) {
            const { data: session, error: sessErr } = await supabase
                .from("sessions")
                .select()
                .eq("sessionToken", sessionToken)
                .maybeSingle();

            if (sessErr) throw sessErr;
            if (!session) return null;

            const { data: user, error: userErr } = await supabase
                .from("users")
                .select()
                .eq("id", session.userId)
                .maybeSingle();

            if (userErr) throw userErr;
            if (!user) return null;

            return {
                session: formatSession(session),
                user: formatUser(user),
            };
        },

        async updateSession(session: any) {
            const { data, error } = await supabase
                .from("sessions")
                .update({
                    expires: session.expires?.toISOString(),
                })
                .eq("sessionToken", session.sessionToken)
                .select()
                .single();

            if (error) throw error;
            return formatSession(data);
        },

        async deleteSession(sessionToken: string) {
            await supabase.from("sessions").delete().eq("sessionToken", sessionToken);
        },

        async createVerificationToken(token: { identifier: string; token: string; expires: Date }) {
            const { data, error } = await supabase
                .from("verification_tokens")
                .insert({
                    identifier: token.identifier,
                    token: token.token,
                    expires: token.expires.toISOString(),
                })
                .select()
                .single();

            if (error) throw error;

            return {
                identifier: data.identifier,
                token: data.token,
                expires: new Date(data.expires),
            };
        },

        async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
            const { data, error } = await supabase
                .from("verification_tokens")
                .delete()
                .match({ identifier, token })
                .select()
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;

            return {
                identifier: data.identifier,
                token: data.token,
                expires: new Date(data.expires),
            };
        },
    };
}

// Helper to format DB row -> AdapterUser
function formatUser(data: any): AdapterUser {
    return {
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.image,
        emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
    };
}

// Helper to format DB row -> AdapterSession
function formatSession(data: any): AdapterSession {
    return {
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: new Date(data.expires),
    };
}
