import { getServerSession } from "next-auth";
import { authOptions, isAuthConfigured } from "@/lib/auth";
import { LandingExperience } from "@/components/ui/LandingExperience";

export default async function Home() {
  const session = isAuthConfigured() ? await getServerSession(authOptions) : null;
  const accountHref = session ? "/dashboard" : "/auth/signin";

  return <LandingExperience accountHref={accountHref} signedIn={Boolean(session)} />;
}
