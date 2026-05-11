"use client";

import React, { useMemo, useRef, useState, memo } from "react";
import { useSession } from "next-auth/react";
import {
  createColumnHelper, flexRender,
  getCoreRowModel, useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ExcelWorkbook } from "@/lib/excelParser";
import { motion } from "framer-motion";
import { Table2, Columns, Hash, Layers, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface ExcelDataViewerProps {
  workbook: ExcelWorkbook | null;
  selectedSheetIndex?: number;
  onSheetChange?: (index: number) => void;
}

const columnHelper = createColumnHelper<Record<string, any>>();

export const ExcelDataViewer = memo(function ExcelDataViewer({
  workbook,
  selectedSheetIndex,
  onSheetChange,
}: ExcelDataViewerProps) {
  const [localIdx, setLocalIdx] = useState(selectedSheetIndex ?? 0);
  const activeIdx = selectedSheetIndex ?? localIdx;
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");

  const sheet = workbook?.sheets[activeIdx] ?? null;

  const filteredRows = useMemo(() => {
    if (!sheet) return [];
    if (!search.trim()) return sheet.rows;
    const q = search.toLowerCase();
    return sheet.rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [sheet, search]);

  const columns = useMemo(
    () =>
      sheet
        ? sheet.columnNames.map((col) =>
            columnHelper.accessor(col, {
              id: col,
              header: () => col,
              cell: (info) => {
                const v = info.getValue();
                return v !== undefined && v !== null ? String(v) : "—";
              },
            })
          )
        : [],
    [sheet?.columnNames]
  );

  const [sorting, setSorting] = useState<{ id: string; desc: boolean } | null>(null);

  const { data: session } = useSession();
  const isPro = (session?.user as any)?.subscriptionTier === "pro";
  const ROW_LIMIT = 500;
  const isTruncated = !isPro && filteredRows.length > ROW_LIMIT;

  const sortedRows = useMemo(() => {
    let base = filteredRows;
    if (isTruncated) {
      base = filteredRows.slice(0, ROW_LIMIT);
    }
    if (!sorting) return base;
    return [...base].sort((a, b) => {
      const vA = a[sorting.id];
      const vB = b[sorting.id];
      if (vA === vB) return 0;
      const res = vA > vB ? 1 : -1;
      return sorting.desc ? -res : res;
    });
  }, [filteredRows, sorting, isTruncated]);

  const table = useReactTable({
    data: sortedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => 40,
    overscan: 8,
  });

  if (!workbook) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500 text-sm gap-2">
        <Table2 size={16} /> Select a file to view data
      </div>
    );
  }
  if (!sheet) {
    return <div className="py-8 text-center text-red-400 text-sm">Sheet not found</div>;
  }

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize   = rowVirtualizer.getTotalSize();
  const padTop      = virtualRows[0]?.start ?? 0;
  const padBottom   = totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* ── Sheet tabs ───────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {workbook.sheets.map((s, i) => (
          <button
            key={i}
            onClick={() => { setLocalIdx(i); onSheetChange?.(i); setSearch(""); }}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              activeIdx === i
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent"
            }`}
          >
            <Layers size={11} />
            {s.name}
          </button>
        ))}
      </div>

      {/* ── Quick stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Hash size={13} />,    label: "Rows",    value: filteredRows.length !== sheet.rowCount ? `${filteredRows.length} / ${sheet.rowCount}` : sheet.rowCount.toLocaleString(), accent: "#6366f1" },
          { icon: <Columns size={13} />, label: "Columns", value: sheet.columnNames.length,                                                                                                 accent: "#10b981" },
          { icon: <Layers size={13} />,  label: "Sheet",   value: `${activeIdx + 1} / ${workbook.sheetCount}`,                                                                              accent: "#f59e0b" },
        ].map(({ icon, label, value, accent }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-3 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${accent}22`, color: accent }}>
              {icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-bold text-white tabular-nums">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + column pills ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input
          type="search"
          placeholder="Search all rows…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 transition"
        />
        <div className="flex flex-wrap gap-1.5">
          {sheet.columnNames.map((col) => (
            <span key={col} className="rounded-md bg-slate-800 border border-white/[0.07] px-2 py-1 text-[10px] font-medium text-slate-400">
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* ── Virtualized table ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/60 overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Table2 size={13} className="text-indigo-400" /> Data Table
          </h3>
          <span className="text-[10px] text-slate-500">
            {filteredRows.length.toLocaleString()} rows
          </span>
        </div>

        {sheet.rowCount === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">This sheet is empty</div>
        ) : (
          <>
            <div ref={tableRef} className="h-[480px] overflow-auto">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-900 shadow-[0_1px_0_rgba(255,255,255,0.06)]">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      <th className="px-3 py-2.5 text-left text-slate-600 font-medium w-10">#</th>
                      {hg.headers.map((h) => (
                        <th 
                          key={h.id} 
                          className="px-3 py-2.5 text-left font-semibold text-slate-400 whitespace-nowrap cursor-pointer hover:bg-white/[0.03] transition-colors group"
                          onClick={() => {
                            setSorting(prev => 
                              prev?.id === h.id 
                                ? (prev.desc ? null : { id: h.id, desc: true })
                                : { id: h.id, desc: false }
                            );
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                            <span className="text-slate-600 group-hover:text-slate-400 transition-colors">
                              {sorting?.id === h.id ? (
                                sorting.desc ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                              ) : (
                                <ArrowUpDown size={12} opacity={0.3} />
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  <tr style={{ height: padTop }} />
                  {virtualRows.map((vr) => {
                    const row = table.getRowModel().rows[vr.index];
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${
                          vr.index % 2 === 0 ? "bg-transparent" : "bg-slate-800/20"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-slate-600 font-medium">{vr.index + 1}</td>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 py-2.5 text-slate-300 whitespace-nowrap max-w-[200px] truncate">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr style={{ height: padBottom }} />
                </tbody>
              </table>
            </div>
            {isTruncated && (
              <div className="px-4 py-3 bg-indigo-600/10 border-t border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500 text-[10px] text-white px-1.5 py-0.5 rounded font-bold">PRO</span>
                  <p className="text-xs text-indigo-300">
                    Free plan limited to first {ROW_LIMIT} rows. Upgrade to unlock all {sheet.rowCount.toLocaleString()} rows.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Experience SheetFlow Pro? This will simulate a payment and upgrade your account instantly.")) {
                      fetch("/api/subscription/upgrade", { method: "POST" }).then(res => {
                        if (res.ok) {
                          alert("Success! You are now a Pro user. Refreshing...");
                          window.location.reload();
                        }
                      });
                    }
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition active:scale-95 whitespace-nowrap"
                >
                  Upgrade Now ✨
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
});
