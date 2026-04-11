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
          <span className="text-blue-700 font-medium">Loading Excel file...</span>
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
      <div className="rounded-[2rem] border-2 border-dashed border-slate-600 bg-slate-950/40 p-8 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.8)] backdrop-blur-md">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-700 bg-slate-900/80 text-3xl">
          📄
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2 text-center">Awaiting your Excel file...</h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto text-center">
          Upload or select an Excel workbook to begin. SheetFlow will parse the sheet, build visual analytics, and keep everything local.
        </p>

        <button
          onClick={selectFile}
          disabled={status === "selecting"}
          className="w-full p-4 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-semibold rounded-3xl hover:from-indigo-700 hover:to-emerald-700 disabled:opacity-50 transition"
        >
          {status === "selecting" ? "Selecting..." : "Select Excel File"}
        </button>

        {savedFileNames.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3 font-medium text-center">
              Recent workbook selections
            </p>
            <div className="grid gap-3">
              {savedFileNames.map((name: string) => (
                <button
                  key={name}
                  onClick={() => loadSavedFile(name)}
                  className="w-full text-left rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-foreground hover:bg-slate-900"
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
    <div className="space-y-3">
      {/* File info box */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">📄 File loaded</p>
            <p className="font-semibold text-green-900">{fileName}</p>
            <p className="text-xs text-green-700 mt-1">
              {isWatching ? "🔄 Watching for changes" : "⏸️ Watching paused"}
            </p>
          </div>
          <div className="text-2xl text-green-600">✓</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
        >
          🔄 Refresh
        </button>

        {isWatching ? (
          <button
            onClick={stopWatching}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium"
          >
            ⏸️ Pause Watching
          </button>
        ) : (
          <button
            onClick={resumeWatching}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium"
          >
            ▶️ Resume Watching
          </button>
        )}

        <button
          onClick={selectFile}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
        >
          📁 Choose Different File
        </button>

        <button
          onClick={clearFile}
          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}
