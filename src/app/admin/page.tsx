"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Navbar 
} from "@/components/layout/Navbar";
import { 
  Play, Check, AlertCircle, Trash2, Edit2, BarChart2, Users, Settings, 
  Terminal, Layers, RefreshCw, Cpu, Eye, Save, Sparkles, BookOpen 
} from "lucide-react";
import UserManagement from "./components/UserManagement";
import PromptSandbox from "./components/PromptSandbox";
import ContentInsights from "./components/ContentInsights";
import ContentTree from "./components/ContentTree";
import SuggestionsQueue from "./components/SuggestionsQueue";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState<"dashboard" | "queue" | "tree" | "suggestions" | "studio" | "analytics" | "users" | "settings">("dashboard");

  // Core Data States
  const [drafts, setDrafts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>(["[Admin UI] System initialized. Ready."]);

  // AI Pipeline Trigger form states
  const [season, setSeason] = useState("Understand Yourself");
  const [cluster, setCluster] = useState("Personality");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [isQueueing, setIsQueueing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<number>(0);

  // Edit / Curation state
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editSlides, setEditSlides] = useState<any>(null);
  const [editQuiz, setEditQuiz] = useState<any>(null);

  // Global settings state
  const [streakShieldCost, setStreakShieldCost] = useState("100");
  const [livesCooldown, setLivesCooldown] = useState("30");

  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Load Initial Data
  useEffect(() => {
    if (session && (session.user as any)?.role === "ADMIN") {
      fetchDrafts();
      fetchUsers();
    }
  }, [session]);

  // Redirect unauthenticated or non-admin users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.replace("/learn");
    }
  }, [status, session, router]);

  // Poll Active generation Job status
  useEffect(() => {
    let intervalId: any;
    if (currentJobId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/admin/pipeline/status/${currentJobId}`);
          if (res.ok) {
            const data = await res.json();
            setJobProgress(data.progress);
            setLogs((prev) => [...prev, ...data.logs.slice(prev.length)]);
            if (data.status === "COMPLETED") {
              setCurrentJobId(null);
              setIsQueueing(false);
              setStatusMessage("AI Generation complete! Draft added to queue.");
              fetchDrafts();
            } else if (data.status === "FAILED") {
              setCurrentJobId(null);
              setIsQueueing(false);
              setIsError(true);
              setStatusMessage(`Generation failed: ${data.error}`);
            }
          }
        } catch (e) {
          console.error("Error polling job status:", e);
        }
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [currentJobId]);

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/admin/drafts");
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    } catch (e) {
      console.error("Error fetching drafts:", e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/topics"); // Fetching user/metadata details from topics API as mock dashboard
      // Standard fetch of users list
      const usersRes = await fetch("/api/user/stats"); // Using ELO / stats as users data endpoint
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data || []);
      }
    } catch (e) {
      console.error("Error fetching users list:", e);
    }
  };

  const handleTriggerPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQueueing(true);
    setIsError(false);
    setStatusMessage("Enqueueing job...");
    setLogs((prev) => [...prev, `[Queue] Sending request to generate topic for cluster: ${cluster}...`]);

    try {
      const res = await fetch("/api/admin/pipeline/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season, dayOfWeek: Number(dayOfWeek), cluster }),
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentJobId(data.jobId);
        setJobProgress(0);
        setStatusMessage(`Job enqueued. ID: ${data.jobId}`);
      } else {
        setIsError(true);
        setStatusMessage(data.error || "Failed to trigger pipeline");
        setIsQueueing(false);
      }
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(err.message || "Failed to trigger pipeline");
      setIsQueueing(false);
    }
  };

  const handleSelectDraft = (draft: any) => {
    setSelectedDraft(draft);
    setEditTitle(draft.title);
    setEditEmoji(draft.emoji || "🧠");
    setEditSummary(draft.summary || "");
    setEditSlides(draft.content?.slides || {
      hook: "", memeCaption: "", memeSearchPrompt: "", revealText: "", whyItMatters: { career: "", money: "", relationships: "" }, mindBlowingFact: ""
    });
    setEditQuiz(draft.content?.quiz || {
      question: "", options: ["", "", "", ""], correctIndex: 0, explanation: ""
    });
  };

  const handleSaveDraft = async (publish: boolean = false) => {
    if (!selectedDraft) return;
    setStatusMessage("Saving draft changes...");
    setIsError(false);

    try {
      const res = await fetch("/api/admin/drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDraft.id,
          title: editTitle,
          emoji: editEmoji,
          summary: editSummary,
          slides: editSlides,
          quiz: editQuiz,
          type: publish ? "DAILY" : "DRAFT",
        }),
      });

      if (res.ok) {
        setStatusMessage(publish ? "Draft published successfully!" : "Draft updates saved.");
        setSelectedDraft(null);
        fetchDrafts();
      } else {
        const data = await res.json();
        setIsError(true);
        setStatusMessage(data.error || "Failed to save draft");
      }
    } catch (e: any) {
      setIsError(true);
      setStatusMessage(e.message || "Failed to save draft");
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm("Are you sure you want to discard this draft?")) return;
    try {
      const res = await fetch(`/api/admin/drafts?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDrafts();
        if (selectedDraft?.id === id) setSelectedDraft(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "loading" || status === "unauthenticated" || (session && (session.user as any)?.role !== "ADMIN")) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-text-secondary font-bold font-display uppercase tracking-widest animate-pulse">
            {status === "loading" ? "Loading..." : "Redirecting..."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row pt-20">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-background-light border-b md:border-b-0 md:border-r border-border p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Admin Workspace
          </div>
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "dashboard" ? "bg-brand-primary text-background" : "hover:bg-background-dark text-text-secondary"}`}
          >
            <Cpu className="w-4 h-4" />
            AI Pipeline & Health
          </button>
          <button 
            onClick={() => setActiveTab("tree")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "tree" ? "bg-brand-primary text-background" : "hover:bg-background-dark text-text-secondary"}`}
          >
            <BookOpen className="w-4 h-4" />
            Content Map Tree
          </button>
          <button 
            onClick={() => setActiveTab("suggestions")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "suggestions" ? "bg-brand-primary text-background" : "hover:bg-background-dark text-text-secondary"}`}
          >
            <Sparkles className="w-4 h-4" />
            AI Suggestions Queue
          </button>
          <button 
            onClick={() => setActiveTab("queue")} 
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "queue" ? "bg-brand-primary text-background" : "hover:bg-background-dark text-text-secondary"}`}
          >
            <span className="flex items-center gap-3">
              <Layers className="w-4 h-4" />
              Review Queue
            </span>
            {drafts.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "queue" ? "bg-background text-brand-primary" : "bg-brand-primary text-background"}`}>
                {drafts.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab("studio")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "studio" ? "bg-brand-primary text-background" : "hover:bg-background-dark text-text-secondary"}`}
          >
            <Sparkles className="w-4 h-4" />
            AI Studio Sandbox
          </button>
          <button 
            onClick={() => setActiveTab("analytics")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "analytics" ? "bg-brand-primary text-background" : "hover:bg-background-dark text-text-secondary"}`}
          >
            <BarChart2 className="w-4 h-4" />
            Content Insights
          </button>
          <button 
            onClick={() => setActiveTab("users")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "users" ? "bg-brand-primary text-background" : "hover:bg-background-dark text-text-secondary"}`}
          >
            <Users className="w-4 h-4" />
            User Management
          </button>
          <button 
            onClick={() => setActiveTab("settings")} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "settings" ? "bg-brand-primary text-background" : "hover:bg-background-dark text-text-secondary"}`}
          >
            <Settings className="w-4 h-4" />
            Global Settings
          </button>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {statusMessage && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${isError ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-green-500/10 border-green-500/30 text-green-400"}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{statusMessage}</p>
            </div>
          )}

          {/* Tab 1: Dashboard / AI Generation */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-display uppercase tracking-wide">AI Pipeline & Health Dashboard</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-background-light p-5 rounded-xl border border-border">
                  <div className="text-xs text-text-secondary font-medium uppercase">Total Topics Active</div>
                  <div className="text-3xl font-bold font-display mt-2">189</div>
                </div>
                <div className="bg-background-light p-5 rounded-xl border border-border">
                  <div className="text-xs text-text-secondary font-medium uppercase">Pending Drafts</div>
                  <div className="text-3xl font-bold font-display mt-2 text-brand-primary">{drafts.length}</div>
                </div>
                <div className="bg-background-light p-5 rounded-xl border border-border">
                  <div className="text-xs text-text-secondary font-medium uppercase">Pipeline Status</div>
                  <div className="text-sm font-bold font-display mt-3 px-2.5 py-1 rounded bg-green-500/10 text-green-400 w-fit">
                    ACTIVE
                  </div>
                </div>
                <div className="bg-background-light p-5 rounded-xl border border-border">
                  <div className="text-xs text-text-secondary font-medium uppercase">API Keys Status</div>
                  <div className="text-sm font-bold font-display mt-3 px-2.5 py-1 rounded bg-brand-primary/10 text-brand-primary w-fit">
                    VERIFIED
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generation Controller */}
                <div className="bg-background-light p-6 rounded-xl border border-border space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-brand-primary" />
                    Trigger Multi-Agent Generation
                  </h3>
                  <form onSubmit={handleTriggerPipeline} className="space-y-4">
                    <div>
                      <label className="text-xs text-text-secondary font-bold block mb-1">Theme Season</label>
                      <select 
                        value={season} 
                        onChange={(e) => setSeason(e.target.value)} 
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                      >
                        <option>Understand Yourself</option>
                        <option>Surviving The Internet</option>
                        <option>Your Body Explained</option>
                        <option>Think Better</option>
                        <option>Money Without The Boring Stuff</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-text-secondary font-bold block mb-1">Target Cluster</label>
                        <input 
                          type="text" 
                          value={cluster} 
                          onChange={(e) => setCluster(e.target.value)} 
                          className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary font-bold block mb-1">Day of Week (1-7)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="7" 
                          value={dayOfWeek} 
                          onChange={(e) => setDayOfWeek(e.target.value)} 
                          className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isQueueing}
                      className="w-full bg-brand-primary text-background font-bold p-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Queue Agent Sequence
                    </button>
                  </form>

                  {isQueueing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-text-secondary">
                        <span>Generation Progress</span>
                        <span>{jobProgress}%</span>
                      </div>
                      <div className="w-full bg-background-dark h-2.5 rounded-full overflow-hidden border border-border">
                        <div 
                          className="bg-brand-primary h-full transition-all duration-500" 
                          style={{ width: `${jobProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Console Log output */}
                <div className="bg-background-dark border border-border rounded-xl p-5 flex flex-col h-[340px]">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-brand-primary" />
                      Orchestrator Logs Console
                    </h3>
                    <button 
                      onClick={() => setLogs(["[Admin UI] Console cleared."])} 
                      className="text-xs text-text-secondary hover:text-text-primary"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs text-green-400/90 leading-relaxed scrollbar-thin">
                    {logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Review Queue & Content Editor */}
          {activeTab === "queue" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-display uppercase tracking-wide">Pending Review Curation Queue</h2>

              {!selectedDraft ? (
                <div className="bg-background-light rounded-xl border border-border divide-y divide-border">
                  {drafts.length === 0 ? (
                    <div className="p-10 text-center space-y-2 text-text-secondary">
                      <BookOpen className="w-10 h-10 mx-auto opacity-40" />
                      <p className="font-bold">No drafts pending review</p>
                      <p className="text-xs">Trigger the generator on the Dashboard to seed new content.</p>
                    </div>
                  ) : (
                    drafts.map((draft) => (
                      <div key={draft.id} className="p-4 flex items-center justify-between hover:bg-background-dark/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{draft.emoji || "💡"}</span>
                          <div>
                            <h4 className="font-bold">{draft.title}</h4>
                            <p className="text-xs text-text-secondary">Season: {draft.season} | Cluster: {draft.cluster} | Day {draft.dayOfWeek}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleSelectDraft(draft)} 
                            className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-background p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Curate & Publish
                          </button>
                          <button 
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-background p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left Side: Mock UI Preview */}
                  <div className="bg-background-light border border-border p-6 rounded-2xl shadow-xl space-y-4 lg:sticky lg:top-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="text-xs font-bold text-text-secondary uppercase flex items-center gap-2">
                        <Eye className="w-4 h-4 text-brand-primary" />
                        Card Loop Simulator (Mobile view)
                      </span>
                      <button 
                        onClick={() => setSelectedDraft(null)} 
                        className="text-xs text-text-secondary hover:text-text-primary"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="border border-border rounded-xl bg-background p-5 max-w-sm mx-auto aspect-[9/16] flex flex-col justify-between shadow-2xl relative overflow-hidden">
                      <div className="flex justify-between items-center text-xs font-bold text-text-secondary">
                        <span className="flex items-center gap-1">
                          {editEmoji} {editTitle || "Untitled Topic"}
                        </span>
                        <span>Slide 3 of 7</span>
                      </div>

                      <div className="flex-1 flex flex-col justify-center space-y-4 my-6">
                        <h4 className="text-lg font-bold leading-snug text-brand-primary">The Reveal 🔓</h4>
                        <p className="text-sm leading-relaxed text-text-primary">
                          {editSlides?.revealText || "Scientific explanation goes here..."}
                        </p>
                      </div>

                      <div className="border-t border-border pt-4 text-center">
                        <button className="w-full bg-brand-primary text-background font-bold text-xs uppercase py-2.5 rounded-lg">
                          Tap to Unlock "Why It Matters"
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Form Editor */}
                  <div className="bg-background-light border border-border p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold border-b border-border pb-2">Edit Draft Content</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-text-secondary block mb-1">Topic Title</label>
                        <input 
                          type="text" 
                          value={editTitle} 
                          onChange={(e) => setEditTitle(e.target.value)} 
                          className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-bold text-text-secondary block mb-1">Emoji</label>
                          <input 
                            type="text" 
                            value={editEmoji} 
                            onChange={(e) => setEditEmoji(e.target.value)} 
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-bold text-text-secondary block mb-1">Summary Teaser</label>
                          <input 
                            type="text" 
                            value={editSummary} 
                            onChange={(e) => setEditSummary(e.target.value)} 
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                          />
                        </div>
                      </div>

                      {/* Slides blocks */}
                      <h4 className="text-sm font-bold text-brand-primary pt-2 border-t border-border/50">Slides Content</h4>
                      
                      <div>
                        <label className="text-xs font-bold text-text-secondary block mb-1">Slide 1: Hook (Curiosity trigger)</label>
                        <textarea 
                          rows={2}
                          value={editSlides?.hook || ""} 
                          onChange={(e) => setEditSlides({ ...editSlides, hook: e.target.value })} 
                          className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-text-secondary block mb-1">Slide 3: Reveal Text (Science / Mechanics)</label>
                        <textarea 
                          rows={3}
                          value={editSlides?.revealText || ""} 
                          onChange={(e) => setEditSlides({ ...editSlides, revealText: e.target.value })} 
                          className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                        />
                      </div>

                      {/* Quiz Blocks */}
                      <h4 className="text-sm font-bold text-brand-primary pt-2 border-t border-border/50">Quiz (Slide 5)</h4>
                      <div>
                        <label className="text-xs font-bold text-text-secondary block mb-1">Quiz Question</label>
                        <input 
                          type="text" 
                          value={editQuiz?.question || ""} 
                          onChange={(e) => setEditQuiz({ ...editQuiz, question: e.target.value })} 
                          className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {editQuiz?.options?.map((opt: string, idx: number) => (
                          <div key={idx}>
                            <label className="text-[10px] font-bold text-text-secondary block mb-0.5">Option {idx + 1}</label>
                            <input 
                              type="text" 
                              value={opt} 
                              onChange={(e) => {
                                const newOpts = [...editQuiz.options];
                                newOpts[idx] = e.target.value;
                                setEditQuiz({ ...editQuiz, options: newOpts });
                              }} 
                              className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-text-secondary block mb-1">Correct Option Index</label>
                          <select 
                            value={editQuiz?.correctIndex || 0} 
                            onChange={(e) => setEditQuiz({ ...editQuiz, correctIndex: Number(e.target.value) })}
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                          >
                            <option value={0}>Option 1</option>
                            <option value={1}>Option 2</option>
                            <option value={2}>Option 3</option>
                            <option value={3}>Option 4</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-text-secondary block mb-1">Quiz Explanation</label>
                          <input 
                            type="text" 
                            value={editQuiz?.explanation || ""} 
                            onChange={(e) => setEditQuiz({ ...editQuiz, explanation: e.target.value })} 
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 border-t border-border pt-4">
                      <button 
                        onClick={() => handleSaveDraft(false)}
                        className="flex-1 bg-background border border-border hover:bg-background-dark font-bold p-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save Draft Changes
                      </button>
                      <button 
                        onClick={() => handleSaveDraft(true)}
                        className="flex-1 bg-brand-primary text-background hover:opacity-95 font-bold p-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Publish to Daily Stream
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Content Tree */}
          {activeTab === "tree" && <ContentTree />}

          {/* Tab 4: AI Suggestions */}
          {activeTab === "suggestions" && <SuggestionsQueue />}

          {/* Tab 5: AI Studio Sandbox */}
          {activeTab === "studio" && <PromptSandbox />}

          {/* Tab 6: Analytics */}
          {activeTab === "analytics" && <ContentInsights />}

          {/* Tab 7: User Management */}
          {activeTab === "users" && <UserManagement />}

          {/* Tab 6: Settings */}
          {activeTab === "settings" && (
            <div className="bg-background-light p-6 rounded-xl border border-border space-y-6">
              <h2 className="text-2xl font-bold font-display uppercase tracking-wide">Global Configurations</h2>
              
              <div className="max-w-md space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Streak Shield Cost (XP)</label>
                  <input 
                    type="number" 
                    value={streakShieldCost} 
                    onChange={(e) => setStreakShieldCost(e.target.value)} 
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Lives Refill Timeout (Minutes)</label>
                  <input 
                    type="number" 
                    value={livesCooldown} 
                    onChange={(e) => setLivesCooldown(e.target.value)} 
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
                  />
                </div>
                
                <button 
                  onClick={() => setStatusMessage("Global settings saved.")}
                  className="bg-brand-primary text-background font-bold px-4 py-2.5 rounded-lg text-sm"
                >
                  Save Global Rules
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
