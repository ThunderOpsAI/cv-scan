/**
 * Custom NextAuth Adapter for Supabase (public schema).
 *
 * Uses the existing createClient() from @/lib/supabase/server
 * which connects to the `public` schema with the service role key.
 *
 * The generated Database type doesn't include accounts/sessions/
 * verification_tokens yet. This adapter keeps narrow local row types for
 * the NextAuth-owned tables created by the SQL migration.
 *
 * NOTE: Postgres columns in `accounts` and `sessions` seem to be lowercase
 * (userid, provideraccountid, sessiontoken) based on error logs,
 * while `users` table has mixed case (emailVerified) based on diagnostic.
 * We enforce lowercase for accounts/sessions to match Postgres behavior.
 */
import type { Adapter, AdapterAccount, AdapterUser, AdapterSession, VerificationToken } from "next-auth/adapters";
import { createClient } from "@/lib/supabase/server";
import { buildConsentFields } from "@/lib/auth/consent";

type SupabaseError = {
    message: string;
};

type SupabaseResult<T> = {
    data: T;
    error: SupabaseError | null;
};

type SupabaseMaybeResult<T> = {
    data: T | null;
    error: SupabaseError | null;
};

type AuthQueryBuilder<T> = {
    insert(values: unknown): AuthQueryBuilder<T>;
    update(values: unknown): AuthQueryBuilder<T>;
    delete(): AuthQueryBuilder<T>;
    select(columns?: string): AuthQueryBuilder<T>;
    eq(column: string, value: unknown): AuthQueryBuilder<T>;
    match(values: Record<string, unknown>): AuthQueryBuilder<T>;
    single(): Promise<SupabaseResult<T>>;
    maybeSingle(): Promise<SupabaseMaybeResult<T>>;
};

type AuthSupabaseClient = {
    from<T>(table: string): AuthQueryBuilder<T>;
};

type AuthUserRow = {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: string | Date | null;
    terms_accepted_at?: string | Date | null;
    privacy_accepted_at?: string | Date | null;
    consent_version?: string | null;
};

type AccountUserIdRow = {
    userId: string;
};

type AuthSessionRow = {
    sessionToken?: string;
    sessiontoken?: string;
    userId?: string;
    userid?: string;
    expires: string | Date;
};

type AuthVerificationTokenRow = {
    identifier: string;
    token: string;
    expires: string | Date;
};

function logAdapterDebug(message: string) {
    if (process.env.NODE_ENV === "development") {
        console.log(`[Adapter] ${message}`);
    }
}

