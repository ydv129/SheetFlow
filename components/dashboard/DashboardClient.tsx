"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ExcelUploadSection } from "@/frontend/components/ExcelUploadSection";
import { ExcelDataViewer } from "@/frontend/components/ExcelDataViewer";
import { DataDashboard } from "@/frontend/components/DataDashboard";
import { useExcelLiveLink } from "@/frontend/hooks/useExcelLiveLink";
import { UserMenu } from "@/components/dashboard/UserMenu";
import {
  BarChart2, Table2, MessageSquare, Upload,
  Sparkles, ChevronRight,
} from "lucide-react";

// Lazy-load AI panel — keeps initial bundle small
const AIChatPanel = dynamic(
  () => import("@/frontend/components/AIChatPanel").then((m) => ({ default: m.AIChatPanel })),
  { loading: () => <div className="p-4 text-center text-slate-500 text-xs">Loading AI…</div>, ssr: false }
);

type Tab = "upload" | "analytics" | "data";

export function DashboardClient() {
  const liveLink = useExcelLiveLink();
  const { workbook, status } = liveLink;
  const [tab, setTab] = useState<Tab>("upload");
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const fileLoaded = useMemo(
    () => ((status as string) === "ready" || (status as string) === "watching") && workbook !== null,
    [status, workbook]
  );

  const currentSheet = workbook?.sheets[selectedSheet] ?? null;

  // On mount: if workbook was restored from sessionStorage, jump to analytics
  useEffect(() => {
    if (fileLoaded && tab === "upload") setTab("analytics");
  }, [fileLoaded]); // intentionally only depends on fileLoaded

  useEffect(() => {
    if (!workbook) { setSelectedSheet(0); setTab("upload"); }
    else if (selectedSheet >= workbook.sheetCount) setSelectedSheet(0);
  }, [workbook, selectedSheet]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; disabled?: boolean; badge?: string }[] = [
    { id: "upload",    label: fileLoaded ? "File" : "Upload", icon: <Upload size={14} />, badge: fileLoaded ? "✓" : undefined },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={14} />, disabled: !fileLoaded },
    { id: "data",      label: "Data",      icon: <Table2 size={14} />,   disabled: !fileLoaded },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* ── Ambient background ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-emerald-500/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-600/8 blur-[90px]" />
      </div>

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0f1e]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <motion.div 
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ 
                  rotate: [0, 5, 0],
                  scale: [1, 1.05, 1],
                  filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/50 p-1 border border-white/10 shadow-2xl overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image 
                  src="/icon.png" 
                  alt="SheetFlow Logo" 
                  width={28} 
                  height={28} 
                  className="relative z-10"
                />
              </motion.div>
              <div className="flex flex-col -space-y-1">
                <span className="text-sm font-black text-white tracking-tight uppercase">
                  SheetFlow <span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                  Secure Analytics
                </span>
              </div>
              {fileLoaded && workbook && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden sm:flex items-center gap-1 text-xs text-slate-500"
                >
                  <ChevronRight size={12} />
                  <span className="text-slate-400 font-medium truncate max-w-[140px]">
                    {liveLink.fileName}
                  </span>
                </motion.div>
              )}
            </div>

            <UserMenu />
          </div>
        </div>
      </header>

      {/* ── Tab bar ───────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 border-b border-white/[0.05] bg-[#0a0f1e]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {tabs.map(({ id, label, icon, disabled, badge }) => (
              <button
                key={id}
                onClick={() => !disabled && setTab(id)}
                disabled={disabled}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  tab === id
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                {icon} {label}
                {badge && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">{badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {tab === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl mx-auto"
            >
              <div className="mb-6 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-400 mb-2">
                  Get Started
                </p>
                <h1 className="text-2xl font-bold text-white">Upload your spreadsheet</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Your data stays 100% local — never leaves this device.
                </p>
              </div>
              <ExcelUploadSection liveLink={liveLink} onFileLoaded={(loaded) => { if (loaded) setTab("analytics"); }} />
            </motion.div>
          )}

          {tab === "analytics" && fileLoaded && currentSheet && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Sheet selector if multi-sheet */}
              {workbook && workbook.sheetCount > 1 && (
                <div className="flex gap-1 mb-5 flex-wrap">
                  {workbook.sheets.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSheet(i)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedSheet === i
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                          : "text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              <DataDashboard sheet={currentSheet} />
            </motion.div>
          )}

          {tab === "data" && fileLoaded && workbook && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ExcelDataViewer
                workbook={workbook}
                selectedSheetIndex={selectedSheet}
                onSheetChange={setSelectedSheet}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── AI Chat FAB ───────────────────────────────────────── */}
      <AnimatePresence>
        {fileLoaded && currentSheet && (
          <div className="fixed bottom-5 right-5 z-50">
            {!showChat ? (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setShowChat(true)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all active:scale-95"
                title="Open AI Analyst"
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">Ask AI</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-[400px] h-[560px] shadow-2xl shadow-black/60 rounded-2xl overflow-hidden"
              >
                <AIChatPanel sheet={currentSheet} onClose={() => setShowChat(false)} />
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}