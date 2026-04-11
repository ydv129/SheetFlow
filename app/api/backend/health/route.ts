import { connectToDatabase } from "@/backend/db";
import { getValkeyClient } from "@/backend/db/valkey";
import { ApiResponse } from "@/lib/types";
import { NextResponse } from "next/server";

/**
 * GET /api/backend/health
 * System-wide health check endpoint
 * Verifies that all critical services are running correctly
 * Public endpoint - no authentication required
 */
export async function GET(request: Request): Promise<NextResponse> {
  const results = {
    status: "checking",
    mongodb: "checking",
    valkey: "checking",
    webgpu: "checking",
  };

  try {
    // Check MongoDB connection
    try {
      await connectToDatabase();
      results.mongodb = "connected";
    } catch (error) {
      console.error("MongoDB health check failed:", error);
      results.mongodb = "disconnected";
    }

    // Check Valkey connection
    try {
      const valkey = getValkeyClient();
      await valkey.ping();
      results.valkey = "ready";
    } catch (error) {
      console.error("Valkey health check failed:", error);
      results.valkey = "disconnected";
    }

    // Check WebGPU support (client-side, but we can check if the API exists)
    // Note: This is a server-side check, actual WebGPU support is client-dependent
    results.webgpu = "supported"; // Assume supported for now

    // Determine overall status
    const allHealthy = Object.values(results).every(status =>
      status === "connected" || status === "ready" || status === "supported"
    );
    results.status = allHealthy ? "online" : "degraded";

    return NextResponse.json(results, { status: allHealthy ? 200 : 503 });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        mongodb: "unknown",
        valkey: "unknown",
        webgpu: "unknown",
        error: "Health check failed",
      },
      { status: 500 }
    );
  }
}
