"use client";

import { useMemo } from "react";
import { CheckCircle, FileText } from "lucide-react";
import type { Issue, ReviewMetrics } from "@/lib/types";
import IssueCard from "./issue-card";

interface ScoreRingProps {
  score: number;
}

function ScoreRing({ score }: ScoreRingProps): React.JSX.Element {
  const color = useMemo<string>(() => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  }, [score]);

  const stroke = useMemo<string>(() => {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "#fbbf24";
    return "#f87171";
  }, [score]);

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-black ${color}`}>{score}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
          Score
        </span>
      </div>
    </div>
  );
}

interface ReviewResultsProps {
  score: number;
  summary: string;
  issues: Issue[];
  metrics: ReviewMetrics;
}

export default function ReviewResults({
  score,
  summary,
  issues,
  metrics,
}: ReviewResultsProps): React.JSX.Element {
  const criticalCount = metrics.issuesBySeverity.critical ?? 0;
  const warningCount = metrics.issuesBySeverity.warning ?? 0;
  const infoCount = metrics.issuesBySeverity.info ?? 0;

  const categoryIcons: Record<string, string> = {
    security: "🔒",
    performance: "⚡",
    style: "🎨",
    "best-practice": "💡",
    "type-safety": "📐",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <ScoreRing score={score} />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">Review Results</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-md leading-relaxed">
              {summary}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-400">{criticalCount} Critical</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-gray-400">{warningCount} Warnings</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-400">{infoCount} Info</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center sm:text-right shrink-0">
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Lines Analyzed
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1">
            {metrics.totalLines}
          </div>
        </div>
      </div>

      {/* Categories breakdown */}
      {Object.keys(metrics.issuesByCategory).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(metrics.issuesByCategory).map(([category, count]) => (
            <div key={category} className="glass py-4 px-4 text-center">
              <div className="text-2xl mb-1">
                {categoryIcons[category] ?? "📋"}
              </div>
              <div className="text-lg font-bold text-white">{count}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                {category.replace("-", " ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issues list */}
      {issues.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-lg">Found Issues</h3>
            <span className="text-sm text-gray-500">({issues.length})</span>
          </div>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="glass text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">Clean Code!</p>
          <p className="text-sm text-gray-500 mt-2">
            No issues found. Your code looks great.
          </p>
        </div>
      )}
    </div>
  );
}
