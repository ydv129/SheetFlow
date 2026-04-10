# Phase 2 Quick Start - Excel Live-Link Demo

Get SheetFlow's Excel file upload and live-watching running in 5 minutes.

## 📋 What You Need

- SheetFlow backend running (`npm run dev`)
- A web browser (Chrome, Edge, Opera, or newer Safari)
- An Excel file (.xlsx or .xls) to test with

## 🚀 Quick Start

### 1. Start the Dev Server

```bash
npm install  # if you haven't already
npm run dev
```

Open `http://localhost:3000` in your browser

### 2. Select an Excel File

1. Click the blue **"📁 Select Excel File"** button
2. A file picker shows up
3. Choose any .xlsx or .xls file from your computer
4. Wait a moment for it to load

### 3. View Your Data

The data should appear in a table on the right side:
- Shows all columns from your Excel file
- Displays the first 10 rows
- Click **"Load more rows"** to see more
- Switch between sheets using tabs at the top

### 4. Test Live Updates (The Magic Part!)

1. Keep SheetFlow open in your browser
2. Open your Excel file in Excel, Google Sheets, or LibreOffice
3. Edit any cell and **save the file**
4. Wait up to 5 seconds
5. SheetFlow automatically updates! ✨

### 5. Test One More Thing

1. Close the browser completely
2. Come back to `http://localhost:3000`
3. Your file is automatically restored! 
4. No need to select it again!

## 🎨 Understanding the UI

### File Info Box (Green)
Shows which file is loaded and whether it's being watched

### Action Buttons

| Button | Does What |
|--------|-----------|
| 🔄 Refresh | Manually reload the file |
| ⏸️ Pause Watching | Stop checking for changes |
| ▶️ Resume Watching | Start checking again |
| 📁 Choose Different | Pick a new file |
| 🗑️ Clear | Delete the saved file |

### Data Preview

| Element | What It Is |
|---------|-----------|
| Row #1, Row #2... | Row numbers |
| Sheet tabs | Different Excel sheets |
| Stats (Rows/Columns) | File statistics |
| "Load more rows" | Pagination control |

## 🧪 Test Scenarios

### Scenario 1: Simple Viewing
1. Select a small Excel file (< 1000 rows)
2. Browse the data
3. Scroll through sheets

### Scenario 2: Live Updates
1. Select any Excel file
2. Note some data values
3. Open the file in Excel
4. Change a value
5. Save it
6. Wait 5 seconds
7. SheetFlow shows the new value ✓

### Scenario 3: Large Files
1. Select an Excel with 10,000+ rows
2. Table should still be responsive
3. Click "Load more rows" to see more
4. Scrolling should be smooth

### Scenario 4: Multiple Sheets
1. Select Excel with 3+ sheets
2. Click different sheet tabs
3. Data should update for each sheet

### Scenario 5: Persistence
1. Select a file
2. Note the file name
3. Reload the page (Ctrl+R or F5)
4. File should be there automatically!

## 🐛 If Something Doesn't Work

### File Picker Doesn't Show
**Problem:** Click button but nothing happens

```
Solution: This requires File System Access API
- Use Chrome, Edge, or Opera
- If not working, check browser console (F12) for errors
```

### File Won't Load After Selection
**Problem:** Selected file but UI doesn't show data

```
Solutions:
1. Check the file is a real Excel file (.xlsx, .xls, .xlsm)
2. Check console for error message (F12)
3. Try with a simple Excel file first
4. Check browser allows JavaScript (not disabled)
```

### Live Updates Not Working
**Problem:** Edit Excel file but SheetFlow doesn't update

```
Solutions:
1. Make sure watching is enabled (green text "🔄 Watching for changes")
2. Make sure you SAVED the Excel file (browser only sees saved files)
3. Wait the full 5 seconds
4. Try clicking "🔄 Refresh" manually
5. Check browser console for errors
```

### File Not Remembered After Reload
**Problem:** Close page and file is gone

```
Solutions:
1. Check you're not in Private/Incognito mode (doesn't support IndexedDB)
2. Try selecting the file again
3. Check browser allows IndexedDB (Privacy settings)
4. Try a simple file first to isolate the problem
```

### Table Is Slow or Freezing
**Problem:** Large Excel file makes table lag

```
Solutions:
1. Excel files with 50,000+ rows may be slow
2. Try clicking "Load more rows" less often
3. Use a smaller Excel file for testing
4. Close other browser tabs to free up memory
```

## 📊 What to Look For (Verifying It Works)

### ✓ File Upload Working
- [ ] File picker opens when you click button
- [ ] Selected file name appears in green box
- [ ] Data shows in the table

### ✓ Viewing Working
- [ ] Can scroll through rows horizontally and vertically
- [ ] Sheet names appear (if file has multiple sheets)
- [ ] Column headers match your Excel file
- [ ] Data values are correct

### ✓ Live Updates Working
- [ ] Green box shows "🔄 Watching for changes"
- [ ] Edit Excel → Save → Wait 5 sec → Data updates
- [ ] Can test multiple times

### ✓ Persistence Working
- [ ] Close entire browser
- [ ] Reopen localhost:3000
- [ ] File is there automatically

## 💡 Tips & Tricks

### Get Better Performance
- Select Excel files< 100MB
- Avoid files with 100,000+ rows
- Close other tabs to free memory

### Test with Sample Data
Need an Excel file to test? Create one:

1. Open Excel or Google Sheets
2. Make 3 sheets: "Sales", "Customers", "Products"
3. Add some sample data:

**Sheet 1: Sales**
```
Date       | Product | Amount
-----------|---------|-------
2024-01-01 | Widget  | 100
2024-01-02 | Gadget  | 150
```

4. Save as .xlsx
5. Use in SheetFlow

### Check Browser Support
Test your browser here: https://caniuse.com/native-filesystem-api

- ✓ Chrome 86+
- ✓ Edge 86+
- ✓ Opera 72+
- ⚠️ Safari (partial support)
- ✗ Firefox (not yet)

## 🎓 Learn More

- **Architecture**: See [docs/ARCHITECTURE.md](../ARCHITECTURE.md)
- **Full Phase 2 Guide**: See [docs/PHASE2.md](../PHASE2.md)
- **API Testing**: See [docs/API_TESTING.md](../API_TESTING.md)

## 🎉 Next Steps

Once Phase 2 feels solid:

1. Play with different Excel files
2. Test large files (check performance)
3. Try multiple sheets
4. Try live editing and watching

Then we move to **Phase 3: Local AI Engine** where you can ask questions about your data!

---

**Congrats! You're running a fully-featured Excel parser with live updates!** 🚀
