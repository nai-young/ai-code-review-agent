"use client";

import { useCallback, useState } from "react";
import type { ReviewData } from "@/lib/types";
import CodeInput from "@/components/code-input";
import ReviewResults from "@/components/review-results";
import StatsPanel from "@/components/stats-panel";
// @ts-ignore: Allow side-effect import of global CSS in Next.js app
import "./globals.css";

export default function HomePage(): React.JSX.Element {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = useCallback(async (code: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ReviewData = await res.json();
      setReviewData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze code";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0c12] text-[#f0f0f5]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
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
          <div className="lg:col-span-2">
            <CodeInput onReview={handleReview} loading={loading} />
          </div>

          {/* Right: Stats */}
          <div>
            <StatsPanel issues={reviewData?.issues ?? []} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 glass border-l-4 border-l-red-500">
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {reviewData && (
          <div className="mt-8">
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
            CSS · Powered by{" "}
            <a
              href="https://groq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition"
            >
              Groq
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
