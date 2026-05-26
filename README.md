# AI Code Review Agent

An automated code review tool powered by **rule-based analysis** with optional **Ollama AI integration**.

## Overview

This application analyzes JavaScript/TypeScript code in real-time, detecting:

- **Security vulnerabilities** (`eval()`, `innerHTML`, XSS risks)
- **Type safety issues** (`any` types, missing generics)
- **Best practices** (`console.log`, `var`, loose equality, TODOs)
- **Performance concerns** (long functions, callback nesting)
- **Style inconsistencies** (magic numbers, formatting)

The rule-based engine works instantly without any external AI service. Optional Ollama integration available for those with GPU resources.

## Demo

Paste any JavaScript or TypeScript code into the editor and click **Run AI Code Review**. The agent returns:

- Overall **quality score** (0-100)
- **Categorized issues** with severity levels
- **Line-by-line suggestions** with code snippets
- **Metrics breakdown** by category

## Stack

| Layer               | Technology                          |
| ------------------- | ----------------------------------- |
| Frontend            | Next.js 14 · React · TypeScript     |
| Styling             | Tailwind CSS · Custom glassmorphism |
| **Analysis Engine** | **Rule-based (regex + heuristics)** |
| Optional AI         | Ollama (Llama 3) — self-hosted      |
| Rate Limit          | In-memory IP-based (10 req/min)     |
| Icons               | Lucide React                        |

## Architecture

```
Frontend (Next.js)
    ├── Code Input Editor
    ├── Review Results Panel
    │   ├── Score Ring (SVG animated)
    │   ├── Issue Cards (severity colored)
    │   └── Category Breakdown
    └── Stats Sidebar

API Route (/api/review)
    ├── Rate Limit Check (10 req/min per IP)
    ├── Try Ollama AI first
    │   └── POST /api/generate → Llama 3
    └── Fallback: Rule-based analysis
        ├── Security checks (eval, innerHTML)
        ├── Type safety (any)
        ├── Best practices (console, var, ==)
        ├── Performance (function length)
        └── Style (magic numbers)
```

## How It Works

### Default: Rule-Based Analysis (Instant, No Setup)

1. Paste your code and click **Run AI Code Review**
2. The API analyzes the code using regex patterns and heuristics
3. Results appear instantly with score, issues, and suggestions

### Optional: Ollama AI (Requires GPU + 5GB Disk)

If you have a machine with a GPU and enough disk space:

1. Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
2. Pull a model: `ollama pull llama3`
3. Set `OLLAMA_URL` in `.env.local`
4. The API will use Ollama first, falling back to rule-based if offline

## Setup

### Prerequisites

- Node.js 18+
- **Ollama** running somewhere (your laptop, server, or Hetzner VPS)
- `llama3` model pulled in Ollama: `ollama pull llama3`

### 1. Configure Ollama URL

```bash
cp .env.local.example .env.local
# Edit .env.local:
OLLAMA_URL=ollama.server:11434   # Your Ollama server
# Or: OLLAMA_URL=http://localhost:11434     # If running locally
```

### 2. Install & Run

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Rate Limiting

To protect your Ollama server from abuse (since this is a public portfolio), the API implements **IP-based rate limiting**:

- **10 requests per minute** per IP address
- Returns HTTP 429 with `Retry-After` header when exceeded
- Uses in-memory store (no Redis needed for portfolio/demo)

If you need higher limits for personal use, modify `RATE_LIMIT_MAX` in `/api/review/route.ts`.

## Project Structure

```
ai-code-review-agent/
├── src/
│   ├── app/
│   │   ├── api/review/route.ts    # AI engine + rate limiting
│   │   ├── page.tsx               # Main dashboard
│   │   ├── layout.tsx             # Root layout with fonts
│   │   └── globals.css            # Glassmorphism design system
│   └── components/
│       ├── code-input.tsx         # Code editor panel
│       ├── issue-card.tsx         # Individual issue display
│       ├── review-results.tsx     # Score + issues list
│       └── stats-panel.tsx        # Category sidebar
├── .env.local.example             # Ollama URL config
├── tailwind.config.ts
└── package.json
```

## Features

- **Free AI analysis** — Ollama Llama 3, no API costs
- **Rule-based fallback** — Works even when Ollama is offline
- **Rate limiting** — Protects server from abuse
- **Security-first** — Detects XSS, eval, unsafe patterns
- **Visual score ring** — Animated SVG progress indicator
- **Categorized issues** — Security, Performance, Style, Best Practice, Type Safety
- **Severity levels** — Critical, Warning, Info with color coding
- **Code snippets** — Shows the exact line for each issue
- **Actionable suggestions** — Every issue includes a fix recommendation
- **Responsive design** — Works on mobile, tablet, desktop
- **Dark theme** — Cyberpunk/glassmorphism aesthetic

## License

MIT
