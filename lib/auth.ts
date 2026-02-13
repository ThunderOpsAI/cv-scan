import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { sendWelcomeEmail } from "@/lib/email/resend";

import { SupabaseAdapter } from "@auth/supabase-adapter";

export const authOptions: NextAuthOptions = {
  // Add the Supabase Adapter. This handles user/session/account/verification storage.
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking Google to existing email accounts
    }),
    EmailProvider({
      // We rely on the adapter for token storage.
      // Custom verification request via Resend API
      server: null, // Disable SMTP
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY!);

        const { host } = new URL(url);

        try {
          await resend.emails.send({
            from: "CVScan <auth@cv-scan.com>",
            to: identifier,
            subject: `Sign in to ${host}`,
            text: text({ url, host }),
            html: html({ url, host }),
          });
        } catch (error) {
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request", // Optional: Add a custom verification page later
  },

  session: {
    strategy: "jwt", // Use JWT session strategy (common with NextAuth)
  },

  callbacks: {
    // Adapter handles user creation in next_auth.users.
    // We sync to public.users (where credits live) on sign-in.
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        const supabase = createClient();

        // Check if user exists in public.users
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (!existingUser) {
          // Create user in public.users with 3 free credits
          await (supabase.from("users").insert as any)({
            email: user.email,
            name: user.name || null,
            image: user.image || null,
          });
        } else {
          // Update existing user info
          await (supabase.from("users").update as any)({
            name: user.name || undefined,
            image: user.image || undefined,
            updated_at: new Date().toISOString(),
          }).eq("email", user.email);
        }
      } catch (error) {
        console.error("Error syncing user to public.users:", error);
        // Don't block sign-in if sync fails
      }

      return true;
    },

    // Enrich the JWT with user email so session callback can use it
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },

    // Enrich the session with credits from public.users
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.id = token.sub || "";
        // Fetch credits from public.users by email
        const supabase = createClient();
        const { data: dbUser } = await supabase
          .from("users")
          .select("id, credits")
          .eq("email", token.email as string)
          .single();

        if (dbUser) {
          session.user.id = (dbUser as any).id;
          session.user.credits = (dbUser as any).credits;
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
