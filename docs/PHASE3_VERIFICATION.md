# Phase 3 Verification Checklist

Complete checklist to verify all Phase 3 features are working correctly.

## ✅ Pre-Flight Checks

Before testing Phase 3, verify these basics:

- [ ] Node.js 18+ installed: `node --version`
- [ ] npm installed: `npm --version`  
- [ ] Dependencies installed: `npm install` (completed without errors)
- [ ] `.env.local` file exists with MongoDB URI and Google OAuth credentials
- [ ] Development server runs: `npm run dev` (no build errors)
- [ ] Browser supports WebGPU (Chrome 113+, Edge, Firefox 121+, Safari 17.4+)
- [ ] At least 8GB free disk space
- [ ] Fast internet connection (for model downloads)

---

## 🔧 Installation Verification

### Check 1: WebLLM Dependency

**What to verify:** @mlc-ai/web-llm is installed

```bash
# In terminal:
npm list @mlc-ai/web-llm
# Should show: @mlc-ai/web-llm@0.2.0 or similar
```

**Expected output:**
```
sheetflow@0.1.0 /workspaces/SheetFlow
└── @mlc-ai/web-llm@0.2.0
```

- [ ] WebLLM appears in package.json dependencies
- [ ] npm list shows the package installed
- [ ] No version conflicts or warnings

### Check 2: Phase 3 Files Exist

**What to verify:** All new Phase 3 files are in place

```bash
# Check these files exist:
ls -la lib/semanticChunking.ts              # Should exist
ls -la frontend/hooks/useLocalAI.ts         # Should exist
ls -la frontend/components/AIChatPanel.tsx  # Should exist
ls -la docs/PHASE3.md                       # Should exist
ls -la docs/PHASE3_QUICKSTART.md            # Should exist
ls -la docs/PHASE3_FILES.md                 # Should exist
```

- [ ] `lib/semanticChunking.ts` exists (300+ lines)
- [ ] `frontend/hooks/useLocalAI.ts` exists (400+ lines)
- [ ] `frontend/components/AIChatPanel.tsx` exists (300+ lines)
- [ ] Documentation files exist (3 markdown files)
- [ ] Files are not empty (not 0 bytes)

### Check 3: Exports Are Updated

**What to verify:** Component and hook exports are included

```bash
# Check hooks export
grep -n "useLocalAI" frontend/hooks/index.ts
# Should show: export { useLocalAI }...

# Check component export  
grep -n "AIChatPanel" frontend/components/index.ts
# Should show: export { AIChatPanel }...
```

- [ ] `frontend/hooks/index.ts` exports `useLocalAI`
- [ ] `frontend/components/index.ts` exports `AIChatPanel`
- [ ] No syntax errors in export files

---

## 🏠 Home Page Verification

### Check 4: AI Button Appears

**What to verify:** "🤖 Ask AI Analyst" button visible on home page

**Steps:**
1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. On the left sidebar, look for the button
4. Check the home page displays without errors

- [ ] Page loads (no JavaScript errors in console)
- [ ] "🤖 Ask AI Analyst" button visible
- [ ] Button text is correct (has AI emoji)
- [ ] Button styling looks good (matches Tailwind theme)

### Check 5: UI Elements Display

**What to verify:** Page layout hasn't broken

