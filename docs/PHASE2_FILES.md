# Phase 2 File Structure & Dependencies

Complete breakdown of all new files created in Phase 2 and how they connect.

## 📂 New Files Created

### Browser Storage Utilities
```
frontend/store/
├── indexeddb.ts          ← Save/retrieve FileSystemFileHandle
```

### Utilities & Parsing  
```
lib/
├── excelParser.ts        ← Parse Excel files with SheetJS
```

### React Hooks
```
frontend/hooks/
├── useExcelLiveLink.ts   ← Main hook (manages everything)
├── index.ts              ← Export helper
```

### React Components
```
frontend/components/
├── ExcelUploadSection.tsx     ← File picker UI
├── ExcelDataViewer.tsx        ← Data table preview
├── index.ts                   ← Export helper
```

### Web Worker
```
public/
├── excelWatcher.worker.ts     ← File watching (polls every 5 sec)
```

### Pages & Styling
```
app/
├── page.tsx              ← Home page (demo)
├── layout.tsx            ← Root layout
├── globals.css           ← Global styles
```

### Configuration
```
root/
├── tailwind.config.ts    ← Tailwind CSS config
├── postcss.config.js     ← PostCSS config
```

### Documentation
```
docs/
├── PHASE2.md             ← Complete Phase 2 guide
├── PHASE2_QUICKSTART.md  ← Quick start (5 minute demo)
```

---

## 🔗 Dependency Graph

```
┌─────────────────────────────────────────────────────────┐
│                     app/page.tsx                         │
│                   (Home Page)                            │
│  Uses: ExcelUploadSection, ExcelDataViewer              │
└────────┬──────────────────────────────┬─────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐    ┌─────────────────────┐
│ExcelUploadSection.tsx│    │ExcelDataViewer.tsx  │
│                      │    │                     │
│Uses:                │    │Uses:                │
│ - useExcelLiveLink  │    │ - ExcelWorkbook type│
│ - UI components     │    │ - React.useState    │
└──────────┬──────────┘    └─────────────────────┘
           │
           ▼
     ┌──────────────────────────┐
     │ useExcelLiveLink.ts      │
     │  (Main React Hook)       │
     │                          │
     │ Uses:                    │
     │ - indexeddb.ts           │
     │ - excelParser.ts         │
     │ - Web Worker             │
     └──────┬────────┬──────────┘
            │        │
            ▼        ▼
     ┌──────────────────────┐   ┌──────────────────────┐
     │indexeddb.ts          │   │excelParser.ts        │
     │ (Browser Storage)    │   │ (Parse Excel)        │
     │                      │   │                      │
     │Functions:           │   │Functions:           │
     │- saveFileHandle()    │   │- parseExcelFile()    │
     │- getFileHandle()     │   │- getSheet()          │
     │- deleteFileHandle()  │   │- filterSheetRows()   │
     │- listSavedFileHandles│  │- getColumnData()     │
     └──────────────────────┘   │- getSheetStats()     │
                                 │                      │
                                 │Uses: SheetJS (xlsx) │
                                 └──────────────────────┘

             ▼ (Spawned by useExcelLiveLink)
     ┌──────────────────────┐
     │excelWatcher.worker.ts│
     │  (Web Worker)        │
     │                      │
     │Polls every 5 seconds │
     │- checkFileForChanges │
     │- Sends "file-changed"│
     │  message on update   │
     └──────────────────────┘
```

---

## 📦 Component Usage Examples

### Basic Usage in a Page

```typescript
// app/page.tsx
import { ExcelUploadSection } from "@/frontend/components";
import { ExcelDataViewer } from "@/frontend/components";
import { useExcelLiveLink } from "@/frontend/hooks";

export default function Page() {
  const { workbook } = useExcelLiveLink();

  return (
    <div>
      <ExcelUploadSection />
      <ExcelDataViewer workbook={workbook} />
    </div>
  );
}
```

### Using the Hook Directly

```typescript
// app/dashboard/page.tsx
import { useExcelLiveLink } from "@/frontend/hooks";

export function Dashboard() {
  const {
    fileHandle,
    fileName,
    workbook,
    isWatching,
    error,
    selectFile,
    refresh,
  } = useExcelLiveLink();

  if (!fileHandle) {
    return <button onClick={selectFile}>Pick File</button>;
  }

  return (
    <div>
      <h1>{fileName}</h1>
      {isWatching && <p>Watching for changes...</p>}
      {workbook && <p>Has {workbook.sheetCount} sheets</p>}
    </div>
  );
}
```

### Using ExcelParser Standalone

```typescript
// lib/myUtil.ts
import { parseExcelFile, getColumnData } from "@/lib/excelParser";

export async function analyzeFile(file: File) {
  const workbook = await parseExcelFile(file);
  const firstSheet = workbook.sheets[0];

  // Get all names from "Name" column
  const names = getColumnData(firstSheet, "Name");

  return names;
}
```

---

## 🔄 Data Flow Through Phase 2

### 1. File Selection
```
User clicks "Select File"
     ↓
useExcelLiveLink.selectFile()
     ↓
window.showOpenFilePicker() (browser file picker)
     ↓
User selects .xlsx file
     ↓
FileSystemFileHandle returned
```

