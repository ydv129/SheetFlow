import { redirect } from "next/navigation";
import { auth } from "@/backend/auth/auth";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function SignInPage() {
  // Check if user is already signed in
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to SheetFlow AI</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}