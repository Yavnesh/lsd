"use client";

import { useState, useEffect } from "react";
import { Edit2, ShieldAlert, Award, Star, Search, RefreshCw, X, Save } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Edit fields
  const [editRole, setEditRole] = useState("USER");
  const [editPremium, setEditPremium] = useState(false);
  const [editStreak, setEditStreak] = useState("0");
  const [editXp, setEditXp] = useState("0");
  const [editLevel, setEditLevel] = useState("Curious Mind");
  const [editShields, setEditShields] = useState("1");
  const [editRating, setEditRating] = useState("1000");

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (query = "") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditRole(user.role || "USER");
    setEditPremium(user.isPremium || false);
    setEditStreak(String(user.stat?.streak || 0));
    setEditXp(String(user.stat?.xp || 0));
    setEditLevel(user.stat?.level || "Curious Mind");
    setEditShields(String(user.stat?.streakShields || 1));
    setEditRating(String(user.stat?.globalRating || 1000));
    setMessage("");
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setMessage("Saving adjustments...");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: editRole,
          isPremium: editPremium,
          streak: Number(editStreak),
          xp: Number(editXp),
          level: editLevel,
          streakShields: Number(editShields),
          globalRating: Number(editRating),
        }),
      });

      if (res.ok) {
        setMessage("User profile updated successfully!");
        setTimeout(() => setSelectedUser(null), 1000);
        fetchUsers(search);
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-display font-bold uppercase tracking-wide">User Account Directory</h2>
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background-dark border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-primary text-background font-bold px-4 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Users Table */}
        <div className="lg:col-span-2 bg-background-light border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-background-dark/50 border-b border-border text-xs font-bold text-text-secondary uppercase">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Streak</th>
                  <th className="p-4">XP / Level</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-secondary animate-pulse">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading directory...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-secondary">
                      No accounts found matching query.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-background-dark/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.selectedAvatar || u.defaultAvatar || `https://api.dicebear.com/9.x/bottts/svg?seed=${u.id}`}
                            className="w-9 h-9 rounded-full bg-background-dark border border-border"
                            alt="Avatar"
                          />
                          <div>
                            <div className="font-bold flex items-center gap-1">
                              {u.name || "Unnamed User"}
                              {u.isPremium && (
                                <Star className="w-3.5 h-3.5 fill-current text-brand-gold" />
                              )}
                            </div>
                            <div className="text-xs text-text-secondary">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${u.role === "ADMIN" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-brand-primary/10 text-brand-primary"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-brand-gold">🔥 {u.stat?.streak || 0}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-xs">{u.stat?.xp || 0} XP</div>
                        <div className="text-[10px] text-text-secondary">{u.stat?.level || "Curious Mind"}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-brand-success">
                        🛡️ {u.stat?.globalRating || 1000}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-background p-2 rounded-lg transition-colors text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adjustments Editor */}
        {selectedUser ? (
          <div className="bg-background-light border border-border rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-brand-primary" />
                Adjust Account Stat
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-text-secondary hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border">
                <img
                  src={selectedUser.selectedAvatar || selectedUser.defaultAvatar}
                  className="w-10 h-10 rounded-full border border-border"
                  alt="avatar"
                />
                <div>
                  <div className="font-bold text-sm">{selectedUser.name || "Anonymous"}</div>
                  <div className="text-xs text-text-secondary">{selectedUser.email}</div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">Privilege Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                >
                  <option value="USER">USER (Standard Access)</option>
                  <option value="ADMIN">ADMIN (Full Panel Control)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="premiumCheck"
                  checked={editPremium}
                  onChange={(e) => setEditPremium(e.target.checked)}
                  className="rounded border-border text-brand-primary"
                />
                <label htmlFor="premiumCheck" className="text-xs font-bold text-text-secondary">
                  Grant Premium Mastermind Status
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Streak Days</label>
                  <input
                    type="number"
                    value={editStreak}
                    onChange={(e) => setEditStreak(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Streak Shields</label>
                  <input
                    type="number"
                    value={editShields}
                    onChange={(e) => setEditShields(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">Total XP</label>
                  <input
                    type="number"
                    value={editXp}
                    onChange={(e) => setEditXp(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">ELO Arena Rating</label>
                  <input
                    type="number"
                    value={editRating}
                    onChange={(e) => setEditRating(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">Title Tier</label>
                <input
                  type="text"
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs"
                />
              </div>

              {message && (
                <div className="text-xs text-brand-primary font-bold bg-brand-primary/5 p-2.5 rounded border border-brand-primary/10">
                  {message}
                </div>
              )}

              <button
                onClick={handleUpdateUser}
                className="w-full bg-brand-primary text-background font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 hover:opacity-90"
              >
                <Save className="w-3.5 h-3.5" />
                Commit adjustments
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-background-light border border-border border-dashed rounded-xl p-8 text-center text-text-secondary text-xs">
            <Award className="w-8 h-8 opacity-30 mx-auto mb-2 text-brand-primary" />
            Select an account to view and adjust streaks, roles, and stats.
          </div>
        )}
      </div>
    </div>
  );
}
