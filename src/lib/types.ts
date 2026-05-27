export type Severity = "critical" | "warning" | "info";
export type Category = "security" | "performance" | "style" | "best-practice" | "type-safety";

export interface Issue {
  id: string;
  severity: Severity;
  category: Category;
  line: number;
  message: string;
  suggestion: string;
  codeSnippet: string;
}

export interface ReviewMetrics {
  totalLines: number;
  issuesByCategory: Record<string, number>;
  issuesBySeverity: Record<string, number>;
}

export interface ReviewData {
  score: number;
  summary: string;
  issues: Issue[];
  metrics: ReviewMetrics;
}
