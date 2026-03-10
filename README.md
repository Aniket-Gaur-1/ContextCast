# ContextCast — AI Meeting Memory

> Never forget a decision again. Search across all your meetings with natural language.

![ContextCast Screenshot](screenshot.png)

## What it does

ContextCast is a local-first meeting memory tool. Add meetings by pasting a transcript, uploading a file, or filling a form — and AI automatically extracts decisions, action items, and a summary. Then search everything with plain English.

**Key features:**
- 🔍 AI-powered semantic search across all meetings
- 📋 Auto-extract decisions & action items from raw transcripts
- 📌 Pin important meetings
- ✅ Check off action items with due date tracking
- ⚠️ Overdue action alerts in the Insights tab
- 👥 Per-person meeting & action stats
- 🔗 Share formatted summaries to Slack/email
- ⬇️ Export meeting as PDF
- 🌙 Dark mode
- 💾 Persisted to localStorage — no backend needed

## Tech Stack

- **React 18** — UI
- **Vite** — build tool
- **Claude API** — AI search answers + transcript extraction
- **localStorage** — persistence (no backend)

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/contextcast.git
cd contextcast

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** The Claude API key is handled by the deployment environment. For local dev, add your key to a `.env` file:
> ```
> VITE_ANTHROPIC_API_KEY=your_key_here
> ```
> Then update `src/utils/api.js` to use `import.meta.env.VITE_ANTHROPIC_API_KEY`.

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Left panel with search + meeting list
│   ├── MeetingRow.jsx       # Single meeting item in sidebar
│   ├── MeetingDetail.jsx    # Full meeting view with actions
│   ├── SearchResults.jsx    # AI answer + keyword match results
│   ├── AddMeetingModal.jsx  # Paste / Upload / Manual form
│   ├── ShareModal.jsx       # Copy formatted summary
│   ├── ConfirmDelete.jsx    # Delete confirmation dialog
│   └── ProcessingBox.jsx    # AI processing steps indicator
├── pages/
│   └── Insights.jsx         # Stats, overdue, people, decisions
├── hooks/
│   └── index.js             # useStorage + useSearch hooks
├── utils/
│   ├── helpers.js           # Pure utility functions
│   └── api.js               # Claude API calls
├── data/
│   └── demo.js              # Sample meetings
└── App.jsx                  # Root — state + layout orchestration
```

## Deploy to Vercel

```bash
npm run build
# then drag the `dist/` folder to vercel.com, or connect your GitHub repo
```

## Author

**Aniket Gaur** — [linkedin.com/in/aniket-gaur](https://linkedin.com/in/aniket-gaur) · [github.com/aniketgaur](https://github.com/aniketgaur)
