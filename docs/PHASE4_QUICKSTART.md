# Phase 4 Quick Start - Dashboard Analytics

Phase 4 adds interactive dashboards to SheetFlow so you can visualize your Excel data and discover insights faster.

## 📋 What You Need

- SheetFlow running locally: `npm run dev`
- A modern browser (Chrome, Edge, or Safari)
- A loaded Excel workbook with at least one numeric column
- `recharts` already installed in dependencies

## 🚀 Quick Start

### Step 1: Open SheetFlow

Start the app if it is not already running:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Step 2: Select an Excel File

1. Click **"📁 Select Excel File"**
2. Choose a `.xlsx` or `.xls` file
3. Wait for the workbook to parse

### Step 3: View the Data Dashboard

1. The right-hand panel now shows data preview and dashboards
2. Scroll down to the **Sheet dashboard** section
3. You will see:
   - row and column counts
   - numeric and category field totals
   - trend bar chart for numeric values
   - category breakdown pie chart
   - summary cards with min/max/average

### Step 4: Choose the Right Fields

- If your sheet has multiple numeric columns, select which one to analyze
- If your sheet has multiple categorical columns, choose one for the pie chart
- The dashboard updates automatically when you switch sheets

### Step 5: Use It with AI

- You can still click **"🤖 Ask AI Analyst"** to query the same sheet
- The dashboard and AI analysis now work together
- Charts help you validate AI findings visually

## 🧪 Test Scenarios

### Scenario 1: Numeric Trend

1. Load a sheet with numeric measurements
2. Confirm the bar chart displays the first 12 row values
3. Verify the summary cards show correct sum, average, min, and max

### Scenario 2: Category Breakdown

1. Load a sheet with a category column
2. Confirm the pie chart displays the top categories
3. If there are more than 5 categories, the rest are grouped into "Other"

### Scenario 3: Multi-Sheet Workbooks

1. Load a workbook with multiple sheets
2. Switch sheet tabs at the top of the data preview
3. Confirm the dashboard updates to reflect the new sheet

## 🐛 Troubleshooting

### Dashboard does not show charts

- Ensure the selected sheet has at least one numeric column for the bar chart
- Ensure the selected sheet has at least one string category column for the pie chart
- Reload the page if the dashboard looks blank

### Selected sheet does not match AI analysis

- Sheet selection now controls both preview and dashboard
- If AI still uses the wrong sheet, refresh the browser and reload the file

## 🎯 What This Phase Adds

- Visual summaries for rows, columns, numeric fields, and categories
- Trend chart for numeric values
- Category distribution pie chart
- Field selection controls for multi-column workbooks
- Dashboard analytics integrated with the existing Excel preview

---

**Phase 4 is focused on making your data easier to explore before you ask the AI questions.**
