import { auth } from "@/backend/auth/auth";
import { connectToDatabase, User, ProjectConfig } from "@/backend/db";
import { ApiResponse, ProjectConfigData } from "@/lib/types";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

/**
 * GET /api/backend/projects
 * List all projects belonging to the current user
 * Requires authentication (checked by middleware)
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the user first to get their ID
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Find all projects for this user
    const projects = await ProjectConfig.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: projects,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/backend/projects:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backend/projects
 * Create a new project configuration
 * Requires authentication (checked by middleware)
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.projectName || typeof body.projectName !== "string") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "projectName is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (body.description && typeof body.description !== "string") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "description must be a string",
        },
        { status: 400 }
      );
    }

    const allowedModels = ["SmolLM2-360M", "Gemma-4-E2B"];
    if (
      body.aiModel &&
      (typeof body.aiModel !== "string" || !allowedModels.includes(body.aiModel))
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "aiModel must be one of: SmolLM2-360M, Gemma-4-E2B",
        },
        { status: 400 }
      );
    }

    if (
      body.watcherInterval !== undefined &&
      (typeof body.watcherInterval !== "number" || body.watcherInterval < 1 || body.watcherInterval > 60)
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "watcherInterval must be a number between 1 and 60",
        },
        { status: 400 }
      );
    }

    if (
      body.ignoredColumns !== undefined &&
      (!Array.isArray(body.ignoredColumns) || body.ignoredColumns.some((item: unknown) => typeof item !== "string"))
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "ignoredColumns must be an array of strings",
        },
        { status: 400 }
      );
    }

    if (
      body.dashboardLayout !== undefined &&
      (typeof body.dashboardLayout !== "object" || body.dashboardLayout === null || Array.isArray(body.dashboardLayout))
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "dashboardLayout must be an object",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the user
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Create new project
    const newProject = await ProjectConfig.create({
      userId: user._id,
      projectName: body.projectName,
      description: body.description || "",
      excelFilePath: body.excelFilePath || null,
      aiModel: body.aiModel || "SmolLM2-360M",
      watcherInterval: body.watcherInterval || 5,
      ignoredColumns: body.ignoredColumns || [],
      dashboardLayout: body.dashboardLayout || {},
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/backend/projects:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create project",
      },
      { status: 500 }
    );
  }
}
