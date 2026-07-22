"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Award, BookOpen, AlertTriangle, RefreshCw } from "lucide-react";

export default function ContentInsights() {
  const [summary, setSummary] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setTopics(data.topics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold uppercase tracking-wide">Content Insights & Analytics</h2>
        <button
          onClick={fetchAnalytics}
          className="bg-background border border-border hover:bg-background-dark text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-text-secondary animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
          Fetching platform analytics...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background-light p-5 rounded-xl border border-border flex items-center justify-between">
              <div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Total Registered Users</div>
                <div className="text-2xl font-bold font-display mt-1">{summary?.totalUsers || 0}</div>
              </div>
              <Users className="w-8 h-8 text-brand-primary opacity-20" />
            </div>

            <div className="bg-background-light p-5 rounded-xl border border-border flex items-center justify-between">
              <div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Average Player ELO</div>
                <div className="text-2xl font-bold font-display mt-1 text-brand-success">{summary?.averageElo || 1000}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-brand-success opacity-20" />
            </div>

            <div className="bg-background-light p-5 rounded-xl border border-border flex items-center justify-between">
              <div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Average Streak Days</div>
                <div className="text-2xl font-bold font-display mt-1 text-brand-gold">🔥 {summary?.averageStreak || 0}</div>
              </div>
              <Award className="w-8 h-8 text-brand-gold opacity-20" />
            </div>

            <div className="bg-background-light p-5 rounded-xl border border-border flex items-center justify-between">
              <div>
                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Completed Activities</div>
                <div className="text-2xl font-bold font-display mt-1">{summary?.totalActivities || 0}</div>
              </div>
              <BookOpen className="w-8 h-8 text-text-secondary opacity-20" />
            </div>
          </div>

          {/* Topics analytics table */}
          <div className="bg-background-light border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-primary" />
              Lesson Level Performance
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-background-dark/50 border-b border-border text-xs font-bold text-text-secondary uppercase">
                    <th className="p-3">Topic</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">ELO Rating</th>
                    <th className="p-3">Completions</th>
                    <th className="p-3">Quiz Success Rate</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topics.map((t) => {
                    const isHard = t.successRate < 60;
                    const isEasy = t.successRate > 90 && t.completions > 2;

                    return (
                      <tr key={t.id} className="hover:bg-background-dark/10 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{t.emoji}</span>
                            <span className="font-bold">{t.title}</span>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-text-secondary">
                          {t.season} / <span className="text-text-primary">{t.cluster}</span>
                        </td>
                        <td className="p-3 font-mono font-medium">{t.difficultyRating}</td>
                        <td className="p-3">{t.completions} completions</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-background-dark h-2 rounded-full overflow-hidden border border-border">
                              <div
                                className={`h-full rounded-full ${isHard ? "bg-red-500" : t.successRate < 80 ? "bg-brand-gold" : "bg-brand-success"}`}
                                style={{ width: `${t.successRate}%` }}
                              />
                            </div>
                            <span className={`font-mono font-bold text-xs ${isHard ? "text-red-400" : t.successRate < 80 ? "text-brand-gold" : "text-brand-success"}`}>
                              {t.successRate}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          {isHard ? (
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded flex items-center gap-1 w-fit ml-auto">
                              <AlertTriangle className="w-3 h-3" /> TOO HARD
                            </span>
                          ) : isEasy ? (
                            <span className="text-[10px] font-bold text-brand-success bg-brand-success/10 border border-brand-success/20 px-2 py-0.5 rounded w-fit ml-auto block">
                              TOO EASY
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-text-secondary bg-background border border-border px-2 py-0.5 rounded w-fit ml-auto block">
                              BALANCED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
