import { connectToDatabase } from "@/backend/db";
import { ApiResponse } from "@/lib/types";
import { NextResponse } from "next/server";

/**
 * GET /api/backend/health
 * Public health check endpoint
 * Verifies that the app and database are running correctly
 * No authentication required
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    await connectToDatabase();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          status: "healthy",
          message: "App is running and database connection is working",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Database connection failed",
        data: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
