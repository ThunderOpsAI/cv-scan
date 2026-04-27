import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { SendVerificationRequestParams } from "next-auth/providers/email";
import { createClient } from "@/lib/supabase/server";
import { CustomSupabaseAdapter } from "@/lib/auth/adapter";
import { buildConsentFields } from "@/lib/auth/consent";
import {
  hasEmailAuthEnv,
  hasGoogleAuthEnv,
  hasSupabaseServerEnv,
  nextAuthSecret,
  sessionTokenCookieName,
  useSecureCookies,
} from "@/lib/auth/env";
import { normalizePlanTier } from "@/lib/billing/plan-tier";

export { isAuthConfigured } from "@/lib/auth/env";

type UserCreditsRow = {
  id: string;
  credits: number;
  plan_tier?: string | null;
};

type ConsentFields = ReturnType<typeof buildConsentFields>;

type UserConsentUpdate = (values: ConsentFields) => {
  eq(column: "id", value: string): PromiseLike<{ error: unknown | null }>;
};

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const SESSION_UPDATE_AGE_SECONDS = 24 * 60 * 60;

const providers: NextAuthOptions["providers"] = [];

if (hasGoogleAuthEnv) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (hasEmailAuthEnv) {
  providers.push(
    {
      id: "email",
      name: "Email",
      type: "email",
      server: {},
      maxAge: 24 * 60 * 60,
      from: process.env.EMAIL_FROM || "noreply@example.com",
      sendVerificationRequest: async ({ identifier, url }: SendVerificationRequestParams) => {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY!);

        const { host } = new URL(url);

        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "CVScan <onboarding@resend.dev>",
            to: identifier,
            subject: `Sign in to ${host}`,
            text: text({ url, host }),
            html: html({ url, host }),
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    } as any
  );
}

export const authOptions: NextAuthOptions = {
  // Custom adapter using public schema (no next_auth schema needed)
  adapter: hasSupabaseServerEnv ? CustomSupabaseAdapter() : undefined,
  providers,
  secret: nextAuthSecret,
  useSecureCookies,

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },

  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },

  cookies: {
    sessionToken: {
      name: sessionTokenCookieName,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },

  callbacks: {
    // The adapter creates users in public.users.
    // No manual sync needed anymore.
    async signIn({ user, email }) {
      if (!user.email) {
        return false;
      }

      const isEmailVerificationRequest =
        typeof email === "object" && !!email?.verificationRequest;

      if (user.id && hasSupabaseServerEnv && !isEmailVerificationRequest) {
        const supabase = createClient();
        const updateConsent = supabase.from("users").update as unknown as UserConsentUpdate;
        const { error } = await updateConsent(buildConsentFields()).eq("id", user.id);

        if (error) {
          console.error("Failed to record auth consent:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.credits = 0;
        session.user.planTier = "free";
      }

      if (session.user && hasSupabaseServerEnv) {
        const tokenUserId = typeof token.sub === "string" ? token.sub : "";
        session.user.id = tokenUserId;
        const supabase = createClient();
        const userQuery = supabase.from("users").select("id, credits, plan_tier");
        const { data: dbUser } = (tokenUserId
          ? (await userQuery.eq("id", tokenUserId).single())
          : token.email
            ? (await userQuery.eq("email", token.email as string).single())
            : { data: null }) as { data: UserCreditsRow | null };

        if (dbUser) {
          session.user.id = dbUser.id;
          let credits = dbUser.credits;
          try {
            const balRes = await (supabase.rpc as any)("get_credit_balance", { p_user_id: dbUser.id });
            if (!balRes.error && balRes.data != null) {
              const n = typeof balRes.data === "number" ? balRes.data : Number(balRes.data);
              if (!Number.isNaN(n)) {
                credits = n;
              }
            }
          } catch {
            /* older DB without get_credit_balance */
          }
          session.user.credits = credits;
          session.user.planTier = normalizePlanTier(dbUser.plan_tier);
        }
      }
      return session;
    },
  },
};

function html(params: { url: string; host: string }) {
  const { url, host } = params;
  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = "#667eea";
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: "#fff",
  };

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email, you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
