"use client";

import { useCallback, useState } from "react";
import { Play, ClipboardPaste, Trash2, Loader2, Code2 } from "lucide-react";

interface CodeInputProps {
  onReview: (code: string) => void;
  loading: boolean;
}

const SAMPLE_CODE = `function getData(userId) {
  var result = any;
  if (userId == null) {
    console.log("Invalid user");
    return;
  }
  eval("fetch('/api/users/' + userId)");
  document.body.innerHTML = "<div>Loading...</div>";
  // TODO: add error handling
  return result;
}` as const;

export default function CodeInput({ onReview, loading }: CodeInputProps): React.JSX.Element {
  const [code, setCode] = useState<string>("");

  const handlePaste = useCallback(async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text);
    } catch {
      // Fallback if clipboard API not available
    }
  }, []);

  const handleReview = useCallback((): void => {
    if (code.trim()) {
      onReview(code);
    }
  }, [code, onReview]);

  const loadSample = useCallback((): void => {
    setCode(SAMPLE_CODE);
  }, []);

  const handleClear = useCallback((): void => {
    setCode("");
  }, []);

  return (
    <div className="glass flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Code Input</h2>
            <p className="text-xs text-gray-500">
              Paste your code for AI review
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSample}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-gray-300"
          >
            Load Sample
          </button>
          <button
            onClick={handlePaste}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-gray-300"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            Paste
          </button>
          <button
            onClick={handleClear}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-gray-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your JavaScript/TypeScript code here...\n\nExample:\nfunction example() {\n  console.log('test');\n}"
          className="w-full h-full min-h-[300px] bg-[#111118] border border-white/[0.08] rounded-xl p-5 text-sm font-mono text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 resize-none transition-all leading-relaxed"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
        {code.length > 0 && (
          <div className="absolute bottom-4 right-4 text-xs text-gray-600 font-mono">
            {code.split("\n").length} lines · {code.length} chars
          </div>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-white/[0.06]">
        <button
          onClick={handleReview}
          disabled={loading || !code.trim()}
          className="btn-primary w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Code...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Run AI Code Review
            </>
          )}
        </button>
      </div>
    </div>
  );
}
