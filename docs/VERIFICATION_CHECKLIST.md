# 🎯 Phase 1 & 2 Verification Checklist

Use this checklist to verify that SheetFlow Phase 1 & 2 are working correctly.

---

## 📋 Pre-Flight Checks

Before starting, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB Atlas account created
- [ ] Google OAuth credentials ready
- [ ] `.env.local` file created with all values filled in

---

## ✅ Phase 1: Backend & Authentication

### Setup

```bash
npm install
npm run dev
```

- [ ] npm install completes without errors
- [ ] npm run dev shows "ready - started server on 0.0.0.0:3000"
- [ ] No error messages in terminal

### Health Check

Open terminal and run:

```bash
curl http://localhost:3000/api/backend/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "App is running and database connection is working",
  "timestamp": "2024-..."
}
```

- [ ] Returns 200 status
- [ ] Shows "healthy" status
- [ ] Database connection confirms working

### Google Sign-In

1. Open `http://localhost:3000` in browser
2. Click "Sign In" button
3. Go through Google OAuth flow
4. Should redirect back to site

- [ ] Sign in button appears
- [ ] Google login works
- [ ] Redirected back after login
- [ ] No errors in console (F12)

### User Profile API

After signing in, run:

```bash
curl http://localhost:3000/api/backend/me
```

Expected response:
```json
{
  "success": true,
  "data": {
    "email": "your-email@gmail.com",
    "name": "Your Name",
    "subscriptionTier": "free",
    "isOnboarded": false,
    "preferences": {
      "theme": "light",
      "language": "en"
    }
  }
}
```

- [ ] Returns 200 status
- [ ] Returns your email
- [ ] Returns your name from Google
- [ ] Has correct subscription tier

### Project Management APIs

#### List Projects

```bash
curl http://localhost:3000/api/backend/projects
```

Should return empty array initially:
```json
{
  "success": true,
  "data": []
}
```

- [ ] Returns 200 status
- [ ] Returns empty array

#### Create Project

```bash
curl -X POST http://localhost:3000/api/backend/projects \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Test Project"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "projectName": "Test Project",
    "aiModel": "SmolLM2-360M",
    ...
  }
}
```

- [ ] Returns 201 status (Created)
- [ ] Returns project data with `_id`
- [ ] Project name matches what you sent

#### Save the Project ID

Copy the `_id` value - you'll need it for the next tests.

#### Get Specific Project

Replace `{PROJECT_ID}` with the ID you saved:

```bash
curl http://localhost:3000/api/backend/projects/{PROJECT_ID}
```

- [ ] Returns 200 status
- [ ] Returns the project you created

#### Update Project

```bash
curl -X PATCH http://localhost:3000/api/backend/projects/{PROJECT_ID} \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Updated Name", "aiModel": "Gemma-4-E2B"}'
```

- [ ] Returns 200 status
- [ ] Project name is updated
- [ ] AI model changed to Gemma-4-E2B

#### Delete Project

```bash
curl -X DELETE http://localhost:3000/api/backend/projects/{PROJECT_ID}
```

- [ ] Returns 200 status
- [ ] Returns success message

#### Verify Delete

```bash
curl http://localhost:3000/api/backend/projects
```

Should show empty array again:
- [ ] Project list is empty

### Authentication Security

Sign out and try to access API:

1. Sign out (button in app)
2. Open new incognito window
3. Try: `curl http://localhost:3000/api/backend/projects`

Should return 401 Unauthorized:
```json
{
  "success": false,
  "error": "Unauthorized - please sign in first"
}
```

- [ ] Returns 401 status
- [ ] Error message shown
- [ ] Cannot access API without sign in

---

## ✅ Phase 2: Excel Live-Link

### Prepare Test File

Create a simple Excel file with test data:

**Sheet 1: "Data"**
```
Name    | Age | City
--------|-----|----------
Alice   | 28  | New York
Bob     | 35  | London
Carol   | 42  | Tokyo
```

Save as `test-data.xlsx`

### Load Excel File

1. Go to `http://localhost:3000`
2. Sign in if needed
3. Click **"📁 Select Excel File"** button

- [ ] File picker opens
- [ ] Can select your test-data.xlsx file
- [ ] File loads after selection
- [ ] Green box shows "✓ File loaded"
- [ ] File name displayed correctly

### View Data

After file loads, check the data table:

- [ ] Table shows all your column headers (Name, Age, City)
- [ ] All rows are visible
- [ ] Data matches your Excel file
- [ ] Row count shows correct number

### Test Sheet Tabs

If your Excel has multiple sheets:

1. Click different sheet tabs at the top
2. Data should change for each sheet

- [ ] Can switch between sheets
- [ ] Data updates when switching
- [ ] Each sheet shows correct data

### Test Live Updates

This is the "live-link" feature:

