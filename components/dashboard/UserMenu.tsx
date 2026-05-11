"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ChevronRight, LogOut } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
            </span>
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground">
            {session.user.name || "User"}
          </p>
          <p className="text-xs text-muted-foreground">
            {session.user.email}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden backdrop-blur-xl">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <p className="text-sm font-semibold text-white">
                {session.user.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {session.user.email}
              </p>
              
              <div className="mt-3 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  (session.user as any).subscriptionTier === "pro" 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-slate-700 text-slate-300"
                }`}>
                  {(session.user as any).subscriptionTier === "pro" ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {(session.user as any).subscriptionTier !== "pro" && (
                <button
                  onClick={async () => {
                    const res = await fetch("/api/subscription/upgrade", { method: "POST" });
                    if (res.ok) {
                      window.location.reload();
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-black text-indigo-400 hover:text-white hover:bg-indigo-600/20 rounded-xl transition-all border border-transparent hover:border-indigo-500/30"
                >
                  <span className="flex items-center gap-2">✨ Upgrade to Pro</span>
                  <ChevronRight size={12} />
                </button>
              )}
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}