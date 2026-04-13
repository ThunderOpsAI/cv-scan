import { withAuth } from "next-auth/middleware";
import { nextAuthSecret, sessionTokenCookieName } from "@/lib/auth/env";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: nextAuthSecret,
  cookies: {
    sessionToken: {
      name: sessionTokenCookieName,
    },
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/buy-credits", "/generate/:path*"],
};
