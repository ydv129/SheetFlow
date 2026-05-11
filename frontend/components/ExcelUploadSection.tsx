"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UseExcelLiveLinkReturn } from "@/frontend/hooks/useExcelLiveLink";
import { Upload, FileSpreadsheet, RefreshCw, Trash2, FolderOpen, CheckCircle2, AlertCircle } from "lucide-react";

interface ExcelUploadSectionProps {
  liveLink: UseExcelLiveLinkReturn;
  onFileLoaded?: (loaded: boolean) => void;
}

export function ExcelUploadSection({ liveLink, onFileLoaded }: ExcelUploadSectionProps) {
  const { fileName, status, error, selectFile, refresh, clearFile, inputRef, handleInputChange } = liveLink;

  useEffect(() => {
    onFileLoaded?.(status === "ready");
  }, [status, onFileLoaded]);

  // Hidden input — always in DOM
  const hiddenInput = (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="file"
      accept=".xlsx,.xls,.xlsm,.csv"
      className="hidden"
      onChange={handleInputChange}
    />
  );

  // ── Parsing ────────────────────────────────────────────────────────────
  if ((status as string) === "loading") {
    return (
      <>
        {hiddenInput}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Parsing spreadsheet…</p>
              <p className="text-xs text-slate-500 mt-0.5">Reading sheets and extracting data</p>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (status === "error" && error) {
    return (
      <>
        {hiddenInput}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-500/20 bg-red-950/30 p-5 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-300 text-sm">Error loading file</p>
              <p className="text-red-400 text-xs mt-1">{error}</p>
              <button
                onClick={selectFile}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-300 hover:text-white transition"
              >
                <FolderOpen size={12} /> Try another file
              </button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  // ── File ready (uploaded OR restored from session) ─────────────────────
  if (status === "ready" && fileName) {
    return (
      <>
        {hiddenInput}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-emerald-400 font-medium">File ready</p>
              <p className="font-semibold text-white text-sm truncate">{fileName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">🔒 Stored locally in this session</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={selectFile}
                title="Change file"
                className="flex items-center gap-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition active:scale-95"
              >
                <FolderOpen size={12} /> Change
              </button>
              <button
                onClick={clearFile}
                title="Remove file"
                className="flex items-center gap-1 rounded-lg bg-red-900/30 hover:bg-red-900/50 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 transition active:scale-95"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  // ── Idle: no file ──────────────────────────────────────────────────────
  return (
    <>
      {hiddenInput}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-10 text-center backdrop-blur-sm hover:border-indigo-500/50 transition-colors cursor-pointer group"
        onClick={selectFile}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80 text-slate-400 group-hover:border-indigo-500/40 group-hover:text-indigo-400 transition-all">
          <FileSpreadsheet size={28} />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Upload your spreadsheet</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
          .xlsx, .xls, .xlsm, or .csv — parsed locally in your browser, never uploaded.
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); selectFile(); }}
          className="mx-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Upload size={15} /> Choose File
        </button>
      </motion.div>
    </>
  );
}
