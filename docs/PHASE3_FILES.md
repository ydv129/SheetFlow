# Phase 3 Files & Structure - Code Guide

Quick reference for all Phase 3 files: what each does, key functions, and how to modify them.

## 📁 File Location Map

```
/workspaces/SheetFlow/
│
├── lib/
│   └── semanticChunking.ts          ← RAG System (breaks Excel → chunks)
│
├── frontend/
│   ├── hooks/
│   │   ├── useLocalAI.ts            ← AI Engine Hook (manages WebLLM)
│   │   └── index.ts                 ← Export for easy importing
│   │
│   └── components/
│       ├── AIChatPanel.tsx          ← Chat UI Component
│       └── index.ts                 ← Export for easy importing
│
├── app/
│   └── page.tsx                     ← Home page (integrated Phase 3)
│
└── package.json                     ← Dependencies (@mlc-ai/web-llm added)
```

## 🔧 Core Files

### 1. `lib/semanticChunking.ts` - RAG System (300+ lines)

**What it does:** Breaks large Excel files into small "chunks" that AI can understand and process efficiently.

**Why needed:** 
- Excel files can have 100,000+ rows
- AI models have limited context windows
- Sending all data = token overflow errors
- Solution: Send only relevant chunks

#### Key Functions:

**`createSemanticChunks(sheet, maxRowsPerChunk)`**

```typescript
// Input
sheet: ExcelSheet = {
  columnNames: ["Date", "Product", "Revenue"],
  rows: [
    { Date: "2024-01-01", Product: "Widget", Revenue: 100 },
    // ... 10,000 rows total
  ]
}
maxRowsPerChunk = 100

// Output
chunks = [
  {
    id: "chunk_0",
    sheetName: "Sales",
    columnNames: ["Date", "Product", "Revenue"],
    rows: [/* rows 0-100 */],
    rowIndices: [0, 100],
    summary: "Q1 sales data"
  },
  {
    id: "chunk_1",
    sheetName: "Sales",
    // ... rows 100-200
  },
  // ... 100 total chunks
]
```

**What to modify:**
- Change `100` to larger/smaller for more/fewer chunks
- Larger = more data per chunk but slower AI
- Smaller = faster AI but might miss context

**`findRelevantChunks(chunks, query)`**

Scores each chunk based on how relevant it is to the user's question.

```typescript
// Input
chunks = [/* 100 chunks from above */]
query = "What are my top 5 products by revenue?"

// Scoring process:
// Chunk 0: "Date" (score 0), "Product" (score 1.0), "Revenue" (score 1.0) → Total: 2.0
// Chunk 1: "Date" (score 0), "Product" (score 1.0), "Revenue" (score 1.0) → Total: 2.0
// Chunk 5: "ProductName" EXACT match (score 2.0), "Revenue" (score 1.0) → Total: 3.0 ⭐
// ...sorting all by score...

// Output: Top 3 chunks
relevantChunks = [
  chunks[5],   // Highest score
  chunks[12],  // Second highest
  chunks[8],   // Third highest
]
```

**What to modify:**
- Change `3` (top 3 chunks) to `5` or `10` for more context
- More chunks = better accuracy but slower, more tokens used
- Fewer chunks = faster but might miss details

**`formatChunksForAI(chunks)`**

Converts chunks to human-readable format for the AI.

```typescript
// Input: chunks = [chunk_0, chunk_5, chunk_12]

// Output: Beautified string
`
Chunk 1 of 3 (Rows 0-100): Sales Revenue
Product: Widget, Product_Category, Revenue (columns)
- Row 1: Widget, Electronics, $1,500
- Row 2: Gadget, Home, $800
- Row 3: Tool, Industrial, $2,200
... (97 more rows in this chunk)

Chunk 2 of 3 (Rows 500-600): Sales Revenue
... similar format
`
```

**What to modify:**
- Change the column order in output
- Change row display format (show more or fewer rows per chunk)
- Currently shows first 3 rows + "... (97 more rows)"

**`getAnalyzableColumns(sheet)`**

Filters out useless columns before sending to AI.

```typescript
// Input: All columns from Excel
columns = ["ID", "UUID", "CreatedAt", "Name", "Revenue", "Empty", "Category"]

// AI shouldn't analyze: IDs, UUIDs, timestamps, empty columns
// It should analyze: Name, Revenue, Category

// Output
analyzableColumns = ["Name", "Revenue", "Category"]
```

**What to modify:**
- Add more filter patterns in `isUnanalyzableColumn()`
- Example: Skip columns with "internal" in the name

