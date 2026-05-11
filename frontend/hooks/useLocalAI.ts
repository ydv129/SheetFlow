/**
 * Custom React Hook: useLocalAI
 *
 * Manages local AI model initialization and inference via WebLLM.
 * NO DATA goes to the backend — everything runs in the browser.
 *
 * Key fixes:
 * - Uses correct WebLLM v0.2 API: CreateWebWorkerMLCEngine + chat.completions
 * - initProgressCallback passed at engine-creation time (not reload())
 * - Lazy init: engine is only created when user explicitly requests it
 * - Proper cleanup on unmount
 */

"use client";

import { useRef, useState, useCallback } from "react";
import {
  createSemanticChunks,
  findRelevantChunks,
  formatChunksForAI,
  createContextSummary,
} from "@/lib/semanticChunking";
import type { ExcelSheet } from "@/lib/excelParser";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AIModel = "SmolLM2-360M" | "TinyLlama-1.1B" | "Phi-3-mini-4k";

export type AIStatus =
  | "not-initialized" // Engine not started yet
  | "initializing"    // Creating WebWorker engine
  | "downloading-model" // Downloading / caching model weights
  | "ready"           // Ready for inference
  | "thinking"        // Processing a question
  | "error";          // Something went wrong

/**
 * Official MLC model IDs (must match prebuiltAppConfig exactly)
 */
const MODEL_ID_MAP: Record<AIModel, string> = {
  "SmolLM2-360M": "SmolLM2-360M-Instruct-q4f16_1-MLC",
  "TinyLlama-1.1B": "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
  "Phi-3-mini-4k": "Phi-3-mini-4k-instruct-q4f16_1-MLC",
};

export interface UseLocalAIReturn {
  status: AIStatus;
  isReady: boolean;
  currentModel: AIModel;
  downloadProgress: number; // 0-100
  switchModel: (model: AIModel) => Promise<void>;
  askQuestion: (query: string, sheet: ExcelSheet) => Promise<string>;
  stopGeneration: () => void;
  initEngine: () => Promise<void>; // explicitly trigger engine init
  lastResponse: string | null;
  error: string | null;
  estimatedTokens: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLocalAI(): UseLocalAIReturn {
  /** The MLC engine instance (lazily created) */
  const engineRef = useRef<any>(null);

  const [status, setStatus] = useState<AIStatus>("not-initialized");
  const [currentModel, setCurrentModel] = useState<AIModel>("SmolLM2-360M");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTokens, setEstimatedTokens] = useState(0);

  const isMounted = useRef(true);
  // Track whether init has already been triggered
  const initStarted = useRef(false);

  // ── Internal: load a model by ID ─────────────────────────────────────────

  const loadModel = useCallback(
    async (modelId: string): Promise<boolean> => {
      if (!engineRef.current) return false;
      try {
        console.log(`[useLocalAI] Loading model: ${modelId}`);
        await engineRef.current.reload(modelId);
        console.log(`[useLocalAI] Model ready: ${modelId}`);
        return true;
      } catch (err: any) {
        console.warn(`[useLocalAI] Model ${modelId} failed:`, err?.message ?? err);
        return false;
      }
    },
    []
  );

  // ── Public: initialize engine (called on demand) ──────────────────────────

