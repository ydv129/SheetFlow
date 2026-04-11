"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/80 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 min-w-0 flex-shrink-0"
          >
            <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">SF</span>
            </div>
            <span className="text-base sm:text-xl font-bold text-foreground truncate">SheetFlow AI</span>
          </motion.div>

          {/* Navigation Links - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden md:flex items-center gap-6 lg:gap-8"
          >
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Start
            </a>
          </motion.div>

          {/* Mobile Menu Button - Visible only on small screens */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors mr-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Auth Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="hidden sm:block"
          >
            {status === "loading" ? (
              <div className="w-20 sm:w-24 h-8 sm:h-10 bg-muted rounded-lg animate-pulse" />
            ) : session ? (
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 transform hover:scale-105 active:scale-95"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 transform hover:scale-105 active:scale-95"
              >
                Sign In
              </button>
            )}
          </motion.div>

          {/* Mobile Auth Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="sm:hidden"
          >
            {status === "loading" ? (
              <div className="w-16 h-8 bg-muted rounded-lg animate-pulse" />
            ) : session ? (
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300"
              >
                Go
              </Link>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300"
              >
                Sign In
              </button>
            )}
          </motion.div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-border py-3 space-y-2"
          >
            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Pricing
            </a>
            <a
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Start
            </a>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}