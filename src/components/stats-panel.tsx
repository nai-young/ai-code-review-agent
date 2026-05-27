"use client";

import { useMemo } from "react";
import { Shield, Zap, FileCode, Type, Lightbulb } from "lucide-react";
import type { Issue, Category } from "@/lib/types";

interface StatsPanelProps {
  issues: Issue[];
}

interface CategoryConfig {
  id: Category;
  label: string;
  icon: typeof Shield;
  color: string;
  bg: string;
  border: string;
}

const categories: CategoryConfig[] = [
  { id: "security", label: "Security", icon: Shield, color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/25" },
  { id: "performance", label: "Performance", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/25" },
  { id: "style", label: "Style", icon: FileCode, color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/25" },
  { id: "best-practice", label: "Best Practice", icon: Lightbulb, color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/25" },
  { id: "type-safety", label: "Type Safety", icon: Type, color: "text-pink-400", bg: "bg-pink-500/15", border: "border-pink-500/25" },
];

export default function StatsPanel({ issues }: StatsPanelProps): React.JSX.Element {
  const counts = useMemo<Record<Category, number>>(() => {
    const map: Record<string, number> = {};
    for (const issue of issues) {
      map[issue.category] = (map[issue.category] ?? 0) + 1;
    }
    return map as Record<Category, number>;
  }, [issues]);

  return (
    <div className="glass">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">Review Categories</h3>
          <p className="text-xs text-gray-500">What we analyze</p>
        </div>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = counts[cat.id] ?? 0;
          return (
            <div key={cat.id} className={`flex items-center justify-between p-3 rounded-xl ${cat.bg} border ${cat.border}`}>
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${cat.color}`} />
                <span className="text-sm font-medium text-gray-200">{cat.label}</span>
              </div>
              <span className={`text-sm font-bold ${cat.color}`}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
