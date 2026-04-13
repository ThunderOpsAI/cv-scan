import { NextResponse } from "next/server";

// Auth middleware disabled for beta branch (no authentication required)
// All routes are now public.

// Export a no-op proxy function for Next.js build compatibility
export default function proxy() {
	// No middleware logic in beta
	return NextResponse.next();
}
