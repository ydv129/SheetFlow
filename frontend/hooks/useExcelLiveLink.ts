/**
 * Custom React Hook: useExcelLiveLink
 *
 * Manages live-linked Excel files with automatic polling
 *
 * Features:
 * - Let user pick Excel file from their computer
 * - Remember file between browser sessions (IndexedDB)
 * - Watch file for changes (Web Worker polls every 5 seconds)
 * - Auto-parse and update when file changes
 * - All data stays in browser (never sent to server)
 *
 * Usage:
 * const { fileHandle, workbook, isWatching, selectFile, refresh } = useExcelLiveLink();
 *
 * if (!fileHandle) {
 *   return <button onClick={selectFile}>Select Excel File</button>;
 * }
 *
 * return <ExcelViewer data={workbook} />;
 */

"use client";

import { useEffect, useRef, useState } from "react";
import {
  getFileHandle,
  saveFileHandle,
  deleteFileHandle,
  listSavedFileHandles,
} from "@/frontend/store/indexeddb";
import { parseExcelFile, ExcelWorkbook } from "@/lib/excelParser";

/**
 * State of the current file operation
 */
export type FileStatus =
  | "idle" // Waiting for user action
  | "selecting" // User is selecting a file
  | "loading" // Loading and parsing file
  | "watching" // File is loaded and being watched
  | "error"; // An error occurred

/**
 * Main hook return type
 */
export interface UseExcelLiveLinkReturn {
  // File information
  fileHandle: FileSystemFileHandle | null;
  fileName: string | null;

  // Parsed Excel data
  workbook: ExcelWorkbook | null;

  // State information
  status: FileStatus;
  isWatching: boolean;
  error: string | null;

  // Actions user can take
  selectFile: () => Promise<void>;
  refresh: () => Promise<void>;
  clearFile: () => Promise<void>;
  stopWatching: () => void;
  resumeWatching: () => Promise<void>;

  // Previously opened files
  savedFileNames: string[];
  loadSavedFile: (fileName: string) => Promise<void>;
}

/**
 * The main hook implementation
 */
