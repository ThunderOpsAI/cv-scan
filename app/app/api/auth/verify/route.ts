import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/auth/signin?error=Missing+verification+token", req.url));
  }

  const supabase = createClient();

  try {
    // Check if token exists and is valid
    const { data: verificationToken, error: fetchError } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("identifier", email)
      .eq("token", token)
      .maybeSingle();

    if (fetchError || !verificationToken) {
      return NextResponse.redirect(new URL("/auth/signin?error=Invalid+or+expired+verification+token", req.url));
    }

    if (new Date(verificationToken.expires) < new Date()) {
      return NextResponse.redirect(new URL("/auth/signin?error=Verification+token+has+expired", req.url));
    }

    // Update user to verified
    const { error: updateError } = await supabase
      .from("users")
      .update({ emailVerified: new Date().toISOString() })
      .eq("email", email);

    if (updateError) {
      console.error("Error updating user emailVerified:", updateError);
      return NextResponse.redirect(new URL("/auth/signin?error=Failed+to+verify+email", req.url));
    }

    // Delete the token
    await supabase
      .from("verification_tokens")
      .delete()
      .eq("identifier", email)
      .eq("token", token);

    // Redirect to a success page or signin with success message
    return NextResponse.redirect(new URL("/auth/signin?verified=true", req.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/auth/signin?error=An+unexpected+error+occurred", req.url));
  }
}
