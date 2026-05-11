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
  const { activeWorkbook: workbook, status, activeFileName: fileName } = liveLink;
  const [tab, setTab] = useState<Tab>("upload");
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const currentSheet = workbook?.sheets[selectedSheet] || null;

  const fileLoaded = useMemo(
    () => ((status as string) === "ready" || (status as string) === "watching") && workbook !== null,
    [status, workbook]
  );

  useEffect(() => {
    if (!workbook) { setSelectedSheet(0); }
    else if (selectedSheet >= workbook.sheetCount) setSelectedSheet(0);
  }, [workbook, selectedSheet]);

  const sidebarItems: { id: Tab; label: string; icon: React.ReactNode; disabled?: boolean; badge?: string }[] = [
    { id: "upload",    label: fileLoaded ? "Sources" : "Upload", icon: <Upload size={18} />, badge: fileLoaded ? `${liveLink.workbooks.length}` : undefined },
    { id: "analytics", label: "Insights", icon: <BarChart2 size={18} />, disabled: !fileLoaded },
    { id: "data",      label: "Explorer", icon: <Table2 size={18} />,   disabled: !fileLoaded },
  ];

  return (
    <div className="flex h-screen w-full bg-[#030712] overflow-hidden">
      {/* ── Ambient background ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] h-[30%] w-[30%] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="relative z-50 border-r border-white/[0.06] bg-[#030712]/40 backdrop-blur-3xl flex flex-col shrink-0 overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06] h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div 
              animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800/50 p-1.5 border border-white/10 shadow-2xl"
            >
              <Image src="/icon.png" alt="Logo" width={32} height={32} className="relative z-10" />
            </motion.div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col -space-y-1"
                >
                  <span className="text-sm font-black text-white tracking-tight uppercase">SheetFlow <span className="text-indigo-400">AI</span></span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Secure Local Data</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all flex-shrink-0"
          >
            <ChevronRight size={16} className={`transition-transform duration-500 ${isSidebarCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {sidebarItems.map(({ id, label, icon, disabled, badge }) => (
            <button
              key={id}
              onClick={() => !disabled && setTab(id)}
              disabled={disabled}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed ${
                tab === id
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              <span className={`${tab === id ? "text-indigo-400" : "text-emerald-500/60 group-hover:text-emerald-400"} transition-colors flex-shrink-0`}>
                {icon}
              </span>
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {badge && !isSidebarCollapsed && (
                <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-black border border-emerald-500/30">
                  {badge}
                </span>
              )}
              {tab === id && (
                <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06] flex items-center overflow-hidden h-20">
          {!isSidebarCollapsed && <UserMenu />}
          {isSidebarCollapsed && (
            <div className="mx-auto w-8 h-8 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="relative flex-1 flex flex-col z-10 overflow-hidden">
        {/* Top Header info */}
        <header className="h-16 border-b border-white/[0.06] bg-[#030712]/20 backdrop-blur-sm flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Dashboard</h2>
            {fileLoaded && (
              <>
                <ChevronRight size={14} className="text-slate-700" />
                
                {/* Enhanced File Switcher Dropdown */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] shadow-lg shadow-black/20">
                    <Sparkles size={10} className="text-indigo-400" />
                    <select 
                      value={liveLink.activeWorkbookIndex}
                      onChange={(e) => liveLink.setActiveWorkbook(parseInt(e.target.value))}
                      className="bg-transparent border-none text-[11px] font-black text-slate-300 focus:ring-0 cursor-pointer uppercase tracking-tight"
                    >
                      {liveLink.workbooks.map((wb, idx) => (
                        <option key={wb.id} value={idx} className="bg-slate-900 text-white py-2">
                          {wb.fileName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Local AI Active</span>
            </div>
          </div>
        </header>

        {/* Scrollable content container */}
        <main className="flex-1 overflow-y-auto">
          <div className={`mx-auto p-8 transition-all duration-500 ${isSidebarCollapsed ? "max-w-[95%]" : "max-w-6xl"}`}>
            <AnimatePresence mode="wait">
              {tab === "upload" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-xl mx-auto py-12"
                >
                  <div className="mb-8 text-center">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-3">Welcome to <span className="text-indigo-500">SheetFlow</span></h1>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">Upload your spreadsheet to begin private, AI-powered analysis right in your browser.</p>
                  </div>
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/[0.06] shadow-2xl">
                    <ExcelUploadSection liveLink={liveLink} />
                  </div>
                </motion.div>
              )}

              {tab === "analytics" && fileLoaded && currentSheet && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                >
                  {workbook && workbook.sheetCount > 1 && (
                    <div className="flex gap-2 mb-8 bg-white/[0.02] p-1 rounded-xl w-fit border border-white/5">
                      {workbook.sheets.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSheet(i)}
                          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                            selectedSheet === i
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="rounded-3xl border border-white/[0.06] overflow-hidden bg-slate-950/50 backdrop-blur-sm">
                    <ExcelDataViewer
                      workbook={workbook}
                      selectedSheetIndex={selectedSheet}
                      onSheetChange={setSelectedSheet}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── AI Chat Overlay ───────────────────────────────────── */}
      <AnimatePresence>
        {fileLoaded && currentSheet && (
          <div className="fixed bottom-8 right-8 z-[100]">
            {!showChat ? (
              <motion.button
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1 }}
                whileActive={{ scale: 0.9 }}
                onClick={() => setShowChat(true)}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-colors"
              >
                <MessageSquare size={24} />
              </motion.button>
            ) : (
              <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.9 }}
                className="w-[440px] h-[640px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-[32px] overflow-hidden border border-white/10"
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