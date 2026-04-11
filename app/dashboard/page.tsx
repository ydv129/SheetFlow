/**
 * Dashboard Page
 * Displays the Excel upload section, data viewer, and AI chat
 */

import { redirect } from "next/navigation";
import { auth } from "@/backend/auth/auth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function Dashboard() {
  // Check if user is authenticated
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return <DashboardClient />;
}