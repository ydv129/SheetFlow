# Phase 4 Files & Structure

This guide explains the new Phase 4 dashboard files and how they connect to the rest of SheetFlow.

## 📁 New File Added

- `frontend/components/DataDashboard.tsx`

## 🔧 What Each File Does

### `frontend/components/DataDashboard.tsx`

**Purpose:** Render sheet-level analytics and charts for the currently selected Excel sheet.

**Key features:**
- Detects numeric and categorical columns automatically
- Renders numeric trend bar chart
- Renders category distribution pie chart
- Shows summary cards for row count, column count, numeric field count, and categorical field count
- Supports multi-field select for sheets with several numeric or category columns

### `frontend/components/ExcelDataViewer.tsx`

**Updated behavior:**
- Supports a controlled `selectedSheetIndex` prop
- Calls `onSheetChange` when a new sheet is selected
- This change ensures the dashboard and AI chat use the same active sheet

### `app/page.tsx`

**Updated behavior:**
- Imports and renders `DataDashboard`
- Passes `selectedSheet` state to both preview and dashboard
- Adds a dashboard feature card to the landing page
- Updates footer copy to Phase 4

## 🔗 Component Relationships

```
app/page.tsx
  ├─ ExcelDataViewer
  │    └─ controlled sheet tabs
  ├─ DataDashboard
  │    ├─ numeric field detection
  │    ├─ category field detection
  │    ├─ trend bar chart
  │    └─ pie chart
  └─ AIChatPanel
       └─ uses same selected sheet state
```

## 🧩 Why the Sheet Selection Change Matters

Previously, `ExcelDataViewer` managed sheet selection internally.
That meant the AI chat and dashboard could be out of sync with the visible sheet.

Phase 4 lifts sheet selection to the page so all three areas are aligned:
- table preview
- analytics dashboard
- AI chat analysis

## 🛠️ Tailwind + Recharts

The dashboard uses the existing styling system and leverages `recharts` for charts:
- `ResponsiveContainer`
- `BarChart`
- `PieChart`
- `CartesianGrid`
- `Tooltip`
- `Legend`

## ✅ Notes for Maintenance

- If you add new chart types, keep them inside `DataDashboard.tsx` or split into smaller chart components.
- If you want to support more advanced filtering, add it here and update the chart data helpers.
- If you need cross-sheet analytics, the selected sheet logic in `app/page.tsx` is the place to extend.