### 2. File Parsing
```
loadAndParseFile(fileHandle)
     ↓
fileHandle.getFile() → File object
     ↓
parseExcelFile(file) 
     ↓
SheetJS converts Excel buffer → JSON
     ↓
ExcelWorkbook object created
     ↓
setState(workbook)
     ↓
UI re-renders with data
```

### 3. File Saving
```
parseExcelFile succeeds
     ↓
saveFileHandle(fileHandle, fileName)
     ↓
IndexedDB stores handle
     ↓
On next page load: getFileHandle() retrieves it automatically
```

### 4. File Watching
```
Web Worker spawned
     ↓
Worker receives fileHandle via postMessage
     ↓
Every 5 seconds: check file.lastModified
     ↓
If timestamp changed:
     ↓
Worker sends "file-changed" message
     ↓
Main thread receives message
     ↓
Calls handleFileChanged()
     ↓
Re-parses file
     ↓
UI updates automatically
```

---

## 🛠️ Technology Stack (Phase 2)

| Technology | Purpose | Used In |
|-----------|---------|---------|
| React 19 | UI framework | Components, hooks |
| TypeScript | Type safety | All .ts files |
| SheetJS | Excel parsing | excelParser.ts |
| IndexedDB | Browser storage | indexeddb.ts |
| Web Workers | Background threads | excelWatcher.worker.ts |
| File System API | File selection | useExcelLiveLink.ts |
| Tailwind CSS | Styling | All components |
| Next.js 15 | Framework | app folder |

---

## 📋 File Checklist

Phase 2 files that should exist:

```
□ frontend/store/indexeddb.ts
□ frontend/hooks/useExcelLiveLink.ts
□ frontend/hooks/index.ts
□ frontend/components/ExcelUploadSection.tsx
□ frontend/components/ExcelDataViewer.tsx
□ frontend/components/index.ts
□ lib/excelParser.ts
□ public/excelWatcher.worker.ts
□ app/page.tsx
□ app/layout.tsx
□ app/globals.css
□ tailwind.config.ts
□ postcss.config.js
□ docs/PHASE2.md
□ docs/PHASE2_QUICKSTART.md
```

---

## 🚀 Testing Each Layer

### Test IndexedDB Storage
```typescript
// browser console
import { saveFileHandle, getFileHandle } from "@/frontend/store/indexeddb";

const handle = /* get a file handle */;
await saveFileHandle(handle, "test");
const retrieved = await getFileHandle("test");
console.log(retrieved === handle); // true
```

### Test Excel Parser
```typescript
// browser console
import { parseExcelFile } from "@/lib/excelParser";

const file = /* get an Excel file */;
const workbook = await parseExcelFile(file);
console.log(workbook.sheets[0].rows);
```

### Test useExcelLiveLink Hook
```typescript
// browser console
// Create a test component
import { useExcelLiveLink } from "@/frontend/hooks";

function Test() {
  const { selectFile, workbook } = useExcelLiveLink();
  return (
    <div>
      <button onClick={selectFile}>Pick file</button>
      {workbook && <p>{workbook.fileName}</p>}
    </div>
  );
}

// Renders in a test app
```

---

## 🔍 Finding Code Quickly

**Need to update file watching logic?**
→ `public/excelWatcher.worker.ts`

**Need to change table appearance?**
→ `frontend/components/ExcelDataViewer.tsx`

**Need to add file formats?**
→ `lib/excelParser.ts` (update validation)

**Need to change UI buttons?**
→ `frontend/components/ExcelUploadSection.tsx`

**Need to fix IndexedDB issues?**
→ `frontend/store/indexeddb.ts`

**Need to change polling interval?**
→ `frontend/hooks/useExcelLiveLink.ts` (look for `5000`)

---

## 📞 Common Changes

### Change polling interval from 5s to 10s
```typescript
// File: frontend/hooks/useExcelLiveLink.ts
// Find this line:
workerRef.current.postMessage({
  type: "start-watching",
  fileHandle: handle,
  interval: 5000,  // ← Change to 10000
});
```

### Add Excel format support
```typescript
// File: lib/excelParser.ts
// Update validExtensions array:
const validExtensions = [
  ".xlsx", 
  ".xls", 
  ".xlsm",
  ".ods"  // ← Add support for OpenDocument
];
```

### Change table row limit
```typescript
// File: frontend/components/ExcelDataViewer.tsx
// Find this line:
const [rowsToShow, setRowsToShow] = useState(10);  // ← Change to 20
```

### Add save Excel feature
```typescript
// File: lib/excelParser.ts
// Add new export function:
export async function saveExcelFile(workbook: ExcelWorkbook) {
  // Use SheetJS write feature
  const wb = XLSX.utils.book_new();
  // ... add sheets...
  XLSX.writeFile(wb, "output.xlsx");
}
```

---

**All Phase 2 files follow the same principles:**
- ✓ Human-readable variable names
- ✓ Detailed comments explaining WHY
- ✓ No TODOs or placeholders
- ✓ Security considered
- ✓ Error handling included
- ✓ Type-safe with TypeScript
