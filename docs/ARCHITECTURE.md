# SheetFlow Architecture - Design Decisions Explained

## Why We Structure Code This Way

When you're working on a project with multiple people, clear structure prevents problems. SheetFlow organizes code into clear sections:

```
/frontend     ← User interface code (buttons, forms, charts)
/backend      ← Server logic (databases, authentication)
/lib          ← Shared code used by both frontend and backend
/app          ← Next.js pages and API routes
```

### The Problem We're Solving

Without clear structure, beginners might accidentally:
- Import database connection code in a React component (leaks secrets)
- Put API logic in the frontend (exposes internal API details)
- Have two copies of the same type definition (causes bugs)

### Our Solution: Strict Separation

**Frontend code NEVER talks to the database directly.**
**Backend code NEVER renders HTML.**
**Shared code is clearly marked in `/lib`.**

---

## Data Flow (How Information Moves)

### When a User Signs In

```
1. User clicks "Sign in with Google" (frontend)
   ↓
2. Browser redirects to Google login (Google's website)
   ↓
3. Google redirects back with a token (to /api/auth/callback/google)
   ↓
4. NextAuth verifies the token
   ↓
5. Backend checks if user exists in MongoDB
   ↓
6. If not, creates new user
   ↓
7. Issues a JWT token to the browser
   ↓
8. Browser stores token in secure cookie
   ↓
9. Next API requests include this token automatically
```

### When a User Views Their Projects

```
1. Frontend requests GET /api/backend/projects
   ↓
2. Middleware checks: "Is this request authorized?" (has valid token?)
   ↓
3. If no token → return 401 Unauthorized
   ↓
4. If valid token → continue to the route handler
   ↓
5. Route handler connects to MongoDB
   ↓
6. Fetches projects for THIS user (not all users!)
   ↓
7. Returns JSON response
   ↓
8. Frontend displays projects in the UI
```

---

## Why This Security Model?

### The Goal: Keep Secrets Secret

Your database password, Google client secret, and API keys should NEVER reach the browser. Here's why:

- Browser memory is inspectable (DevTools)
- Network traffic can be captured (Wireshark)
- JavaScript in the browser is readable by anyone

### Our Protection

**Secrets Live on the Server Only**
- MongoDB connection string? Server only.
- Google OAuth secret? Server only.
- NextAuth secret? Server only.

**Frontend Makes Requests, Backend Works**
- Frontend sends simple requests: "GET /api/backend/projects"
- Middleware checks the request: "Is this user logged in?"
- Backend queries database (safely, inside the server)
- Backend returns only public data: project names, dates

**Excel Data Stays in Browser**
- When user uploads Excel file, it's parsed in JavaScript
- Raw Excel data is NEVER sent to the backend
- Instead, user can ask questions to local AI
- Only AI-generated insights might be saved

---

## File Explanations

### `/backend/auth/auth.ts`

```typescript
// Handles user authentication with Google OAuth
// Creates/updates users in MongoDB when they sign in
```

**Why separate file?**
This code is sensitive - it deals with user credentials. By putting it in `/backend/`, we make it clear this runs on the server only.

### `/middleware.ts`

```typescript
// Runs on EVERY request to /api/backend
// Checks: "Is the user logged in?"
// If no → reject with 401
```

**Why this matters?**
Without middleware, someone could directly call the database API without being logged in. Middleware is our security guard.

### `/lib/types.ts`

```typescript
// Shared TypeScript types
// Used by both frontend AND backend
// Frontend knows what data backend returns
```

**Why shared?**
If the frontend doesn't know what the API returns, it might display wrong data. Shared types keep them in sync.

---

## Database Design (Why We Store What)

### What We Store in MongoDB

✓ User email and name
✓ Subscription status (free vs pro)
✓ User preferences (theme, language)
✓ Project configuration settings
✓ File path to Excel file

### What We DON'T Store

✗ Actual Excel data (thousands of rows)
✗ Analyses or calculations (those are temporary)
✗ Password (we use Google OAuth instead)

**Why?** MongoDB has storage limits. More importantly, we want data privacy. If an Excel file has sensitive data, it shouldn't sit on our servers.

