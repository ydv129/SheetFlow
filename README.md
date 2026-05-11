# 🌊 SheetFlow AI

> **Privacy-First, Local-First Excel Intelligence.** Experience the power of generative AI on your spreadsheets without your data ever leaving your browser.

---

## 🛡️ The Privacy Shield
SheetFlow is engineered from the ground up to protect sensitive business data. We believe that privacy is not a feature, but a fundamental right.

- **Zero-Cloud Processing**: 100% of your Excel data is parsed and analyzed within your browser's sandbox. 
- **Local AI Inference**: Utilizing `WebLLM` and `WebGPU`, the AI models (Gemma, SmolLM) run entirely on your local machine.
- **E2E Isolation**: Your spreadsheets are stored in `sessionStorage` or `IndexedDB` (for handles), ensuring they never traverse the network.
- **No Telemetry**: We collect zero usage statistics, zero tracking data, and zero metadata about your documents.

---

## ✨ Premium Capabilities

### 🧠 Intelligent Conversational Analyst
Talk to your data as if it were a colleague. Ask for summaries, trends, or complex cross-sheet calculations using natural language.

### 📊 Dynamic Bento Dashboard
Automated, high-fidelity visualizations that adapt to your data structure. View category distributions, trend lines, and KPI metrics instantly.

### 📁 Unified Multi-Workbook Environment
Manage and analyze multiple workbooks in a single, streamlined workspace with live-link file watching.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Core** | Next.js 15 / React 19 | High-performance, reactive framework |
| **Styling** | Vanilla CSS / Framer Motion | Premium, glassmorphic UI & cinematic animations |
| **AI Engine** | WebLLM / WebGPU | Local browser-level inference |
| **Data Engine** | SheetJS | High-speed, local Excel parsing |
| **Auth** | NextAuth v5 (Google OAuth) | Secure, session-based access |
| **Persistence** | MongoDB / Valkey | Metadata management & rate limiting |

---

## 🚀 Quick Setup

1. **Clone & Install**:
   ```bash
   git clone <repo> && cd SheetFlow && npm install
   ```
2. **Environment**:
   Copy `.env.example` to `.env.local` and configure your MongoDB and Google OAuth keys.
3. **Launch**:
   ```bash
   npm run dev
   ```
   *Visit `localhost:3000` to start your private analysis.*

---

## 🔐 Compliance & Security Model

SheetFlow is designed for MSMEs handling sensitive financial, medical, or legal data. By eliminating the cloud intermediate, we provide:
- ✓ **GDPR/HIPAA Ready Architecture**
- ✓ **Hardware Accelerated Privacy**
- ✓ **Offline-Capable Analysis**

---

**Built with ❤️ for Data Sovereignty.**
