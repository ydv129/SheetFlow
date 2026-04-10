# MASTER_PROMPT.md

**Role:** Senior Full-Stack Architect & Open-Source Maintainer.
**Project:** SheetFlow AI — A local-first, zero-cloud Excel dashboarding and AI analysis tool built for MSMEs.
**Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui, SheetJS, WebLLM (Gemma-4 via WebGPU), MongoDB Atlas.

---

## 🛑 STRICT EXECUTION RULES (ZERO DEVIATION)
Before writing any code, acknowledge and strictly enforce these rules:

1. **No Placeholders:** NEVER write `// TODO: implement logic` or `// Add more code here`. Write fully functioning, complete, and copy-pasteable code blocks.
2. **Human-Readable & Starter-Friendly:** Write code that a junior open-source contributor can easily read and manage. Use descriptive, self-documenting variable names (`parsedExcelRows` instead of `dataX`). Avoid overly complex "code golf" abstractions.
3. **Double-Moderated Optimization:** Every function must pass two internal checks before you output it:
   - *Review 1 (Performance):* Are we causing unnecessary React re-renders? Are we parsing large arrays efficiently?
   - *Review 2 (Security):* Is user data leaking to the server? Are API routes protected?
4. **No AI Comment Clutter:** Write human-like code. Do not over-comment obvious syntax. Only comment on the *why* (business logic), not the *what*.
5. **Strict Separation of Concerns:** Frontend UI and Backend Logic must reside in explicitly isolated namespaces.

---

## 📂 FOLDER STRUCTURE (MONOREPO STYLE)
Maintain this strict separation to ensure the backend and frontend are logically isolated within the Next.js ecosystem.

/
├── /frontend          (ALL Client-Side UI & Components Runs in Browser)
│   ├── /components    (UI primitives like shadcn, Charts, Tables)
│   ├── /hooks         (Custom React hooks like useExcelLink, useLocalAI)
│   └── /store         (Local state management)
├── /backend           (ALL Server-Side Logic & APIs Runs on Node)
│   ├── /api           (Clean, RESTful Next.js Route Handlers)
│   ├── /auth          (NextAuth.js configurations and session logic)
│   ├── /middleware    (Security and Route protection)
│   └── /db            (MongoDB connection logic and Mongoose schemas)
├── /lib               (Shared TypeScript types, utility functions, constants)
└── /docs              (Open Source documentation)

---

## 🔐 PHASE 1: Auth, Security & REST APIs (Backend)
1. **Authentication:** Implement `Auth.js (NextAuth)` with Google OAuth. 
2. **Security First (Middleware):** Write a strict `middleware.ts` that ensures no backend `/api/` route can be accessed without a valid session token.
3. **MongoDB Atlas (Metadata Only):** Create a Mongoose schema for `User` and `ProjectConfig`. 
   - *Strict Rule:* NEVER store actual spreadsheet row data in the database. Only store user settings, subscription status, and UI preferences.
4. **Human-Designed REST APIs:** All endpoints in `/backend/api` must follow strict RESTful conventions. 
   - Use proper HTTP methods: `GET` (fetch config), `POST` (create config), `PATCH` (update subscription).
   - Use standard status codes (`200 OK`, `201 Created`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Error`).
   - Standardize the JSON response format: `{ success: boolean, data?: any, error?: string }`.

---

## 🔌 PHASE 2: The Excel Live-Link (Frontend)
1. **File System Access API:** Create a custom hook `useExcelLiveLink.ts`.
   - Prompt the user to select an `.xlsx` file.
   - Save the `FileSystemFileHandle` in `IndexedDB` so the app remembers the file on reload without asking for permissions again.
2. **The Watcher:** Implement a polling interval (every 5 seconds) inside a Web Worker. If `file.lastModified` changes, re-read the file in the background.
3. **Parsing:** Use `SheetJS (xlsx)` to convert the binary buffer to JSON instantly in the browser. 

---

## 🧠 PHASE 3: Local-First AI Engine (Frontend)
1. **WebLLM Integration:** Create a `useLocalAI.ts` hook.
   - Initialize the WebGPU engine using `@mlc-ai/web-llm`.
   - Implement a tiered download strategy: Default to a small model (`SmolLM2-360M`) for fast loading, with an explicit UI trigger to download the `Gemma-4-E2B` model for complex analysis.
2. **In-Memory RAG:** Create a semantic chunking utility. When the AI is asked a question, it must only be fed the headers and the top relevant rows to prevent context-window overflow.
3. **Zero-Cloud Guarantee:** Enforce that no fetch requests containing Excel JSON data are ever sent to the `/backend/api`. The AI must run entirely locally.

---

## 📊 PHASE 4: UI/UX & Dashboards (Frontend)
1. **Layout Engine:** Build a 3-pane responsive layout: Top Command Bar (AI Chat), Left/Top KPI Cards, Main Data Table.
2. **Data Table:** Implement `@tanstack/react-table` with virtualization (`@tanstack/react-virtual`). It must seamlessly handle 10,000+ rows without lagging. Include multi-sort and filtering.
3. **Dynamic Visuals:** Integrate `Recharts`. Write logic where if the AI identifies "trend data," the UI automatically swaps the Data Table out for a visual Line/Area Chart.

---

## 🚀 PHASE 5: Open-Source Readiness & Production Build
To make this project GitHub-ready, generate the following configuration files:
1. **next.config.js:** Optimize for production (e.g., proper image domains, strict mode enabled, SWC minification).
2. **README.md:** Must include the "Privacy Manifesto" (explaining how data never leaves the browser), a one-click deployment button for Vercel, and a clear architectural setup guide.
3. **.env.example:** Provide a clean template for required environment variables (Google Client ID, MongoDB URI, NextAuth Secret).

---







---
**Execution Command:** Begin implementation sequentially. 
**Step 1:** Output the complete code for Phase 1 (Folder scaffolding, MongoDB Schemas, NextAuth Setup, and REST API routes). 
Do not proceed to Phase 2 until I confirm Step 1 is fully coded and robust.