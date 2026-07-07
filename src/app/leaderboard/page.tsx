"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Crown, Shield, Sparkles, Brain, Landmark, Zap, Flame, BarChart2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardUser {
    xp: number;
    streak: number;
    level: string;
    globalRating?: number;
    user: { name: string; email: string; selectedAvatar: string };
}

interface Standing {
    xpRank?: number;
    streakRank?: number;
    xp?: number;
    streak?: number;
    rank?: number;
    rating?: number;
}

const CATEGORIES = [
    { name: "GLOBAL", label: "Global Brain", icon: "🧠" },
    { name: "Consumer Psychology", label: "Consumer Psych", icon: "🛍️" },
    { name: "Negotiation", label: "Negotiation", icon: "🤝" },
    { name: "Biases", label: "Biases", icon: "🔮" },
    { name: "Decision Making", label: "Decision Making", icon: "🎯" }
];

export default function LeaderboardPage() {
    const { status } = useSession();
    
    // Toggle between general (XP/Streak) and skill (Elo ratings)
    const [detailedSkillMode, setDetailedSkillMode] = useState(false);
    
    // General leaderboard states
    const [activeGeneralTab, setActiveGeneralTab] = useState<"streak" | "xp">("streak");
    const [topStreak, setTopStreak] = useState<LeaderboardUser[]>([]);
    const [topXp, setTopXp] = useState<LeaderboardUser[]>([]);
    const [generalStanding, setGeneralStanding] = useState<any>(null);

    // Skill rating states
    const [selectedCategory, setSelectedCategory] = useState("GLOBAL");
    const [skillListings, setSkillListings] = useState<LeaderboardUser[]>([]);
    const [skillStanding, setSkillStanding] = useState<any>(null);

    const [loading, setLoading] = useState(true);

    // Fetch general listings
    useEffect(() => {
        if (detailedSkillMode) return;
        async function fetchGeneral() {
            setLoading(true);
            try {
                const res = await fetch("/api/leaderboard?mode=general");
                if (res.ok) {
                    const data = await res.json();
                    setTopStreak(data.topStreak || []);
                    setTopXp(data.topXp || []);
                    setGeneralStanding(data.standing || null);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchGeneral();
    }, [detailedSkillMode]);

    // Fetch skill ratings
    useEffect(() => {
        if (!detailedSkillMode) return;
        async function fetchSkill() {
            setLoading(true);
            try {
                const res = await fetch(`/api/leaderboard?mode=skill&category=${encodeURIComponent(selectedCategory)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSkillListings(data.listings || []);
                    setSkillStanding(data.standing || null);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchSkill();
    }, [detailedSkillMode, selectedCategory]);

    const activeList = detailedSkillMode 
        ? skillListings 
        : (activeGeneralTab === "streak" ? topStreak : topXp);

    const top3 = activeList.slice(0, 3);
    const rest = activeList.slice(3);

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
                    className="text-center mb-6"
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="text-5xl mb-4"
                    >
                        ⚔️
                    </motion.div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 border border-brand-gold/20 rounded-full mb-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold">The Arena</span>
                    </div>
                    <h1 className="font-game text-4xl md:text-5xl text-foreground mb-3">
                        Tournament <span className="gradient-text-gold">Standings</span>
                    </h1>
                    <p className="text-text-secondary max-w-md mx-auto text-sm">
                        {detailedSkillMode 
                            ? "Detailed cognitive skill analysis ladder." 
                            : "Compete daily. Climb the ranks. Become a legend."
                        }
                    </p>
                </motion.header>

                {/* Mode Selector Toggle Button */}
                <div className="flex justify-center mb-8">
                    {detailedSkillMode ? (
                        <button
                            onClick={() => setDetailedSkillMode(false)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-game uppercase tracking-wider transition-all cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 text-brand-gold" /> Return to Streak & XP Ladder
                        </button>
                    ) : (
                        <button
                            onClick={() => setDetailedSkillMode(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl text-[10px] font-game uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-brand-primary/20"
                        >
                            <BarChart2 className="w-4 h-4 text-white" /> View Skill & Category Ratings
                        </button>
                    )}
                </div>

                {/* Category selectors for Skill Mode */}
                {detailedSkillMode && (
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-game text-[10px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                    selectedCategory === cat.name
                                        ? "bg-brand-gold text-black shadow-lg scale-102"
                                        : "bg-white/5 border border-white/5 text-text-secondary hover:text-foreground hover:bg-white/10"
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* General Mode tab switcher */}
                {!detailedSkillMode && (
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
                                    onClick={() => setActiveGeneralTab(tab.key as "streak" | "xp")}
                                    className={`px-6 py-2.5 rounded-2xl font-game text-sm transition-all cursor-pointer ${
                                        activeGeneralTab === tab.key
                                            ? `${tab.color} text-white shadow-lg`
                                            : "text-text-secondary hover:text-foreground"
                                    }`}
                                >
                                    {tab.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Standing display */}
                {detailedSkillMode ? (
                    skillStanding && skillStanding.rank > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="game-card p-5 md:p-6 mb-8 border border-brand-gold/25 bg-gradient-to-br from-brand-gold/8 to-transparent"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center shadow-lg shadow-brand-gold/30">
                                        <Shield className="w-6 h-6 text-amber-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-game text-base text-foreground">Your Rank Standing</h3>
                                        <p className="text-text-secondary text-xs">Based on {selectedCategory === "GLOBAL" ? "overall global brain rating" : selectedCategory}.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1">Rank</div>
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <Sparkles className="w-4 h-4 text-brand-gold" />
                                            <span className="font-game text-xl text-brand-gold font-bold">#{skillStanding.rank}</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-10 bg-border" />
                                    <div className="text-center">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1">Mastery Rating</div>
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <Brain className="w-4 h-4 text-brand-primary" />
                                            <span className="font-game text-xl text-brand-primary font-bold">{skillStanding.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                ) : (
                    generalStanding && generalStanding.xpRank > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="game-card p-5 md:p-6 mb-8 border border-brand-gold/25 bg-gradient-to-br from-brand-gold/8 to-transparent"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center shadow-lg shadow-brand-gold/30">
                                        <Shield className="w-6 h-6 text-amber-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-game text-base text-foreground">Your Rank Standing</h3>
                                        <p className="text-text-secondary text-xs">Keep learning to defend your position!</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1">Streak</div>
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <Flame className="w-4 h-4 text-brand-orange fill-brand-orange" />
                                            <span className="font-game text-xl text-brand-orange font-bold">#{generalStanding.streakRank}</span>
                                        </div>
                                        <span className="text-[9px] text-text-secondary">{generalStanding.streak}d streak</span>
                                    </div>
                                    <div className="w-px h-10 bg-border" />
                                    <div className="text-center">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1">XP</div>
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <Zap className="w-4 h-4 text-brand-primary fill-brand-primary" />
                                            <span className="font-game text-xl text-brand-primary font-bold">#{generalStanding.xpRank}</span>
                                        </div>
                                        <span className="text-[9px] text-text-secondary">{generalStanding.xp?.toLocaleString()} XP</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                )}

                {/* Competitors List */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="p-16 text-center text-text-secondary text-sm">
                            Loading standings...
                        </div>
                    ) : (
                        <motion.div
                            key={detailedSkillMode ? selectedCategory : activeGeneralTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Podium (Top 3) */}
                            {top3.length > 0 && (
                                <div className="mb-8 relative">
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
                                                <div className="w-14 h-14 rounded-2xl bg-slate-400/20 border-2 border-slate-400/30 flex items-center justify-center text-2xl shadow-lg overflow-hidden">
                                                    {top3[1].user?.selectedAvatar?.startsWith("http") ? (
                                                        <img src={top3[1].user.selectedAvatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{top3[1].user?.selectedAvatar || "🧠"}</span>
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-game text-xs text-foreground truncate max-w-[110px]">{top3[1].user?.name || "Unknown"}</p>
                                                    <p className="text-[9px] text-text-secondary font-black">
                                                        {detailedSkillMode 
                                                            ? `${top3[1].globalRating} Rating`
                                                            : (activeGeneralTab === "streak" ? `${top3[1].streak}d streak` : `${top3[1].xp?.toLocaleString()} XP`)
                                                        }
                                                    </p>
                                                </div>
                                                <div className="podium-silver w-full h-16 rounded-t-2xl flex items-center justify-center">
                                                    <span className="font-game text-xl font-bold text-white/80">2</span>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* 1st place */}
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
                                                    className="w-16 h-16 rounded-2xl bg-brand-gold/20 border-2 border-brand-gold/50 flex items-center justify-center text-3xl shadow-xl overflow-hidden"
                                                >
                                                    {top3[0].user?.selectedAvatar?.startsWith("http") ? (
                                                        <img src={top3[0].user.selectedAvatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{top3[0].user?.selectedAvatar || "🧠"}</span>
                                                    )}
                                                </motion.div>
                                                <div className="text-center">
                                                    <p className="font-game text-sm text-foreground truncate max-w-[130px]">{top3[0].user?.name || "Unknown"}</p>
                                                    <p className="text-[9px] text-brand-gold font-black">
                                                        {detailedSkillMode 
                                                            ? `${top3[0].globalRating} Rating`
                                                            : (activeGeneralTab === "streak" ? `${top3[0].streak}d streak` : `${top3[0].xp?.toLocaleString()} XP`)
                                                        }
                                                    </p>
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
                                                <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border-2 border-amber-600/30 flex items-center justify-center text-2xl shadow-lg overflow-hidden">
                                                    {top3[2].user?.selectedAvatar?.startsWith("http") ? (
                                                        <img src={top3[2].user.selectedAvatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{top3[2].user?.selectedAvatar || "🧠"}</span>
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-game text-xs text-foreground truncate max-w-[110px]">{top3[2].user?.name || "Unknown"}</p>
                                                    <p className="text-[9px] text-text-secondary font-black">
                                                        {detailedSkillMode 
                                                            ? `${top3[2].globalRating} Rating`
                                                            : (activeGeneralTab === "streak" ? `${top3[2].streak}d streak` : `${top3[2].xp?.toLocaleString()} XP`)
                                                        }
                                                    </p>
                                                </div>
                                                <div className="podium-bronze w-full h-12 rounded-t-2xl flex items-center justify-center">
                                                    <span className="font-game text-lg font-bold text-white/80">3</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rest of rankings */}
                            {rest.length > 0 && (
                                <div className="game-card overflow-hidden">
                                    <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Competitor Ladder</span>
                                    </div>
                                    <div className="divide-y divide-border/40">
                                        {rest.map((rUser, i) => (
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
                                                        {rUser.user?.selectedAvatar?.startsWith("http") ? (
                                                            <img src={rUser.user.selectedAvatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{rUser.user?.selectedAvatar || "🧠"}</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-game text-sm text-foreground truncate">{rUser.user?.name || "Anonymous"}</p>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded mt-0.5 inline-block">{rUser.level}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 font-game font-bold text-sm">
                                                    {detailedSkillMode ? (
                                                        <span className="text-brand-gold">🏆 {rUser.globalRating} Rating</span>
                                                    ) : (
                                                        activeGeneralTab === "streak" ? (
                                                            <span className="text-brand-orange flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-brand-orange" /> {rUser.streak}d</span>
                                                        ) : (
                                                            <span className="text-brand-primary flex items-center gap-1"><Zap className="w-3.5 h-3.5 fill-brand-primary" /> {rUser.xp?.toLocaleString()}</span>
                                                        )
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeList.length === 0 && (
                                <div className="game-card p-16 text-center">
                                    <div className="text-5xl mb-4 floating">🏟️</div>
                                    <p className="font-game text-xl text-foreground mb-2">The Arena Awaits</p>
                                    <p className="text-text-secondary text-sm">No users have ranked in this category yet. Be the first to claim the title!</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
