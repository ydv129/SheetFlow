# Phase 3 Quick Start - Local AI Excel Analysis

Get SheetFlow's local AI engine running in 10 minutes. Ask questions about your Excel data using offline AI running in your browser.

## 📋 What You Need

- SheetFlow running with Phase 3 files installed (`npm install`)
- A modern web browser with **WebGPU support**:
  - ✅ Chrome/Edge 113+
  - ✅ Firefox 121+ (experimental, enable in about:config)
  - ✅ Safari 17.4+ (on macOS)
- An Excel file (.xlsx or .xls) with data
- **2GB free disk space** (for AI model download, one-time only)
- Fast internet connection (first model download ~5-10 minutes)

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This downloads the latest version including `@mlc-ai/web-llm` package.

### Step 2: Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Step 3: Upload an Excel File

1. Click the blue **"📁 Select Excel File"** button
2. Choose any .xlsx file from your computer
3. Wait for data to load (should show a table on the right)

### Step 4: Open AI Chat

1. Look for the blue **"🤖 Ask AI Analyst"** button on the left sidebar
2. Click it to toggle the AI panel
3. The chat panel appears on the right side
4. You see "Initializing AI Engine..." (takes 5-10 seconds first time)

### Step 5: Download AI Model (First Time Only)

1. Choose a model:
   - **"⚡ Fast"** (360M) - Small, quick, uses ~2GB storage - **Start here!**
   - **"🧠 Smart"** (4B) - Larger, smarter, uses ~9GB storage

2. Click the model button to download
3. You'll see a progress bar: `Downloading: 45%`
4. Wait for it to finish (takes 2-10 minutes depending on internet)
5. Once ready, the input box becomes active

### Step 6: Ask a Question

1. Type a question about your data:
   - "What are the top 5 highest values?"
   - "Show me the average for each category"
   - "Which row has the most sales?"
   - "What's the geographic distribution?"

2. Press **Send** button or hit Enter
3. AI thinks for a moment (you see "🤖 Analyzing...")
4. Response appears in chat - **all processing happens locally!**

## 🎵 Understanding the AI Panel

### Model Selector Buttons (Top)

```
⚡ Fast (360M)  |  🧠 Smart (4B)
```

- **⚡ Fast**: Smaller model (360 million parameters), faster responses, lower accuracy
- **🧠 Smart**: Larger model (4 billion parameters), slower responses, better accuracy
- **First time**: Download takes 5-10 minutes
- **Later**: Model loads instantly from browser cache

### Chat Messages

| Type | Color | Example |
|------|-------|---------|
| Your Question | Blue | "What's the total of sales column?" |
| AI Response | Gray | "The total of sales column is $145,320..." |
| System Message | Gray | "⚙️ Initializing AI engine..." |
| Error | Red | "❌ Error: Model download failed" |

### Status Bar (Under Model Buttons)

| Status | Meaning |
|--------|---------|
| 🟢 Ready | AI model is loaded and ready for questions |
| 🟡 Initializing | Setting up AI engine (5-10 sec) |
| 🟡 Downloading: 45% | Model is downloading, be patient |
| 🔴 Error | Something went wrong, see help section |

### Input & Buttons

- **Input box**: Type your question here (only active when status is 🟢 Ready)
- **Send button**: Submit your question (appears when status is 🟢 Ready)
- **Stop button**: Stop AI generation if it's taking too long

## 🧪 Test Scenarios

### Scenario 1: Basic Analysis (5 minutes)

**Goal:** Get AI to summarize your data

1. Upload a simple CSV or Excel file (100-1000 rows)
2. Download "Fast" (360M) model
3. Ask: "Summarize this data for me"
4. AI provides 3-5 sentence summary ✓

### Scenario 2: Specific Question (10 minutes)

**Goal:** Get specific insight from data

1. Upload sales data with columns: Date, Product, Amount
2. Ask: "What was my highest sale?"
3. AI analyzes and responds: "Your highest sale was $5,500 for Product X on June 15"
4. Verify the answer is correct ✓

### Scenario 3: Speed Comparison (15 minutes)

**Goal:** Compare Fast vs Smart models

1. Keep same Excel file loaded
2. Ask a complex question with "Fast" model - note response time
3. Switch to "Smart" model - wait for download
4. Ask same question - note response time and accuracy
5. Make note of tradeoffs ✓

### Scenario 4: Large File Analysis (20 minutes)

**Goal:** Test with bigger data

1. Upload Excel file with 5,000+ rows
2. Use "Smart" model (better for complex analysis)
3. Ask: "What are the trends in this data?"
4. AI analyzes relevant chunks and responds ✓

### Scenario 5: Persistence & Reload (10 minutes)

**Goal:** Verify model is cached

1. Download "Fast" model (took X minutes)
2. Refresh the page (Ctrl+R or F5)
3. AI comes back immediately (model is cached)
4. Ask a question - instant analysis ✓

## 🐛 Troubleshooting

### "AI Button Doesn't Appear"

**Problem:** "🤖 Ask AI Analyst" button missing

```
Solutions:
1. Make sure Excel file is loaded first (data visible on right)
2. Check you're on home page (http://localhost:3000)
3. Hard refresh browser (Ctrl+Shift+R)
4. Check console (F12) for JavaScript errors
```

### "WebGPU Not Supported"

**Problem:** See error "WebGPU is not supported in this browser"

