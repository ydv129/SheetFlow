# Phase 4: UI & Dashboards

Phase 4 adds interactive dashboards to SheetFlow so users can visually inspect trends, understand category distributions, and compare numeric values directly from Excel data.

## 🎯 What Phase 4 Means

Phase 4 turns raw spreadsheet data into an analytics dashboard:
- Summary cards for row and column counts
- Numeric field metrics (sum, average, min, max)
- Trend chart for numeric values
- Category breakdown pie chart
- Sheet-aware dashboards that update when the user switches sheets

This phase is designed to help users explore data visually before they ask AI questions.

## 🧱 Core Components

### `DataDashboard`

This component is the centerpiece of Phase 4.
It reads the current `ExcelSheet` and generates:
- numeric column analysis
- category distribution metrics
- chart-ready datasets for `recharts`

It also provides dropdown selectors when the sheet has multiple numeric or category columns.

### `ExcelDataViewer`

`ExcelDataViewer` now supports controlled sheet selection.
The selected sheet is lifted to the page so both the preview, dashboard, and AI chat all use the same active sheet.

### `app/page.tsx`

The home page now renders the dashboard below the data preview when AI chat is not active.
It also adds a new feature badge for dashboards.

## 📊 Dashboard Behavior

### Column detection

The dashboard uses heuristics to infer:
- numeric fields: values that parse cleanly to numbers
- categorical fields: non-empty strings

### Chart types

- **Bar chart**: shows the first 12 rows of the selected numeric column
- **Pie chart**: displays the top 5 categories and groups remaining values as "Other"
- **Summary cards**: rows, columns, numeric field count, and categorical field count

### Field selection

When a sheet has multiple candidate fields, the dashboard displays selectors for:
- numeric field selection
- category field selection

This makes it easy to switch between different analytics perspectives without reloading the file.

## 🔧 Data Flow

1. Excel file is loaded and parsed by `useExcelLiveLink`
2. `ExcelDataViewer` renders the sheet preview
3. The selected sheet is lifted to `app/page.tsx`
4. `DataDashboard` receives the active sheet and computes:
   - numeric columns
   - category columns
   - trend chart data
   - category pie data
   - numeric summary metrics
5. Charts render using `recharts`

## ✅ Why This Phase Is Valuable

- Users get immediate visual insight into their data
- Charts surface trends that may not be obvious from the table alone
- Category breakdowns help validate AI explanations
- Selecting active sheets now updates both dashboard and AI analysis consistently

## 🧩 Summary of New UX

- Dashboard appears beneath the data preview panel
- Sheet tabs now change both table and dashboard
- New chart section improves discoverability for analytics
- The footer and feature cards now highlight Phase 4 dashboard capabilities

## 📌 Notes for Developers

- If `sheet` is null, the dashboard shows a placeholder message
- If there are no numeric or categorical fields, the charts state that clearly
- The dashboard uses a lightweight, responsive layout with Tailwind and `recharts`
- The new dashboard component is entirely client-side

---

**Phase 4 is about making SheetFlow not just a file viewer, but an analytics workspace.**
