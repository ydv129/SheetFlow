import { Suspense } from "react";
import { AuthErrorContent } from "@/components/auth/AuthErrorContent";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <AuthErrorContent />
        </Suspense>
      </div>
    </div>
  );
}