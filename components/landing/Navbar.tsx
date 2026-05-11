"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Menu, X } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Security", href: "#security" },
  ];

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex justify-center pt-4 sm:pt-6 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`
          relative pointer-events-auto flex items-center justify-between
          w-[95%] max-w-7xl h-16 sm:h-20 px-6 sm:px-10
          rounded-[2rem] border transition-all duration-500
          ${isScrolled 
            ? "bg-[#030712]/70 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]" 
            : "bg-white/[0.02] backdrop-blur-md border-white/[0.05]"
          }
        `}
      >
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 8, scale: 1.1 }}
            className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20"
          >
            <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center overflow-hidden">
              <Image src="/icon.png" alt="SheetFlow" width={24} height={24} className="relative z-10" />
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black text-white tracking-tighter leading-none">SheetFlow</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">AI Analyst</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative text-sm font-bold text-slate-400 hover:text-white transition-colors group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            {status === "loading" ? (
              <div className="w-24 h-10 rounded-2xl bg-white/5 animate-pulse" />
            ) : session ? (
              <Link
                href="/dashboard"
                className="group relative px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                <span className="relative z-10 flex items-center gap-2">Dashboard <ChevronRight size={16} /></span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => signIn("google")}
                  className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => signIn("google")}
                  className="group relative px-6 py-2.5 rounded-2xl bg-white text-black font-black text-sm overflow-hidden transition-all hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">Start Free <Sparkles size={16} /></span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-full left-0 right-0 mt-4 p-6 rounded-[2rem] bg-[#030712] border border-white/10 shadow-2xl backdrop-blur-3xl md:hidden"
            >
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-bold text-slate-300 hover:text-indigo-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="border-white/5" />
                {session ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white font-black"
                  >
                    Dashboard <ChevronRight size={18} />
                  </Link>
                ) : (
                  <button
                    onClick={() => signIn("google")}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-black font-black"
                  >
                    Get Started <Sparkles size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}

function ChevronRight({ size }: { size: number }) {
  return (
    <svg 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}