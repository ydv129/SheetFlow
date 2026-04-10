import { auth } from "@/backend/auth/auth";
import { connectToDatabase, User } from "@/backend/db";
import type { IUser } from "@/backend/db/models";
import { ApiResponse } from "@/lib/types";
import { NextResponse } from "next/server";

/**
 * GET /api/backend/me
 * Returns the current logged-in user's profile information
 * Requires authentication (checked by middleware)
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Get the session from NextAuth
    const session = await auth();

    // This shouldn't happen because middleware already checks auth,
    // but we double-check for safety
    if (!session?.user?.email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the user in MongoDB
    const user = (await User.findOne({ email: session.user.email })
      .lean()) as IUser | null;

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Return the user data
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          email: user.email,
          name: user.name,
          image: user.image,
          subscriptionTier: user.subscriptionTier,
          subscriptionExpiresAt: user.subscriptionExpiresAt,
          isOnboarded: user.isOnboarded,
          preferences: user.preferences,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/backend/me:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch user profile",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/backend/me
 * Update the current user's profile information
 * Requires authentication (checked by middleware)
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    // Get the session
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

    // Parse the request body
    const body = await request.json();

    // Validate input - users can only update specific fields
    const allowedFields = ["preferences"];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // If nothing to update, return early
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

    // Update the user
    const updatedUser = (await User.findOneAndUpdate(
      { email: session.user.email },
      updates,
      { new: true }
    ).lean()) as IUser | null;

    if (!updatedUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "User not found after update",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          email: updatedUser.email,
          name: updatedUser.name,
          preferences: updatedUser.preferences,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/backend/me:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update user profile",
      },
      { status: 500 }
    );
  }
}
