"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight, Activity } from "lucide-react";
import { useExcelLiveLink } from "@/frontend/hooks/useExcelLiveLink";

export function Hero() {
  const { data: session, status: sessionStatus } = useSession();
  const liveLink = useExcelLiveLink();
  const { activeWorkbook: workbook, activeFileName: fileName } = liveLink;
  
  const isLoggedIn = sessionStatus !== "loading" && !!session;

  const [dynamicValue, setDynamicValue] = React.useState(842500);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setDynamicValue(prev => prev + (Math.random() * 100 - 40));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#030712]" />;

  const rowCount = workbook ? workbook.sheets[0]?.rowCount : 14202;
  const displayFileName = fileName || "SheetFlow_Demo_Analytics.xlsx";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      {/* ── Cinematic Ambient Background ──────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="absolute top-[30%] right-[10%] h-[40%] w-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
        
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: ["-10%", "110%"],
              x: (Math.random() * 20 - 10) + "%"
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-sm"
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center px-4">
        {/* Headline */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-6 backdrop-blur-md"
          >
            <Sparkles size={12} className="text-indigo-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Privacy First Analytics</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]"
          >
            Talk to your <br />
            <span className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-400 bg-[length:200%_auto] animate-gradient text-transparent bg-clip-text">
              Spreadsheets.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The local-first AI engine that turns Excel files into living, conversational insights—without your data ever leaving your device.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
        >
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="group relative px-8 py-4 rounded-2xl bg-white text-black font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">Enter Dashboard <ChevronRight size={20} /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            </Link>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="group relative px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(79,70,229,0.3)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">Start for Free <Sparkles size={20} /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          
          <button className="px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-bold text-lg hover:bg-white/5 transition-all">
            How it works
          </button>
        </motion.div>

        {/* Cinematic 3D Dashboard Visualization (Coded, not image) */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative group perspective-1000">
            {/* Ambient Gloom/Glow */}
            <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative rounded-[32px] border border-white/[0.08] bg-[#030712]/60 backdrop-blur-3xl overflow-hidden shadow-2xl p-4 transform-gpu transition-all duration-700 hover:rotate-x-2 hover:-rotate-y-1">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{displayFileName}</div>
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 p-6">
                <div className="col-span-8 space-y-4">
                  <div className="h-48 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5 p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Dynamic Insight</div>
                        <div className="text-2xl font-black text-white tracking-tight">
                          ${dynamicValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                        +{(Math.random() * 5 + 20).toFixed(1)}%
                      </div>
                    </div>
                    <div className="mt-8 flex items-end gap-2 h-16">
                      {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.8 + (i * 0.1), duration: 1 }}
                          className="flex-1 bg-indigo-500/40 rounded-t-sm"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-between">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Customer Retention</div>
                      <div className="text-lg font-black text-white">98.2%</div>
                    </div>
                    <div className="h-32 rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-between">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Avg. Deal Size</div>
                      <div className="text-lg font-black text-white">$12.4K</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-4 space-y-4">
                  <div className="h-full rounded-2xl bg-indigo-600/5 border border-indigo-500/20 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group/ai">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)] group-hover/ai:scale-150 transition-transform duration-1000" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 mb-4 shadow-2xl shadow-indigo-500/40"
                    >
                      <div className="w-full h-full bg-[#030712] rounded-2xl flex items-center justify-center overflow-hidden">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute inset-0 bg-indigo-500/20 blur-xl"
                        />
                        <Sparkles size={24} className="text-indigo-400 relative z-10" />
                      </div>
                    </motion.div>
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 relative z-10">Neural Dynamic Analysis</div>
                    <p className="text-[11px] font-bold text-slate-400 leading-tight relative z-10">
                      Processing {rowCount.toLocaleString()} rows locally...
                    </p>
                    
                    <div className="mt-4 w-full space-y-1 relative z-10">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="h-full w-1/3 bg-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Floating Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 -right-8 p-4 rounded-2xl bg-[#030712] border border-white/10 shadow-2xl backdrop-blur-xl z-20 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Sparkles size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local Security</div>
                    <div className="text-xs font-bold text-white tracking-tight">E2E Encrypted</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 -left-8 p-4 rounded-2xl bg-[#030712] border border-white/10 shadow-2xl backdrop-blur-xl z-20 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Activity size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inference Speed</div>
                    <div className="text-xs font-bold text-white tracking-tight">42 tokens/sec</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}