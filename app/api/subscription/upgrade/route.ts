import { NextResponse } from "next/server";
import { auth } from "@/backend/auth/auth";
import { connectToDatabase, User } from "@/backend/db";

/**
 * Temporary Payment Gateway API
 * Simulates a successful checkout and upgrades the user to 'pro'
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update user to Pro
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        subscriptionTier: "pro",
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Upgraded to Pro successfully!",
      tier: user.subscriptionTier 
    });
  } catch (error: any) {
    console.error("Subscription upgrade error:", error);
    return NextResponse.json({ error: error.message || "Upgrade failed" }, { status: 500 });
  }
}
