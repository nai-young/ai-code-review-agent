"use client";

import { useState } from "react";
import { Code2, ShieldCheck } from "lucide-react";
import CodeInput from "@/components/code-input";
import ReviewResults from "@/components/review-results";
import StatsPanel from "@/components/stats-panel";
// @ts-ignore: Allow side-effect import of global CSS in Next.js app
import "./globals.css";

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

interface ReviewData {
  score: number;
  summary: string;
  issues: Issue[];
  metrics: {
    totalLines: number;
    issuesByCategory: Record<string, number>;
    issuesBySeverity: Record<string, number>;
  };
}

export default function HomePage() {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReviewData(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-grid relative">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <header className="mb-10 animate-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-600/25">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gradient tracking-tight">
                AI Code Review Agent
              </h1>
            </div>
          </div>
          <p className="text-lg text-gray-400 mt-4 max-w-2xl leading-relaxed">
            Automated code analysis for{" "}
            <span className="text-violet-400 font-semibold">security</span>,{" "}
            <span className="text-amber-400 font-semibold">performance</span>,
            and{" "}
            <span className="text-emerald-400 font-semibold">
              best practices
            </span>
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Code Input */}
          <div
            className="lg:col-span-2 animate-in"
            style={{ animationDelay: "0.1s" }}
          >
            <CodeInput onReview={handleReview} loading={loading} />
          </div>

          {/* Right: Stats */}
          <div className="animate-in" style={{ animationDelay: "0.15s" }}>
            <StatsPanel issues={reviewData?.issues || []} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 glass border-l-4 border-l-red-500 animate-in">
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {reviewData && (
          <div className="mt-8 animate-in" style={{ animationDelay: "0.2s" }}>
            <ReviewResults
              score={reviewData.score}
              summary={reviewData.summary}
              issues={reviewData.issues}
              metrics={reviewData.metrics}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-sm text-gray-600">
            AI Code Review Agent · Built with Next.js + TypeScript + Tailwind
            CSS
          </p>
        </footer>
      </div>
    </div>
  );
}