export function useExcelLiveLink(): UseExcelLiveLinkReturn {
  // Current file being watched
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
    null
  );

  // Parsed Excel data
  const [workbook, setWorkbook] = useState<ExcelWorkbook | null>(null);

  // Current status
  const [status, setStatus] = useState<FileStatus>("idle");

  // Error message if something went wrong
  const [error, setError] = useState<string | null>(null);

  // Whether file watching is currently active
  const [isWatching, setIsWatching] = useState(false);

  // List of previously saved files
  const [savedFileNames, setSavedFileNames] = useState<string[]>([]);

  // Reference to the Web Worker for polling
  const workerRef = useRef<Worker | null>(null);

  // Track if this component is mounted (for cleanup)
  const isMountedRef = useRef(true);

  /**
   * Initialize the Web Worker on component mount
   */
  useEffect(() => {
    // Create the Web Worker
    // Note: The worker file is served from the public folder
    try {
      workerRef.current = new Worker("/excelWatcher.worker.js");

      // Listen for messages from the worker
      workerRef.current.onmessage = (event) => {
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;

        const { type, error: workerError } = event.data;

        if (type === "file-changed") {
          // File has been modified - refresh it
          handleFileChanged();
        } else if (type === "error") {
          setError(`File watcher error: ${workerError}`);
          setIsWatching(false);
        }
      };

      // Load list of previously saved files
      loadSavedFilesList();
    } catch (err) {
      console.error("Failed to create Web Worker:", err);
      setError("File watching not available (Web Workers not supported)");
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  /**
   * When component mounts, try to restore previously saved file
   */
  useEffect(() => {
    if (fileHandle === null) {
      restorePreviouslySavedFile();
    }
  }, []);

  /**
   * Load list of saved file names from IndexedDB
   */
  async function loadSavedFilesList(): Promise<void> {
    const fileNames = await listSavedFileHandles();
    setSavedFileNames(fileNames);
  }

  /**
   * Try to restore the most recently used file
   */
  async function restorePreviouslySavedFile(): Promise<void> {
    try {
      // Get the most recent file (first in the list)
      const fileNames = await listSavedFileHandles();
      if (fileNames.length === 0) {
        return;
      }

      const mostRecentFileName = fileNames[0];

      // Try to load it
      const savedHandle = await getFileHandle(mostRecentFileName);
      if (savedHandle) {
        await loadAndParseFile(savedHandle, mostRecentFileName);
      }
    } catch (err) {
      // If restore fails, just continue without it
      console.log("Could not restore previous file");
    }
  }

  /**
   * File picker - let user select an Excel file
   */
  async function selectFile(): Promise<void> {
    try {
      setStatus("selecting");
      setError(null);

      const filePicker = (window as any).showOpenFilePicker;
      if (!filePicker) {
        throw new Error(
          "File System Access API is not supported in this browser. Use a supported Chromium-based browser."
        );
      }

      // Show file picker
      // This is the File System Access API - available in modern browsers
      const [fileHandle] = await filePicker({
        types: [
          {
            description: "Excel Files",
            accept: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
              "application/vnd.ms-excel": [".xls"],
              "application/vnd.ms-excel.sheet.macroEnabled.12": [".xlsm"],
            },
          },
        ],
      });

      // User cancelled the file picker
      if (!fileHandle) {
        setStatus("idle");
        return;
      }

      // Load and parse the file
      await loadAndParseFile(fileHandle, fileHandle.name);

      // Save it for next time
      await saveFileHandle(fileHandle, fileHandle.name);
      await loadSavedFilesList();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown error during file selection";
      setError(errorMsg);
      setStatus("error");
      console.error("Error selecting file:", err);
    }
  }

  /**
   * Load a file from saved list
   */
  async function loadSavedFile(fileName: string): Promise<void> {
    try {
      setError(null);
      const savedHandle = await getFileHandle(fileName);

      if (!savedHandle) {
        setError("Saved file is no longer accessible. Please select it again.");
        // Clean it up
        await deleteFileHandle(fileName);
        await loadSavedFilesList();
        return;
      }

      await loadAndParseFile(savedHandle, fileName);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown error loading file";
      setError(errorMsg);
      setStatus("error");
    }
  }

  /**
   * Load and parse an Excel file
   * Core logic that reads file and updates state
   */
  async function loadAndParseFile(
    handle: FileSystemFileHandle,
    displayName: string
  ): Promise<void> {
    try {
      setStatus("loading");
      setError(null);

      // Get the file from the handle
      const file = await handle.getFile();

      // Parse the Excel file
      const parsedWorkbook = await parseExcelFile(file);

      // Update state only if component is still mounted
      if (!isMountedRef.current) return;

      setFileHandle(handle);
      setWorkbook(parsedWorkbook);
      setStatus("watching");

      // Start watching for changes
      startFileWatcher(handle);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown error parsing file";
      setError(errorMsg);
      setStatus("error");
      console.error("Error parsing Excel file:", err);
    }
  }

  /**
   * Start the Web Worker to watch for file changes
   */
  function startFileWatcher(handle: FileSystemFileHandle): void {
    if (!workerRef.current) {
      console.warn("Web Worker not available");
      return;
    }

    try {
      // Tell the worker to start watching
      workerRef.current.postMessage({
        type: "start-watching",
        fileHandle: handle,
        interval: 5000, // Check every 5 seconds
      });

      setIsWatching(true);
    } catch (err) {
      console.error("Error starting file watcher:", err);
      setError("Could not start file watcher");
    }
  }

  /**
   * Called when the file watcher detects the file has changed
   */
  async function handleFileChanged(): Promise<void> {
    if (!fileHandle) return;

    try {
      setStatus("loading");

      // Re-parse the file
      const file = await fileHandle.getFile();
      const parsedWorkbook = await parseExcelFile(file);

      if (isMountedRef.current) {
        setWorkbook(parsedWorkbook);
        setStatus("watching");
        setError(null);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown error reloading file";
      setError(errorMsg);
      setStatus("error");
      console.error("Error reloading file:", err);
    }
  }

  /**
   * Manually refresh the file
   */
  async function refresh(): Promise<void> {
    if (!fileHandle) {
      setError("No file selected");
      return;
    }

    await handleFileChanged();
  }

  /**
   * Stop watching for changes (but keep file loaded)
   */
  function stopWatching(): void {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "stop-watching" });
    }
    setIsWatching(false);
  }

  /**
   * Resume watching for changes
   */
  async function resumeWatching(): Promise<void> {
    if (fileHandle) {
      startFileWatcher(fileHandle);
    }
  }

  /**
   * Clear the current file
   */
  async function clearFile(): Promise<void> {
    try {
      stopWatching();

      if (fileHandle) {
        await deleteFileHandle(fileHandle.name);
      }

      setFileHandle(null);
      setWorkbook(null);
      setStatus("idle");
      setError(null);

      await loadSavedFilesList();
    } catch (err) {
      console.error("Error clearing file:", err);
      setError("Could not clear file");
    }
  }

  return {
    // State
    fileHandle,
    fileName: fileHandle?.name || null,
    workbook,
    status,
    isWatching,
    error,
    savedFileNames,

    // Actions
    selectFile,
    refresh,
    clearFile,
    stopWatching,
    resumeWatching,
    loadSavedFile,
  };
}
