/**
 * useExcelLiveLink — Multi-file Excel hook with sessionStorage persistence.
 *
 * - User picks one or more files via <input type="file">
 * - Parsed workbooks are stored in sessionStorage (survives page refresh)
 * - Managed as a list: users can switch between multiple active files
 */
"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { parseExcelFile, ExcelWorkbook } from "@/lib/excelParser";

export type FileStatus = "idle" | "loading" | "ready" | "error";

export interface WorkbookEntry {
  fileName: string;
  workbook: ExcelWorkbook;
  id: string;
}

export interface UseExcelLiveLinkReturn {
  workbooks: WorkbookEntry[];
  activeWorkbookIndex: number;
  activeWorkbook: ExcelWorkbook | null;
  activeFileName: string | null;
  status: FileStatus;
  error: string | null;
  selectFiles: () => Promise<void>;
  setActiveWorkbook: (index: number) => void;
  clearAll: () => void;
  removeWorkbook: (index: number) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const SESSION_KEY_LIST = "sheetflow_workbooks_list";
const MAX_SESSION_BYTES = 30 * 1024 * 1024; // 30 MB aggregate cap

/** Save list of workbooks to sessionStorage */
function saveAllToSession(entries: WorkbookEntry[]) {
  try {
    const payload = JSON.stringify(entries);
    if (payload.length > MAX_SESSION_BYTES) return; 
    sessionStorage.setItem(SESSION_KEY_LIST, payload);
  } catch { /* ignore */ }
}

/** Restore from sessionStorage */
function loadAllFromSession(): WorkbookEntry[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_LIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useExcelLiveLink(): UseExcelLiveLinkReturn {
  const [workbooks, setWorkbooks] = useState<WorkbookEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [status, setStatus] = useState<FileStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Restore on mount
  useEffect(() => {
    const saved = loadAllFromSession();
    if (saved.length > 0) {
      setWorkbooks(saved);
      setStatus("ready");
    }
  }, []);

  // Parse files
  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const chosen = Array.from(e.target.files || []);
      if (inputRef.current) inputRef.current.value = "";
      if (chosen.length === 0) return;

      setStatus("loading");
      setError(null);

      try {
        const newEntries: WorkbookEntry[] = [];
        for (const f of chosen) {
          const wb = await parseExcelFile(f);
          newEntries.push({
            fileName: f.name,
            workbook: wb,
            id: crypto.randomUUID(),
          });
        }

        setWorkbooks((prev) => {
          const updated = [...prev, ...newEntries];
          saveAllToSession(updated);
          return updated;
        });
        setStatus("ready");
        // Auto-switch to the first new file if none existed
        if (workbooks.length === 0) setActiveIdx(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse files");
        setStatus("error");
      }
    },
    [workbooks.length]
  );

  const selectFiles = useCallback(async () => {
    inputRef.current?.click();
  }, []);

  const setActiveWorkbook = useCallback((index: number) => {
    if (index >= 0 && index < workbooks.length) {
      setActiveIdx(index);
    }
  }, [workbooks.length]);

  const removeWorkbook = useCallback((index: number) => {
    setWorkbooks((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      saveAllToSession(updated);
      return updated;
    });
    if (activeIdx >= index && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  }, [activeIdx]);

  const clearAll = useCallback(() => {
    setWorkbooks([]);
    setActiveIdx(0);
    setStatus("idle");
    sessionStorage.removeItem(SESSION_KEY_LIST);
  }, []);

  const activeEntry = workbooks[activeIdx] || null;

  return {
    workbooks,
    activeWorkbookIndex: activeIdx,
    activeWorkbook: activeEntry?.workbook || null,
    activeFileName: activeEntry?.fileName || null,
    status,
    error,
    selectFiles,
    setActiveWorkbook,
    clearAll,
    removeWorkbook,
    inputRef,
    handleInputChange,
  };
}
