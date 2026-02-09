import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { sendWelcomeEmail } from "@/lib/email/resend";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      if (session.user) {
        const supabase = createClient();
        const { data: dbUser } = await (supabase
          .from("users")
          .select as any)("id, credits")
          .eq("email", session.user.email!)
          .single();

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.credits = dbUser.credits;
        }
      }
      return session;
    },
  },
};
