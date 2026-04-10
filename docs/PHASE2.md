# Phase 2: Excel Live-Link - Complete Implementation

> Watch Excel files for changes and parse them automatically in the browser.

## 🎯 What Phase 2 Adds

### Features

✓ **File Pick Dialog** - Users select Excel files from their computer  
✓ **Memory Persistence** - Browser remembers files using IndexedDB  
✓ **Live Polling** - Web Worker checks for file changes every 5 seconds  
✓ **Auto-Parse** - SheetJS instantly converts Excel to JSON  
✓ **Data Preview** - Beautiful table view of Excel data  
✓ **Zero Cloud** - Everything happens client-side (except authentication)  

---

## 📚 What Got Built

### New Utilities

| File | Purpose |
|------|---------|
| `frontend/store/indexeddb.ts` | Save/retrieve FileSystemFileHandle in browser storage |
| `lib/excelParser.ts` | Parse Excel files using SheetJS |
| `public/excelWatcher.worker.ts` | Web Worker that polls for file changes |

### New React Hooks

| File | Purpose |
|------|---------|
| `frontend/hooks/useExcelLiveLink.ts` | Main hook - manages file selection, parsing, watching |

### New UI Components

| File | Purpose |
|------|---------|
| `frontend/components/ExcelUploadSection.tsx` | File selection UI with status display |
| `frontend/components/ExcelDataViewer.tsx` | Data table preview of Excel sheets |

### New Pages

| File | Purpose |
|------|---------|
| `app/page.tsx` | Home page demonstrating the features |
| `app/globals.css` | Global styles |
| `app/layout.tsx` | Root layout |

### Configuration

| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Tailwind CSS theming |
| `postcss.config.js` | PostCSS for CSS processing |

---

## 🏗️ how it Works

### 1. User Selects a File

```
User clicks "Select Excel File"
        ↓
Browser shows file picker (File System Access API)
        ↓
User chooses a .xlsx file
        ↓
App gets FileSystemFileHandle (permission granted)
```

### 2. File Is Saved for Next Time

```
FileSystemFileHandle stored in IndexedDB
        ↓
Next time user visits → file is automatically restored
        ↓
No need to ask for permission again!
```

### 3. File is Parsed

```
SheetJS reads the Excel file
        ↓
Converts each sheet to JSON
        ↓
Show preview table with data
```

### 4. File is Watched for Changes

```
Web Worker starts in background
        ↓
Every 5 seconds: Check file's lastModified timestamp
        ↓
If timestamp changed → file was updated!
        ↓
Main thread automatically re-parses the file
        ↓
UI updates with new data
```

---

## 🔐 Security Notes

### What's Secure

✓ File never sent to server - stays in browser memory  
✓ Only file metadata (name, size, lastModified) checked  
✓ User has full control - can clear file at any time  
✓ IndexedDB is per-origin (single domain only)  

### Browser Permissions

The File System Access API requires:
- User explicitly selects the file (not automatic)
- File can only be accessed if user granted permission
- Browser shows "this site can access" notification
- User can revoke permission anytime

---

## 📖 Data Flow Diagram

```
┌─ Browser ─┐
│           │
│ ┌─────────────────────────────┐
│ │ ExcelUploadSection (UI)      │
│ │ - File picker button         │
│ │ - File info display          │
│ └──────────────┬──────────────┘
│                │ uses
│ ┌──────────────▼──────────────┐
│ │ useExcelLiveLink (Hook)      │
│ │ - Manages file state         │
│ │ - Handles parsing            │
│ │ - Controls worker            │
│ └──────┬─────────────┬─────────┘
│        │ uses        │ uses
│ ┌──────▼──┐  ┌──────▼──┐
│ │IndexedDB │  │Worker   │
│ │Store     │  │Process  │
│ │Handle    │  │(Polls)  │
│ └──────────┘  └─────────┘
│
└─ ExcelDataViewer (UI) ◄── Shows parsed data
```

---

## 🚀 How to Test

### 1. Build and Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### 2. Upload an Excel File

- Click "📁 Select Excel File"
- Choose any .xlsx or .xls file from your computer
- File loads and displays in the table

### 3. Test Live Updates

- Keep SheetFlow open
- Open the Excel file in Excel/Google Sheets
- Edit a cell and save
- Wait 5 seconds
- SheetFlow automatically refreshes! ✓

### 4. Test Persistence

- Reload the browser page
- File is automatically restored! ✓
- No file picker needed

### 5. Test Multiple Sheets

- Choose an Excel with multiple sheets
- Click sheet tabs at the top
- Data updates for each sheet

---

## 💻 Code Examples

### Using the Hook

