/**
 * AIChatPanel Component
 *
 * Chat interface for querying Excel data with local AI (WebLLM).
 * All AI processing happens in the browser — zero cloud dependency.
 *
 * Changes:
 * - Engine is NOT auto-started on mount (lazy: user clicks "Load AI")
 * - Uses updated useLocalAI API (initEngine, chat.completions)
 * - Shows clear status + retry for errors
 */

"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { useSession } from "next-auth/react";
import { useLocalAI } from "@/frontend/hooks/useLocalAI";
import type { ExcelSheet } from "@/lib/excelParser";

interface AIChatPanelProps {
  sheet: ExcelSheet | null;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export const AIChatPanel = memo(function AIChatPanel({
  sheet,
  onClose,
}: AIChatPanelProps) {
  const { data: session } = useSession();
  const {
    status,
    isReady,
    currentModel,
    downloadProgress,
    askQuestion,
    stopGeneration,
    switchModel,
    initEngine,
    error: aiError,
  } = useLocalAI();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Submit handler ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !isReady || !sheet) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askQuestion(input, sheet);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          content: response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "ai",
          content: err instanceof Error ? err.message : "Failed to get response",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // ── No sheet guard ─────────────────────────────────────────────────────────
  if (!sheet) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p className="mb-2 text-2xl">📊</p>
        <p className="font-medium">Upload an Excel file to start chatting</p>
        <p className="text-sm mt-1 text-muted-foreground">
          Once data is loaded you can ask questions here
        </p>
      </div>
    );
  }

  // ── Status banner ──────────────────────────────────────────────────────────
  function StatusBanner() {
    if (status === "not-initialized") {
      return (
        <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg text-center">
          <p className="text-muted-foreground text-sm mb-3">
            🤖 Local AI is not loaded yet. Models run 100% on your device.
          </p>
          <button
            onClick={initEngine}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-sm transition active:scale-95"
          >
            Load AI Model
          </button>
        </div>
      );
    }

    if (status === "initializing") {
      return (
        <div className="p-4 bg-blue-950/40 border border-blue-800 rounded-lg flex items-center gap-3">
          <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full flex-shrink-0" />
          <span className="text-blue-300 text-sm font-medium">
            Initializing AI engine…
          </span>
        </div>
      );
    }

    if (status === "downloading-model") {
      return (
        <div className="p-4 bg-yellow-950/40 border border-yellow-800 rounded-lg">
          <p className="text-yellow-300 font-medium text-sm mb-2">
            📥 Downloading model ({downloadProgress}%)
          </p>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            First time only — model is cached after download
          </p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-lg">
          <p className="text-red-300 font-medium text-sm mb-1">⚠️ AI Unavailable</p>
          <p className="text-red-400 text-xs mb-3">
            {aiError ?? "Local AI could not be started."}
          </p>
          <button
            onClick={initEngine}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-xs font-medium transition active:scale-95"
          >
            Retry
          </button>
        </div>
      );
    }

    if (isReady) {
      return (
        <div className="p-2 bg-green-950/30 border border-green-800 rounded text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-medium">AI Ready</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-slate-400">{currentModel}</span>
        </div>
      );
    }

    return null;
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-900/80 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3 flex justify-between items-center flex-shrink-0">
        <h2 className="font-bold text-foreground text-sm">🤖 AI Analyst</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <StatusBanner />
      </div>

      {/* Model switcher — only visible when ready */}
      {isReady && (
        <div className="px-4 py-2 border-b border-slate-700 flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
            Model
          </p>
          <div className="flex gap-2 flex-wrap">
            {(
              [
                { key: "SmolLM2-360M", label: "🚀 Tiny (360M)", free: true },
                { key: "TinyLlama-1.1B", label: "⚡ Fast (1.1B)", free: false },
                { key: "Phi-3-mini-4k", label: "🧠 Smart (3.8B)", free: false },
              ] as const
            ).map(({ key, label, free }) => {
              const isPro = (session?.user as any)?.subscriptionTier === "pro";
              const locked = !free && !isPro;
              
              return (
                <button
                  key={key}
                  onClick={() => !locked && switchModel(key)}
                  disabled={isLoading || status !== "ready" || locked}
                  className={`relative px-3 py-1.5 rounded text-xs font-medium transition disabled:opacity-50 ${
                    currentModel === key
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  } ${locked ? "cursor-not-allowed grayscale" : ""}`}
                >
                  {label}
                  {locked && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-[8px] text-white px-1 rounded-full font-bold">PRO</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin">
        {messages.length === 0 && isReady && (
          <div className="text-center text-muted-foreground py-8 text-sm">
            <p className="mb-1">💬 Ask anything about your data</p>
            <p className="text-xs">
              Try: &ldquo;What are the top 5 values?&rdquo; or &ldquo;Show me the average&rdquo;
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : msg.isError
                  ? "bg-red-950/60 text-red-300 border border-red-800 rounded-bl-sm"
                  : "bg-slate-700/70 text-slate-100 rounded-bl-sm"
              }`}
            >
              {msg.content}
              <p
                className={`text-xs mt-1 ${
                  msg.role === "user" ? "text-indigo-200" : "text-slate-500"
                }`}
              >
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/70 text-slate-300 px-4 py-3 rounded-xl rounded-bl-sm flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-slate-100 rounded-full" />
              <span className="text-sm">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700 p-4 bg-slate-900/60 flex-shrink-0">
        {isReady ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your data…"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 text-foreground placeholder:text-muted-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition active:scale-95"
                >
                  ■ Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition active:scale-95 disabled:opacity-40"
                >
                  Send
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              🔒 All processing is local — your data never leaves this device
            </p>
          </form>
        ) : (
          <p className="text-center text-muted-foreground text-xs py-1">
            {status === "initializing" && "Starting AI engine…"}
            {status === "downloading-model" && `Downloading model (${downloadProgress}%)…`}
            {status === "not-initialized" && "Click 'Load AI Model' above to get started"}
            {status === "error" && "AI unavailable — see details above"}
          </p>
        )}
      </div>
    </div>
  );
});
