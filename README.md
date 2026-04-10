# SheetFlow AI - Local-First Excel Dashboarding & Analysis

> A privacy-first, zero-cloud AI analysis tool for Excel files, built for MSMEs (Micro, Small & Medium Enterprises).

## 🎯 What is SheetFlow?

SheetFlow AI brings intelligent data analysis to Excel files without ever sending your data to the cloud. Upload your spreadsheet, ask questions in natural language, and get instant AI-powered insights—all processed locally in your browser.

**Key Promise: Your data never leaves your computer.**

---

## 🏗️ Architecture Overview

SheetFlow follows a strict **separation of concerns** pattern to keep backend logic secure and frontend code clean:

```
/frontend       → React components & UI hooks (runs in browser)
/backend        → Server-side logic & databases (runs on Node.js)
/lib            → Shared types & utilities
/app            → Next.js App Router (both frontend pages & backend API)
```

### Why This Structure?

- **Security**: Database connections and API keys live only on the backend
- **Clarity**: New developers know exactly where to find frontend vs backend code
- **Separation**: Frontend developers don't accidentally import backend code

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier available)
- Google OAuth credentials

### Step 1: Clone & Setup

```bash
git clone <repository>
cd SheetFlow
npm install
```

### Step 2: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add your IP to the allowlist

### Step 3: Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials
5. Set authorized redirect URIs to: `http://localhost:3000/api/auth/callback/google`

### Step 4: Create `.env.local`

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/sheetflow?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
NEXTAUTH_SECRET=<generate with: openssl rand -hex 32>
NEXTAUTH_URL=http://localhost:3000
```

### Step 5: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🔐 Security Architecture

### Authentication Flow

1. User clicks "Sign in with Google"
2. NextAuth handles OAuth flow
3. User created in MongoDB (first login only)
4. JWT session token issued
5. Middleware checks every API request for valid token

### API Protection

All endpoints under `/api/backend` are protected by middleware in `middleware.ts`:

- ✓ Requires valid JWT token
- ✓ Verifies user ownership of resources
- ✓ Prevents unauthorized access

### Data Privacy

- **Excel data stays in browser** - never sent to backend
- **Only metadata in database** - user settings, project configs
- **No tracking** - SheetFlow doesn't collect usage data

---

## 📚 API Documentation

### Base URL: `/api/backend`

All endpoints require authentication. Responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Or on error:

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

---

### User Endpoints

#### GET `/me` - Get Current User

```bash
curl http://localhost:3000/api/backend/me \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "free",
    "isOnboarded": false,
    "preferences": {
      "theme": "light",
      "language": "en"
    }
  }
}
```

#### PATCH `/me` - Update User Preferences

```bash
curl -X PATCH http://localhost:3000/api/backend/me \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "theme": "dark"
    }
  }'
```

---

### Project Endpoints

#### GET `/projects` - List All Projects

```bash
curl http://localhost:3000/api/backend/projects
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "projectName": "Sales Report 2024",
      "description": "Monthly sales tracking",
      "aiModel": "SmolLM2-360M",
      "watcherInterval": 5,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/projects` - Create Project

```bash
curl -X POST http://localhost:3000/api/backend/projects \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Q4 Analytics",
    "description": "Fourth quarter metrics",
    "aiModel": "SmolLM2-360M",
    "watcherInterval": 5
  }'
```

#### GET `/projects/[id]` - Get Specific Project

```bash
curl http://localhost:3000/api/backend/projects/507f1f77bcf86cd799439011
```

#### PATCH `/projects/[id]` - Update Project

```bash
curl -X PATCH http://localhost:3000/api/backend/projects/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Q4 Analytics - Updated",
    "aiModel": "Gemma-4-E2B"
  }'
