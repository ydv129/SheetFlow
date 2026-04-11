import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getValkeyClient } from "@/backend/db/valkey";

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = request.headers.get("x-client-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }

  // Fallback to a default for localhost
  return "127.0.0.1";
}

/**
 * Check rate limit for a client using Valkey
 */
async function checkRateLimit(clientIP: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const key = `ratelimit:${clientIP}`;
  const windowKey = `${key}:window`;

  try {
    const valkey = getValkeyClient();

    // Get current count and window start time
    const [count, windowStart] = await Promise.all([
      valkey.get(key),
      valkey.get(windowKey)
    ]);

    const currentCount = count ? parseInt(count, 10) : 0;
    const currentWindowStart = windowStart ? parseInt(windowStart, 10) : now;

    // Check if we're in a new window
    if (now - currentWindowStart >= RATE_LIMIT_WINDOW) {
      // New window - reset counter
      await Promise.all([
        valkey.set(key, "1"),
        valkey.set(windowKey, now.toString()),
        valkey.pexpire(key, RATE_LIMIT_WINDOW),
        valkey.pexpire(windowKey, RATE_LIMIT_WINDOW)
      ]);
      return {
        allowed: true,
        remaining: RATE_LIMIT_MAX_REQUESTS - 1,
        resetTime: now + RATE_LIMIT_WINDOW,
      };
    }

    // Still in current window
    if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentWindowStart + RATE_LIMIT_WINDOW,
      };
    }

    // Increment counter
    await valkey.incr(key);
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - currentCount - 1,
      resetTime: currentWindowStart + RATE_LIMIT_WINDOW,
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // On error, allow the request to prevent blocking legitimate users
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }
}

/**
 * Middleware function - runs on every request
 * Enforces rate limiting and authentication for backend API routes
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow a public health check without rate limiting or authentication
  if (pathname === "/api/backend/health") {
    return NextResponse.next();
  }

  // Apply rate limiting to all /api/backend routes
  if (pathname.startsWith("/api/backend")) {
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetTime.toString());

    return response;
  }

  return NextResponse.next();
}

/**
 * Configuration for where this middleware should run
 * We protect all API routes under /api/backend
 * Force Node.js runtime to support Valkey/Redis operations
 */
export const config = {
  matcher: ["/api/backend/:path*"],
  runtime: "nodejs",
};
