"use client";

import { useState, useEffect } from "react";
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, AlertCircle } from "lucide-react";

export default function SuggestionsQueue() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/suggestions");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerGenerator = async () => {
    setIsLoading(true);
    setMessage("AI is planning curriculum updates...");
    try {
      const res = await fetch("/api/admin/suggestions", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.items);
        setMessage("Content suggestions generated successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessSuggestion = async (id: string, action: "APPROVE" | "REJECT") => {
    setIsProcessingId(id);
    setMessage("");
    try {
      const res = await fetch("/api/admin/suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        setMessage(`Suggestion successfully ${action.toLowerCase()}d.`);
        fetchSuggestions();
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <h2 className="text-2xl font-display font-bold uppercase tracking-wide">AI Curriculum Suggestions</h2>
        <button
          onClick={handleTriggerGenerator}
          disabled={isLoading}
          className="bg-brand-primary text-background font-bold px-4 py-2.5 rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50 transition-opacity hover:opacity-90 animate-pulse"
        >
          <Sparkles className="w-4 h-4" />
          Trigger Suggestions Planner
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-text-secondary animate-pulse text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-primary" />
          Analyzing existing topics for gaps...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="p-12 text-center bg-background-light border border-border border-dashed rounded-xl text-text-secondary text-sm">
          No suggestions currently in queue. Click the button above to trigger an autonomous curriculum analysis run.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((item) => (
            <div key={item.id} className="bg-background-light border border-border rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-brand-primary/30 transition-colors">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${item.type === "WORLD" ? "bg-purple-500/10 text-purple-400" : item.type === "REGION" ? "bg-blue-500/10 text-blue-400" : "bg-brand-gold/10 text-brand-gold"}`}>
                    SUGGESTED {item.type}
                  </span>
                  <span className="text-[10px] text-text-secondary font-bold">Confidence: {Math.round(item.confidence * 100)}%</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  {item.parentName && (
                    <p className="text-[10px] text-text-secondary">Parent: <span className="text-text-primary">{item.parentName}</span></p>
                  )}
                </div>

                <p className="text-xs text-text-secondary leading-relaxed bg-background/50 p-2.5 rounded border border-border/20">
                  {item.reason}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-3">
                <div className="flex gap-2 text-[10px] text-text-secondary">
                  <span>Popularity: <span className="text-brand-success font-bold">{item.estimatedPopularity || "HIGH"}</span></span>
                  <span>•</span>
                  <span>Difficulty: <span className="text-brand-gold font-bold">{item.estimatedDifficulty || "MEDIUM"}</span></span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleProcessSuggestion(item.id, "REJECT")}
                    disabled={isProcessingId !== null}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleProcessSuggestion(item.id, "APPROVE")}
                    disabled={isProcessingId !== null}
                    className="p-1.5 text-brand-success hover:bg-brand-success/10 rounded transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
