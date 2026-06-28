"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Flame, Zap, Crown, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardUser {
    xp: number;
    streak: number;
    level: string;
    user: { name: string; email: string; selectedAvatar: string };
}

interface Standing {
    xpRank: number;
    streakRank: number;
    xp: number;
    streak: number;
}

const PODIUM_CONFIG = [
    { place: 1, label: "Champion", height: "h-28", cardClass: "podium-gold", crownEmoji: "👑", glow: "rgba(247,201,72,0.4)", ringColor: "border-brand-gold" },
    { place: 2, label: "Guardian", height: "h-20", cardClass: "podium-silver", crownEmoji: "🥈", glow: "rgba(192,192,192,0.3)", ringColor: "border-slate-400" },
    { place: 3, label: "Warrior", height: "h-14", cardClass: "podium-bronze", crownEmoji: "🥉", glow: "rgba(205,127,50,0.3)", ringColor: "border-amber-600" },
];

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
    const top3 = listToRender.slice(0, 3);
    const rest = listToRender.slice(3);

    if (loading) {
        return (
            <main className="min-h-screen bg-world-quest text-foreground flex items-center justify-center">
                <div className="text-center space-y-5">
                    <motion.div
                        animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-7xl"
                    >
                        ⚔️
                    </motion.div>
                    <p className="font-game text-2xl text-foreground">Calculating Standings...</p>
                    <div className="w-48 mx-auto h-1.5 bg-brand-primary/20 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full gradient-primary rounded-full"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pb-28 md:pb-16 bg-world-quest text-foreground relative overflow-hidden">
            {/* Atmospheric background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-gold/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-brand-error/6 rounded-full blur-3xl" />
            </div>

            <Navbar />

            <div className="container mx-auto px-4 md:px-6 pt-24 max-w-3xl relative z-10">

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="text-5xl mb-4"
                    >
                        ⚔️
                    </motion.div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-error/10 border border-brand-error/20 rounded-full mb-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-error">The Arena</span>
                    </div>
                    <h1 className="font-game text-4xl md:text-5xl text-foreground mb-3">
                        Tournament <span className="gradient-text-gold">Standings</span>
                    </h1>
                    <p className="text-text-secondary max-w-md mx-auto text-sm">
                        Compete daily. Climb the ranks. Become a legend.
                    </p>
                </motion.header>

                {/* Your Standing */}
                {standing && standing.xpRank > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="game-card p-5 md:p-6 mb-8 border border-brand-gold/25 bg-gradient-to-br from-brand-gold/8 to-transparent"
                    >
                        <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center shadow-lg shadow-brand-gold/30">
                                    <Shield className="w-6 h-6 text-amber-900" />
                                </div>
                                <div>
                                    <h3 className="font-game text-base text-foreground">Your Rank</h3>
                                    <p className="text-text-secondary text-xs">Keep learning to defend your position!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1">Streak</div>
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <Flame className="w-4 h-4 text-brand-orange fill-brand-orange" />
                                        <span className="font-game text-xl text-brand-orange font-bold">#{standing.streakRank}</span>
                                    </div>
                                    <span className="text-[9px] text-text-secondary">{standing.streak}d streak</span>
                                </div>
                                <div className="w-px h-10 bg-border" />
                                <div className="text-center">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1">XP</div>
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <Zap className="w-4 h-4 text-brand-primary fill-brand-primary" />
                                        <span className="font-game text-xl text-brand-primary font-bold">#{standing.xpRank}</span>
                                    </div>
                                    <span className="text-[9px] text-text-secondary">{standing.xp.toLocaleString()} XP</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Tab switcher */}
                <div className="flex justify-center mb-8">
                    <div className="game-card p-1.5 flex gap-1">
                        {[
                            { key: "streak", label: "🔥 Streak Warriors", color: "bg-brand-orange" },
                            { key: "xp", label: "⚡ XP Champions", color: "bg-brand-primary" }
                        ].map(tab => (
                            <motion.button
                                key={tab.key}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setActiveTab(tab.key as "streak" | "xp")}
                                className={`px-6 py-2.5 rounded-2xl font-game text-sm transition-all cursor-pointer ${
                                    activeTab === tab.key
                                        ? `${tab.color} text-white shadow-lg`
                                        : "text-text-secondary hover:text-foreground"
                                }`}
                            >
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* === PODIUM (Top 3) === */}
                        {top3.length > 0 && (
                            <div className="mb-8 relative">
                                {/* Podium platform visual */}
                                <div className="flex items-end justify-center gap-3 px-4 pb-6">
                                    {/* 2nd place */}
                                    {top3[1] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex flex-col items-center gap-2 flex-1 max-w-[140px]"
                                        >
                                            <span className="text-2xl">🥈</span>
                                            <div className="w-14 h-14 rounded-2xl bg-slate-400/20 border-2 border-slate-400/30 flex items-center justify-center text-2xl shadow-lg">
                                                {top3[1].user?.selectedAvatar || top3[1].user?.name?.[0] || "?"}
                                            </div>
                                            <div className="text-center">
                                                <p className="font-game text-xs text-foreground truncate max-w-[110px]">{top3[1].user?.name || "Unknown"}</p>
                                                <p className="text-[9px] text-text-secondary font-black">{top3[1].level}</p>
                                            </div>
                                            <div className="podium-silver w-full h-16 rounded-t-2xl flex items-center justify-center">
                                                <span className="font-game text-xl font-bold text-white/80">2</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* 1st place — tallest */}
                                    {top3[0] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="flex flex-col items-center gap-2 flex-1 max-w-[160px]"
                                        >
                                            <motion.span
                                                animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="text-3xl"
                                            >
                                                👑
                                            </motion.span>
                                            <motion.div
                                                animate={{ boxShadow: ["0 0 20px rgba(247,201,72,0.3)", "0 0 40px rgba(247,201,72,0.6)", "0 0 20px rgba(247,201,72,0.3)"] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-16 h-16 rounded-2xl bg-brand-gold/20 border-2 border-brand-gold/50 flex items-center justify-center text-3xl shadow-xl"
                                            >
                                                {top3[0].user?.selectedAvatar || top3[0].user?.name?.[0] || "?"}
                                            </motion.div>
                                            <div className="text-center">
                                                <p className="font-game text-sm text-foreground truncate max-w-[130px]">{top3[0].user?.name || "Unknown"}</p>
                                                <p className="text-[9px] text-brand-gold font-black">{top3[0].level}</p>
                                            </div>
                                            <div className="podium-gold w-full h-24 rounded-t-2xl flex items-center justify-center">
                                                <span className="font-game text-2xl font-bold text-white">1</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* 3rd place */}
                                    {top3[2] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex flex-col items-center gap-2 flex-1 max-w-[140px]"
                                        >
                                            <span className="text-2xl">🥉</span>
                                            <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border-2 border-amber-600/30 flex items-center justify-center text-2xl shadow-lg">
                                                {top3[2].user?.selectedAvatar || top3[2].user?.name?.[0] || "?"}
                                            </div>
                                            <div className="text-center">
                                                <p className="font-game text-xs text-foreground truncate max-w-[110px]">{top3[2].user?.name || "Unknown"}</p>
                                                <p className="text-[9px] text-text-secondary font-black">{top3[2].level}</p>
                                            </div>
                                            <div className="podium-bronze w-full h-12 rounded-t-2xl flex items-center justify-center">
                                                <span className="font-game text-lg font-bold text-white/80">3</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* === REST OF RANKINGS === */}
                        {rest.length > 0 && (
                            <div className="game-card overflow-hidden">
                                <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">All Competitors</span>
                                </div>
                                <div className="divide-y divide-border/40">
                                    {rest.map((userStat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-brand-primary/4 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <span className="w-8 text-center font-game font-bold text-text-secondary text-sm flex-shrink-0">#{i + 4}</span>
                                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/15 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                                                    {userStat.user?.selectedAvatar || userStat.user?.name?.[0] || "?"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-game text-sm text-foreground truncate">{userStat.user?.name || "Anonymous"}</p>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded mt-0.5 inline-block">{userStat.level}</span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {activeTab === "streak" ? (
                                                    <div className="flex items-center gap-1.5 font-game font-bold text-brand-orange">
                                                        <Flame className="w-4 h-4 fill-brand-orange" />
                                                        <span>{userStat.streak}</span>
                                                        <span className="text-[9px] opacity-60 font-sans uppercase tracking-wider">days</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 font-game font-bold text-brand-primary">
                                                        <Zap className="w-4 h-4 fill-brand-primary" />
                                                        <span>{userStat.xp.toLocaleString()}</span>
                                                        <span className="text-[9px] opacity-60 font-sans uppercase tracking-wider">XP</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {listToRender.length === 0 && (
                            <div className="game-card p-16 text-center">
                                <div className="text-5xl mb-4 floating">🏟️</div>
                                <p className="font-game text-xl text-foreground mb-2">The Arena Awaits</p>
                                <p className="text-text-secondary text-sm">No warriors have entered yet. Be the first legend.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