**`createContextSummary(sheet)`**

Generates system prompt that tells AI what data it's analyzing.

```typescript
// Input: Sheet with columns [Date, Product, Revenue, Category]

// Output: System prompt excerpt
`You are analyzing business sales data.
Column types:
- Date: date/timestamp column
- Product: text/product names
- Revenue: currency/numeric amounts  
- Category: text/product categories

Total rows in dataset: 10,547
Analyzed rows in context: 300 (sample of relevant data)

Respond clearly and concisely.`
```

**What to modify:**
- Change the system prompt instructions for different AI behavior
- Add domain context if needed

---

### 2. `frontend/hooks/useLocalAI.ts` - AI Engine (400+ lines)

**What it does:** React hook that manages the WebLLM engine lifecycle and handles all AI interactions.

**Why a hook?** 
- React components need state management
- Multiple components might need AI
- Reusable across the app
- Clean TypeScript interfaces

#### Hook Interface:

```typescript
interface UseLocalAIReturn {
  // State
  status: AIStatus;           // "not-initialized" | "initializing" | ...
  downloadProgress: number;   // 0-100 (percentage)
  currentModel: AIModel;      // "smollm" | "gemma"
  lastResponse: string;       // Last AI response
  errorMessage: string;       // Error details if any

  // Methods
  askQuestion: (query: string, sheet: ExcelSheet) => Promise<string>;
  switchModel: (model: AIModel) => Promise<void>;
  stop: () => void;           // Stop generation
}
```

#### How to Use in a Component:

```typescript
// In AIChatPanel.tsx or any component
import { useLocalAI } from "@/frontend/hooks/useLocalAI";
import type { ExcelSheet } from "@/lib/excelParser";

export function MyComponent({ sheet }: { sheet: ExcelSheet }) {
  const {
    status,
    downloadProgress,
    currentModel,
    askQuestion,
    switchModel,
  } = useLocalAI();

  async function handleSubmit(query: string) {
    // 1. Switch model if needed
    if (currentModel !== "smollm") {
      await switchModel("smollm");
    }

    // 2. Ask question
    const response = await askQuestion(query, sheet);
    
    // 3. Use response
    console.log(response);
  }

  return (
    <div>
      <p>Status: {status}</p>
      {status === "downloading-model" && (
        <progress value={downloadProgress} max={100} />
      )}
      <button onClick={() => handleSubmit("What's the sum?")}>
        Ask AI
      </button>
    </div>
  );
}
```

#### Key Implementation Details:

**Initialization (first page load):**

```typescript
useEffect(() => {
  async function initialize() {
    setStatus("initializing");
    
    try {
      // Dynamically import WebLLM
      const webllm = await import("@mlc-ai/web-llm");
      
      // Create engine with WebGPU
      const engine = new webllm.Engine();
      
      // Pre-load default model (SmolLM2-360M)
      await engine.generate(
        "Initialize", 
        onDownloadProgress // Will be 0% since already downloaded
      );
      
      engineRef.current = engine;
      setStatus("ready");
      setCurrentModel("smollm");
    } catch (err) {
      setStatus("error");
      setErrorMessage((err as Error).message);
    }
  }
  
  initialize();
}, []); // Run once on mount
```

**Model Switching:**

```typescript
async function switchModel(newModel: AIModel) {
  setStatus("downloading-model");
  setDownloadProgress(0);
  
  try {
    const modelSpec = newModel === "smollm" 
      ? "Qwen/SmolLM2-360M-Instruct-q4f32_1" 
      : "google/Gemma-4-E2B-Instruct-q4f16_1";
    
    // Trigger download if not cached
    await engineRef.current!.generate(
      "Test", 
      (prog) => setDownloadProgress(Math.round(prog * 100))
    );
    
    setCurrentModel(newModel);
    setStatus("ready");
  } catch (err) {
    setStatus("error");
    setErrorMessage((err as Error).message);
  }
}
```

**Asking Questions:**

```typescript
async function askQuestion(query: string, sheet: ExcelSheet) {
  setStatus("thinking");
  
  try {
    // 1. Prepare data
    const chunks = createSemanticChunks(sheet, 100);
    const relevant = findRelevantChunks(chunks, query);
    const formatted = formatChunksForAI(relevant);
    
    // 2. Build prompt
    const systemPrompt = createContextSummary(sheet);
    const userPrompt = `${systemPrompt}\n\nData:\n${formatted}\n\nQ: ${query}`;
    
    // 3. Generate response (streaming)
    let fullResponse = "";
    for await (const chunk of engineRef.current!.generate(userPrompt)) {
      fullResponse += chunk;
      setLastResponse(fullResponse);
    }
    
    setStatus("ready");
    return fullResponse;
  } catch (err) {
    setStatus("error");
    setErrorMessage((err as Error).message);
    return "";
  }
}
```

