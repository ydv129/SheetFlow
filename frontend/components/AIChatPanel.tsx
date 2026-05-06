/**
 * AIChatPanel Component
 * Beautiful chat interface for querying Excel data with local AI
 * All AI processing happens in the browser - zero cloud dependency
 */

"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { useLocalAI } from "@/frontend/hooks/useLocalAI";
import type { ExcelSheet } from "@/lib/excelParser";

interface AIChatPanelProps {
  sheet: ExcelSheet | null;
  onClose?: () => void;
}

/**
 * Represents a message in the chat (user or AI)
 */
interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  error?: string;
}

export const AIChatPanel = memo(function AIChatPanel({
  sheet,
  onClose,
}: AIChatPanelProps) {
  const {
    status,
    isReady,
    currentModel,
    downloadProgress,
    askQuestion,
    stopGeneration,
    switchModel,
    error: aiError,
  } = useLocalAI();

  // Chat history
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Current input from user
  const [input, setInput] = useState("");

  // Whether we're waiting for a response
  const [isLoading, setIsLoading] = useState(false);

  // Reference to chat container for auto-scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle user submitting a question
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim() || !isReady || !sheet) {
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send to AI for analysis
      const response = await askQuestion(input, sheet);

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "ai",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: "ai",
        content: err instanceof Error ? err.message : "Failed to get response",
        timestamp: new Date(),
        error: "true",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Render status message
   */
  function renderStatusMessage() {
    if (status === "initializing") {
      return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-blue-700 font-medium">
              Initializing AI engine...
            </span>
          </div>
        </div>
      );
    }

    if (status === "downloading-model") {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-yellow-700 font-medium mb-2">
                📥 Downloading AI model ({downloadProgress}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                First time only - model cached after download
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="p-6 text-center">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 font-medium mb-2">⚠️ AI Currently Unavailable</p>
            <p className="text-yellow-600 text-sm">{aiError || "Local AI is not available right now."}</p>
            <p className="text-yellow-600 text-sm mt-2">
              You can still upload and analyze Excel files without AI assistance.
            </p>
          </div>
        </div>
      );
    }

    if (isReady) {
      return (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
          <span className="text-green-700">✓ AI Ready</span>
          <span className="text-gray-600 mx-2">•</span>
          <span className="text-gray-700 font-medium">{currentModel}</span>
        </div>
      );
    }

    return null;
  }

  /**
   * If no sheet selected, show prompt
   */
  if (!sheet) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p className="mb-2">📊 Select an Excel file to start chatting</p>
        <p className="text-sm text-gray-500">
          Once you load data, you can ask questions about it here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="font-bold text-gray-900">🤖 AI Analyst</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 pt-4">{renderStatusMessage()}</div>

      {/* Model Selector */}
      {isReady && (
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-xs text-gray-600 mb-2 font-medium">MODEL</p>
          <div className="flex gap-2">
            <button
              onClick={() => switchModel("TinyLlama-1.1B")}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                currentModel === "TinyLlama-1.1B"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              disabled={isLoading}
            >
              ⚡ Fast (1.1B)
            </button>
            <button
              onClick={() => switchModel("Phi-3-mini-4k")}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                currentModel === "Phi-3-mini-4k"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              disabled={isLoading}
            >
              🧠 Smart (3.8B)
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && isReady && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">💬 Ask me anything about your data</p>
            <p className="text-sm text-gray-400">
              Try: "What are the top values?" or "Show me the average"
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : message.error
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-2 ${
                  message.role === "user" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-gray-700 rounded-full"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        {isReady ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about the data..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                >
                  ■ Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium text-sm"
                >
                  Send
                </button>
              )}
            </div>

            <p className="text-xs text-gray-600">
              💡 All processing happens locally - your data never leaves your
              browser
            </p>
          </form>
        ) : (
          <div className="text-center text-gray-500 text-sm">
            {status === "initializing" && "Loading AI engine..."}
            {status === "downloading-model" && (
              <>Downloading model... ({downloadProgress}%)</>
            )}
            {status === "error" && "AI not available"}
          </div>
        )}
      </div>
    </div>
  );
});
