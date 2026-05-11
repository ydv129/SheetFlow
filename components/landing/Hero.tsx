"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export function Hero() {
  const { data: session, status: sessionStatus } = useSession();
  const isLoggedIn = sessionStatus !== "loading" && !!session;
  const sampleData = [
    { month: "Jan", revenue: 45000, growth: 12 },
    { month: "Feb", revenue: 52000, growth: 15 },
    { month: "Mar", revenue: 48000, growth: 8 },
    { month: "Apr", revenue: 61000, growth: 27 },
    { month: "May", revenue: 55000, growth: 10 },
    { month: "Jun", revenue: 72000, growth: 31 },
  ];

  const maxRevenue = Math.max(...sampleData.map(d => d.revenue));

  return (
    <section className="min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto text-center w-full">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6"
        >
          Talk to your{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">
            spreadsheets
          </span>
          .
          <br />
          Keep your data off the cloud.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-1"
        >
          The local-first AI dashboard that turns your Excel files into living, conversational insights—without sending a single row to the internet.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 w-full px-1"
        >
          {sessionStatus === "loading" ? (
            <div className="w-40 h-12 rounded-xl bg-muted animate-pulse" />
          ) : isLoggedIn ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/25 transform hover:scale-105 active:scale-95 text-center"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/25 transform hover:scale-105 active:scale-95"
              >
                Start for Free
              </button>
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full sm:w-auto border border-border bg-card hover:bg-accent text-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:shadow-lg active:scale-95"
              >
                Sign In
              </button>
            </>
          )}
        </motion.div>

        {/* Live Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="relative w-full"
        >
          <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl max-w-5xl mx-auto backdrop-blur overflow-hidden">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-2xl font-bold text-foreground">Sample Analytics Dashboard</h3>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">LIVE</span>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-semibold">LOCAL</span>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4"
              >
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text">₹3.33M</p>
                <p className="text-xs text-emerald-400 mt-2">↑ 18% vs last period</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.6 }}
                className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4"
              >
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Avg Growth</p>
                <p className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">+17.2%</p>
                <p className="text-xs text-emerald-400 mt-2">Trending up</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4"
              >
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Data Points</p>
                <p className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">1,847</p>
                <p className="text-xs text-cyan-400 mt-2">Analyzed</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.6 }}
                className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4"
              >
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Processing</p>
                <p className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">0ms</p>
                <p className="text-xs text-purple-400 mt-2">Local only</p>
              </motion.div>
            </div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="bg-slate-950/50 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6"
            >
              <div className="mb-4">
                <h4 className="text-base sm:text-lg font-semibold text-foreground">Revenue Trend (6 Months)</h4>
              </div>
              <div className="flex items-end justify-between gap-1 sm:gap-2 h-32 sm:h-40">
                {sampleData.map((data, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(data.revenue / maxRevenue) * 100}%`, opacity: 1 }}
                    transition={{ delay: 1.1 + idx * 0.08, duration: 0.6, ease: "easeOut" }}
                    className="flex-1 bg-gradient-to-t from-indigo-500 via-emerald-500 to-emerald-400 rounded-t-lg hover:from-indigo-400 hover:via-emerald-400 hover:to-emerald-300 transition-all group relative"
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs font-semibold text-foreground bg-slate-950/90 px-2 py-1 rounded whitespace-nowrap">
                        ₹{(data.revenue / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-4 sm:mt-6 text-xs text-muted-foreground gap-1">
                {sampleData.map((data, idx) => (
                  <span key={idx} className="truncate">{data.month}</span>
                ))}
              </div>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 relative pb-4 sm:pb-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="border border-slate-700 bg-slate-950/30 rounded-lg sm:rounded-xl p-3 sm:p-4"
              >
                <div className="text-xl sm:text-2xl mb-2 sm:mb-3">🔒</div>
                <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">100% Private</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">All data stays on your device. No cloud, no tracking.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.35, duration: 0.5 }}
                className="border border-slate-700 bg-slate-950/30 rounded-lg sm:rounded-xl p-3 sm:p-4"
              >
                <div className="text-xl sm:text-2xl mb-2 sm:mb-3">⚡</div>
                <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Instant Analysis</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">AI processes data locally in milliseconds.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="border border-slate-700 bg-slate-950/30 rounded-lg sm:rounded-xl p-3 sm:p-4"
              >
                <div className="text-xl sm:text-2xl mb-2 sm:mb-3">💬</div>
                <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Conversational</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Ask questions naturally. Get insights instantly.</p>
              </motion.div>
            </div>

            {/* Floating Card - Responsive positioning */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="hidden sm:block absolute -right-4 sm:-right-6 md:-right-8 -bottom-4 sm:-bottom-6 md:-bottom-8 bg-slate-900 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xl max-w-xs"
            >
              <div className="text-xs sm:text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                AI Insights
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                &quot;Your Q2 revenue shows 31% growth. Top performer: June with ₹72K. Average monthly increase: 17%.&quot;
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}