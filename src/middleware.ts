import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
// /api/tasks uses API key auth, handled in the route itself
const publicRoutes = ["/login", "/api/auth", "/api/tasks", "/api/goals", "/api/lists", "/api/initiative"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie from better-auth
  // We check for both possible cookie names that better-auth might use
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie?.value) {
    // No session cookie - redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie exists - allow the request
  // Full session validation happens in API routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
