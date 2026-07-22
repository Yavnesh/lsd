"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Folder, FolderOpen, FileText, ChevronRight, ChevronDown, CheckCircle, RefreshCw } from "lucide-react";

export default function ContentTree() {
  const [worlds, setWorlds] = useState<any[]>([]);
  const [expandedWorlds, setExpandedWorlds] = useState<Record<string, boolean>>({});
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // New item states
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldEmoji, setNewWorldEmoji] = useState("🌐");
  const [newRegionName, setNewRegionName] = useState("");
  const [selectedWorldId, setSelectedWorldId] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/worlds");
      if (res.ok) {
        const data = await res.json();
        setWorlds(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorld = (id: string) => {
    setExpandedWorlds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRegion = (id: string) => {
    setExpandedRegions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorldName) return;
    try {
      const res = await fetch("/api/admin/worlds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWorldName, emoji: newWorldEmoji }),
      });
      if (res.ok) {
        setNewWorldName("");
        fetchStructure();
        setMessage("World created successfully.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegionName || !selectedWorldId) return;
    try {
      const res = await fetch("/api/admin/regions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRegionName, worldId: selectedWorldId }),
      });
      if (res.ok) {
        setNewRegionName("");
        fetchStructure();
        setMessage("Region created successfully.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <h2 className="text-2xl font-display font-bold uppercase tracking-wide">Curriculum Hierarchy Manager</h2>
        <button
          onClick={fetchStructure}
          className="bg-background border border-border text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Tree
        </button>
      </div>

      {message && (
        <div className="p-3 text-xs text-brand-primary font-bold bg-brand-primary/5 rounded border border-brand-primary/10 w-fit">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Content Tree View */}
        <div className="lg:col-span-2 bg-background-light border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-2">Platform Worlds</h3>

          {isLoading ? (
            <div className="p-12 text-center text-text-secondary animate-pulse text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading curriculum tree...
            </div>
          ) : (
            <div className="space-y-3">
              {worlds.map((world) => {
                const wExpanded = !!expandedWorlds[world.id];
                return (
                  <div key={world.id} className="border border-border rounded-lg overflow-hidden">
                    <div
                      onClick={() => toggleWorld(world.id)}
                      className="bg-background-dark/30 hover:bg-background-dark/50 p-3.5 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {wExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span className="text-xl">{world.emoji || "🌐"}</span>
                        <span className="font-bold text-sm">{world.name}</span>
                      </div>
                      <span className="text-[10px] text-text-secondary font-bold uppercase px-2 py-0.5 bg-background border border-border rounded">
                        {world.regions?.length || 0} Regions
                      </span>
                    </div>

                    {wExpanded && (
                      <div className="p-3 bg-background/25 border-t border-border space-y-2 pl-6">
                        {world.regions?.length === 0 ? (
                          <div className="text-xs text-text-secondary italic">No regions inside this world.</div>
                        ) : (
                          world.regions.map((reg: any) => {
                            const rExpanded = !!expandedRegions[reg.id];
                            return (
                              <div key={reg.id} className="border border-border/40 rounded-lg">
                                <div
                                  onClick={() => toggleRegion(reg.id)}
                                  className="bg-background-dark/20 p-2.5 flex items-center justify-between cursor-pointer text-xs"
                                >
                                  <div className="flex items-center gap-1.5 font-semibold">
                                    {rExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    <Folder className="w-3.5 h-3.5 text-brand-primary" />
                                    {reg.name}
                                  </div>
                                  <span className="text-[9px] text-text-secondary">
                                    {reg.missions?.length || 0} Missions
                                  </span>
                                </div>

                                {rExpanded && (
                                  <div className="p-2 border-t border-border/30 bg-background/10 space-y-1 pl-6 text-xs">
                                    {reg.missions?.length === 0 ? (
                                      <div className="text-[10px] text-text-secondary italic p-1">No missions enqueued.</div>
                                    ) : (
                                      reg.missions.map((mis: any) => (
                                        <div key={mis.id} className="flex items-center justify-between p-1.5 hover:bg-background-dark/20 rounded">
                                          <div className="flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-text-secondary" />
                                            <span>
                                              Quiz {mis.sequenceOrder}: <span className="font-bold">{mis.name}</span>
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${mis.difficulty === "HARD" ? "bg-red-500/10 text-red-400" : mis.difficulty === "MEDIUM" ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-success/10 text-brand-success"}`}>
                                              {mis.difficulty}
                                            </span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${mis.status === "PUBLISHED" ? "bg-brand-primary/10 text-brand-primary" : "bg-background border border-border text-text-secondary"}`}>
                                              {mis.status}
                                            </span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Creators Panel */}
        <div className="space-y-6">
          {/* Add World */}
          <div className="bg-background-light border border-border rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">Create New World</h4>
            <form onSubmit={handleCreateWorld} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">World Name</label>
                <input
                  type="text"
                  value={newWorldName}
                  onChange={(e) => setNewWorldName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                  placeholder="e.g. History Realm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">Emoji Icon</label>
                <input
                  type="text"
                  value={newWorldEmoji}
                  onChange={(e) => setNewWorldEmoji(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-primary text-background font-bold py-2 rounded-lg text-xs"
              >
                Insert World Model
              </button>
            </form>
          </div>

          {/* Add Region */}
          <div className="bg-background-light border border-border rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">Create New Region</h4>
            <form onSubmit={handleCreateRegion} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">Parent World</label>
                <select
                  value={selectedWorldId}
                  onChange={(e) => setSelectedWorldId(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                >
                  <option value="">Select world...</option>
                  {worlds.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.emoji} {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">Region Name</label>
                <input
                  type="text"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                  placeholder="e.g. Circular Sleep cycles"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-primary text-background font-bold py-2 rounded-lg text-xs"
              >
                Insert Region Model
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
