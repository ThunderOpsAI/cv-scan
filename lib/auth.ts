import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { sendWelcomeEmail } from "@/lib/email/resend";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      // We are using the Resend API via sendVerificationRequest, so no SMTP server config is needed.
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY!);

        const { host } = new URL(url);

        try {
          await resend.emails.send({
            from: "CVScan <auth@cv-scan.com>", // Updated sender
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
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const supabase = createClient();

      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", user.email)
        .single();

      if (!existingUser) {
        // Create new user (trigger will add 3 credits automatically)
        const newUser: Database['public']['Tables']['users']['Insert'] = {
          email: user.email,
          name: user.name,
          image: user.image,
        };
        await (supabase.from("users").insert as any)(newUser);

        // Send welcome email (non-blocking, won't fail signup if email fails)
        if (process.env.RESEND_API_KEY) {
          sendWelcomeEmail(user.email, user.name || "there").catch(console.error);
        }
      } else {
        // Update existing user info
        await (supabase
          .from("users")
          .update as any)({
            name: user.name,
            image: user.image,
            updated_at: new Date().toISOString(),
          })
          .eq("email", user.email);
      }

      return true;
    },

    async session({ session, token }) {
      console.log("[DEBUG session callback] Starting, session.user.email:", session.user?.email);
      if (session.user) {
        const supabase = createClient();
        const { data: dbUser, error: dbError } = await (supabase
          .from("users")
          .select as any)("id, credits")
          .eq("email", session.user.email!)
          .single();

        console.log("[DEBUG session callback] Supabase result:", { dbUser, dbError });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.credits = dbUser.credits;
          console.log("[DEBUG session callback] Set session.user.id:", dbUser.id);
        } else {
          console.log("[DEBUG session callback] No dbUser found for email:", session.user.email);
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
