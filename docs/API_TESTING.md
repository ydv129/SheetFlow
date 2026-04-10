# API Testing Guide

Test the SheetFlow API without a frontend UI. Perfect for verifying backend setup.

## Tools You Can Use

- **cURL** (command line, built into most systems)
- **Postman** (app, more visual)
- **Thunder Client** (VS Code extension)
- **curl from JavaScript** (in browser console)

This guide uses cURL because it's installed on all systems.

---

## Step 1: Verify the Server is Running

```bash
curl http://localhost:3000/api/backend/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "message": "App is running and database connection is working",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

If this fails, check:
- Dev server running? (`npm run dev`)
- Port 3000 open?
- MongoDB connection working?

---

## Step 2: Sign In With Google

1. Go to `http://localhost:3000` in your browser
2. Click "Sign In"
3. Complete Google login
4. You'll be redirected back

After this, your browser has an auth token. Let's use it.

---

## Step 3: Get Your Session

First, let's get the current user profile:

```bash
curl http://localhost:3000/api/backend/me
```

**Expected response:**
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

If you get `"success": false` or `401`, you're not signed in yet. Go back to Step 2.

---

## Step 4: Create a Project

```bash
curl -X POST http://localhost:3000/api/backend/projects \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "My First Project",
    "description": "Testing the API",
    "aiModel": "SmolLM2-360M",
    "watcherInterval": 5
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "projectName": "My First Project",
    "description": "Testing the API",
    "aiModel": "SmolLM2-360M",
    "watcherInterval": 5,
    "ignoredColumns": [],
    "dashboardLayout": {},
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Save the `_id` from the response!** You'll need it for the next tests.

---

## Step 5: List All Projects

```bash
curl http://localhost:3000/api/backend/projects
```

**Expected response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "projectName": "My First Project",
      "description": "Testing the API",
      ...
    }
  ]
}
```

---

## Step 6: Get a Specific Project

Replace `PROJECT_ID` with the `_id` you saved:

```bash
curl http://localhost:3000/api/backend/projects/PROJECT_ID
```

**Example:**
```bash
curl http://localhost:3000/api/backend/projects/507f1f77bcf86cd799439011
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "projectName": "My First Project",
    ...
  }
}
```

---

## Step 7: Update a Project

```bash
curl -X PATCH http://localhost:3000/api/backend/projects/PROJECT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Updated Project Name",
    "aiModel": "Gemma-4-E2B"
  }'
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/backend/projects/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "My Updated Project"
  }'
```

**Expected response:** Updated project data

---

## Step 8: Update User Preferences

```bash
curl -X PATCH http://localhost:3000/api/backend/me \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "theme": "dark"
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "email": "your-email@gmail.com",
    "name": "Your Name",
    "preferences": {
      "theme": "dark",
      "language": "en"
    }
  }
}
```

---

## Step 9: Delete a Project

```bash
curl -X DELETE http://localhost:3000/api/backend/projects/PROJECT_ID
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/backend/projects/507f1f77bcf86cd799439011
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

Now if you list projects, this one won't be there:

```bash
curl http://localhost:3000/api/backend/projects
```

---

## Testing Error Scenarios

### Test 401 Unauthorized (Not Signed In)

Open an incognito/private window and try:

```bash
curl http://localhost:3000/api/backend/projects
```

**Expected response (401):**
```json
{
  "success": false,
  "error": "Unauthorized - please sign in first"
}
```

### Test 400 Bad Request (Missing Required Field)

```bash
curl -X POST http://localhost:3000/api/backend/projects \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Project without name"
  }'
```

**Expected response (400):**
```json
{
  "success": false,
  "error": "projectName is required and must be a string"
}
```

### Test 404 Not Found (Project Doesn't Exist)

```bash
curl http://localhost:3000/api/backend/projects/000000000000000000000000
```

**Expected response (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

## Using Postman (GUI Alternative)

If you prefer a graphical interface:

1. Download [Postman](https://www.postman.com/downloads/)
2. Create a new request
3. Set method to GET/POST/PATCH/DELETE
4. Set URL to `http://localhost:3000/api/backend/projects`
5. For POST/PATCH:
   - Go to "Body" tab
   - Select "raw" and "JSON"
   - Paste your JSON data

Postman saves your requests, making it great for developing APIs.

---

## JavaScript Fetch Examples

Test from the browser console (F12 → Console):

### Get current user

```javascript
const response = await fetch('/api/backend/me');
const data = await response.json();
console.log(data);
```

### Create a project

```javascript
const response = await fetch('/api/backend/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectName: 'From Browser Console'
  })
});
const data = await response.json();
console.log(data);
```

### List projects

```javascript
const response = await fetch('/api/backend/projects');
const data = await response.json();
console.log(data.data);  // data.data is the array of projects
```

---

## Debugging API Problems

### Response is 500 Internal Error

1. Check your terminal running `npm run dev`
2. Look for error message in the logs
3. Common issues:
   - MongoDB connection problem
   - Invalid JSON in request
   - Missing environment variable

### You get 401 even after signing in

1. Close all browser windows
2. Stop dev server (`Ctrl+C`)
3. Run `npm run dev` again
4. Sign in again at `http://localhost:3000`
5. Try the API call

### "Unexpected token < in JSON at position 0"

The API returned HTML instead of JSON (usually an error page). Check:
- URL is exactly correct
- Server is running
- You're using the right HTTP method (GET vs POST)

---

## Full Test Workflow

Run this sequence to thoroughly test everything:

```bash
# 1. Check health
curl http://localhost:3000/api/backend/health

# 2. Get current user (requires sign-in first!)
curl http://localhost:3000/api/backend/me

# 3. Create project
curl -X POST http://localhost:3000/api/backend/projects \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Test Project"}'

# 4. List projects
curl http://localhost:3000/api/backend/projects

# 5. Save PROJECT_ID from step 3, then get it
curl http://localhost:3000/api/backend/projects/PROJECT_ID

# 6. Update it
curl -X PATCH http://localhost:3000/api/backend/projects/PROJECT_ID \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Updated"}'

# 7. Delete it
curl -X DELETE http://localhost:3000/api/backend/projects/PROJECT_ID

# 8. Verify it's gone
curl http://localhost:3000/api/backend/projects
```

If all these work, your backend is solid! ✓

---

## Next Steps

Once the API works:
- Start building the frontend UI components
- Connect React components to these API endpoints
- Add Excel file upload functionality (Phase 2)

---

**Happy testing!** 🧪