1. Keep SheetFlow open in browser
2. Open your Excel file in Excel/Google Sheets/LibreOffice
3. Edit a value (e.g., change Alice's age from 28 to 29)
4. Save the file
5. Wait 5-10 seconds
6. Look at SheetFlow

- [ ] SheetFlow automatically updates
- [ ] Shows changed value (29 instead of 28)
- [ ] No manual refresh needed
- [ ] Green text shows "🔄 Watching for changes"

### Test Manual Refresh

1. Change another value in Excel (but don't save)
2. Click **"🔄 Refresh"** button in SheetFlow
3. Change should NOT appear yet

- [ ] Unsaved changes don't appear

Then:

1. Save the file in Excel
2. Click **"🔄 Refresh"** again

- [ ] Now the change appears

### Test Pause/Resume Watching

1. Click **"⏸️ Pause Watching"** button
2. Edit Excel and save
3. Wait 10 seconds
4. SheetFlow should NOT update

- [ ] Changes NOT detected while paused

Then:

1. Click **"▶️ Resume Watching"**
2. Edit Excel file again
3. Save it
4. Wait 5 seconds

- [ ] Changes ARE detected again
- [ ] Updates resume working

### Test File Persistence

1. Note your file name
2. Reload the browser (Ctrl+R or F5)
3. Wait for page to load
4. File should automatically restore

- [ ] File restored without file picker
- [ ] No need to select it again
- [ ] File name is correct
- [ ] Data is intact
- [ ] Watching automatic resumes

### Test Recently Used Files

If you used the same file before:

1. Click **"📁 Choose Different"**
2. Look for "Recently used files" section
3. Your previous file should appear as a button

- [ ] Recently used files listed
- [ ] Can click to reload previous file
- [ ] File loads when clicked

### Test Multiple Files

1. Clear the current file (click **"🗑️ Clear"**)
2. Select a different Excel file
3. Load it successfully

- [ ] Can switch to different files
- [ ] Old file cleared
- [ ] New file loads
- [ ] Data updates correctly

### Test with Large File

Try with a bigger Excel (1000+ rows):

1. Select a large Excel file
2. Wait for it to load
3. Click "Load more rows" to see more data
4. Scroll through the data table

- [ ] Loads without freezing
- [ ] Pagination works
- [ ] Scrolling is smooth
- [ ] UI remains responsive

---

## 🔐 Security Verification

### Data Privacy

1. Open DevTools (F12)
2. Go to Network tab
3. Load an Excel file in SheetFlow
4. Look at all network requests

- [ ] No request sends the Excel data to the server
- [ ] Only file selection request to browser API
- [ ] No personal data in network traffic

### Session Security

1. Sign in
2. Open DevTools → Application → Cookies
3. Look for authentication cookies

- [ ] Cookie named `next-auth.session-token` exists
- [ ] Cookie is HttpOnly (can't access from JS)
- [ ] Cookie is Secure (HTTPS only in production)

---

## 🐛 Common Issues & Fixes

### "File picker doesn't open"

**Check:**
- [ ] Using Chrome, Edge, or Opera (not Firefox)
- [ ] Not in private/incognito mode
- [ ] JavaScript enabled
- [ ] Check console for errors (F12)

### "File won't load after selection"

**Check:**
- [ ] File is real Excel (.xlsx, .xls, .xlsm)
- [ ] File isn't corrupt (open in Excel first)
- [ ] File size under 50MB
- [ ] Browser allows file system access

### "Live updates not working"

**Check:**
- [ ] Green text shows "🔄 Watching for changes"
- [ ] You saved the Excel file (not just edited)
- [ ] Waited full 5 seconds after saving
- [ ] File not locked by another program
- [ ] Worker loaded (check DevTools Sources tab)

### "File not remembered after reload"

**Check:**
- [ ] Not in private/incognito mode
- [ ] IndexedDB allowed in browser settings
- [ ] Clear site data and try again
- [ ] Try a simple small file first

### "API calls return 401 Unauthorized"

**Check:**
- [ ] Signed in with Google
- [ ] No errors during sign-in
- [ ] Cookie appears in DevTools
- [ ] Try signing out and back in

---

## 📊 Performance Baseline

These numbers help identify problems:

### Excel File Loading
- Small file (< 100 rows): Should load in < 1 second
- Medium file (1,000 rows): Should load in 1-3 seconds
- Large file (10,000+ rows): Should load in 5-10 seconds

### Live Updates
- File change detection: Within 5-10 seconds
- File re-parsing: 1-5 seconds depending on size
- UI update: Immediate after parsing

### Memory Usage
- SheetFlow alone: 30-50 MB
- With small Excel file: 50-80 MB
- With large Excel file: 100-200 MB

If slower than these, check:
- Computer RAM available
- Other browser tabs open
- File corruption
- Browser cache size

---

## ✨ Success Indicators

If all these are true, you're good to go:

✓ Phase 1: Authentication working, APIs responding  
✓ Phase 2: Files load, display data, update automatically  
✓ Security: No data leaks to server  
✓ Performance: No freezing or lag  
✓ Persistence: Files remembered between sessions  

---

## 🚀 Next Steps After Verification

Once everything passes:

1. Read [docs/ARCHITECTURE.md](ARCHITECTURE.md) to understand design
2. Try modifying components
3. Experiment with different Excel files
4. Plan Phase 3 integration

---

## 📝 Test Results

Copy this section and fill in:

```
Test Date: __________
Tester: ________
Browser: ________
OS: ________

Phase 1: [ ] PASS [ ] FAIL
Phase 2: [ ] PASS [ ] FAIL
Security: [ ] PASS [ ] FAIL

Issues Found:
- 
- 
- 

Notes:
```

---

**All checks passing? Congratulations! 🎉**

SheetFlow Phase 1 & 2 are fully operational and ready for production use!