---

## Authentication Flow (Step by Step)

### First Time Login

```
[Browser]                    [Google]               [Our Server]
   |                            |                        |
   |-- Click Login -----------→|                        |
   |                            |                        |
   |← Redirect with code -------|                        |
   |                                                      |
   |-- Send code ────────────────────────────────────────→|
   |                                                      |
   |← JWT Token ←─────────────────────────────────────---|
   |                                                      |
   (Token stored in cookie)
   
```

### Subsequent Requests

```
[Browser]                      [Our Server]
   |                                |
   |-- GET /api/backend/me ------→ |
   |    Authorization: Bearer Token |
   |                                |
   |                     [Middleware checks token]
   |                     [Route handler queries DB]
   |                     [Returns user data]
   |                                |
   |← { email, name, ... } ←--------|
```

---

## Why TypeScript?

TypeScript helps catch bugs before they happen:

**Without TypeScript:**
```javascript
const user = { email: "john@example.com" };
console.log(user.emial);  // Oops! typo
// No error, just prints undefined
```

**With TypeScript:**
```typescript
interface User {
  email: string;
}
const user: User = { email: "john@example.com" };
console.log(user.emial);  // ERROR: Property 'emial' does not exist
```

When you save the file, VS Code shows the error before you even run the server!

---

## API Design (Why Responses Look a Certain Way)

Every API response follows this format:

```json
{
  "success": true/false,
  "data": { /* actual data */ },
  "error": "error message if success is false"
}
```

**Why consistent?**
The frontend knows exactly what to expect. No surprises.

Frontend code is simple:

```typescript
const response = await fetch("/api/backend/projects");
const result = await response.json();

if (result.success) {
  setProjects(result.data);
} else {
  showError(result.error);
}
```

---

## Performance Considerations

### 1. Database Query Optimization

```typescript
// ❌ Slow - returns all user data
const user = await User.findOne({ email });

// ✓ Fast - returns only what we need
const user = await User.findOne({ email }).lean();
```

`.lean()` returns plain objects, not Mongoose documents. It's faster for read-only queries.

### 2. Connection Pooling

MongoDB connections are expensive to create. Our `connection.ts` caches the connection:

```typescript
let cachedConnection = null;

if (cachedConnection) {
  return cachedConnection;  // Reuse existing connection
}

// Create new only if needed
const connection = await mongoose.connect(mongoUri);
cachedConnection = connection;
```

### 3. Serverless Considerations

Next.js can run on serverless platforms like Vercel where each request gets a new container. Connection caching handles this automatically.

---

## Security Checklist

We've built in these protections:

- ✓ All secrets in `.env.local` (never in code)
- ✓ JWT tokens for stateless sessions (work on serverless)
- ✓ Middleware enforces authentication
- ✓ API checks user ownership (can't access other user's projects)
- ✓ Mongoose validates all input types
- ✓ HTTPS-only cookies in production
- ✓ Security headers in Next.js config (prevents clickjacking)
- ✓ Excel data stays client-side (never sent to server)

---

## What Each Phase Builds

**Phase 1 (Current):** User auth, core API, database setup
**Phase 2:** Excel file upload, file watcher, SheetJS parsing
**Phase 3:** Local AI engine, semantic search, RAG
**Phase 4:** Visual dashboards, charts, data tables
**Phase 5:** Production deployment, CI/CD, monitoring

Each phase builds on the previous one without breaking existing code.

---

## Debugging Tips

### "I'm getting 401 Unauthorized"

Check: Are you logged in? Does your browser have the auth cookie?

```bash
# In browser DevTools → Application → Cookies
# Look for: next-auth.session-token
```

### "API isn't connecting to MongoDB"

Check:
1. Is MongoDB Atlas running? (Check your account)
2. Is your IP whitelisted? (Network Access → IP Whitelist)
3. Is `MONGODB_URI` correct in `.env.local`?
4. Are you using the right username/password?

### "Middleware is blocking my request"

Middleware protects `/api/backend/*`. Try calling `/api/backend/health` which doesn't need auth but will test everything.

---

**Questions? Check the comments in the code - every file is documented!**
