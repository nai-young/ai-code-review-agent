import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Rate limiter: conservative to stay within Groq free tier (20 req/min)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

interface Issue {
  id: string;
  severity: "critical" | "warning" | "info";
  category:
    | "security"
    | "performance"
    | "style"
    | "best-practice"
    | "type-safety";
  line: number;
  message: string;
  suggestion: string;
  codeSnippet: string;
}

interface ReviewResult {
  score: number;
  issues: Issue[];
  summary: string;
  metrics: {
    totalLines: number;
    issuesByCategory: Record<string, number>;
    issuesBySeverity: Record<string, number>;
  };
}

// Fallback rule-based analysis when AI is unavailable
function analyzeCodeRuleBased(code: string): ReviewResult {
  const lines = code.split("\n");
  const issues: Issue[] = [];
  let issueId = 0;

  const addIssue = (
    severity: Issue["severity"],
    category: Issue["category"],
    line: number,
    message: string,
    suggestion: string,
    codeSnippet: string,
  ) => {
    issues.push({
      id: `issue-${++issueId}`,
      severity,
      category,
      line,
      message,
      suggestion,
      codeSnippet: codeSnippet.trim().substring(0, 80),
    });
  };

  let inFunction = false;
  let functionStartLine = 0;

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    if (trimmed.includes("eval(")) {
      addIssue(
        "critical",
        "security",
        lineNum,
        "Use of eval() detected",
        "Avoid eval() as it executes arbitrary code. Use safer alternatives.",
        trimmed,
      );
    }
    if (
      trimmed.includes("innerHTML") &&
      !trimmed.includes("textContent") &&
      !trimmed.includes("innerText")
    ) {
      addIssue(
        "critical",
        "security",
        lineNum,
        "Potential XSS via innerHTML",
        "Use textContent instead of innerHTML, or sanitize input.",
        trimmed,
      );
    }
    if (trimmed.includes(": any") || trimmed === "any") {
      addIssue(
        "warning",
        "type-safety",
        lineNum,
        "Usage of 'any' type",
        "Replace 'any' with specific types or use 'unknown' with type guards.",
        trimmed,
      );
    }
    if (/console\.(log|warn|error|debug)\(/.test(trimmed)) {
      addIssue(
        "warning",
        "best-practice",
        lineNum,
        "Console statement found",
        "Remove console statements in production code.",
        trimmed,
      );
    }
    if (/\bvar\s+/.test(trimmed) && !trimmed.includes("//")) {
      addIssue(
        "warning",
        "best-practice",
        lineNum,
        "Use of 'var' keyword",
        "Use 'const' or 'let' instead of 'var' for better scoping.",
        trimmed,
      );
    }
    if (
      /[^=!]==[^=]/.test(trimmed) &&
      !trimmed.includes("===") &&
      !trimmed.includes("//")
    ) {
      addIssue(
        "warning",
        "best-practice",
        lineNum,
        "Loose equality operator",
        "Use strict equality (===) instead of loose equality (==).",
        trimmed,
      );
    }
    if (/TODO|FIXME|HACK|XXX/.test(trimmed)) {
      addIssue(
        "info",
        "best-practice",
        lineNum,
        "Code comment indicates incomplete work",
        "Address TODO/FIXME comments before merging.",
        trimmed,
      );
    }
    if (/function\s*\(|=>\s*\{|\{\s*$/.test(line)) {
      inFunction = true;
      functionStartLine = lineNum;
    }
    if (inFunction && line.includes("}")) {
      const funcLength = lineNum - functionStartLine + 1;
      if (funcLength > 40) {
        addIssue(
          "warning",
          "performance",
          functionStartLine,
          `Function too long (${funcLength} lines)`,
          "Break this function into smaller functions. Aim for <20 lines.",
          trimmed,
        );
      }
      inFunction = false;
    }
    if ((trimmed.match(/callback|=>/g) || []).length >= 3) {
      addIssue(
        "warning",
        "best-practice",
        lineNum,
        "Potential callback nesting",
        "Consider using async/await or Promises.",
        trimmed,
      );
    }
    if (
      /\b\d{3,}\b/.test(trimmed) &&
      !trimmed.includes("//") &&
      !trimmed.includes("const") &&
      !trimmed.includes("let")
    ) {
      addIssue(
        "info",
        "best-practice",
        lineNum,
        "Magic number detected",
        "Extract magic numbers into named constants.",
        trimmed,
      );
    }
  });

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;
  const totalLines = lines.length;

  let score = 100;
  score -= criticalCount * 15;
  score -= warningCount * 5;
  score -= infoCount * 1;
  score = Math.max(0, Math.min(100, score));

  const issuesByCategory: Record<string, number> = {};
  const issuesBySeverity: Record<string, number> = {};
  issues.forEach((i) => {
    issuesByCategory[i.category] = (issuesByCategory[i.category] || 0) + 1;
    issuesBySeverity[i.severity] = (issuesBySeverity[i.severity] || 0) + 1;
  });

  let summary = "Great job! Your code follows most best practices.";
  if (criticalCount > 0) {
    summary = `Found ${criticalCount} critical security issue${criticalCount > 1 ? "s" : ""} that need immediate attention.`;
  } else if (warningCount > 0) {
    summary = `Code is functional but has ${warningCount} warning${warningCount > 1 ? "s" : ""} to address.`;
  } else if (infoCount > 0) {
    summary = "Minor improvements suggested. Code is mostly clean.";
  }

  return {
    score,
    issues,
    summary,
    metrics: { totalLines, issuesByCategory, issuesBySeverity },
  };
}

// Groq AI analysis (free tier via API)
async function analyzeWithGroq(code: string): Promise<ReviewResult | null> {
  if (!GROQ_API_KEY) return null;

  const systemPrompt = `You are a senior software engineer doing a code review.
Analyze the provided JavaScript/TypeScript code for security, performance, type safety, style, and best practices.

Respond ONLY with a valid JSON object. No markdown, no explanation, no code blocks. Just raw JSON.

Required JSON structure:
{
  "score": <number 0-100>,
  "summary": "One sentence overview",
  "issues": [
    {
      "severity": "critical|warning|info",
      "category": "security|performance|style|best-practice|type-safety",
      "line": <number>,
      "message": "Short issue description",
      "suggestion": "How to fix it",
      "codeSnippet": "The problematic line (max 80 chars)"
    }
  ]
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Code to review:\n\n\`\`\`\n${code}\n\`\`\``,
          },
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Groq API error:", res.status, errorData);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    if (!content) return null;

    const parsed = JSON.parse(content);
    const rawIssues = parsed.issues || [];

    const issues: Issue[] = rawIssues.map((issue: any, i: number) => ({
      id: `issue-${i + 1}`,
      severity: ["critical", "warning", "info"].includes(issue.severity)
        ? issue.severity
        : "info",
      category: [
        "security",
        "performance",
        "style",
        "best-practice",
        "type-safety",
      ].includes(issue.category)
        ? issue.category
        : "best-practice",
      line: typeof issue.line === "number" ? issue.line : 0,
      message: issue.message || "Issue found",
      suggestion: issue.suggestion || "Review this code",
      codeSnippet: (issue.codeSnippet || "").substring(0, 80),
    }));

    const issuesByCategory: Record<string, number> = {};
    const issuesBySeverity: Record<string, number> = {};
    issues.forEach((i) => {
      issuesByCategory[i.category] = (issuesByCategory[i.category] || 0) + 1;
      issuesBySeverity[i.severity] = (issuesBySeverity[i.severity] || 0) + 1;
    });

    return {
      score: Math.max(0, Math.min(100, parsed.score ?? 80)),
      issues,
      summary: parsed.summary || "AI review completed.",
      metrics: {
        totalLines: code.split("\n").length,
        issuesByCategory,
        issuesBySeverity,
      },
    };
  } catch (err) {
    console.error("Groq analysis failed:", err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Maximum ${RATE_LIMIT_MAX} requests per minute. Please wait and try again.`,
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
          },
        },
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Try Groq AI first (free API, no local setup needed)
    let result = await analyzeWithGroq(code);

    // Fallback to rule-based analysis
    if (!result) {
      result = analyzeCodeRuleBased(code);
      result.summary =
        "[Rule-based fallback, AI service not available] " + result.summary;
    }

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": String(rateCheck.remaining),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to analyze code", details: error.message },
      { status: 500 },
    );
  }
}
