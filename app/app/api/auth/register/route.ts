import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/lib/email/resend";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password does not meet complexity requirements" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          name: name || null,
          hashed_password: hashedPassword,
        },
      ])
      .select("id, email, name")
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours expiry

    const { error: tokenError } = await supabase
      .from("verification_tokens")
      .insert([
        {
          identifier: email,
          token,
          expires: expires.toISOString(),
        },
      ]);

    if (tokenError) {
      console.error("Error saving verification token:", tokenError);
      // We still return 201 because user is created, but they won't get the email.
      // In a robust system, we might delete the user or queue a retry.
    } else {
      await sendVerificationEmail(email, token);
    }

    return NextResponse.json(
      { user: newUser, message: "User registered successfully. Please check your email to verify." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
