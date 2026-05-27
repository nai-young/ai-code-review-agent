"use client";

import { Shield, Zap, FileCode, Type, Lightbulb } from "lucide-react";
import type { Issue, Severity, Category } from "@/lib/types";

interface IssueCardProps {
  issue: Issue;
}

interface SeverityConfig {
  icon: typeof Shield;
  color: string;
  dot: string;
  label: string;
}

const severityConfig: Record<Severity, SeverityConfig> = {
  critical: {
    icon: Shield,
    color: "bg-red-500/15 text-red-400 border-red-500/25",
    dot: "bg-red-500",
    label: "Critical",
  },
  warning: {
    icon: Zap,
    color: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    dot: "bg-amber-500",
    label: "Warning",
  },
  info: {
    icon: Lightbulb,
    color: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    dot: "bg-blue-500",
    label: "Info",
  },
};

interface CategoryConfig {
  icon: typeof Shield;
  label: string;
}

const categoryConfig: Record<Category, CategoryConfig> = {
  security: { icon: Shield, label: "Security" },
  performance: { icon: Zap, label: "Performance" },
  style: { icon: FileCode, label: "Style" },
  "best-practice": { icon: Lightbulb, label: "Best Practice" },
  "type-safety": { icon: Type, label: "Type Safety" },
};

export default function IssueCard({ issue }: IssueCardProps): React.JSX.Element {
  const sev = severityConfig[issue.severity];
  const cat = categoryConfig[issue.category];
  const SeverityIcon = sev.icon;
  const CategoryIcon = cat.icon;

  const borderClass =
    issue.severity === "critical"
      ? "border-l-red-500"
      : issue.severity === "warning"
        ? "border-l-amber-500"
        : "border-l-blue-500";

  return (
    <div className={`glass border-l-4 ${borderClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${sev.color}`}>
            <SeverityIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">{issue.message}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sev.color}`}>
                {sev.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <CategoryIcon className="w-3 h-3" />
                {cat.label}
              </div>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-500 font-mono">Line {issue.line}</span>
            </div>
          </div>
        </div>
      </div>

      {issue.codeSnippet && (
        <div className="mt-4 p-3 rounded-xl bg-[#111118] border border-white/[0.06] font-mono text-xs text-gray-400 overflow-x-auto">
          {issue.codeSnippet}
        </div>
      )}

      <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
        <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-200/80 leading-relaxed">{issue.suggestion}</p>
      </div>
    </div>
  );
}
