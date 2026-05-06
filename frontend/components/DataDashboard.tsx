"use client";

import React, { useEffect, useMemo, useState, memo } from "react";
import type { ExcelSheet } from "@/lib/excelParser";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHART_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#ea580c",
];

function parseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getNumericColumns(sheet: ExcelSheet) {
  return sheet.columnNames.filter((columnName) =>
    sheet.rows.some((row) => parseNumber(row[columnName]) !== null)
  );
}

function getCategoricalColumns(sheet: ExcelSheet) {
  return sheet.columnNames.filter((columnName) =>
    sheet.rows.some((row) => {
      const value = row[columnName];
      return typeof value === "string" && value.trim().length > 0;
    })
  );
}

function getNumericColumnStats(sheet: ExcelSheet, columnName: string) {
  const values = sheet.rows
    .map((row) => parseNumber(row[columnName]))
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce((acc, value) => acc + value, 0);
  const average = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const uniqueCount = new Set(values).size;

  return {
    count: values.length,
    sum,
    average,
    min,
    max,
    uniqueCount,
  };
}

function getTopCategoryData(sheet: ExcelSheet, columnName: string, limit = 5) {
  const counts = sheet.rows.reduce((acc: Record<string, number>, row) => {
    const raw = row[columnName];

    if (typeof raw !== "string") {
      return acc;
    }

    const value = raw.trim();
    if (value.length === 0) {
      return acc;
    }

    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topEntries = entries.slice(0, limit).map(([name, value]) => ({ name, value }));
  const otherValue = entries.slice(limit).reduce((acc, [, value]) => acc + value, 0);

  if (otherValue > 0) {
    topEntries.push({ name: "Other", value: otherValue });
  }

  return topEntries;
}

function buildNumericTrendData(sheet: ExcelSheet, columnName: string, limit = 12) {
  return sheet.rows.slice(0, limit).map((row, index) => {
    const value = parseNumber(row[columnName]);
    return {
      name: `Row ${index + 1}`,
      value: value ?? 0,
    };
  });
}

interface DataDashboardProps {
  sheet: ExcelSheet | null;
}

export const DataDashboard = memo(function DataDashboard({ sheet }: DataDashboardProps) {
  const [selectedNumericColumn, setSelectedNumericColumn] = useState<string>("");
  const [selectedCategoryColumn, setSelectedCategoryColumn] = useState<string>("");

  const numericColumns = useMemo(() => {
    return sheet ? getNumericColumns(sheet) : [];
  }, [sheet]);

  const categoricalColumns = useMemo(() => {
    return sheet ? getCategoricalColumns(sheet) : [];
  }, [sheet]);

  const firstNumericColumn = numericColumns[0] ?? "";
  const firstCategoryColumn = categoricalColumns[0] ?? "";

  const numericColumn = selectedNumericColumn || firstNumericColumn;
  const categoryColumn = selectedCategoryColumn || firstCategoryColumn;

  useEffect(() => {
    setSelectedNumericColumn("");
    setSelectedCategoryColumn("");
  }, [sheet]);

  const numericStats = useMemo(() => {
    return sheet && numericColumn ? getNumericColumnStats(sheet, numericColumn) : null;
  }, [sheet, numericColumn]);

  const categoryData = useMemo(() => {
    return sheet && categoryColumn ? getTopCategoryData(sheet, categoryColumn) : [];
  }, [sheet, categoryColumn]);

  const trendData = useMemo(() => {
    return sheet && numericColumn ? buildNumericTrendData(sheet, numericColumn) : [];
  }, [sheet, numericColumn]);

  if (!sheet) {
    return (
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-6 text-center text-blue-700">
          Load a sheet first to view dashboards and charts.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Sheet dashboard
          </p>
          <h3 className="text-xl font-semibold text-slate-900">
            {sheet.name} overview
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Visual analytics and instant insights for the current sheet.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {numericColumns.length > 1 && (
            <label className="flex flex-col text-sm text-slate-700">
              Numeric column
              <select
                value={numericColumn}
                onChange={(event) => setSelectedNumericColumn(event.target.value)}
                className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              >
                {numericColumns.map((columnName) => (
                  <option key={columnName} value={columnName}>
                    {columnName}
                  </option>
                ))}
              </select>
            </label>
          )}

          {categoricalColumns.length > 1 && (
            <label className="flex flex-col text-sm text-slate-700">
              Category column
              <select
                value={categoryColumn}
                onChange={(event) => setSelectedCategoryColumn(event.target.value)}
                className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              >
                {categoricalColumns.map((columnName) => (
                  <option key={columnName} value={columnName}>
                    {columnName}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI Cards - Top Row */}
        <Card className="md:col-span-1">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Rows</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{sheet.rowCount}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Columns</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{sheet.columnNames.length}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Numeric fields</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{numericColumns.length}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Categorical fields</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{categoricalColumns.length}</p>
          </CardContent>
        </Card>

        {/* Charts Section - Spans 2 columns */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Numeric Trend</CardTitle>
            <p className="text-sm text-slate-500">{numericColumn || "No numeric column available"}</p>
          </CardHeader>
          <CardContent>
            {numericColumn ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No numeric values found to render a chart.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
            <p className="text-sm text-slate-500">{categoryColumn || "No category column available"}</p>
          </CardHeader>
          <CardContent>
            {categoryColumn ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No categorical values found to render a chart.</p>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats - Full Width */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Numeric Field Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {numericStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Sum</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {numericStats.sum.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Average</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {numericStats.average.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Min</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {numericStats.min.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Max</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {numericStats.max.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Data points</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {numericStats.count}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Unique values</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {numericStats.uniqueCount}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Pick a numeric field to see summary metrics.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