#### What to Modify:

**Change default model:**

```typescript
// Line: setCurrentModel("smollm");
// Change to:
setCurrentModel("gemma"); // Start with smart model
```

**Change model names:**

```typescript
// In switchModel() function, update these:
const modelSpec = newModel === "custom_model"
  ? "path/To/Custom/Model"  // Your model here
  : "google/Gemma-4-E2B-Instruct-q4f16_1";
```

**Add error logging:**

```typescript
} catch (err) {
  console.error("AI Error:", err);
  logToAnalytics("ai_error", { error: err.message });
  setStatus("error");
}
```

---

### 3. `frontend/components/AIChatPanel.tsx` - Chat UI (300+ lines)

**What it does:** Beautiful chat interface for users to interact with the AI.

**Features:**
- Model selector buttons
- Chat message history with timestamps
- Auto-scrolling
- Real-time streaming responses
- Error display
- Stop generation button

#### Component Props:

```typescript
interface AIChatPanelProps {
  sheet?: ExcelSheet;  // The Excel data to analyze (optional)
}

// If sheet is not provided, component shows "No data loaded"
```

#### Usage:

```typescript
// In parent component (app/page.tsx)
import { AIChatPanel } from "@/frontend/components/AIChatPanel";
import { useExcelLiveLink } from "@/frontend/hooks/useExcelLiveLink";

export default function Home() {
  const { sheets, selectedSheetIndex } = useExcelLiveLink();
  
  return (
    <div>
      {/* ... Excel viewer ... */}
      
      {/* Pass current sheet to AI chat */}
      <AIChatPanel sheet={sheets[selectedSheetIndex]} />
    </div>
  );
}
```

#### Internal State:

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "ai" | "error" | "system";
  content: string;
  timestamp: Date;
}

// Component state
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [inputValue, setInputValue] = useState("");
const [isLoading, setIsLoading] = useState(false);
const messagesEndRef = useRef<HTMLDivElement>(null);

const {
  status,
  downloadProgress,
  currentModel,
  askQuestion,
  switchModel,
  lastResponse,
  errorMessage,
} = useLocalAI();
```

#### Key Functions:

**`handleSubmit(e)`** - Send question

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!inputValue.trim() || !sheet) return;
  
  // 1. Add user message
  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: "user",
    content: inputValue,
    timestamp: new Date(),
  };
  setMessages([...messages, userMsg]);
  setInputValue("");
  
  // 2. Ask AI
  setIsLoading(true);
  const response = await askQuestion(inputValue, sheet);
  
  // 3. Add AI response
  if (response) {
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
  }
  
  setIsLoading(false);
}
```

**`handleModelSwitch()`** - Switch AI model

```typescript
async function handleModelSwitch(model: "smollm" | "gemma") {
  setIsLoading(true);
  
  // Show status message
  const statusMsg: ChatMessage = {
    id: Date.now().toString(),
    role: "system",
    content: `Loading ${model === "smollm" ? "⚡ Fast" : "🧠 Smart"} model...`,
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, statusMsg]);
  
  try {
    await switchModel(model);
    setMessages((prev) => [
      ...prev.slice(0, -1), // Remove old status
      { ...statusMsg, content: `✓ Ready to use ${model === "smollm" ? "⚡ Fast" : "🧠 Smart"}` },
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { ...statusMsg, role: "error", content: `Error loading model: ${err}` },
    ]);
  }
  
  setIsLoading(false);
}
```

**`useEffect` - Auto-scroll to latest message**

```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]); // Run whenever messages change
```

#### UI Structure:

```
┌────────────────────────────┐
│   Model Buttons            │  ← handleModelSwitch()
│ ⚡ Fast  |  🧠 Smart      │
└────────────────────────────┘
┌────────────────────────────┐
│  Status Line               │
│  🟢 Ready / 🟡 Init...    │
│  Download: 45%             │
└────────────────────────────┘
┌────────────────────────────┐
│                            │
│  Chat Messages             │  ← Map through messages
│  User: What's the sum?     │
│                            │
│  AI: The sum is $10,500    │
│                            │
│  [auto-scroll to here]     │  ← messagesEndRef
│                            │
└────────────────────────────┘
┌────────────────────────────┐
│ Input Form                 │
│ ┌──────────────────┐┌────┐ │
│ │ Ask question...  ││Send│ │
│ └──────────────────┘└────┘ │
└────────────────────────────┘
```

