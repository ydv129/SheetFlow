"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UseExcelLiveLinkReturn } from "@/frontend/hooks/useExcelLiveLink";
import { Upload, FileSpreadsheet, Trash2, FolderOpen, CheckCircle2, AlertCircle, X } from "lucide-react";

interface ExcelUploadSectionProps {
  liveLink: UseExcelLiveLinkReturn;
  onFileLoaded?: (loaded: boolean) => void;
}

export function ExcelUploadSection({ liveLink, onFileLoaded }: ExcelUploadSectionProps) {
  const { 
    workbooks, activeWorkbookIndex, status, error, 
    selectFiles, setActiveWorkbook, removeWorkbook, clearAll,
    inputRef, handleInputChange 
  } = liveLink;

  useEffect(() => {
    onFileLoaded?.(status === "ready" && workbooks.length > 0);
  }, [status, workbooks.length, onFileLoaded]);

  // Hidden input — always in DOM
  const hiddenInput = (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="file"
      accept=".xlsx,.xls,.xlsm,.csv"
      multiple
      className="hidden"
      onChange={handleInputChange}
    />
  );

  // ── Loading state ──────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="space-y-4">
        {hiddenInput}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center backdrop-blur-sm"
        >
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          </div>
          <h3 className="font-black text-white uppercase tracking-tight">Decrypting Data</h3>
          <p className="text-xs text-slate-500 mt-1">Parsing spreadsheet architecture locally...</p>
        </motion.div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (status === "error" && error) {
    return (
      <div className="space-y-4">
        {hiddenInput}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-red-500/20 bg-red-950/20 p-8 backdrop-blur-sm text-center"
        >
          <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-sm font-black text-red-300 uppercase tracking-widest">Parsing Failed</h3>
          <p className="text-xs text-red-400/80 mt-2 mb-6">{error}</p>
          <button
            onClick={selectFiles}
            className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-black text-red-300 uppercase tracking-widest transition-all"
          >
            Try Different Files
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Ready state: Show List ─────────────────────────────────────────────
  if (workbooks.length > 0) {
    return (
      <div className="space-y-6">
        {hiddenInput}
        
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Sources ({workbooks.length})</h3>
          <button onClick={clearAll} className="text-[10px] font-black text-red-400/60 hover:text-red-400 uppercase tracking-widest transition-colors">
            Clear All
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {workbooks.map((wb, idx) => (
              <motion.div
                key={wb.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setActiveWorkbook(idx)}
                className={`group relative cursor-pointer rounded-2xl border transition-all duration-300 p-4 ${
                  activeWorkbookIndex === idx 
                    ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20" 
                    : "bg-white/[0.02] border-white/[0.05] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    activeWorkbookIndex === idx ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-500"
                  }`}>
                    <FileSpreadsheet size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate uppercase tracking-tight">{wb.fileName}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Local Source Shielded</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeWorkbook(idx); }}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button
          onClick={selectFiles}
          className="w-full py-4 rounded-2xl border border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-[0.2em] transition-all"
        >
          + Add More Files
        </button>
      </div>
    );
  }

  // ── Idle state ─────────────────────────────────────────────────────────
  return (
    <>
      {hiddenInput}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={selectFiles}
        className="group relative rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-xl hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-500 cursor-pointer overflow-hidden"
      >
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-emerald-500/0 group-hover:from-indigo-500/5 group-hover:to-emerald-500/5 transition-all duration-700" />
        
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-800/80 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
            <Upload size={32} />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Connect Your Data</h2>
          <p className="text-xs text-slate-500 mb-8 max-w-[240px] mx-auto uppercase tracking-widest font-bold leading-relaxed">
            Drag & Drop or Click to Upload <br/>
            <span className="text-indigo-400/80">.xlsx, .csv, .xlsm</span>
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-white/5 group-hover:scale-105 transition-transform">
            Select Multiple Files
          </div>
        </div>
      </motion.div>
    </>
  );
}
