import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware function - runs on every request
 * This middleware only scopes the backend API paths.
 * Authentication is enforced inside the API route handlers themselves.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow a public health check without requiring authentication
  if (pathname === "/api/backend/health") {
    return NextResponse.next();
  }

  // Routes that start with /api/backend continue to the API routes.
  if (pathname.startsWith("/api/backend")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Configuration for where this middleware should run
 * We protect all API routes under /api/backend
 */
export const config = {
  matcher: ["/api/backend/:path*"],
};