#### CSS Classes (Tailwind):

```typescript
// Model buttons
"px-4 py-2 rounded-lg font-semibold transition-all"
"active:bg-blue-600 bg-blue-500 text-white"

// User message
"flex justify-end mb-4"
"bg-blue-500 text-white rounded-lg px-4 py-2"

// AI message  
"flex justify-start mb-4"
"bg-gray-200 text-gray-900 rounded-lg px-4 py-2"

// Error message
"bg-red-100 border border-red-400 text-red-700"
```

#### What to Modify:

**Change model display names:**

```typescript
// In JSX
{currentModel === "smollm" ? "⚡ SmolLM2-360M" : "🧠 Gemma-4-E2B"}
// Change to:
{currentModel === "smollm" ? "Quick" : "Detailed"}
```

**Change message colors:**

```typescript
// User message, change bg-blue-500 to:
"bg-purple-500"     // Purple
"bg-green-500"      // Green
"bg-indigo-500"     // Indigo
```

**Add emoji to responses:**

```typescript
// In aiMsg creation:
content: `✨ ${response}` // Add sparkle emoji
```

---

## 🧩 Integration Points

### How Phase 3 Files Connect:

```
User Types Question
    ↓
AIChatPanel.tsx
    ├── Calls: useLocalAI.askQuestion()
    ├── Pass: (query, sheet)
    └── Gets: response (streamed)

useLocalAI.ts
    ├── Calls: createSemanticChunks() 
    ├── Calls: findRelevantChunks()
    ├── Calls: formatChunksForAI()
    ├── Calls: createContextSummary()
    └── Calls: engine.generate() [WebLLM]

semanticChunking.ts
    ├── Receives: ExcelSheet object
    ├── Returns: DataChunk array
    └── Used by: useLocalAI.ts

WebLLM Library
    ├── Downloads: AI model
    ├── Manages: WebGPU acceleration
    └── Returns: Response text
```

---

## 📦 Dependencies Added

### New in `package.json`:

```json
{
  "dependencies": {
    "@mlc-ai/web-llm": "^0.2.0"
  }
}
```

**What it is:**
- Official WebLLM library by Machine Learning Compilation
- Enables local AI inference via WebGPU
- Handles model downloading and caching
- Pure JavaScript (no binary compilation needed)

**Install:**
```bash
npm install
```

---

## 🔄 Data Types

### `ExcelSheet` (from `lib/excelParser.ts`)

```typescript
interface ExcelSheet {
  columnNames: string[];           // ["Date", "Product", "Revenue"]
  rows: Array<Record<string, any>>; // [{Date: "2024-01-01", ...}, ...]
}
```

### `DataChunk` (from `lib/semanticChunking.ts`)

```typescript
interface DataChunk {
  id: string;
  sheetName: string;
  columnNames: string[];
  rows: Record<string, any>[];
  rowIndices: [number, number];
  summary: string;
}
```

### `ChatMessage` (from `frontend/components/AIChatPanel.tsx`)

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "ai" | "error" | "system";
  content: string;
  timestamp: Date;
}
```

---

## 🚀 Quick Modifications

### Want to add a "Clear Chat" button?

**In `AIChatPanel.tsx`:**

```typescript
<button
  onClick={() => setMessages([])}
  className="bg-red-500 text-white px-3 py-1 rounded"
>
  Clear
</button>
```

### Want to change max chunks analyzed?

**In `useLocalAI.ts`, in `askQuestion()` function:**

```typescript
// Change this line:
const relevantChunks = findRelevantChunks(chunks, query);
// To limit to top 5:
const relevantChunks = findRelevantChunks(chunks, query).slice(0, 5);
```

### Want to disable a model?

**In `AIChatPanel.tsx`, hide the button:**

```typescript
{/* {currentModel !== "gemma" && (
  <button onClick={() => handleModelSwitch("gemma")}>
    🧠 Smart
  </button>
)} */}
```

---

## 📚 Next Steps

1. **Test Phase 3**: Follow PHASE3_QUICKSTART.md
2. **Understand AI Flow**: Read PHASE3.md architecture section
3. **Modify Components**: Use examples above as templates
4. **Debug Issues**: Check browser console (F12) for errors
5. **Performance**: Monitor GPU usage and model caching

---

**Ready to build on Phase 3? Happy coding! 🚀**
