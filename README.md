# AI Code Review Agent

An automated code review tool powered by **Groq AI** (free API) with a **rule-based fallback**.

<img width="1919" height="847" alt="Screenshot_2026-05-27_01-08-16" src="https://github.com/user-attachments/assets/3528be15-69da-41af-8058-46be33ab5017" />


<img width="1678" height="854" alt="Screenshot_2026-05-27_01-12-55" src="https://github.com/user-attachments/assets/2da2c682-e75c-4c00-adca-4114798c8321" />



## Overview

This application analyzes JavaScript/TypeScript code in real-time using a real AI model (Llama 3.3 70B via Groq), detecting:

- **Security vulnerabilities** (`eval()`, `innerHTML`, XSS risks)
- **Type safety issues** (`any` types, missing generics)
- **Best practices** (`console.log`, `var`, loose equality, TODOs)
- **Performance concerns** (long functions, callback nesting)
- **Style inconsistencies** (magic numbers, formatting)

If the AI service is unavailable, it instantly falls back to a rule-based engine so the app always works.

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
| **AI Engine**       | **Groq API (Llama 3.3 70B)**        |
| Fallback Engine     | Rule-based (regex + heuristics)     |
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
    ├── Try Groq AI first
    │   └── POST api.groq.com/v1/chat/completions → Llama 3.3 70B
    └── Fallback: Rule-based analysis
        ├── Security checks (eval, innerHTML)
        ├── Type safety (any)
        ├── Best practices (console, var, ==)
        ├── Performance (function length)
        └── Style (magic numbers)
```

## How It Works

### 1. Get a free Groq API key

1. Sign up at [console.groq.com](https://console.groq.com/) (free, no credit card)
2. Go to **API Keys** and create one
3. Copy the key starting with `gsk_...`

### 2. Configure

```bash
cp .env.local.example .env.local
# Edit .env.local:
GROQ_API_KEY=gsk-your-key-here
```

### 3. Install & Run

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## AI Provider

### Groq (Free Tier — Recommended)

- **Llama 3.3 70B** — excellent for code review
- **Mixtral 8x7B** — fast alternative
- **Rate limits**: 20 req/min, 600K tokens/min
- **No local setup** — pure API, works on any server

### Fallback: Rule-Based (Always Available)

If Groq is down, rate-limited, or the API key is missing, the app automatically falls back to instant regex/heuristic analysis. No setup required.

## Rate Limiting

To protect the free API tier from abuse (since this is a public portfolio), the API implements **IP-based rate limiting**:

- **10 requests per minute** per IP address
- Returns HTTP 429 with `Retry-After` header when exceeded
- Uses in-memory store (no Redis needed for portfolio/demo)

## Project Structure

```
ai-code-review-agent/
├── src/
│   ├── app/
│   │   ├── api/review/route.ts    # AI engine (Groq + fallback)
│   │   ├── page.tsx               # Main dashboard
│   │   ├── layout.tsx             # Root layout with fonts
│   │   └── globals.css            # Glassmorphism design system
│   └── components/
│       ├── code-input.tsx         # Code editor panel
│       ├── issue-card.tsx         # Individual issue display
│       ├── review-results.tsx     # Score + issues list
│       └── stats-panel.tsx        # Category sidebar
├── .env.local.example             # Groq API key config
├── tailwind.config.ts
└── package.json
```

## Features

- **Real AI analysis** — Groq Llama 3.3 70B, free tier
- **Rule-based fallback** — Works even when AI is offline
- **Rate limiting** — Protects API from abuse
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
