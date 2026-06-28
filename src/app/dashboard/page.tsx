"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { XPProgressBar } from "@/components/gamification/Stats";
import { motion } from "framer-motion";
import { Zap, Trophy, Brain, Target, Calendar, Share2, Award, Star, Flame, Layout } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";

interface Activity {
    id: string;
    topic: {
        title: string;
        emoji: string;
    };
    earnedXp: number;
    completedAt: string;
}

export default function DashboardPage() {
    const { xp, streak, level, syncWithDatabase } = useUserStore();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    useEffect(() => {
        async function loadUserStats() {
            if (status === "authenticated") {
                await syncWithDatabase();
                try {
                    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const res = await fetch(`/api/user/stats?tz=${encodeURIComponent(tz)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setActivities(data.activities || []);
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

    const stats = [
        { label: "Streak", value: `${streak} Days`, icon: Flame, color: "text-brand-orange", bg: "bg-brand-orange/10" },
        { label: "Brain XP", value: xp.toLocaleString(), icon: Trophy, color: "text-brand-primary", bg: "bg-brand-primary/10" },
        { label: "Intel Ops", value: `${activities.length} completed`, icon: Brain, color: "text-brand-secondary", bg: "bg-brand-secondary/10" },
        { label: "Accuracy", value: "100%", icon: Target, color: "text-brand-success", bg: "bg-brand-success/10" },
    ];

    const formatCompletedDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Calculate level limits for progress bar
    let lowerLimit = 0;
    let upperLimit = 100;
    if (xp >= 5000) { lowerLimit = 5000; upperLimit = 10000; }
    else if (xp >= 2500) { lowerLimit = 2500; upperLimit = 5000; }
    else if (xp >= 1000) { lowerLimit = 1000; upperLimit = 2500; }
    else if (xp >= 500) { lowerLimit = 500; upperLimit = 1000; }
    else if (xp >= 100) { lowerLimit = 100; upperLimit = 500; }
    
    const xpProgress = xp - lowerLimit;
    const nextLevelXp = upperLimit - lowerLimit;
    const progressPercent = Math.min(100, Math.round((xpProgress / nextLevelXp) * 100));

    return (
        <main className="min-h-screen pb-24 bg-background text-foreground">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 max-w-6xl">
                {/* Header Section */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold font-display mb-2 text-foreground">
                            Sup, <span className="text-brand-primary">{session.user?.name || level}?</span> 🎓
                        </h1>
                        <p className="text-text-secondary text-lg font-medium">You're in the top <span className="text-brand-primary font-bold">5%</span> this week. Keep that edge.</p>
                    </motion.div>

                    <div className="flex gap-4 flex-wrap">
                        <Link href="/leaderboard">
                            <button className="flex items-center gap-2 bg-card px-6 py-3 rounded-2xl font-bold text-foreground border border-border card-shadow hover:bg-background transition-all btn-push cursor-pointer">
                                <Trophy className="w-5 h-5 text-brand-primary" /> Leaderboards
                            </button>
                        </Link>
                        <button className="flex items-center gap-2 bg-card px-6 py-3 rounded-2xl font-bold text-foreground border border-border card-shadow hover:bg-background transition-all btn-push">
                            <Share2 className="w-5 h-5" /> Share Stats
                        </button>
                        <Link href="/learn">
                            <button className="gradient-primary text-white px-8 py-3 rounded-2xl font-bold font-display shadow-xl shadow-brand-primary/25 flex items-center gap-2 btn-push cursor-pointer">
                                <Zap className="w-5 h-5 fill-white" /> Continue Learning
                            </button>
                        </Link>
                    </div>
                </header>

                {/* Global Progress Card - Gamified */}
                <div className="bg-card rounded-[3.5rem] p-8 md:p-12 card-shadow border border-border mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-12 translate-x-12" />

                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        <div className="relative pb-4">
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                className="w-32 h-32 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl relative z-10"
                            >
                                <Trophy className="w-16 h-16 text-white" />
                            </motion.div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap z-20">
                                {level}
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold font-display text-foreground leading-none mb-2">Rank: {level}</h2>
                                    <p className="text-text-secondary text-xs font-black uppercase tracking-[0.2em]">
                                        {xpProgress} / {nextLevelXp} XP to next level
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-brand-primary font-black text-2xl font-display">{progressPercent}%</span>
                                </div>
                            </div>
                            <XPProgressBar currentXp={xpProgress} maxXp={nextLevelXp} />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-card p-8 rounded-[2.5rem] card-shadow border border-border group"
                        >
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-6 h-6 ${stat.icon !== Target ? 'fill-current' : ''}`} />
                            </div>
                            <p className="text-text-secondary text-xs font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <p className="text-3xl font-bold font-display text-foreground">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-card rounded-[3.5rem] p-10 card-shadow border border-border">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-bold font-display text-foreground flex items-center gap-3">
                                <Target className="text-brand-primary" /> Brain Feed
                            </h3>
                            <button className="text-brand-secondary font-black text-xs uppercase tracking-widest hover:underline">View All</button>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center text-text-secondary">Loading feed...</div>
                        ) : activities.length === 0 ? (
                            <div className="py-20 text-center text-text-secondary font-medium font-sans">
                                No lessons completed yet. Start your journey today!
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {activities.map((activity, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 10 }}
                                        className="flex items-center justify-between p-5 rounded-[2rem] bg-background hover:bg-brand-primary/5 transition-colors border border-transparent hover:border-brand-primary/10 group overflow-hidden relative"
                                    >
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-border group-hover:rotate-6 transition-transform">
                                                {activity.topic.emoji || "🧐"}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground font-display text-lg">{activity.topic.title}</h4>
                                                <p className="text-xs text-text-secondary font-black uppercase tracking-tight">
                                                    Completed on {formatCompletedDate(activity.completedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 relative z-10">
                                            <span className="text-brand-success font-black text-lg font-display">+{activity.earnedXp} XP</span>
                                            <button className="p-3 bg-card rounded-xl border border-border text-text-secondary hover:text-brand-primary transition-colors">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Gamified Sidebar */}
                    <div className="space-y-8">
                        {/* Daily Challenge Card */}
                        <div className="gradient-primary rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <Layout className="absolute top-2 right-2 w-40 h-40 opacity-10 -rotate-12 group-hover:rotate-12 transition-transform duration-1000" />
                            <Star className="text-brand-secondary fill-brand-secondary w-10 h-10 mb-6 drop-shadow-[0_0_10px_rgba(0,191,255,0.5)]" />
                            <h3 className="text-2xl font-bold mb-4 font-display">Daily Quest</h3>
                            <p className="text-white/80 mb-8 font-medium font-sans">Complete topics consistently to boost your learning streaks.</p>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-80">
                                    <span>Quest Progress</span>
                                    <span>{Math.min(100, Math.round((streak / 7) * 100))}%</span>
                                </div>
                                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-white h-full rounded-full shadow-[0_0_10px_white]" style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }} />
                                </div>
                            </div>

                            <Link href="/learn" className="block w-full">
                                <button className="w-full bg-white text-brand-primary py-4 rounded-2xl font-bold font-display text-lg shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all btn-push">
                                    Learn Daily Topic
                                </button>
                            </Link>
                        </div>

                        {/* Badges/Achievements Case */}
                        <div className="bg-card rounded-[3.5rem] p-8 border border-border card-shadow">
                            <h4 className="text-center text-xs font-black uppercase tracking-[0.3em] text-text-secondary mb-8">Trophy Room</h4>
                            <div className="grid grid-cols-3 gap-6">
                                {[1, activities.length > 0 ? 2 : 0, xp >= 5000 ? 3 : 0, 0, 0, 0].map((val, idx) => (
                                    <div key={idx} className={`aspect-square rounded-2xl flex items-center justify-center border-2 border-dashed ${val > 0 ? 'bg-brand-primary/5 border-brand-primary/20 scale-110' : 'bg-background border-border opacity-30'}`}>
                                        {val > 0 ? <Award className={`w-8 h-8 text-brand-primary`} /> : <Layout className="w-6 h-6 text-text-secondary" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
