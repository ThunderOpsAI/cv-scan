import type { NextAuthOptions } from "next-auth";
import type { SendVerificationRequestParams } from "next-auth/providers/email";
import { createClient } from "@/lib/supabase/server";
import { CustomSupabaseAdapter } from "@/lib/auth/adapter";
import { buildConsentFields } from "@/lib/auth/consent";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {
  hasEmailAuthEnv,
  hasGoogleAuthEnv,
  hasSupabaseServerEnv,
  nextAuthSecret,
  sessionTokenCookieName,
  useSecureCookies,
} from "@/lib/auth/env";
import { normalizePlanTier } from "@/lib/billing/plan-tier";
import { APP_NAME } from "@/lib/branding";

export { isAuthConfigured } from "@/lib/auth/env";

type UserCreditsRow = {
  id: string;
  credits: number;
  plan_tier?: string | null;
};

type ConsentFields = ReturnType<typeof buildConsentFields>;


const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const SESSION_UPDATE_AGE_SECONDS = 24 * 60 * 60;

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "credentials",
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Missing email or password");
      }
      
      const supabase = createClient();
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("email", credentials.email)
        .single();
        
      if (!user || !user.hashed_password) {
        throw new Error("Invalid credentials");
      }
      
      const isPasswordValid = await bcrypt.compare(credentials.password, user.hashed_password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (hasGoogleAuthEnv) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
        const nodemailer = await import("nodemailer");
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const { host } = new URL(url);

        try {
          await transport.sendMail({
            from: process.env.EMAIL_FROM || `${APP_NAME} <noreply@${host}>`,
            to: identifier,
            subject: `Your ${APP_NAME} sign-in link`,
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
        const { error } = await supabase.from("users").update(buildConsentFields() as any).eq("id", user.id);

        if (error) {
          console.error("Failed to record auth consent (non-fatal):", error);
          // Do not return false here, so the user can still log in even if the migration hasn't run
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
        Sign in to <strong>${APP_NAME}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Open this secure magic link to continue on ${escapedHost}. If you did not request it, you can safely ignore this email.
      </td>
    </tr>
  </table>
</body>
`;
}

function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${APP_NAME} on ${host}\n${url}\n\n`;
}
