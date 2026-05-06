/**
 * ExcelUploadSection Component
 * Displays file selection UI and file information
 * Shows loading states and errors clearly
 */

"use client";

import React from "react";
import type { UseExcelLiveLinkReturn } from "@/frontend/hooks/useExcelLiveLink";

interface ExcelUploadSectionProps {
  liveLink: UseExcelLiveLinkReturn;
  onFileLoaded?: (loaded: boolean) => void;
}

export function ExcelUploadSection({
  liveLink,
  onFileLoaded,
}: ExcelUploadSectionProps) {
  const {
    fileHandle,
    fileName,
    status,
    isWatching,
    error,
    savedFileNames,
    selectFile,
    refresh,
    clearFile,
    loadSavedFile,
    stopWatching,
    resumeWatching,
  } = liveLink;

  // Notify parent when file is loaded or cleared
  React.useEffect(() => {
    if (!onFileLoaded) {
      return;
    }

    onFileLoaded(status === "watching");
  }, [status, onFileLoaded]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-blue-700 font-medium">
            Loading Excel file...
          </span>
        </div>
      </div>
    );
  }

  // Show error state
  if (status === "error" && error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-2">Error loading file</h3>
        <p className="text-red-800 text-sm mb-3">{error}</p>
        <button
          onClick={selectFile}
          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show no file selected state
  if (!fileHandle) {
    return (
      <div className="rounded-xl sm:rounded-2xl md:rounded-[2rem] border-2 border-dashed border-slate-600 bg-slate-950/40 p-4 sm:p-6 md:p-8 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.8)] backdrop-blur-md">
        <div className="mx-auto mb-4 sm:mb-6 flex h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 items-center justify-center rounded-2xl sm:rounded-3xl border border-slate-700 bg-slate-900/80 text-2xl sm:text-3xl">
          📄
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 text-center">
          Awaiting your Excel file...
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto text-center">
          Upload or select a spreadsheet (Excel, CSV, or ODS). SheetFlow will
          parse the sheets, build visual analytics, and keep everything local.
        </p>

        <button
          onClick={selectFile}
          disabled={status === "selecting"}
          className="w-full p-3 sm:p-4 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-semibold rounded-2xl sm:rounded-3xl hover:from-indigo-700 hover:to-emerald-700 disabled:opacity-50 transition text-sm sm:text-base active:scale-95"
        >
          {status === "selecting" ? "Selecting..." : "Select Excel File"}
        </button>

        {savedFileNames.length > 0 && (
          <div className="mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 font-medium text-center">
              Recent workbook selections
            </p>
            <div className="grid gap-2 sm:gap-3">
              {savedFileNames.map((name: string) => (
                <button
                  key={name}
                  onClick={() => loadSavedFile(name)}
                  className="w-full text-left rounded-lg sm:rounded-2xl border border-slate-700 bg-slate-900/70 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-foreground hover:bg-slate-900 transition active:scale-95"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show file loaded state
  return (
    <div className="space-y-2 sm:space-y-3">
      {/* File info box */}
      <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/30 dark:border-green-900 dark:text-green-100">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium">
              📄 File loaded
            </p>
            <p className="font-semibold text-green-900 dark:text-green-100 truncate text-sm sm:text-base">
              {fileName}
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
              {isWatching ? "🔄 Watching for changes" : "⏸️ Watching paused"}
            </p>
          </div>
          <div className="text-xl sm:text-2xl text-green-600 flex-shrink-0">
            ✓
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={refresh}
          className="px-2 sm:px-3 md:px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs sm:text-sm font-medium transition active:scale-95 flex-grow sm:flex-grow-0"
        >
          🔄 Refresh
        </button>

        {isWatching ? (
          <button
            onClick={stopWatching}
            className="px-2 sm:px-3 md:px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs sm:text-sm font-medium transition active:scale-95 flex-grow sm:flex-grow-0"
          >
            ⏸️ Pause
          </button>
        ) : (
          <button
            onClick={resumeWatching}
            className="px-2 sm:px-3 md:px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs sm:text-sm font-medium transition active:scale-95 flex-grow sm:flex-grow-0"
          >
            ▶️ Resume
          </button>
        )}

        <button
          onClick={selectFile}
          className="px-2 sm:px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs sm:text-sm font-medium transition active:scale-95 flex-grow sm:flex-grow-0"
        >
          📁 Choose
        </button>

        <button
          onClick={clearFile}
          className="px-2 sm:px-3 md:px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs sm:text-sm font-medium transition active:scale-95 flex-grow sm:flex-grow-0"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}
