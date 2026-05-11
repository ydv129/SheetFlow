"use client";

import React, { useEffect, useMemo, useState, memo } from "react";
import type { ExcelSheet } from "@/lib/excelParser";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, TrendingUp, PieChart as PieIcon, Activity,
  Hash, Columns, Table2, Tag, Sigma, ArrowUpDown, Minus, ArrowUp,
  RefreshCw, ChevronDown,
} from "lucide-react";

// ─── Colour palette ────────────────────────────────────────────────────────────
const PALETTE = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
];

// ─── Tooltip skin ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur-md text-xs">
      <p className="font-semibold text-slate-300 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name}: <span className="text-white">{Number(p.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  delay?: number;
}
function StatCard({ icon, label, value, accent, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/60 p-5 backdrop-blur-sm hover:border-white/20 transition-colors group"
    >
      {/* glow blob */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500">{label}</span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Chart type toggle ────────────────────────────────────────────────────────
type TrendType = "bar" | "line" | "area";
const TREND_OPTIONS: { type: TrendType; icon: React.ReactNode; label: string }[] = [
  { type: "bar", icon: <BarChart2 size={13} />, label: "Bar" },
  { type: "line", icon: <TrendingUp size={13} />, label: "Line" },
  { type: "area", icon: <Activity size={13} />, label: "Area" },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────
function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
function getNumericColumns(sheet: ExcelSheet) {
  return sheet.columnNames.filter((c) => sheet.rows.some((r) => parseNumber(r[c]) !== null));
}
function getCategoricalColumns(sheet: ExcelSheet) {
  return sheet.columnNames.filter((c) =>
    sheet.rows.some((r) => typeof r[c] === "string" && (r[c] as string).trim().length > 0)
  );
}
function getNumericStats(sheet: ExcelSheet, col: string) {
  const vals = sheet.rows.map((r) => parseNumber(r[col])).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  const sum = vals.reduce((a, b) => a + b, 0);
  return { count: vals.length, sum, average: sum / vals.length, min: Math.min(...vals), max: Math.max(...vals), uniqueCount: new Set(vals).size };
}
function getCategoryData(sheet: ExcelSheet, col: string, limit = 6) {
  const counts: Record<string, number> = {};
  sheet.rows.forEach((r) => {
    const v = typeof r[col] === "string" ? (r[col] as string).trim() : "";
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, limit).map(([name, value]) => ({ name, value }));
  const other = sorted.slice(limit).reduce((a, [, v]) => a + v, 0);
  if (other > 0) top.push({ name: "Other", value: other });
  return top;
}
function getTrendData(sheet: ExcelSheet, numCol: string, catCol: string, limit = 20) {
  const groups: Record<string, number> = {};
  sheet.rows.forEach((r) => {
    const cat = String(r[catCol] || "Other").trim();
    const val = parseNumber(r[numCol]) || 0;
    groups[cat] = (groups[cat] || 0) + val;
  });

  return Object.entries(groups)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// ─── Column selector pill ─────────────────────────────────────────────────────
function ColPill({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300">
      <span className="text-slate-500 uppercase tracking-wider text-[10px]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-white outline-none cursor-pointer max-w-[120px] truncate"
      >
        {options.map((o) => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
      </select>
      <ChevronDown size={11} className="text-slate-500 flex-shrink-0" />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
interface DataDashboardProps { sheet: ExcelSheet | null; }

export const DataDashboard = memo(function DataDashboard({ sheet }: DataDashboardProps) {
  const [selNum, setSelNum] = useState("");
  const [selCat, setSelCat] = useState("");
  const [trendType, setTrendType] = useState<TrendType>("bar");
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  const numCols = useMemo(() => (sheet ? getNumericColumns(sheet) : []), [sheet]);
  const catCols = useMemo(() => (sheet ? getCategoricalColumns(sheet) : []), [sheet]);
  const numCol = selNum || numCols[0] || "";
  const catCol = selCat || catCols[0] || "";

  useEffect(() => { setSelNum(""); setSelCat(""); setTrendType("bar"); }, [sheet]);

  const stats   = useMemo(() => sheet && numCol ? getNumericStats(sheet, numCol) : null, [sheet, numCol]);
  const catData = useMemo(() => sheet && catCol ? getCategoryData(sheet, catCol) : [], [sheet, catCol]);
  const trend   = useMemo(() => sheet && numCol ? getTrendData(sheet, numCol, catCol) : [], [sheet, numCol, catCol]);

  if (!sheet) return (
    <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
      <Table2 size={18} className="mr-2" /> Upload a file to view analytics
    </div>
  );

  // ── Shared axis style ──────────────────────────────────────────────────────
  const axisStyle = { fill: "#94a3b8", fontSize: 11, fontWeight: 500 };
  const gridStyle = { stroke: "rgba(255,255,255,0.1)", strokeDasharray: "4 4" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-400 mb-1">
            Analytics Dashboard
          </p>
          <h2 className="text-xl font-bold text-white">{sheet.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {sheet.rowCount.toLocaleString()} rows · {sheet.columnNames.length} columns
          </p>
        </div>

        {/* Column selectors */}
        <div className="flex flex-wrap gap-2">
          {numCols.length > 1 && (
            <ColPill label="Numeric" value={numCol} options={numCols} onChange={setSelNum} />
          )}
          {catCols.length > 1 && (
            <ColPill label="Category" value={catCol} options={catCols} onChange={setSelCat} />
          )}
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Hash size={14} />}    label="Rows"       value={sheet.rowCount.toLocaleString()}      accent="#6366f1" delay={0}    />
        <StatCard icon={<Columns size={14} />} label="Columns"    value={sheet.columnNames.length}              accent="#10b981" delay={0.06} />
        <StatCard icon={<Sigma size={14} />}   label="Numeric"    value={numCols.length}                        accent="#f59e0b" delay={0.12} />
        <StatCard icon={<Tag size={14} />}     label="Categorical" value={catCols.length}                       accent="#ec4899" delay={0.18} />
      </div>

      {/* ── Stats row (if numeric column selected) ─────────────────── */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {[
            { label: "Sum",     value: fmt(stats.sum),      icon: <Sigma size={13} />,       accent: "#6366f1" },
            { label: "Avg",     value: fmt(stats.average),  icon: <ArrowUpDown size={13} />, accent: "#10b981" },
            { label: "Min",     value: fmt(stats.min),      icon: <Minus size={13} />,       accent: "#3b82f6" },
            { label: "Max",     value: fmt(stats.max),      icon: <ArrowUp size={13} />,     accent: "#f59e0b" },
            { label: "Points",  value: stats.count,         icon: <Hash size={13} />,        accent: "#8b5cf6" },
            { label: "Unique",  value: stats.uniqueCount,   icon: <RefreshCw size={13} />,   accent: "#14b8a6" },
          ].map(({ label, value, icon, accent }) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-slate-900/50 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-2" style={{ color: accent }}>
                {icon}
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{label}</span>
              </div>
              <p className="text-lg font-bold text-white tabular-nums">{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Charts grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Trend chart — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="lg:col-span-3 rounded-2xl border border-white/[0.07] bg-slate-900/60 p-5 backdrop-blur-sm"
        >
          <SectionHeader title={numCol || "Trend"} subtitle="First 20 rows">
            {/* Chart type toggle */}
            <div className="flex gap-1 rounded-lg border border-white/10 bg-slate-800/60 p-0.5">
              {TREND_OPTIONS.map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => setTrendType(type)}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                    trendType === type
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </SectionHeader>

          <div className="h-64 relative">
            {trend.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={trendType}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {trendType === "bar" ? (
                      <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} tickFormatter={fmt} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                        <Bar dataKey="value" name={numCol} radius={[4, 4, 0, 0]}>
                          {trend.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : trendType === "line" ? (
                      <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} tickFormatter={fmt} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name={numCol}
                          stroke="#6366f1"
                          strokeWidth={3}
                          dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                          activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...gridStyle} vertical={false} />
                        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} tickFormatter={fmt} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name={numCol}
                          stroke="#6366f1"
                          strokeWidth={3}
                          fill="url(#areaGrad)"
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-600 text-xs border border-dashed border-white/5 rounded-xl">
                No numeric data to visualize
              </div>
            )}
          </div>
        </motion.div>

        {/* Pie / donut — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.34 }}
          className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-slate-900/60 p-5 backdrop-blur-sm"
        >
          <SectionHeader title={catCol || "Categories"} subtitle="Top 6 by frequency" />

          <div className="h-56">
            {catData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catData} dataKey="value" nameKey="name"
                    cx="50%" cy="45%"
                    innerRadius="38%" outerRadius="65%"
                    paddingAngle={3} strokeWidth={0}
                    onMouseEnter={(_, i) => setActivePieIndex(i)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {catData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PALETTE[i % PALETTE.length]}
                        opacity={activePieIndex === null || activePieIndex === i ? 1 : 0.45}
                        style={{ transition: "opacity 0.2s, filter 0.2s" }}
                        filter={activePieIndex === i ? "drop-shadow(0 0 6px rgba(99,102,241,0.5))" : undefined}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle" iconSize={8}
                    wrapperStyle={{ fontSize: 10, color: "#94a3b8", paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-600 text-xs">
                No categorical data
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Category Insights (Dynamic Bento Grid) ──────────────────────── */}
      {catData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-6"
        >
          <SectionHeader 
            title="Category Intelligence" 
            subtitle={`Structural analysis of ${catCol}`} 
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {catData.map((d, i) => {
                const total = catData.reduce((acc, curr) => acc + curr.value, 0);
                const pct = (d.value / total) * 100;
                const color = PALETTE[i % PALETTE.length];
                const isExpanded = activePieIndex === i;
                
                // Get top 3 contributors for this category if possible
                const topContributors = sheet?.rows
                  ?.filter((row: Record<string, any>) => row[catCol] === d.name)
                  .slice(0, 3)
                  .map((row: Record<string, any>) => row[Object.keys(row)[0]]) || [];

                return (
                  <motion.div
                    key={d.name}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    onClick={() => setActivePieIndex(isExpanded ? null : i)}
                    className={`relative group cursor-pointer overflow-hidden rounded-[2.5rem] border transition-all duration-500 backdrop-blur-2xl ${
                      isExpanded 
                        ? "col-span-full ring-2 ring-indigo-500/40 bg-white/[0.04] p-8 border-indigo-500/30 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]" 
                        : "bg-white/[0.02] p-6 border-white/[0.06] hover:border-white/20 hover:bg-white/[0.05] shadow-xl"
                    }`}
                  >
                    {/* Visual Background Glow */}
                    <div 
                      className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity"
                      style={{ backgroundColor: color }}
                    />

                    <div className="flex items-start justify-between mb-8">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Classification</span>
                        <h4 className="text-xl font-black text-white tracking-tight">{d.name}</h4>
                      </div>
                      
                      {/* Circular Progress Visual */}
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-white/5"
                          />
                          <motion.circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke={color}
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={150.8}
                            initial={{ strokeDashoffset: 150.8 }}
                            animate={{ strokeDashoffset: 150.8 - (150.8 * pct) / 100 }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                          {Math.round(pct)}%
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Dominance</p>
                        <p className="text-lg font-black text-white">{pct.toFixed(1)}%</p>
                      </div>
                      <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Frequency</p>
                        <p className="text-lg font-black text-white">{d.value}</p>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 pt-4 border-t border-white/10"
                        >
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">AI Summary</h5>
                              <p className="text-sm text-slate-300 leading-relaxed italic">
                                &ldquo;The category <span className="text-white font-bold">{d.name}</span> represents a significant 
                                <span className="text-emerald-400 font-bold"> {pct.toFixed(1)}%</span> of your total distribution. 
                                Analysis indicates high structural importance, specifically concentrated in {topContributors.join(", ") || "the top data points"}.&rdquo;
                              </p>
                            </div>
                            <div className="space-y-4">
                              <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Top Contributors</h5>
                              <div className="space-y-2">
                                {topContributors.map((val: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="w-5 h-5 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400">
                                      {idx + 1}
                                    </div>
                                    <span className="text-xs font-bold text-slate-300 truncate">{String(val)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <span>Last Analyzed: {new Date().toLocaleTimeString()}</span>
                            <span className="text-indigo-400">Local Privacy Shield Active</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {!isExpanded && (
                      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                        <Activity size={10} className="text-indigo-400" />
                        <span className="text-[9px] font-semibold text-indigo-300 uppercase tracking-tighter">Click to Expand Analysis</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});
