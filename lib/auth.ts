import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { createClient } from "@/lib/supabase/server";
import { CustomSupabaseAdapter } from "@/lib/auth/adapter";
import { APP_NAME } from "@/lib/branding";

export const authOptions: NextAuthOptions = {
  adapter: CustomSupabaseAdapter() as any,
  providers: [
    EmailProvider({
      server: {},
      from: process.env.EMAIL_FROM || "noreply@example.com",
      maxAge: 10 * 60,
      sendVerificationRequest: async ({ identifier, url }) => {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const { host } = new URL(url);

        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || `${APP_NAME} <onboarding@resend.dev>`,
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
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      return !!user.email;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.id = token.sub || "";
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

function html({ url, host }: { url: string; host: string }) {
  const escapedHost = host.replace(/\./g, "&#8203;.");

  return `
<body style="background:#f4f8fb;margin:0;padding:24px 0;font-family:Arial,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;background:#07111f;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 12px 32px;text-align:center;">
              <div style="font-size:24px;font-weight:700;color:#ffffff;">${APP_NAME}</div>
              <p style="margin:12px 0 0 0;color:#cbd5e1;font-size:15px;line-height:24px;">
                Use the secure button below to sign in to <strong>${escapedHost}</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;text-align:center;">
              <a href="${url}" target="_blank" style="display:inline-block;border-radius:999px;background:#67e8f9;color:#082f49;padding:14px 24px;font-size:15px;font-weight:700;text-decoration:none;">
                Sign in to ${APP_NAME}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;color:#94a3b8;font-size:13px;line-height:22px;text-align:center;">
              This link expires in 10 minutes. If you did not request it, you can ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
`;
}

function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${APP_NAME} on ${host}\n${url}\n\nThis link expires in 10 minutes.`;
}
