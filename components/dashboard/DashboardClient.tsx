"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ExcelUploadSection } from "@/frontend/components/ExcelUploadSection";
import { ExcelDataViewer } from "@/frontend/components/ExcelDataViewer";
import { DataDashboard } from "@/frontend/components/DataDashboard";
import { useExcelLiveLink } from "@/frontend/hooks/useExcelLiveLink";
import { UserMenu } from "@/components/dashboard/UserMenu";

// Dynamically import AIChatPanel to reduce initial bundle size
const AIChatPanel = dynamic(() => import("@/frontend/components/AIChatPanel").then(mod => ({ default: mod.AIChatPanel })), {
  loading: () => <div className="p-4 text-center text-gray-500">Loading AI Chat...</div>,
  ssr: false, // Disable SSR for this component since it uses WebLLM
});

export function DashboardClient() {
  const liveLink = useExcelLiveLink();
  const { workbook, status } = liveLink;
  const [showChat, setShowChat] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(0);

  const fileLoaded = useMemo(
    () => status === "watching" && workbook !== null,
    [status, workbook]
  );

  const currentSheet = workbook?.sheets[selectedSheet] || null;

  useEffect(() => {
    if (!workbook) {
      setSelectedSheet(0);
      return;
    }

    if (selectedSheet >= workbook.sheetCount) {
      setSelectedSheet(0);
    }
  }, [workbook, selectedSheet]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">📊 SheetFlow AI</h1>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload Section */}
        <div className="mb-8">
          <ExcelUploadSection liveLink={liveLink} />
        </div>

        {/* Data Visualization */}
        {fileLoaded && currentSheet && (
          <div className="mb-8">
            <DataDashboard sheet={currentSheet} />
          </div>
        )}

        {/* Excel Data Viewer */}
        {fileLoaded && workbook && (
          <div className="mb-8">
            <ExcelDataViewer
              workbook={workbook}
              selectedSheetIndex={selectedSheet}
              onSheetChange={setSelectedSheet}
            />
          </div>
        )}

        {/* AI Chat Panel */}
        {fileLoaded && currentSheet && (
          <div className="fixed bottom-4 right-4 z-50">
            {!showChat ? (
              <button
                onClick={() => setShowChat(true)}
                className="bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            ) : (
              <AIChatPanel sheet={currentSheet} onClose={() => setShowChat(false)} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}