"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { XPProgressBar } from "@/components/gamification/Stats";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Share2, Target } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";

interface Activity {
    id: string;
    topic: { title: string; emoji: string; cluster?: string };
    earnedXp: number;
    completedAt: string;
    quizCorrect?: boolean | null;
}

const statCards = [
    { key: "streak", emoji: "🔥", label: "Day Streak", color: "text-brand-orange", bg: "from-brand-orange/20 to-brand-orange/5", glow: "rgba(255,112,67,0.2)", border: "border-brand-orange/20" },
    { key: "xp", emoji: "⚡", label: "Brain XP", color: "text-brand-primary", bg: "from-brand-primary/20 to-brand-primary/5", glow: "rgba(124,77,255,0.2)", border: "border-brand-primary/20" },
    { key: "lessons", emoji: "📖", label: "Quests Done", color: "text-brand-secondary", bg: "from-brand-secondary/20 to-brand-secondary/5", glow: "rgba(41,182,246,0.2)", border: "border-brand-secondary/20" },
    { key: "accuracy", emoji: "🎯", label: "Accuracy", color: "text-brand-success", bg: "from-brand-success/20 to-brand-success/5", glow: "rgba(76,175,80,0.2)", border: "border-brand-success/20" },
];

const collections = [
    { emoji: "🧠", label: "Psychology", color: "text-brand-primary", bg: "bg-brand-primary/15", border: "border-brand-primary/25" },
    { emoji: "🪐", label: "Personality", color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/25" },
    { emoji: "⚡", label: "Decisions", color: "text-brand-gold", bg: "bg-brand-gold/15", border: "border-brand-gold/25" },
    { emoji: "🔮", label: "Cognition", color: "text-brand-secondary", bg: "bg-brand-secondary/15", border: "border-brand-secondary/25" },
];

export default function DashboardPage() {
    const { xp, streak, level, syncWithDatabase, streakShields } = useUserStore();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [userAvatar, setUserAvatar] = useState("");
    const [unlockedClusters, setUnlockedClusters] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (status === "unauthenticated") router.replace("/login");
    }, [status, router]);

    useEffect(() => {
        async function loadUserStats() {
            if (status === "authenticated") {
                await syncWithDatabase();
                try {
                    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const [statsRes, profileRes] = await Promise.all([
                        fetch(`/api/user/stats?tz=${encodeURIComponent(tz)}`),
                        fetch("/api/user/profile")
                    ]);
                    if (statsRes.ok) {
                        const data = await statsRes.json();
                        // Only show COMPLETED activities
                        const completed = (data.activities || []).filter((a: any) => a.status === "COMPLETED");
                        setActivities(completed);
                        // Track which clusters are unlocked
                        const clusters = new Set<string>(completed.map((a: any) => a.topic?.cluster || "").filter(Boolean));
                        setUnlockedClusters(clusters);
                    }
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        setUserAvatar(profileData.user?.selectedAvatar || profileData.user?.defaultAvatar || "");
                    }
                } catch (e) {
                    console.error("Failed to load user activities", e);
                } finally {
                    setLoading(false);
                }
            }
        }
        loadUserStats();
    }, [status, syncWithDatabase]);

    if (status !== "authenticated") return null;

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // XP progress
    let lowerLimit = 0, upperLimit = 100;
    if (xp >= 5000) { lowerLimit = 5000; upperLimit = 10000; }
    else if (xp >= 2500) { lowerLimit = 2500; upperLimit = 5000; }
    else if (xp >= 1000) { lowerLimit = 1000; upperLimit = 2500; }
    else if (xp >= 500) { lowerLimit = 500; upperLimit = 1000; }
    else if (xp >= 100) { lowerLimit = 100; upperLimit = 500; }
    const xpProgress = xp - lowerLimit;
    const nextLevelXp = upperLimit - lowerLimit;
    const progressPercent = Math.min(100, Math.round((xpProgress / nextLevelXp) * 100));

    const statValues: Record<string, string> = {
        streak: `${streak} days`,
        xp: xp.toLocaleString(),
        lessons: `${activities.length}`,
        accuracy: activities.length === 0 ? "–" : (() => {
            const withQuiz = activities.filter(a => a.quizCorrect !== null && a.quizCorrect !== undefined);
            if (withQuiz.length === 0) return "100%";
            const correct = withQuiz.filter(a => a.quizCorrect === true).length;
            return `${Math.round((correct / withQuiz.length) * 100)}%`;
        })(),
    };

    const shieldCount = streakShields ?? 0;

    return (
        <main className="min-h-screen pb-28 md:pb-16 bg-world-forest text-foreground">
            <Navbar />

            {/* Atmospheric particles */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-brand-success/40"
                        style={{ left: `${20 + i * 17}%`, top: `${10 + i * 15}%` }}
                        animate={{ y: [0, -80, 0], opacity: [0, 0.6, 0] }}
                        transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 md:px-6 pt-24 max-w-5xl relative z-10">

                {/* === CHARACTER SHEET HEADER === */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="game-card p-7 md:p-10 mb-8 relative overflow-hidden"
                >
                    {/* Background world glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/8 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-success/6 rounded-full blur-3xl translate-y-12 -translate-x-12 pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                        {/* Avatar orb */}
                        <div className="relative flex-shrink-0">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="w-24 h-24 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(124,77,255,0.3),0_8px_0_rgba(80,32,192,0.5)] border-2 border-brand-primary/30"
                            >
                                {userAvatar && userAvatar.startsWith("http") ? (
                                    <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full gradient-primary flex items-center justify-center text-5xl">
                                        {userAvatar || "🧠"}
                                    </div>
                                )}
                            </motion.div>
                            {/* Level badge */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-gold text-amber-900 font-game text-[9px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap border border-amber-300/30">
                                {level}
                            </div>
                        </div>

                        {/* Identity */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary mb-1">Adventurer Profile</div>
                                <h1 className="font-game text-2xl md:text-3xl text-foreground">
                                    {session.user?.name || level} ✨
                                </h1>
                                <p className="text-text-secondary text-sm mt-1">
                                    Top <span className="text-brand-primary font-bold">5%</span> of learners this week. Keep that edge.
                                </p>
                            </div>

                            {/* XP bar */}
                            <div className="space-y-1.5 max-w-sm">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-text-secondary">
                                    <span>Experience Points</span>
                                    <span className="text-brand-primary">{progressPercent}%</span>
                                </div>
                                <XPProgressBar currentXp={xpProgress} maxXp={nextLevelXp} />
                                <p className="text-[9px] text-text-secondary">{xpProgress} / {nextLevelXp} XP to next rank</p>
                            </div>
                        </div>

                        {/* Shield + CTA */}
                        <div className="flex flex-col gap-3 flex-shrink-0">
                            {/* Shield count */}
                            <div className="flex items-center gap-2 bg-brand-secondary/10 border border-brand-secondary/20 rounded-2xl px-4 py-2">
                                <span className="text-xl">🛡️</span>
                                <div>
                                    <div className="font-game text-sm text-brand-secondary font-bold">{shieldCount} Shield{shieldCount !== 1 ? "s" : ""}</div>
                                    <div className="text-[9px] text-text-secondary uppercase tracking-wider">Streak Guard</div>
                                </div>
                            </div>
                            <Link href="/quizzes">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="game-btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-4 h-4" /> Today's Quest
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* === STAT GEMS GRID === */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            className={`game-card p-6 bg-gradient-to-br ${stat.bg} border ${stat.border} relative overflow-hidden group`}
                        >
                            <div className="absolute -top-4 -right-4 text-5xl opacity-10 pointer-events-none">{stat.emoji}</div>
                            <div className="relative z-10">
                                <motion.div
                                    className="text-3xl mb-3"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                                >
                                    {stat.emoji}
                                </motion.div>
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary mb-1">{stat.label}</div>
                                <div className={`font-game text-2xl font-bold ${stat.color}`}>{statValues[stat.key]}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* === QUEST JOURNAL === */}
                    <div className="lg:col-span-2 game-card p-7 md:p-9">
                        <div className="flex items-center justify-between mb-7">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
                                    <span className="text-white">📜</span>
                                </div>
                                <div>
                                    <h3 className="font-game text-lg text-foreground">Quest Journal</h3>
                                    <p className="text-[9px] text-text-secondary uppercase tracking-wider">Completed adventures</p>
                                </div>
                            </div>
                            <button className="text-brand-secondary font-black text-[10px] uppercase tracking-widest hover:underline cursor-pointer">View All</button>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 rounded-2xl bg-background/50 shimmer" />
                                ))}
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="text-5xl mb-4 floating">🗺️</div>
                                <p className="font-game text-lg text-foreground mb-2">Your journal is empty</p>
                                <p className="text-text-secondary text-sm mb-6">Complete your first quest to write your legend.</p>
                                <Link href="/quizzes">
                                    <button className="game-btn-primary text-sm px-6 py-3">⚡ Start First Quest</button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((activity, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        whileHover={{ x: 5 }}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-background/40 hover:bg-brand-primary/5 border border-transparent hover:border-brand-primary/15 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-2xl border border-border group-hover:rotate-6 transition-transform shadow-sm">
                                                {activity.topic.emoji || "🧐"}
                                            </div>
                                            <div>
                                                <p className="font-game text-sm text-foreground font-bold">{activity.topic.title}</p>
                                                <p className="text-[10px] text-text-secondary uppercase tracking-wide mt-0.5">
                                                    ✅ Completed · {formatDate(activity.completedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.06 + 0.2 }}
                                                className="font-game text-base font-bold text-brand-gold"
                                            >
                                                +{activity.earnedXp} XP
                                            </motion.span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* === RIGHT SIDEBAR === */}
                    <div className="space-y-5">
                        {/* Daily Quest CTA */}
                        <div className="game-card p-7 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-brand-gold/5 pointer-events-none" />
                            <div className="relative z-10 text-center space-y-4">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-5xl"
                                >
                                    🌟
                                </motion.div>
                                <h3 className="font-game text-xl text-foreground">Daily Quest</h3>
                                <p className="text-text-secondary text-sm">Complete daily to boost your streak and unlock chests.</p>

                                {/* Streak progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-text-secondary">
                                        <span>Weekly Goal</span>
                                        <span className="text-brand-gold">{Math.min(100, Math.round((streak / 7) * 100))}%</span>
                                    </div>
                                    <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            animate={{ width: `${Math.min(100, (streak / 7) * 100)}%` }}
                                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                            className="h-full gradient-gold rounded-full shadow-[0_0_8px_rgba(247,201,72,0.5)]"
                                        />
                                    </div>
                                </div>

                                <Link href="/quizzes" className="block">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="game-btn-gold w-full py-3.5"
                                    >
                                        ⚡ Continue Quest
                                    </motion.button>
                                </Link>
                            </div>
                        </div>

                        {/* Collections Inventory */}
                        <div className="game-card p-7">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-xl">📚</span>
                                <div>
                                    <h4 className="font-game text-sm text-foreground">Collection Shelf</h4>
                                    <p className="text-[9px] text-text-secondary uppercase tracking-wider">Knowledge inventory</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {collections.map((col, i) => {
                                    // Check if the user has completed any quest in this cluster
                                    const clusterKey = ["Consumer Psychology", "Personality", "Decision Making", "Biases"][i] || col.label;
                                    const unlocked = activities.length > 0 && (i === 0 || unlockedClusters.has(clusterKey));
                                    return (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.04 }}
                                            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer overflow-hidden ${
                                                unlocked
                                                    ? `${col.bg} ${col.border}`
                                                    : "bg-background/40 border-dashed border-border/60 opacity-50"
                                            }`}
                                        >
                                            {!unlocked && (
                                                <div className="absolute inset-0 shimmer opacity-30" />
                                            )}
                                            <span className={`text-2xl mb-1 ${!unlocked ? "grayscale opacity-50" : ""}`}>{col.emoji}</span>
                                            <span className={`text-[8px] font-black uppercase tracking-wider ${unlocked ? col.color : "text-text-secondary/40"}`}>
                                                {unlocked ? "Unlocked" : "Locked"}
                                            </span>
                                            <span className="text-[7px] text-text-secondary/60 mt-0.5">{col.label}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="game-card p-7">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-xl">🏅</span>
                                <div>
                                    <h4 className="font-game text-sm text-foreground">Achievement Cabinet</h4>
                                    <p className="text-[9px] text-text-secondary uppercase tracking-wider">Secret badges</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { emoji: "🌱", label: "First Steps", unlocked: true, color: "text-brand-success", bg: "bg-brand-success/15", border: "border-brand-success/25" },
                                    { emoji: "⚔️", label: "Quest Champion", unlocked: activities.length > 0, color: "text-brand-primary", bg: "bg-brand-primary/15", border: "border-brand-primary/25" },
                                    { emoji: "🔥", label: "Streak Master", unlocked: streak >= 3, color: "text-brand-orange", bg: "bg-brand-orange/15", border: "border-brand-orange/25" },
                                ].map((badge, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.06, rotate: 2 }}
                                        title={badge.label}
                                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-help relative overflow-hidden ${
                                            badge.unlocked
                                                ? `${badge.bg} ${badge.border}`
                                                : "bg-background/30 border-dashed border-border/50 opacity-40"
                                        }`}
                                    >
                                        <span className={`text-2xl ${!badge.unlocked ? "grayscale" : ""}`}>{badge.emoji}</span>
                                        <span className={`text-[7px] font-black uppercase mt-1 ${badge.unlocked ? badge.color : "text-text-secondary/30"}`}>
                                            {badge.unlocked ? "Earned" : "🔒"}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
