import { auth } from "@/backend/auth/auth";
import { connectToDatabase, User, ProjectConfig } from "@/backend/db";
import { ApiResponse } from "@/lib/types";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

/**
 * GET /api/backend/projects/[id]
 * Get a specific project by ID
 * Only the owner of the project can view it
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid project ID",
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

    // Find the project - make sure it belongs to this user
    const project = await ProjectConfig.findOne({
      _id: params.id,
      userId: user._id,
    }).lean();

    if (!project) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: project,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/backend/projects/[id]:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch project",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/backend/projects/[id]
 * Update a specific project
 * Only the owner of the project can update it
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid project ID",
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate fields if provided
    if (body.projectName !== undefined && typeof body.projectName !== "string") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "projectName must be a string",
        },
        { status: 400 }
      );
    }

    if (body.description !== undefined && typeof body.description !== "string") {
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
      body.aiModel !== undefined &&
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

    // Define which fields users can update
    // We don't allow userId to be changed - only the owner can modify their own projects
    const allowedFields = [
      "projectName",
      "description",
      "excelFilePath",
      "aiModel",
      "watcherInterval",
      "ignoredColumns",
      "dashboardLayout",
    ];

    // Build the updates object with only allowed fields
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No valid fields to update",
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

    // Update the project - ensure it belongs to the user
    const updatedProject = await ProjectConfig.findOneAndUpdate(
      {
        _id: params.id,
        userId: user._id,
      },
      updates,
      { new: true }
    ).lean();

    if (!updatedProject) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Project not found or you don't have permission to update it",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updatedProject,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/backend/projects/[id]:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update project",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/backend/projects/[id]
 * Delete a specific project
 * Only the owner of the project can delete it
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid project ID",
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

    // Delete the project - ensure it belongs to the user
    const result = await ProjectConfig.deleteOne({
      _id: params.id,
      userId: user._id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Project not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: "Project deleted successfully",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/backend/projects/[id]:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete project",
      },
      { status: 500 }
    );
  }
}
