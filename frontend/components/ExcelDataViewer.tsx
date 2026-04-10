/**
 * ExcelDataViewer Component
 * Displays Excel data in a virtualized table for large sheets.
 */

"use client";

import React, { useMemo, useRef, useState } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ExcelWorkbook } from "@/lib/excelParser";

interface ExcelDataViewerProps {
  workbook: ExcelWorkbook | null;
  selectedSheetIndex?: number;
  onSheetChange?: (index: number) => void;
}

const columnHelper = createColumnHelper<Record<string, any>>();

export function ExcelDataViewer({
  workbook,
  selectedSheetIndex,
  onSheetChange,
}: ExcelDataViewerProps) {
  const [localSheetIndex, setLocalSheetIndex] = useState(selectedSheetIndex ?? 0);
  const activeSheetIndex = selectedSheetIndex ?? localSheetIndex;
  const [rowsToShow, setRowsToShow] = useState(10);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  if (!workbook) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select an Excel file to view data
      </div>
    );
  }

  const selectedSheet = workbook.sheets[activeSheetIndex];

  if (!selectedSheet) {
    return (
      <div className="p-4 text-center text-red-500">Sheet not found</div>
    );
  }

  const data = useMemo(() => selectedSheet.rows, [selectedSheet.rows]);
  const columns = useMemo(
    () =>
      selectedSheet.columnNames.map((columnName) =>
        columnHelper.accessor(columnName, {
          id: columnName,
          header: () => columnName,
          cell: (info) => {
            const value = info.getValue();
            return value !== undefined && value !== null ? String(value) : "—";
          },
        })
      ),
    [selectedSheet.columnNames]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 44,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0) : 0;

  return (
    <div className="space-y-4">
      {/* Sheet selection tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 flex-wrap">
          {workbook.sheets.map((sheet, index) => (
            <button
              key={index}
              onClick={() => {
                setLocalSheetIndex(index);
                setRowsToShow(10);
                onSheetChange?.(index);
              }}
              className={`px-4 py-2 border-b-2 font-medium text-sm transition ${
                activeSheetIndex === index
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              📊 {sheet.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sheet statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-xs text-gray-600">Rows</p>
          <p className="text-2xl font-bold text-blue-600">{selectedSheet.rowCount}</p>
        </div>
        <div className="p-3 bg-green-50 rounded">
          <p className="text-xs text-gray-600">Columns</p>
          <p className="text-2xl font-bold text-green-600">{selectedSheet.columnNames.length}</p>
        </div>
        <div className="p-3 bg-purple-50 rounded">
          <p className="text-xs text-gray-600">Sheet</p>
          <p className="text-2xl font-bold text-purple-600">
            {activeSheetIndex + 1} of {workbook.sheetCount}
          </p>
        </div>
      </div>

      {/* Virtualized data table */}
      <div className="border border-gray-200 rounded bg-white">
        {selectedSheet.rowCount === 0 ? (
          <div className="p-4 text-center text-gray-500">This sheet is empty</div>
        ) : (
          <div className="h-[520px] overflow-auto" ref={tableContainerRef}>
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">#</th>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                <tr style={{ height: paddingTop }} />
                {virtualRows.map((virtualRow) => {
                  const row = table.getRowModel().rows[virtualRow.index];
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-200 ${virtualRow.index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <td className="px-4 py-3 text-gray-600 font-medium">{virtualRow.index + 1}</td>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr style={{ height: paddingBottom }} />
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Column info */}
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm font-semibold text-gray-700 mb-2">Columns:</p>
        <div className="flex flex-wrap gap-2">
          {selectedSheet.columnNames.map((colName) => (
            <span key={colName} className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">
              {colName}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
