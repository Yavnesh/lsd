"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Trophy, Flame, Zap, Award, Medal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardUser {
    xp: number;
    streak: number;
    level: string;
    user: {
        name: string;
        email: string;
        selectedAvatar: string;
    };
}

interface Standing {
    xpRank: number;
    streakRank: number;
    xp: number;
    streak: number;
}

export default function LeaderboardPage() {
    const { status } = useSession();
    const [activeTab, setActiveTab] = useState<"streak" | "xp">("streak");
    const [loading, setLoading] = useState(true);
    const [standing, setStanding] = useState<Standing | null>(null);
    const [topStreak, setTopStreak] = useState<LeaderboardUser[]>([]);
    const [topXp, setTopXp] = useState<LeaderboardUser[]>([]);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await fetch("/api/leaderboard");
                if (res.ok) {
                    const data = await res.json();
                    setTopStreak(data.topStreak || []);
                    setTopXp(data.topXp || []);
                    setStanding(data.standing || null);
                }
            } catch (e) {
                console.error("Failed to fetch leaderboard", e);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    const listToRender = activeTab === "streak" ? topStreak : topXp;

    const getMedalEmoji = (index: number) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return `#${index + 1}`;
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-lg text-text-secondary font-bold font-display uppercase tracking-widest animate-pulse">Calculating Standings...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pb-24 bg-background text-foreground">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 max-w-4xl">
                <header className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-6">
                        <Trophy className="w-4 h-4 text-brand-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Global Leaderboard</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight mb-4">
                        Platform <span className="gradient-text italic">Standings.</span>
                    </h1>
                    <p className="text-text-secondary text-lg max-w-xl mx-auto">
                        See how you stack up against the sharpest minds on the network.
                    </p>
                </header>

                {/* User Standing Section */}
                {standing && standing.xpRank > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 md:p-8 rounded-[2.5rem] bg-card border border-brand-primary/20 shadow-xl shadow-brand-primary/5 flex flex-col md:flex-row items-center justify-around gap-6 mb-12 text-center md:text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary">
                                <Award className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold font-display text-lg text-foreground">Your Rank Standing</h3>
                                <p className="text-text-secondary text-sm font-sans mt-0.5">Keep learning daily to secure your rank!</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Streak Rank</span>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <Flame className="w-5 h-5 text-brand-orange fill-brand-orange" />
                                    <span className="text-2xl font-black font-display text-brand-orange">#{standing.streakRank}</span>
                                </div>
                                <span className="text-xs text-text-secondary font-medium font-sans mt-0.5 block">{standing.streak} day streak</span>
                            </div>

                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">XP Rank</span>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <Zap className="w-5 h-5 text-brand-accent fill-brand-accent" />
                                    <span className="text-2xl font-black font-display text-brand-accent">#{standing.xpRank}</span>
                                </div>
                                <span className="text-xs text-text-secondary font-medium font-sans mt-0.5 block">{standing.xp} total XP</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-card p-1.5 border border-border rounded-full flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab("streak")}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === "streak"
                                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                                    : "text-text-secondary hover:text-foreground"
                            }`}
                        >
                            <Flame className="w-4 h-4" /> Streak Warriors
                        </button>
                        <button
                            onClick={() => setActiveTab("xp")}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === "xp"
                                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                                    : "text-text-secondary hover:text-foreground"
                            }`}
                        >
                            <Zap className="w-4 h-4" /> XP Champions
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="bg-card border border-border rounded-[3rem] card-shadow overflow-hidden">
                    {listToRender.length === 0 ? (
                        <div className="p-16 text-center text-text-secondary font-sans">
                            No leaderboard records compiled yet. Be the first to start learning!
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {listToRender.map((userStat, i) => {
                                const isTop3 = i < 3;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="p-5 flex items-center justify-between gap-4 hover:bg-brand-primary/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            {/* Rank Indicator */}
                                            <span className={`w-8 text-center font-display font-black text-lg ${
                                                i === 0 ? "text-2xl text-yellow-500" :
                                                i === 1 ? "text-2xl text-slate-400" :
                                                i === 2 ? "text-2xl text-amber-600" :
                                                "text-text-secondary text-sm"
                                            }`}>
                                                {getMedalEmoji(i)}
                                            </span>

                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-2xl relative overflow-hidden flex-shrink-0">
                                                {userStat.user?.selectedAvatar ? (
                                                    <span className="select-none">{userStat.user.selectedAvatar}</span>
                                                ) : (
                                                    <span className="select-none font-bold text-sm text-brand-primary">
                                                        {userStat.user?.name ? userStat.user.name.charAt(0).toUpperCase() : "?"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Name & Badge */}
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-foreground font-sans truncate text-base">{userStat.user?.name || "Anonymous User"}</h4>
                                                <span className="inline-block text-[9px] font-black uppercase tracking-widest text-brand-primary mt-0.5 bg-brand-primary/10 px-2 py-0.5 rounded-md">
                                                    {userStat.level}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Scores */}
                                        <div className="flex-shrink-0">
                                            {activeTab === "streak" ? (
                                                <div className="flex items-center gap-1.5 font-display font-black text-xl text-brand-orange">
                                                    <Flame className="w-5 h-5 fill-brand-orange" />
                                                    <span>{userStat.streak}</span>
                                                    <span className="text-[10px] opacity-60 font-medium font-sans uppercase tracking-wider ml-1">days</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 font-display font-black text-xl text-brand-accent">
                                                    <Zap className="w-5 h-5 fill-brand-accent" />
                                                    <span>{userStat.xp}</span>
                                                    <span className="text-[10px] opacity-60 font-medium font-sans uppercase tracking-wider ml-1">XP</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
