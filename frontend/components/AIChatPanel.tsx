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
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Table2, MessageSquare, Activity } from "lucide-react";
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

  // ── Auto-initialize AI if not ready ────────────────────────────────────────
  useEffect(() => {
    if (status === "not-initialized") {
      initEngine();
    }
  }, [status, initEngine]);

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
      <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-[#030712]">
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
          <Table2 className="text-indigo-400" size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Data Found</h3>
        <p className="text-slate-400 text-sm max-w-xs">
          Please upload a spreadsheet first to activate the AI Analyst.
        </p>
      </div>
    );
  }

  // ── Neural Thinking Animation ──────────────────────────────────────────────
  const ThinkingIndicator = () => (
    <div className="flex gap-1.5 items-center px-4 py-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 w-fit">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: i * 0.2 
            }}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"
          />
        ))}
      </div>
      <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest ml-2 italic">Thinking</span>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#030712] border-l border-white/[0.06] backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Premium Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ rotate: [0, 8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/50 p-1.5 border border-white/10 shadow-2xl"
          >
            <Image src="/icon.png" alt="AI Logo" width={28} height={28} className="relative z-10" />
            <div className="absolute inset-0 bg-indigo-500/10 blur-md rounded-full" />
          </motion.div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight">AI Analyst</h2>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isReady ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-slate-600"}`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {isReady ? "Local Engine Ready" : "Initializing..."}
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Model Selection Dropdown/Tabs */}
      <div className="flex-shrink-0 px-6 py-4 bg-white/[0.01] border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Model Tier</span>
          {!isReady && status === "not-initialized" && (
            <button 
              onClick={initEngine}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              Load AI Now
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { key: "SmolLM2-360M", label: "Tiny", free: true },
              { key: "TinyLlama-1.1B", label: "Fast", free: false },
              { key: "Phi-3-mini-4k", label: "Smart", free: false },
            ] as const
          ).map(({ key, label, free }) => {
            const isPro = (session?.user as any)?.subscriptionTier === "pro";
            const locked = !free && !isPro;
            const active = currentModel === key;
            
            return (
              <button
                key={key}
                onClick={() => !locked && switchModel(key)}
                disabled={isLoading || locked || !isReady}
                className={`relative group px-2 py-2 rounded-xl border text-[11px] font-bold transition-all ${
                  active 
                    ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)]" 
                    : "bg-white/[0.02] border-white/[0.05] text-slate-500 hover:border-white/10 hover:text-slate-300"
                } ${locked ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {label}
                {locked && <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-[7px] text-white px-1 py-0.5 rounded-full font-black shadow-lg">PRO</span>}
                {active && <motion.div layoutId="active-model" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Download Progress Overlay */}
      <AnimatePresence>
        {status === "downloading-model" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 py-4 bg-indigo-500/10 border-b border-indigo-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Optimizing Model</span>
              <span className="text-[10px] font-black text-indigo-300">{downloadProgress}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${downloadProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-white" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Local Intel Engine</h4>
            <p className="text-[10px] text-slate-400 max-w-[180px]">Ask questions about trends, statistics, or data points in this sheet.</p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-[85%] px-5 py-4 rounded-[24px] text-sm leading-relaxed shadow-xl ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-indigo-500/10"
                  : msg.isError
                  ? "bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-none"
                  : "bg-white/[0.03] border border-white/[0.06] text-slate-200 rounded-bl-none"
              }`}
            >
              {msg.content}
              <div className={`absolute bottom-[-18px] text-[9px] font-bold uppercase tracking-widest ${msg.role === "user" ? "right-2 text-indigo-500/60" : "left-2 text-slate-600"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <ThinkingIndicator />
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-t from-black to-transparent">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isReady ? "Ask about your data..." : "Initialize AI to start..."}
            disabled={isLoading || !isReady}
            className="w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-600 rounded-2xl px-6 py-4 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all group-focus-within:bg-white/[0.05] group-focus-within:border-white/20 shadow-2xl"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <div className="w-4 h-4 bg-current rounded-sm" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || !isReady}
                className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-20 disabled:grayscale"
              >
                <Sparkles size={18} />
              </button>
            )}
          </div>
        </form>
        <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
          <span>E2E Encryption</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>Local Inference</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>No Cloud Sync</span>
        </div>
      </div>
    </div>
  );
});