  const initEngine = useCallback(async () => {
    if (initStarted.current) return; // prevent double-init
    initStarted.current = true;

    try {
      setStatus("initializing");
      setError(null);

      // Dynamic import keeps the heavy WebLLM bundle out of initial JS
      const webllm = await import("@mlc-ai/web-llm");

      // Build app config — merge prebuilt list with any custom model_list.json
      let appConfig = webllm.prebuiltAppConfig;
      try {
        const res = await fetch("/model_list.json");
        if (res.ok) {
          const custom = await res.json();
          appConfig = {
            ...appConfig,
            model_list: [
              ...appConfig.model_list,
              ...(custom.model_list ?? []),
            ],
          };
        }
      } catch {
        console.warn("[useLocalAI] Could not load custom model_list.json, using defaults");
      }

      // ── Create engine in a dedicated Web Worker ──────────────────────────
      // initProgressCallback MUST be passed here in v0.2 (not inside reload())
      const engine = await webllm.CreateWebWorkerMLCEngine(
        new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }),
        MODEL_ID_MAP["SmolLM2-360M"], // load default model immediately
        {
          appConfig,
          initProgressCallback: (report: { progress: number; text: string }) => {
            if (!isMounted.current) return;
            const pct = Math.floor((report.progress ?? 0) * 100);
            setDownloadProgress(pct);
            if (pct < 100) {
              setStatus("downloading-model");
            }
          },
        }
      );

      engineRef.current = engine;

      if (isMounted.current) {
        setStatus("ready");
        setDownloadProgress(0);
        setCurrentModel("SmolLM2-360M");
      }
    } catch (err: any) {
      console.error("[useLocalAI] Engine init failed:", err);
      if (isMounted.current) {
        initStarted.current = false; // allow retry
        setStatus("error");
        setError(
          err?.message?.includes("WebGPU")
            ? "Your browser doesn't support WebGPU. Try Chrome 113+ or Edge 113+."
            : `Failed to initialize AI engine: ${err?.message ?? err}. Check your connection and refresh.`
        );
      }
    }
  }, [loadModel]);

  // ── Switch model ──────────────────────────────────────────────────────────

  const switchModel = useCallback(
    async (newModel: AIModel) => {
      if (newModel === currentModel && status === "ready") return;

      if (!engineRef.current) {
        setError("AI engine not initialized. Click 'Load AI' first.");
        return;
      }

      try {
        setStatus("downloading-model");
        setDownloadProgress(0);
        setError(null);

        const ok = await loadModel(MODEL_ID_MAP[newModel]);
        if (!ok) {
          throw new Error(`Model ${newModel} could not be loaded.`);
        }

        if (isMounted.current) {
          setCurrentModel(newModel);
          setStatus("ready");
          setDownloadProgress(0);
        }
      } catch (err: any) {
        if (isMounted.current) {
          setStatus("error");
          setError(`Switch failed: ${err?.message ?? err}. Refresh and try again.`);
        }
      }
    },
    [currentModel, status, loadModel]
  );

  // ── Ask a question ────────────────────────────────────────────────────────

  const askQuestion = useCallback(
    async (query: string, sheet: ExcelSheet): Promise<string> => {
      if (!engineRef.current) {
        throw new Error("AI engine not initialized");
      }
      if (status !== "ready") {
        throw new Error(`AI not ready (status: ${status}). Please wait.`);
      }

      try {
        setStatus("thinking");
        setError(null);
        setLastResponse(null);

        // Semantic RAG: find relevant chunks and format them
        const chunks = createSemanticChunks(sheet, 100);
        const relevant = findRelevantChunks(chunks, query);
        const formattedData = formatChunksForAI(relevant);
        const context = createContextSummary(sheet);

        const tokenEstimate = Math.ceil(
          (context.length + formattedData.length + query.length) / 4
        );
        if (isMounted.current) setEstimatedTokens(tokenEstimate);

        // ── WebLLM v0.2 chat.completions API ────────────────────────────────
        const response = await engineRef.current.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are a helpful data analyst. ${context} Be concise and specific.`,
            },
            {
              role: "user",
              content: `Based on this data:\n\n${formattedData}\n\nAnswer: ${query}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 512,
          stream: true,
        });

        let fullText = "";
        for await (const chunk of response) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          fullText += delta;
          if (isMounted.current) setLastResponse(fullText);
        }

        if (isMounted.current) setStatus("ready");
        return fullText;
      } catch (err: any) {
        console.error("[useLocalAI] askQuestion error:", err);
        if (isMounted.current) {
          setStatus("error");
          setError(`AI error: ${err?.message ?? err}`);
        }
        throw err;
      }
    },
    [status]
  );

  // ── Stop generation ───────────────────────────────────────────────────────

  const stopGeneration = useCallback(() => {
    if (engineRef.current && status === "thinking") {
      try {
        engineRef.current.interruptGenerate?.();
      } catch {
        /* ignore */
      }
      if (isMounted.current) setStatus("ready");
    }
  }, [status]);

  return {
    status,
    isReady: status === "ready",
    currentModel,
    downloadProgress,
    switchModel,
    askQuestion,
    stopGeneration,
    initEngine,
    lastResponse,
    error,
    estimatedTokens,
  };
}
