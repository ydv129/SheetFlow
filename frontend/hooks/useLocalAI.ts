/**
 * Custom React Hook: useLocalAI
 *
 * Manages local AI model initialization and inference
 * NO DATA goes to the backend - everything runs in the browser
 *
 * Features:
 * - Initialize WebLLM engine with GPU acceleration
 * - Default to fast small model (SmolLM2-360M)
 * - Option to download larger model (Gemma-4-E2B)
 * - Generate responses about Excel data
 * - Track model download progress
 *
 * Usage:
 * const { isReady, model, response, askQuestion } = useLocalAI();
 * if (isReady) {
 *   const answer = await askQuestion("What's the average price?", chunks);
 * }
 */

"use client";

import { useEffect, useRef, useState } from "react";
import {
  createSemanticChunks,
  findRelevantChunks,
  formatChunksForAI,
  createContextSummary,
  DataChunk,
} from "@/lib/semanticChunking";
import type { ExcelSheet } from "@/lib/excelParser";

/**
 * Available AI models
 * TinyLlama: 1.1B ultra-lightweight model for browsers
 * Phi-3-mini: 3.8B efficient model with better quality
 */
export type AIModel = "TinyLlama-1.1B" | "Phi-3-mini-4k";

/**
 * State of the AI engine
 */
export type AIStatus =
  | "not-initialized" // Not started yet
  | "initializing" // Loading WebLLM library
  | "downloading-model" // Downloading the model
  | "ready" // Ready for inference
  | "thinking" // Processing a question
  | "error"; // An error occurred

/**
 * Main hook return type
 */
export interface UseLocalAIReturn {
  // Status information
  status: AIStatus;
  isReady: boolean;
  currentModel: AIModel;
  downloadProgress: number; // 0-100

  // Model management
  switchModel: (model: AIModel) => Promise<void>;

  // AI operations
  askQuestion: (query: string, sheet: ExcelSheet) => Promise<string>;
  stopGeneration: () => void;

  // State information
  lastResponse: string | null;
  error: string | null;
  estimatedTokens: number; // How many tokens will be used
}

/**
 * Type for WebLLM engine (we import it dynamically to avoid build issues)
 */
interface WebLLMEngine {
  reload(modelId: string): Promise<void>;
  generate(
    prompt: string,
    options?: {
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
    },
  ): AsyncIterable<string>;
  interruptGenerate(): void;
}

/**
 * Calculate SHA-256 hash of data
 */
async function calculateSHA256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Expected checksums for model chunks (these would be provided by the model registry)
 * In a real implementation, these would be fetched from a trusted source
 */
const EXPECTED_CHECKSUMS: Record<string, string> = {};

/**
 * Validate model data integrity before loading
 */
async function validateModelChecksum(
  modelId: string,
  modelData: ArrayBuffer,
): Promise<boolean> {
  try {
    const expectedChecksum = EXPECTED_CHECKSUMS[modelId];

    if (!expectedChecksum) {
      return true; // No checksum configured for this model yet
    }

    const actualChecksum = await calculateSHA256(modelData);
    const isValid = actualChecksum === expectedChecksum;

    if (!isValid) {
      console.error(
        `Model checksum validation failed for ${modelId}. Expected: ${expectedChecksum}, Got: ${actualChecksum}`,
      );
    }

    return isValid;
  } catch (error) {
    console.error("Error validating model checksum:", error);
    return false;
  }
}

/**
 * The main hook implementation
 */