```
Solutions:
1. Use Chrome 113+, Edge 113+, Opera, or Safari 17.4+
2. Enable experimental features:
   - Chrome: chrome://flags and search "WebGPU"
   - Firefox: about:config and set "dom.webgpu.enabled" to true

If browser doesn't support WebGPU:
- SheetFlow detection will show: "Your browser doesn't support WebGPU"
- This is a browser limitation, not SheetFlow issue
```

### "Model Download Fails"

**Problem:** Download starts but stops with error

```
Solutions:
1. Check internet connection (try visiting google.com)
2. Try smaller model first (⚡ Fast, 360M before 🧠 Smart)
3. Check you have 2GB+ free disk space
4. Clear browser cache: Settings → Privacy → Clear browsing data
5. Try in Incognito mode to rule out extensions
6. Wait a few minutes and retry (temporary server issue)
```

### "AI Doesn't Respond"

**Problem:** Type question, click Send, nothing happens

```
Solutions:
1. Check status bar shows 🟢 Ready (green)
2. Check console (F12) for error messages
3. Try a simpler question first: "Hello"
4. Try clicking ⚡ Fast button to switch models
5. Refresh page and retry: Ctrl+R
6. Check your browser hasn't run out of memory (F12 → Memory tab)
```

### "Response Seems Wrong"

**Problem:** AI gives inaccurate or hallucinated answer

```
Why this happens:
- Small models (360M) are less accurate with complex data
- AI might "guess" if data pattern isn't clear
- Very large datasets might miss details in relevant chunks

Solutions:
1. Switch to "Smart" model (4B) - more accurate
2. Ask more specific questions: "Show me highest 5 values" vs "Analyze"
3. Check AI analyzed relevant columns (AI tells you what it's looking at)
4. For very large files, ask about specific columns
```

### "Chat History Disappeared After Reload"

**Problem:** Closed browser and messages are gone

```
This is expected behavior:
- Chat history is only stored in browser memory during current session
- Reloading clears the chat history
- This is NOT a bug - it's how we designed it
- The AI engine and models are cached (for instant loading)
- Chat messages reset so each session starts fresh
```

### "Browser Says Disk Space Is Full"

**Problem:** Download fails saying "not enough space"

```
Solutions:
1. Check disk space: 
   - Mac: Apple menu → About This Mac → Storage
   - Windows: Settings → System → Storage
   - Linux: df -h
2. Clear browser cache and old model data
3. Try downloading just ⚡ Fast model first (2GB)
4. Don't download both models - use one at a time
```

## 💡 Pro Tips

### Tip 1: Start with Small Model
Save download time by using ⚡ Fast model first. Switch to 🧠 Smart only if you need better accuracy.

### Tip 2: Ask Clear Questions
Instead of: "Tell me about this"
Try: "What are the top 5 values in the sales column?"

### Tip 3: Use Local Cache
First download: 5-10 minutes. After that: instant! Models stay in your browser.

### Tip 4: No Internet After Download
Once model is fully downloaded, you can unplug the internet and AI still works!

### Tip 5: Privacy is Guaranteed
All processing stays in your browser. We never see your data or questions.

## 🔧 How It Works (For Curious Minds)

```
Your Excel File
       ↓
[Semantic Chunking] ← Breaks big data into small pieces
       ↓
[Find Relevant Chunks] ← AI looks for matching columns
       ↓
[Format for AI] ← Pretty-print chunks with headers
       ↓
[Local AI Model] ← Runs on your GPU (WebGPU)
       ↓
[Response] ← Answer appears in chat
```

**Key Point:** All this happens in your browser. Nothing about your data goes to our servers!

## ⏱️ Expected Performance

| Action | Time |
|--------|------|
| First app load | 2-3 sec |
| Select Excel file | 1-2 sec |
| Initialize AI engine | 5-10 sec (first time) |
| Download ⚡ Fast model | 5-10 min (first time) |
| Download 🧠 Smart model | 15-20 min (first time) |
| Ask a question (small file) | 2-5 sec |
| Ask a question (large file) | 5-15 sec |
| Switch models | 1-2 sec |
| Reload page (model already cached) | 2-3 sec |

## 🎯 Common Questions

**Q: Is my data safe?**
A: 100% safe. All processing happens locally in your browser. We never see your Excel files, questions, or analysis.

**Q: Can AI see all my data?**
A: No. We use "semantic chunking" to send only relevant data chunks to the AI, not your entire file.

**Q: Do I need internet after downloading the model?**
A: No! Once downloaded, you can work offline. Just need internet for first model download.

**Q: How big can my Excel file be?**
A: Works best with 1,000-100,000 rows. Extremely large files (million+ rows) might be slower.

**Q: Can I use this on my phone?**
A: Most phones don't support WebGPU yet. Desktop browsers recommended.

**Q: Will this work on older computers?**
A: Depends on your GPU. Newer GPUs are much faster. Very old laptops might be very slow.

## 📚 Next Steps

1. **First Time?**: Follow "Quick Start" section above
2. **Want Details?**: Read [PHASE3.md](./PHASE3.md) for full architecture
3. **File Guide?**: Check [PHASE3_FILES.md](./PHASE3_FILES.md) for code structure
4. **Seeing Issues?**: Check "Troubleshooting" section above
5. **Questions?**: Open an issue on GitHub

---

**Happy analyzing! Your data, your AI, your computer. 🚀**