export function CustomSupabaseAdapter(): Adapter {
    const supabase = createClient() as unknown as AuthSupabaseClient;

    return {
        async createUser(user: Omit<AdapterUser, "id">) {
            logAdapterDebug("createUser");
            const { data, error } = await supabase
                .from<AuthUserRow>("users")
                .insert({
                    email: user.email,
                    name: user.name ?? null,
                    image: user.image ?? null,
                    emailVerified: user.emailVerified?.toISOString() ?? null,
                    ...buildConsentFields(),
                })
                .select()
                .single();

            if (error) {
                console.error("[Adapter] createUser error:", error);
                throw error;
            }
            return formatUser(data);
        },

        async getUser(id: string) {
            // console.log("[Adapter] getUser:", id);
            const { data, error } = await supabase
                .from<AuthUserRow>("users")
                .select()
                .eq("id", id)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;
            return formatUser(data);
        },

        async getUserByEmail(email: string) {
            logAdapterDebug("getUserByEmail");
            const { data, error } = await supabase
                .from<AuthUserRow>("users")
                .select()
                .eq("email", email)
                .maybeSingle();

            if (error) throw error;
            if (!data) {
                logAdapterDebug("getUserByEmail: not found");
                return null;
            }
            return formatUser(data);
        },

        async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
            logAdapterDebug(`getUserByAccount:${provider}`);

            // Try lowercase column names for accounts table
            const { data: account, error: accErr } = await supabase
                .from<AccountUserIdRow>("accounts")
                .select("userId:userid") // Maps userid -> userId
                .match({ provider, provideraccountid: providerAccountId })
                .maybeSingle();

            if (accErr) {
                console.error("[Adapter] getUserByAccount error:", accErr);
                throw accErr;
            }
            if (!account) {
                logAdapterDebug("getUserByAccount: account not found");
                return null;
            }

            const { data: user, error: userErr } = await supabase
                .from<AuthUserRow>("users")
                .select()
                .eq("id", account.userId) // account.userId is populated from alias above
                .maybeSingle();

            if (userErr) throw userErr;
            if (!user) return null;
            return formatUser(user);
        },

        async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
            logAdapterDebug("updateUser");
            const { data, error } = await supabase
                .from<AuthUserRow>("users")
                .update({
                    name: user.name ?? undefined,
                    email: user.email ?? undefined,
                    image: user.image ?? undefined,
                    emailVerified: user.emailVerified?.toISOString() ?? undefined,
                })
                .eq("id", user.id)
                .select()
                .single();

            if (error) {
                console.error("[Adapter] updateUser error:", error);
                throw error;
            }
            return formatUser(data);
        },

        async deleteUser(userId: string) {
            await supabase.from<AuthUserRow>("users").delete().eq("id", userId);
        },

        async linkAccount(account: AdapterAccount) {
            logAdapterDebug(`linkAccount:${account.provider}`);
            const sessionState =
                "session_state" in account && typeof account.session_state === "string"
                    ? account.session_state
                    : null;

            const { error } = await supabase
                .from<unknown>("accounts")
                .insert({
                    userid: account.userId,
                    type: account.type,
                    provider: account.provider,
                    provideraccountid: account.providerAccountId,
                    refresh_token: account.refresh_token ?? null,
                    access_token: account.access_token ?? null,
                    expires_at: account.expires_at ?? null,
                    token_type: account.token_type ?? null,
                    scope: account.scope ?? null,
                    id_token: account.id_token ?? null,
                    session_state: sessionState,
                })
                .select("id")
                .maybeSingle();

            if (error) {
                console.error("[Adapter] linkAccount error:", error);
                throw error;
            }
        },

        async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
            await supabase
                .from<unknown>("accounts")
                .delete()
                .match({ provider, provideraccountid: providerAccountId });
        },

        async createSession({ sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }) {
            const { data, error } = await supabase
                .from<AuthSessionRow>("sessions")
                .insert({
                    sessiontoken: sessionToken,
                    userid: userId,
                    expires: expires.toISOString(),
                })
                .select("sessionToken:sessiontoken, userId:userid, expires")
                .single();

            if (error) throw error;
            return formatSession(data);
        },

        async getSessionAndUser(sessionToken: string) {
            const { data: session, error: sessErr } = await supabase
                .from<AuthSessionRow>("sessions")
                .select("sessionToken:sessiontoken, userId:userid, expires")
                .eq("sessiontoken", sessionToken)
                .maybeSingle();

            if (sessErr) throw sessErr;
            if (!session) return null;

            const { data: user, error: userErr } = await supabase
                .from<AuthUserRow>("users")
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

        async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">) {
            const { data, error } = await supabase
                .from<AuthSessionRow>("sessions")
                .update({
                    expires: session.expires?.toISOString(),
                })
                .eq("sessiontoken", session.sessionToken)
                .select("sessionToken:sessiontoken, userId:userid, expires")
                .single();

            if (error) throw error;
            return formatSession(data);
        },

        async deleteSession(sessionToken: string) {
            await supabase.from<AuthSessionRow>("sessions").delete().eq("sessiontoken", sessionToken);
        },

        async createVerificationToken(token: VerificationToken) {
            const { data, error } = await supabase
                .from<AuthVerificationTokenRow>("verification_tokens")
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
                .from<AuthVerificationTokenRow>("verification_tokens")
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
function formatUser(data: AuthUserRow): AdapterUser {
    return {
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.image,
        emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
    };
}

// Helper to format DB row -> AdapterSession
function formatSession(data: AuthSessionRow): AdapterSession {
    const sessionToken = data.sessionToken ?? data.sessiontoken;
    const userId = data.userId ?? data.userid;

    if (!sessionToken || !userId) {
        throw new Error("Malformed NextAuth session row");
    }

    return {
        sessionToken,
        userId,
        expires: new Date(data.expires),
    };
}