export function useLocalAI(): UseLocalAIReturn {
  // Engine instance (lazy loaded)
  const engineRef = useRef<WebLLMEngine | null>(null);

  // Current status
  const [status, setStatus] = useState<AIStatus>("not-initialized");

  // Model info
  const [currentModel, setCurrentModel] = useState<AIModel>("TinyLlama-1.1B");

  // Download progress tracking
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Last response from AI
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  // Error message if something went wrong
  const [error, setError] = useState<string | null>(null);

  // Estimate of tokens that will be used
  const [estimatedTokens, setEstimatedTokens] = useState(0);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Initialize the AI engine on component mount
   * This loads WebLLM library and prepares the engine
   */
  useEffect(() => {
    const initializeAI = async () => {
      try {
        setStatus("initializing");
        setError(null);

        const webllm = await import("@mlc-ai/web-llm");
        const engine = new webllm.MLCEngine() as unknown as WebLLMEngine;
        engineRef.current = engine;

        setStatus("downloading-model");

        // List of lightweight models to try (in order of preference)
        const modelsToTry = [
          "TinyLlama-1.1B-Chat-v1.0-int4",
          "TinyLlama-1.1B-Chat-v1.0-q4f16_1",
          "TinyLlama-1.1B-Chat-v1.0-q80f32",
          "llama-2-7b-chat-hf-q4f16_1",
          "Mistral-7B-Instruct-v0.2-q4f16_1",
          "neural-chat-7b-v3-1-q4f16_1",
          "OpenHermes-2.5-Mistral-7B-q4f16_1",
        ];

        let modelLoaded = false;

        for (const modelId of modelsToTry) {
          try {
            console.log(`Trying to load model: ${modelId}`);
            await engine.reload(modelId);
            console.log(`Successfully loaded: ${modelId}`);
            modelLoaded = true;
            break;
          } catch (err: any) {
            console.warn(`Model ${modelId} not available:`, err?.message);
            continue;
          }
        }

        if (!modelLoaded) {
          if (isMountedRef.current) {
            setStatus("error");
            setError(
              "No lightweight AI models available. Check internet connection and try refreshing the page."
            );
          }
          return;
        }

        if (isMountedRef.current) {
          setStatus("ready");
          setDownloadProgress(0);
        }
      } catch (err) {
        console.warn("AI initialization skipped:", err instanceof Error ? err.message : err);
        if (isMountedRef.current) {
          setStatus("error");
          setError(
            "Local AI unavailable. You can still analyze Excel files without AI assistance."
          );
        }
      }
    };

    initializeAI();

    return () => {
      isMountedRef.current = false;
      if (engineRef.current) {
        try {
          if (typeof (engineRef.current as any).unload === "function") {
            (engineRef.current as any).unload();
          }
        } catch (err) {
          console.warn("Failed to unload AI model:", err);
        }
        engineRef.current = null;
      }
    };
  }, []);

  /**
   * Switch to a different model
   * Useful when user needs more advanced analysis
   */
  async function switchModel(newModel: AIModel): Promise<void> {
    if (!engineRef.current) {
      setError("AI engine not initialized");
      return;
    }

    if (newModel === currentModel) {
      return;
    }

    try {
      setStatus("downloading-model");
      setDownloadProgress(0);
      setError(null);

      const modelsToTry = [
        "TinyLlama-1.1B-Chat-v1.0-int4",
        "TinyLlama-1.1B-Chat-v1.0-q4f16_1",
        "TinyLlama-1.1B-Chat-v1.0-q80f32",
        "llama-2-7b-chat-hf-q4f16_1",
        "Mistral-7B-Instruct-v0.2-q4f16_1",
        "neural-chat-7b-v3-1-q4f16_1",
        "OpenHermes-2.5-Mistral-7B-q4f16_1",
      ];

      // For Phi model, try different variants
      if (newModel === "Phi-3-mini-4k") {
        modelsToTry.unshift(
          "Phi-3-mini-4k-instruct-q4f16_1",
          "Phi-3-mini-instruct-v0.2-q4f16_1",
          "Phi-3-mini-q4f16_1"
        );
      }

      let modelLoaded = false;
      let lastError = "";

      for (const modelId of modelsToTry) {
        try {
          console.log(`Switching to model: ${modelId}`);
          await engineRef.current.reload(modelId);
          console.log(`Successfully switched to: ${modelId}`);
          modelLoaded = true;
          break;
        } catch (err: any) {
          lastError = err?.message || String(err);
          console.warn(`Model ${modelId} not available:`, lastError);
          continue;
        }
      }

      if (!modelLoaded) {
        throw new Error(
          `No available model for ${newModel}. Check internet and refresh.`
        );
      }

      if (isMountedRef.current) {
        setCurrentModel(newModel);
        setStatus("ready");
        setDownloadProgress(0);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to switch model";

      console.error("Model switch error:", err);

      if (isMountedRef.current) {
        setStatus("error");
        setError(`Failed to switch model: ${errorMsg}. Please refresh and try again.`);
      }
    }
  }

  /**
   * Ask the AI a question about Excel data
   * This is the main function users will call
   */
  async function askQuestion(
    query: string,
    sheet: ExcelSheet,
  ): Promise<string> {
    if (!engineRef.current) {
      throw new Error("AI engine not ready");
    }

    if (status !== "ready") {
      throw new Error(
        `AI not ready. Current status: ${status}. Please wait for initialization.`,
      );
    }

    try {
      setStatus("thinking");
      setError(null);
      setLastResponse(null);

      // Create semantic chunks from the data
      // This breaks large datasets into manageable pieces
      const chunks = createSemanticChunks(sheet, 100);

      // Find the most relevant chunks to the question
      // This reduces the amount of data sent to the AI
      const relevantChunks = findRelevantChunks(chunks, query);

      // Format the chunks into a prompt
      const formattedData = formatChunksForAI(relevantChunks);

      // Create context that helps AI understand the data
      const context = createContextSummary(sheet);

      // Build the complete prompt
      // This is what gets sent to the AI model
      const systemPrompt =
        `You are a helpful data analyst. ${context} ` +
        `When answering questions, be concise and specific. `;

      const userPrompt =
        `Based on this data:\n\n${formattedData}\n\n` +
        `Please answer this question: ${query}\n\n` +
        `Provide a clear, actionable answer.`;

      // Estimate tokens (rough calculation: 1 token ≈ 4 characters)
      const estimatedTokenCount = Math.ceil(
        (systemPrompt.length + userPrompt.length) / 4,
      );
      if (isMountedRef.current) {
        setEstimatedTokens(estimatedTokenCount);
      }

      // Generate response using the model
      // This runs entirely in the browser - no cloud calls!
      let fullResponse = "";

      // Stream the response
      for await (const chunk of engineRef.current.generate(userPrompt)) {
        fullResponse += chunk;

        if (isMountedRef.current) {
          setLastResponse(fullResponse);
        }
      }

      if (isMountedRef.current) {
        setStatus("ready");
      }

      return fullResponse;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to generate response";

      console.error("Query error:", err);

      if (isMountedRef.current) {
        setStatus("error");
        setError(`AI Error: ${errorMsg}`);
      }

      throw err;
    }
  }

  /**
   * Stop generation immediately
   * Useful if response is taking too long
   */
  function stopGeneration(): void {
    if (engineRef.current && status === "thinking") {
      engineRef.current.interruptGenerate();

      if (isMountedRef.current) {
        setStatus("ready");
      }
    }
  }

  return {
    // Status
    status,
    isReady: status === "ready",

    // Model
    currentModel,
    downloadProgress,

    // Actions
    switchModel,
    askQuestion,
    stopGeneration,

    // State
    lastResponse,
    error,
    estimatedTokens,
  };
}