```

#### DELETE `/projects/[id]` - Delete Project

```bash
curl -X DELETE http://localhost:3000/api/backend/projects/507f1f77bcf86cd799439011
```

---

## 📂 Key Files Explained

### Backend Configuration

- **`backend/db/connection.ts`** - MongoDB connection with connection pooling
- **`backend/db/models.ts`** - User and ProjectConfig Mongoose schemas
- **`backend/auth/auth.ts`** - NextAuth.js configuration with OAuth setup

### Security

- **`middleware.ts`** - Protects all `/api/backend` routes, checks JWT tokens
- **`next.config.js`** - Security headers (prevents clickjacking, XSS)

### API Routes

- **`app/api/backend/me/route.ts`** - User profile endpoints
- **`app/api/backend/projects/route.ts`** - Project list & creation
- **`app/api/backend/projects/[id]/route.ts`** - Individual project operations

### Shared Code

- **`lib/types.ts`** - TypeScript interfaces used across the app

---

## 🧪 Testing the API

### Simple Test Script

Create `test-api.ts` in the root:

```typescript
// Get the first project
const response = await fetch("/api/backend/projects");
const result = await response.json();

if (result.success) {
  console.log("✓ API working! Projects:", result.data);
} else {
  console.log("✗ Error:", result.error);
}
```

---

## � Phase 2: Excel Live-Link (COMPLETE ✓)

SheetFlow now includes live Excel file monitoring with client-side parsing!

### Features Added
- ✓ File picker dialog - users select Excel files from their computer
- ✓ Automatic persistence - files remembered via IndexedDB (no re-selection needed)
- ✓ Live file watching - detected changes every 5 seconds via Web Worker
- ✓ Instant parsing - SheetJS converts Excel to JSON in the browser
- ✓ Data preview - beautiful table view with pagination
- ✓ Multi-sheet support - view all sheets in a workbook
- ✓ Zero cloud - all processing stays on the user's computer

### New Components
- `ExcelUploadSection` - File selection and controls
- `ExcelDataViewer` - Data table preview

### New Utilities & Hooks
- `useExcelLiveLink` - React hook managing the entire workflow
- `excelParser` - Utilities for parsing Excel files
- `indexeddb` - Browser storage for FileSystemFileHandle

### How It Works
1. User clicks "Select Excel File"
2. File picker shows → user selects .xlsx file
3. File is parsed using SheetJS
4. Web Worker starts polling file every 5 seconds
5. If file changes → automatically re-parsed and UI updates
6. File handle saved in IndexedDB (remembered on page reload)

### Testing Phase 2
- Go to [http://localhost:3000](http://localhost:3000)
- Click "📁 Select Excel File"
- Select any .xlsx or .xls file
- Edit the file in Excel/Google Sheets and save
- SheetFlow updates automatically in ~5 seconds!

For complete Phase 2 guide, see [docs/PHASE2.md](docs/PHASE2.md)

---
## 🤖 Phase 3: Local AI Engine (COMPLETE ✓)

SheetFlow now includes a powerful local AI engine that analyzes Excel data using your computer's GPU—without sending data anywhere!

### Features Added
- ✓ Local AI inference with WebGPU acceleration
- ✓ No cloud dependency - models run in your browser
- ✓ Two AI models: SmolLM2-360M (fast) and Gemma-4-E2B (smart)
- ✓ Semantic chunking RAG system - efficiently processes large files
- ✓ Beautiful chat UI for asking questions about data
- ✓ Real-time streaming responses
- ✓ Model caching - instant model loading after first download
- ✓ Privacy guaranteed - all processing stays local

### New Components
- `AIChatPanel` - Chat interface for asking questions
- `useLocalAI` - React hook managing WebLLM engine
- `semanticChunking` - RAG utilities for breaking Excel into chunks

### How It Works
1. User selects Excel file and views data (Phase 2)
2. Click "🤖 Ask AI Analyst" button to open chat
3. Choose model: ⚡ Fast (2GB, quick) or 🧠 Smart (9GB, accurate)
4. Model downloads first time (~5-20 min depending on speed)
5. Ask question about the data
6. AI analyzes relevant data chunks locally on your GPU
7. Response streams to chat in real-time
8. All processing stays in your browser ✓

### System Architecture
```
Excel Data → Semantic Chunking → Chunk Relevance Scoring → 
Local AI Model (WebLLM) → Response → Chat Display
                ↑                        ↓
          Your GPU (WebGPU)      Real-time Streaming