1. Open browser DevTools (F12)
2. Check Console tab (shouldn't have red errors)
3. Visually inspect page layout

- [ ] No JavaScript errors in console
- [ ] Excel file upload section visible  
- [ ] Feature grid displays (Phase 1, Phase 2, Phase 3 sections)
- [ ] Footer shows Phase 3 mention
- [ ] AI button toggles (doesn't cause crashes)

### Check 6: AI Panel Shows

**What to verify:** Chat panel opens when button clicked

**Steps:**
1. Click the "🤖 Ask AI Analyst" button
2. Right panel should show chat interface
3. Click button again to hide panel

- [ ] Chat panel appears on the right
- [ ] Button click toggles panel open/closed
- [ ] No JavaScript errors when toggling
- [ ] Chat panel positioning looks correct
- [ ] Data viewer still shows on left when panel hidden

---

## 🧠 AI Engine Verification

### Check 7: Model Buttons Display

**What to verify:** Model selector buttons visible in chat panel

1. Click "🤖 Ask AI Analyst" to open chat
2. Look for model buttons at top of panel

- [ ] "⚡ Fast" button visible
- [ ] "🧠 Smart" button visible  
- [ ] Buttons have clear labels and emojis
- [ ] Button styling looks good

### Check 8: Status Display Works

**What to verify:** Status message shows correctly

1. Chat panel should show status line
2. Initial status should be visible

- [ ] Status line appears (e.g., "Ready" or "Initializing")
- [ ] Status text is readable
- [ ] Status indicator (🟢 🟡 🔴) appears

### Check 9: AI Engine Initializes

**What to verify:** WebLLM initializes on first visit

**Steps:**
1. Open DevTools (F12), go to Console tab
2. Open chat panel (click "🤖 Ask AI Analyst")
3. Watch status messages
4. Wait 5-10 seconds

- [ ] No critical errors in console
- [ ] Status shows "Initializing" briefly
- [ ] Status changes to "Ready" (or "downloading-model")
- [ ] Can interact with model buttons

### Check 10: Model Download Starts

**What to verify:** Clicking model button triggers download

**Steps:**
1. Ensure Excel file is loaded first
2. Open AI chat panel
3. Click "⚡ Fast" button (360M model)
4. Watch the status

**Expected sequence:**
- Status: "downloading-model"
- Progress bar appears: "Downloading: 0%" → "100%"
- Takes 5-10 minutes for 360M model
- Takes 15-20 minutes for 4B model

- [ ] Download starts after clicking model button
- [ ] Progress bar appears
- [ ] Progress updates (you see percentages changing)
- [ ] No errors in console during download
- [ ] Can still interact with UI during download (it's non-blocking)

---

## 💬 Chat Functionality Verification

### Check 11: Input Box Appears

**What to verify:** Chat input field is available

1. Load Excel file (required)
2. Open chat panel
3. Wait for model to finish loading
4. Look for input box at bottom

- [ ] Input box visible and enabled
- [ ] Placeholder text says "Ask a question..."
- [ ] Input box is focused (can type)
- [ ] Send button next to input box

### Check 12: Can Type Questions

**What to verify:** Text input works

1. Click in the input box
2. Type: "Hello test"
3. Text appears in input

- [ ] Text appears as you type
- [ ] Can delete text with backspace
- [ ] Can select and copy text
- [ ] Send button is clickable

### Check 13: Basic Question Test

**What to verify:** AI can answer a simple question

**Prerequisites:**
- Excel file loaded with data
- Model fully downloaded (status = Ready)

**Test steps:**
1. Type simple question: "Hello"
2. Click Send button (or press Enter)
3. Watch for response

**Expected with SmolLM-360M:**
- Status: "🤖 Thinking..."
- Response starts appearing in chat
- Takes 3-5 seconds
- Response visible in gray message bubble

- [ ] Status changes to "Thinking"
- [ ] User message appears in blue
- [ ] AI response appears in gray
- [ ] Response is not empty (has content)
- [ ] No errors in console

### Check 14: Real Data Analysis

**What to verify:** AI analyzes actual Excel data

**Test steps:**
1. Load Excel file with at least 100 rows
2. Ask specific question like:
   - "What columns are in this data?"
   - "How many rows are there?"
   - "What's the highest value?"
3. Check if answer references actual data

**Expected:**
- AI mentions column names from your file
- AI references actual numbers from data
- Response is relevant to question

- [ ] AI response mentions real columns
- [ ] AI response references actual data values
- [ ] Analysis seems to match your data
- [ ] No "hallucinated" completely random answers

### Check 15: Chat History

**What to verify:** Messages accumulate in chat

1. Ask 2-3 different questions
2. Scroll up in chat panel
3. All previous messages should be visible

- [ ] First question/answer still visible
- [ ] Second question/answer visible
- [ ] Chat history keeps accumulating
- [ ] Auto-scrolls to newest message

---

## 🚀 Advanced Features Verification

### Check 16: Model Switching

**What to verify:** Can switch between models

**Steps:**
1. Have SmolLM-360M (Fast) already downloaded
2. Ask a question with Fast model (works, quick)
3. Click "🧠 Smart" button
4. Wait for download
5. Ask same question with Smart model

**Expected:**
- Status shows "Downloading: 0%..." for Gemma-4B
- Download takes 15-20 minutes first time
- Can use Smart model after download
- Quality of responses improves (potentially)

- [ ] Smart model download starts
- [ ] Progress bar shows percentage
- [ ] Download completes without errors
- [ ] Can use Smart model after download
- [ ] Switching back to Fast is instant

### Check 17: Error Handling

**What to verify:** Errors display correctly

**Test edge cases:**
1. Send empty question (just spaces) - should not send
2. Try to ask without loading Excel - should show error
3. Unplug internet during download (if available)
4. Type very large question (1000+ characters)

**Expected:**
- Empty questions ignored (Send button disabled)
- No data error shows helpfully
- Network errors display in chat
- Large questions handled gracefully

- [ ] Empty questions don't send
- [ ] Error messages appear in red or special format
- [ ] Can recover from errors
- [ ] Errors are readable (not technical jargon)

### Check 18: Large File Handling

**What to verify:** AI can analyze large files

**Steps:**
1. Load Excel with 5000+ rows
2. Ask a question about the data
3. Check how long it takes
4. Verify accuracy

**Expected:**
- Response time: 5-15 seconds (depends on model)
- Semantic chunking selects relevant chunks
- Still provides relevant answers
- No crashes or memory errors

- [ ] App doesn't crash with large file
- [ ] Response time is reasonable
- [ ] Answers are still relevant
- [ ] No "out of memory" errors

---

## 🔐 Privacy & Architecture Verification

### Check 19: Network Monitor

**What to verify:** Excel data isn't sent to servers

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Ask AI a question about Excel data
4. Check network requests

**Expected:**
- No uploads of Excel data
- Only requests: to HuggingFace (model download) or localhost
- No requests to external AI APIs (OpenAI, etc.)
- No requests to analytics servers

- [ ] No data uploads to external servers
- [ ] Only model downloads from HuggingFace (first time)
- [ ] Subsequent queries don't upload anything
- [ ] All processing local to your browser

### Check 20: GPU Usage

**What to verify:** GPU is being used for AI

**Steps:**
1. Open system monitor (Task Manager on Windows, Activity Monitor on Mac)
2. Ask a question
3. Watch GPU/Memory usage spike during response
4. On Windows, might see "GPU 0" usage increase

**Expected:**
- GPU usage increases during "Thinking"
- Memory increases (model loaded in RAM)
- CPU usage NOT at 100% (GPU doing the work)

- [ ] GPU activity observed during inference
- [ ] Not just CPU usage (should involve GPU)
- [ ] Memory usage is reasonable (under system limit)

---

## 📊 Performance Verification

### Check 21: First Load Performance

**What to verify:** Initialization doesn't take too long

**Steps:**
1. Fresh browser, clear cache
2. Open http://localhost:3000
3. Time from page load to ready: should be ~5-10 seconds
4. Load Excel file: should be < 2 seconds
5. Open chat: should show immediately

- [ ] Page loads in < 10 seconds
- [ ] Excel loads in < 2 seconds  
- [ ] Chat panel opens instantly
- [ ] No long hangs or freezes

### Check 22: Model Download Time

**What to verify:** Downloads are reasonable

**Test with different models:**

SmolLM2-360M (⚡ Fast):
- Expected time: 5-10 minutes (on fast internet)
- Size: ~720MB compressed, ~2GB extracted

Gemma-4-E2B (🧠 Smart):
- Expected time: 15-20 minutes (on fast internet)
- Size: ~2GB compressed, ~9GB extracted

- [ ] 360M downloads in < 15 minutes
- [ ] 4B downloads in < 30 minutes
- [ ] Download doesn't stall or fail mid-way
- [ ] Can use app while downloading (non-blocking)

### Check 23: Query Response Time

**What to verify:** AI responses are fast enough

**Test scenarios:**

Small file (100 rows):
- SmolLM2-360M: 2-4 seconds ✓
- Gemma-4-E2B: 4-8 seconds ✓

Large file (10,000 rows):
- SmolLM2-360M: 5-10 seconds ✓
- Gemma-4-E2B: 8-20 seconds ✓

- [ ] Small file = quick response (< 5 sec)
- [ ] Large file = reasonable wait (< 20 sec)
- [ ] Response time is acceptable for user
- [ ] Doesn't feel "stuck" during thinking

### Check 24: Memory Stability

**What to verify:** App doesn't leak memory

**Steps:**
1. Ask 10+ consecutive questions
2. Watch browser memory in DevTools (F12 → Memory)
3. Memory shouldn't grow unbounded

**Expected:**
- Memory after 10 questions: maybe 1-2GB (for model + data)
- Memory doesn't grow by 500MB per question
- Chat history doesn't cause memory leaks

- [ ] Memory stable after multiple questions
- [ ] Can ask 20+ questions without crashing
- [ ] Page reload clears memory as expected
- [ ] No noticeable slowdown after many questions

---

## 🐛 Debugging Checks

### Check 25: Console Errors

**What to verify:** No critical errors in console

**Steps:**
1. Open DevTools (F12), Console tab
2. Reload page
3. Use the application normally
4. Check for red error messages

**Expected:**
- No red "Uncaught Error" messages
- Warnings (yellow) are OK
- Info/log messages (gray) are normal

- [ ] No red errors in console
- [ ] Warnings are acceptable (no actual problems)
- [ ] Can identify any errors clearly

### Check 26: Component Rendering

**What to verify:** React components render without errors

**Steps:**
1. DevTools → React Developer Tools (if installed)
2. Check Components tree
3. Verify AIChatPanel is in the tree
4. Verify useLocalAI hook exists

- [ ] AIChatPanel component renders
- [ ] No React errors about hooks
- [ ] Component tree looks reasonable
- [ ] All props passing correctly

### Check 27: TypeScript Compilation

**What to verify:** No type errors

**Steps:**
```bash
npm run type-check
# Should complete with no errors
```

**Expected output:**
```
✓ Type checking successful
```

- [ ] `npm run type-check` passes
- [ ] No TypeScript errors about Phase 3 files
- [ ] All types are properly defined

---

## ✨ Edge Cases & Robustness

### Check 28: No Excel File Loaded

**What to verify:** App handles missing data gracefully

**Steps:**
1. Open chat panel WITHOUT loading Excel first
2. Try to ask a question
3. Should show helpful error message

**Expected:**
- Error message like "Please load Excel file first"
- No app crash
- Can recover (load file, then ask again)

- [ ] Graceful error if no data loaded
- [ ] Error message is clear
- [ ] App recovers properly

### Check 29: Very Simple Data

**What to verify:** Works with minimal Excel

1. Create Excel with 10 rows, 2 columns
2. Load it and ask question
3. Should still work

- [ ] Works with tiny files
- [ ] Doesn't require minimum rows
- [ ] Provides meaningful response

### Check 30: Mixed Data Types

**What to verify:** Handles text + numbers + dates

1. Load Excel with different column types
2. Ask about the data
3. AI should understand different types

- [ ] Can analyze text columns
- [ ] Can analyze numeric columns
- [ ] Can understand date columns
- [ ] Combines all types in analysis

---

## 📋 Final Checklist

### Phase 3 Ready for Production?

Answer ALL of these:

- [ ] All 30 checks above PASSED ✓
- [ ] No critical errors in console
- [ ] Performance is acceptable (< 20 sec for responses)
- [ ] Privacy: No data leaves browser (verified with Network tab)
- [ ] All documentation reads correctly
- [ ] Code has no TypeScript errors
- [ ] App works on intended browsers
- [ ] Graceful error handling works
- [ ] Can handle multiple user sessions
- [ ] Large files don't crash app

### User Readiness

- [ ] User can follow PHASE3_QUICKSTART.md without issues
- [ ] User understands GPU requirements
- [ ] User knows why data stays local
- [ ] User can switch between models
- [ ] User knows expected performance
- [ ] User can troubleshoot common issues

---

## 🗒️ Test Log

Keep track of your test results:

```markdown
## Test Session: [Date]

### Environment
- Browser: Chrome 120.0.0
- OS: Windows 11
- GPU: NVIDIA RTX 3080
- RAM: 16GB
- Disk: 500GB free

### Results
- Pre-flight checks: ✅ PASSED
- Installation: ✅ PASSED
- UI Display: ✅ PASSED
- AI Engine: ✅ PASSED
- Chat: ✅ PASSED
- Performance: ✅ PASSED
- Privacy: ✅ PASSED

### Issues Found
- [if any] Issue 1: Description...
- [if any] Issue 2: Description...

### Conclusion
Phase 3 is READY / NOT READY for production

Tested by: [Your Name]
Date: [Date]
```

---

## 🎉 Success Criteria

**Phase 3 is considered COMPLETE when:**

✅ All 30 verification checks pass
✅ No critical errors in console
✅ User can complete PHASE3_QUICKSTART.md successfully
✅ Performance is acceptable
✅ Privacy is verified (no data leaks)  
✅ Code has 0 TypeScript errors
✅ Documentation is clear and complete
✅ Both AI models work correctly
✅ Error handling is graceful
✅ Large files don't crash the app

---

**Comprehensive Phase 3 verification complete! 🚀**

For issues or questions, see PHASE3.md troubleshooting section.
