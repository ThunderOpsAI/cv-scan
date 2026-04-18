import { NextResponse } from "next/server";

const mockSession = {
  user: {
    name: "Beta User",
    email: "beta@cvscan.com",
    image: null,
    id: "beta-user-123",
    role: "user",
    credits: 9999,
    stripe_customer_id: null,
    subscription_status: "active",
    planTier: "enterprise"
  },
  expires: "9999-12-31T23:59:59.999Z"
};

export function GET(req: Request) {
  const url = new URL(req.url);
  
  if (url.pathname.endsWith("/session")) {
    return NextResponse.json(mockSession);
  }

  return NextResponse.json(mockSession);
}

export function POST() {
  return NextResponse.json(mockSession);
}