```typescript
import { useExcelLiveLink } from "@/frontend/hooks/useExcelLiveLink";

export function MyComponent() {
  const {
    fileHandle,
    workbook,
    status,
    isWatching,
    error,
    selectFile,
    refresh,
  } = useExcelLiveLink();

  if (!fileHandle) {
    return <button onClick={selectFile}>Select File</button>;
  }

  return (
    <div>
      <p>File: {fileHandle.name}</p>
      <p>Status: {status}</p>
      {isWatching && <p>🔄 Watching for changes</p>}
      {workbook && <p>Rows: {workbook.sheets[0].rowCount}</p>}
    </div>
  );
}
```

### Parsing Excel Files

```typescript
import { parseExcelFile, getSheet } from "@/lib/excelParser";

async function handleFile(file: File) {
  const workbook = await parseExcelFile(file);

  // Get first sheet
  const firstSheet = getSheet(workbook, 0);

  // Get all rows
  const rows = firstSheet.rows;

  // Get specific column
  const names = getColumnData(firstSheet, "Name");

  // Filter rows
  const filtered = filterSheetRows(firstSheet, (row) => row.Age > 18);
}
```

### Storing File Handles

```typescript
import {
  saveFileHandle,
  getFileHandle,
  deleteFileHandle,
} from "@/frontend/store/indexeddb";

// Save a file handle
await saveFileHandle(fileHandle, "my-data.xlsx");

// Retrieve it later
const savedHandle = await getFileHandle("my-data.xlsx");

// Delete it
await deleteFileHandle("my-data.xlsx");
```

---

## 🧪 Testing Web Worker Polling

The Web Worker runs independently. To verify it's working:

1. Open DevTools (F12)
2. Go to "Sources" tab
3. Look for "excelWatcher.worker.ts"
4. Set a breakpoint in `checkFileForChanges()`
5. Edit your Excel file
6. Wait 5 seconds
7. Breakpoint should hit!

---

## ⚡ Performance Notes

### Why Web Worker?

Without a worker, file polling would block the UI:
- User can't type or click while file is being checked
- The UI would freeze every 5 seconds

With a worker:
- Polling happens in a background thread
- UI remains responsive even while checking file
- Only updates when file actually changes

### Optimization Tips

**For Large Files:**
- Only parse sheets you need (not all sheets)
- Show first 100 rows in preview (lazy load rest)
- Chunk processing with `requestIdleCallback`

**For Many Files:**
- Clear old file handles from IndexedDB
- Use `deleteFileHandle()` to free space

**For Real-Time Needs:**
- Increase polling frequency (change 5000ms to lower)
- Trade: More CPU usage but faster detection

---

## 🐛 Troubleshooting

### File Picker Doesn't Show

**Problem:** Click button but no file picker appears

**Solutions:**
- Check browser supports File System Access API (Chrome 86+, Edge, Opera)
- Try different browser
- Check console for errors

### File Won't Load

**Problem:** Selected file but nothing happens

**Solutions:**
- Make sure it's a valid Excel file (.xlsx, .xls, .xlsm)
- Check console for error message
- Try a simple Excel file first

### Changes Not Detecting

**Problem:** Edit Excel file but SheetFlow doesn't update

**Solutions:**
- Make sure watching is enabled (green indicator shows)
- Check you saved the file (browser only sees saved changes)
- Try clicking "🔄 Refresh" button manually
- Check console for worker errors

### IndexedDB Not Working

**Problem:** File not restored on page reload

**Solutions:**
- Check browser allows IndexedDB (not in private/incognito mode)
- Try clearing site data and selecting file again
- Check DevTools → Application → Storage → IndexedDB

---

## 🎓 Learning: File System Access API

The File System Access API is new and powerful:

```typescript
// Let user pick a file
const [handle] = await window.showOpenFilePicker();

// Get the File object
const file = await handle.getFile();

// Read file contents
const data = await file.arrayBuffer();

// Get metadata
console.log(file.name);           // "data.xlsx"
console.log(file.lastModified);   // 1234567890
```

Limitations:
- ✓ Great for reading files
- ✓ Can request write access
- ✗ Can't access files system folders
- ✗ Can't see other user's files
- ✗ Requires user permission each time (unless persistence granted)

---

## 📊 Next: Phase 3

After Phase 2 is solid, we'll build:

**Phase 3: Local AI Engine**
- Download Gemma model in browser
- Ask questions about Excel data
- In-memory RAG (Retrieval Augmented Generation)
- All processing stays local!

---

**Phase 2 is complete!** 🎉

You now have a fully functional Excel file uploader with live updating and zero cloud dependency.
