"use client";

import { useState, useEffect } from "react";
import { Sparkles, Save, Play, RefreshCw, AlertCircle, FileText } from "lucide-react";

export default function PromptSandbox() {
  const [prompts, setPrompts] = useState({
    planner: "",
    researcher: "",
    curriculum: "",
    questioner: "",
  });
  const [activeAgent, setActiveAgent] = useState<"planner" | "researcher" | "curriculum" | "questioner">("planner");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Evolved curriculum state
  const [worldName, setWorldName] = useState("Earning Mindset World");
  const [regionName, setRegionName] = useState("Compound Interest");
  const [sequenceOrder, setSequenceOrder] = useState("1");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  
  const [isRunningDry, setIsRunningDry] = useState(false);
  const [dryRunOutput, setDryRunOutput] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch("/api/admin/prompts");
      if (res.ok) {
        const data = await res.json();
        setPrompts(data);
      }
    } catch (e) {
      console.error("Error loading prompts:", e);
    }
  };

  const handleSavePrompts = async () => {
    setIsSaving(true);
    setMessage("");
    setIsError(false);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompts),
      });
      if (res.ok) {
        setMessage("System prompt templates saved successfully.");
      } else {
        setIsError(true);
        setMessage("Failed to save prompts configuration.");
      }
    } catch (e: any) {
      setIsError(true);
      setMessage(e.message || "Failed to save prompts.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDryRun = async () => {
    setIsRunningDry(true);
    setDryRunOutput(null);
    try {
      const res = await fetch("/api/admin/pipeline/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldName,
          regionName,
          sequenceOrder: Number(sequenceOrder),
          difficulty,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDryRunOutput(`Job queued successfully!\nJob ID: ${data.jobId}\nCheck the live logs on the Dashboard console to view results.`);
      } else {
        setDryRunOutput(`Dry Run Failed: ${data.error}`);
      }
    } catch (e: any) {
      setDryRunOutput(`Error: ${e.message}`);
    } finally {
      setIsRunningDry(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold uppercase tracking-wide">AI Studio Sandbox</h2>
        <button
          onClick={handleSavePrompts}
          disabled={isSaving}
          className="bg-brand-primary text-background font-bold px-4 py-2.5 rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50 transition-opacity hover:opacity-90"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save System Prompts
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${isError ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-green-500/10 border-green-500/30 text-green-400"}`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Agent Select & Edit Area */}
        <div className="lg:col-span-2 bg-background-light border border-border rounded-xl p-5 space-y-4">
          <div className="flex border-b border-border gap-2 pb-2">
            {(["planner", "researcher", "curriculum", "questioner"] as const).map((agent) => (
              <button
                key={agent}
                onClick={() => setActiveAgent(agent)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors ${activeAgent === agent ? "bg-brand-primary/10 text-brand-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                {agent} Agent
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Edit System Prompts Instructions</span>
              <span className="font-mono">{prompts[activeAgent]?.length || 0} characters</span>
            </div>
            <textarea
              rows={16}
              value={prompts[activeAgent] || ""}
              onChange={(e) => setPrompts({ ...prompts, [activeAgent]: e.target.value })}
              className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono leading-relaxed focus:outline-none focus:border-brand-primary scrollbar-thin"
              placeholder={`Enter prompt instructions for ${activeAgent} agent...`}
            />
          </div>
        </div>

        {/* Right Side: Dry Run Simulator */}
        <div className="bg-background-light border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-sm border-b border-border pb-3">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            Dry Run Simulator
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-1">Target World</label>
              <select
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs"
              >
                <option>Earning Mindset World</option>
                <option>Internet Nexus</option>
                <option>Cognitive Spire</option>
                <option>Self Awareness Sanctuary</option>
                <option>Bio-Dome Arena</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-secondary block mb-1">Region Name</label>
              <input
                type="text"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                placeholder="e.g. Compound Interest"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">Sequence Order</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={sequenceOrder}
                  onChange={(e) => setSequenceOrder(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleDryRun}
              disabled={isRunningDry}
              className="w-full bg-brand-primary text-background font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              {isRunningDry ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run Sandbox Generation
            </button>

            {dryRunOutput && (
              <div className="bg-background-dark border border-border rounded-lg p-3 space-y-1.5 font-mono text-[10px] text-green-400">
                <div className="flex items-center gap-1 text-text-secondary font-sans border-b border-border pb-1 mb-1 font-bold text-[9px] uppercase tracking-wider">
                  <FileText className="w-3 h-3" /> Output Result
                </div>
                <div className="whitespace-pre-wrap">{dryRunOutput}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
