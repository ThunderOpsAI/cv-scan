// Auth API disabled for beta branch (no authentication)
export function GET() {
	return new Response('Authentication is disabled in beta', { status: 404 });
}
export function POST() {
	return new Response('Authentication is disabled in beta', { status: 404 });
}