```

### Performance Characteristics
- **SmolLM2-360M**: 3-5 seconds for small files, 2GB storage
- **Gemma-4-E2B**: 5-15 seconds for small files, 9GB storage  
- **Subsequent queries**: 2-3x faster (model cached)
- **Large files (50K+ rows)**: Semantic chunking ensures reasonable speed

### System Requirements
- **Browser**: Chrome 113+, Edge 113+, Firefox 121+, or Safari 17.4+
- **GPU**: Any modern GPU (integrated GPUs work but are slower)
- **RAM**: 8GB recommended, 4GB minimum
- **Disk**: 2-10GB free (depending on models you download)
- **WebGPU support**: Required (auto-detected by app)

### Testing Phase 3
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Visit [http://localhost:3000](http://localhost:3000)
4. Load an Excel file (Phase 2)
5. Click "🤖 Ask AI Analyst" button
6. Choose model and wait for download
7. Ask: "What are the top 5 values?" or similar
8. Watch as AI analyzes your data locally!

### Documentation
- **Quick Start**: [docs/PHASE3_QUICKSTART.md](docs/PHASE3_QUICKSTART.md) - 10-minute tutorial
- **Full Architecture**: [docs/PHASE3.md](docs/PHASE3.md) - Deep dive into how it works
- **File Reference**: [docs/PHASE3_FILES.md](docs/PHASE3_FILES.md) - Code-by-code breakdown
- **Phase 4 Quick Start**: [docs/PHASE4_QUICKSTART.md](docs/PHASE4_QUICKSTART.md) - Dashboard setup
- **Phase 4 Architecture**: [docs/PHASE4.md](docs/PHASE4.md) - Dashboard details
- **Phase 4 Files**: [docs/PHASE4_FILES.md](docs/PHASE4_FILES.md) - File guide

### Privacy & Security
- ✅ Your Excel data never leaves your computer
- ✅ AI models downloaded from HuggingFace (standard open-source models)
- ✅ No servers involved in data analysis
- ✅ Only Google OAuth required for user account (unavoidable)
- ✅ Local model caching means offline analysis after first download

---
## �🛠️ Development Workflow

### Adding a New API Endpoint

1. Create a new file in `app/api/backend/[endpoint]/route.ts`
2. Import `auth`, `connectToDatabase`, and models
3. Check authentication: `const session = await auth()`
4. Return standardized `ApiResponse` format
5. Add to this README

### Adding a Frontend Component

1. Create component in `frontend/components/`
2. Import from `@/components/*` in your pages
3. Use React hooks from `frontend/hooks/`

---

## ⚡ Performance Notes

- MongoDB queries use `.lean()` to return plain objects (faster)
- API middleware is cached in Next.js (minimal overhead)
- Excel data processing happens only in-browser (no server load)

---

## 📖 Development Phases

**Phase 1:** Authentication & REST APIs (COMPLETE ✓)
- User authentication with Google OAuth
- 8 REST API endpoints
- MongoDB integration
- JWT token security

**Phase 2:** Excel Live-Link (COMPLETE ✓)  
- File picker dialog
- Live file watching
- SheetJS parsing
- Data table preview
- IndexedDB persistence

**Phase 3:** Local AI Engine (COMPLETE ✓)
- WebLLM local inference
- Semantic chunking RAG
- Chat interface  
- Two AI models (SmolLM2-360M, Gemma-4-E2B)
- Privacy-first analysis

**Phase 4:** UI & Dashboards (COMPLETE ✓)
- Data visualization charts
- Dashboard analytics
- Sheet-aware metrics
- Category distributions

**Phase 5:** Production Release (IN PROGRESS)
- Performance optimization
- Deployment guides
- Docker containers
- Complete documentation
- Phase 5 docs: [docs/PHASE5.md](docs/PHASE5.md)

---

## 📝 License

Open source. See LICENSE file.

---

## 🤝 Contributing

This project welcomes contributions from junior developers. The codebase is intentionally written to be beginner-friendly.

**How to contribute:**
1. Pick an issue from the GitHub issues page
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes with clear commit messages
4. Push and create a pull request

---

## ❓ Troubleshooting

### "MONGODB_URI is not set"

Check your `.env.local` file exists and has the correct MongoDB connection string.

### "401 Unauthorized on API calls"

Make sure you're logged in first. Visit the app and sign in with Google.

### "Connection refused to MongoDB"

Your MongoDB IP allowlist might be blocking your computer. Update it in MongoDB Atlas.

---

**Built with ❤️ for data privacy.**
