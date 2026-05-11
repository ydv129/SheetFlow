/**
 * useExcelLiveLink — Upload-only Excel hook with sessionStorage persistence.
 *
 * - User picks a file via <input type="file">
 * - Parsed workbook is stored in sessionStorage (survives page refresh)
 * - No polling, no Web Workers, no IndexedDB
 */
"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { parseExcelFile, ExcelWorkbook } from "@/lib/excelParser";

export type FileStatus = "idle" | "loading" | "ready" | "error";

export interface UseExcelLiveLinkReturn {
  fileHandle: File | null;
  fileName: string | null;
  workbook: ExcelWorkbook | null;
  status: FileStatus;
  isWatching: boolean;
  error: string | null;
  selectFile: () => Promise<void>;
  refresh: () => Promise<void>;
  clearFile: () => Promise<void>;
  stopWatching: () => void;
  resumeWatching: () => Promise<void>;
  savedFileNames: string[];
  loadSavedFile: (fileName: string) => Promise<void>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const SESSION_KEY = "sheetflow_workbook";
const MAX_SESSION_BYTES = 25 * 1024 * 1024; // 25 MB cap

/** Try to save workbook+name to sessionStorage. Silently skip if too large. */
function saveToSession(fileName: string, wb: ExcelWorkbook) {
  try {
    const payload = JSON.stringify({ fileName, workbook: wb });
    if (payload.length > MAX_SESSION_BYTES) return; // skip huge files
    sessionStorage.setItem(SESSION_KEY, payload);
  } catch {
    // quota exceeded — ignore
  }
}

/** Restore from sessionStorage. Returns null on failure. */
function loadFromSession(): { fileName: string; workbook: ExcelWorkbook } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.fileName && parsed?.workbook) return parsed as { fileName: string; workbook: ExcelWorkbook };
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
  }
  return null;
}

export function useExcelLiveLink(): UseExcelLiveLinkReturn {
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<ExcelWorkbook | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<FileStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ── Restore from sessionStorage on first mount ─────────────────────────
  useEffect(() => {
    const saved = loadFromSession();
    if (saved) {
      setWorkbook(saved.workbook);
      setFileName(saved.fileName);
      setStatus("ready");
    }
  }, []);

  // ── Parse a File object ────────────────────────────────────────────────
  const parseFile = useCallback(async (f: File) => {
    try {
      setStatus("loading");
      setError(null);
      const wb = await parseExcelFile(f);
      setFile(f);
      setFileName(f.name);
      setWorkbook(wb);
      setStatus("ready");
      saveToSession(f.name, wb);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to parse file";
      setError(msg);
      setStatus("error");
      console.error("[useExcelUpload] parse error:", err);
    }
  }, []);

  // ── Open file picker ───────────────────────────────────────────────────
  const selectFile = useCallback(async () => {
    inputRef.current?.click();
  }, []);

  // ── Handle input change (called by ExcelUploadSection via ref) ─────────
  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const chosen = e.target.files?.[0];
      if (inputRef.current) inputRef.current.value = "";
      if (!chosen) return;
      await parseFile(chosen);
    },
    [parseFile]
  );



  // ── Re-parse current file (requires original File object) ─────────────
  const refresh = useCallback(async () => {
    if (!file) {
      // If restored from session, no File object — just re-render from state
      if (workbook) { setStatus("ready"); return; }
      setError("No file loaded — please upload again.");
      return;
    }
    await parseFile(file);
  }, [file, workbook, parseFile]);

  // ── Clear everything ───────────────────────────────────────────────────
  const clearFile = useCallback(async () => {
    setFile(null);
    setFileName(null);
    setWorkbook(null);
    setStatus("idle");
    setError(null);
    sessionStorage.removeItem(SESSION_KEY);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return {
    fileHandle: file,
    fileName,
    workbook,
    status,
    isWatching: false,
    error,
    selectFile,
    refresh,
    clearFile,
    stopWatching: () => {},
    resumeWatching: async () => {},
    savedFileNames: [],
    loadSavedFile: async () => {},
    inputRef,
    handleInputChange,
  };
}
