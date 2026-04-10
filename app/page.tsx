/**
 * Main Home Page
 * Displays the Excel upload section, data viewer, and AI chat
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ExcelUploadSection } from "@/frontend/components/ExcelUploadSection";
import { ExcelDataViewer } from "@/frontend/components/ExcelDataViewer";
import { AIChatPanel } from "@/frontend/components/AIChatPanel";
import { DataDashboard } from "@/frontend/components/DataDashboard";
import { useExcelLiveLink } from "@/frontend/hooks/useExcelLiveLink";

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">📊 SheetFlow AI</h1>
          <p className="text-gray-600 mt-1">
            Local-first Excel analysis • Your data stays on your computer
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1.35fr_420px] gap-8 items-start">
          {/* Left side - File upload and controls */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📁 Excel File
              </h2>
              <ExcelUploadSection liveLink={liveLink} />
            </div>

            {/* AI Chat Button */}
            {fileLoaded && (
              <button
                onClick={() => setShowChat(!showChat)}
                className={`w-full mt-4 p-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                  showChat
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {showChat ? "🔙 Back to Data" : "🤖 Ask AI Analyst"}
              </button>
            )}

            {/* Statistics if file is loaded */}
            {fileLoaded && workbook && (
              <div className="mt-4 bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-gray-900 mb-3">📈 File Stats</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Sheets</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {workbook.sheetCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Rows</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {workbook.sheets.reduce<number>(
                        (sum, s) => sum + s.rowCount,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Middle pane - Data preview */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 min-h-[600px] flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 Data Preview
              </h2>
              <div className="flex-1 overflow-hidden">
                <ExcelDataViewer
                  workbook={workbook}
                  selectedSheetIndex={selectedSheet}
                  onSheetChange={setSelectedSheet}
                />
              </div>
            </div>
          </div>

          {/* Right pane - Dashboard or AI chat */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 min-h-[600px] flex flex-col">
              {showChat ? (
                <AIChatPanel
                  sheet={currentSheet}
                  onClose={() => setShowChat(false)}
                />
              ) : (
                <DataDashboard sheet={currentSheet} />
              )}
            </div>
          </div>
        </div>

        {/* Bottom - Key features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">🔒 Privacy</p>
            <p className="text-xs text-blue-800 mt-1">
              All data stays in your browser. No cloud uploads.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm font-semibold text-green-900">⚡ Live Updates</p>
            <p className="text-xs text-green-800 mt-1">
              File changes detected every 5 seconds automatically.
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm font-semibold text-purple-900">🤖 Local AI</p>
            <p className="text-xs text-purple-800 mt-1">
              Ask questions about data. AI runs locally in your browser.
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm font-semibold text-orange-900">📊 Multi-Sheet</p>
            <p className="text-xs text-orange-800 mt-1">
              View and analyze all sheets in your Excel workbook.
            </p>
          </div>

          <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
            <p className="text-sm font-semibold text-sky-900">📈 Dashboards</p>
            <p className="text-xs text-sky-800 mt-1">
              Visualize trends with charts, summaries, and category breakdowns.
            </p>
          </div>
        </div>

        {/* Help section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">❓ How to Use</h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <span className="text-gray-700">
                Click <strong>&quot;📁 Select Excel File&quot;</strong> to choose a file from your computer
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span className="text-gray-700">
                The file is automatically parsed. View data in the preview area
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span className="text-gray-700">
                Scroll down to the dashboard to see charts, trends, and category summaries for your sheet
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <span className="text-gray-700">
                Click <strong>&quot;🤖 Ask AI Analyst&quot;</strong> to chat about your data using local AI
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">5.</span>
              <span className="text-gray-700">
                Edit the Excel file in your system. SheetFlow detects changes every 5 seconds
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">5.</span>
              <span className="text-gray-700">
                Your file choice is saved. Reload the page to access it again
              </span>
            </li>
          </ol>

          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="text-sm text-purple-900 font-medium">
              💡 AI Tips: Try asking &quot;What are the highest values?&quot;, &quot;Show me trends&quot;, or &quot;Summarize the data&quot;
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600">
          <p>
            SheetFlow AI • Phase 4: Dashboards & Local AI • All processing stays in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}
