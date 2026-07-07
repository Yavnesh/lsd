"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trophy, Users, Zap, Search, ShieldCheck, Timer, AlertCircle, ArrowRight, BookOpen, Flame, Compass, Sparkles, Lock, Crown, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Topic {
    id: string;
    title: string;
    slug: string;
    emoji: string;
    summary: string;
    season: string;
    cluster: string;
    isPremium: boolean;
    difficultyRating: number;
}

// World region configurations matching the /topics page theme
const worldTheme: Record<string, {
    border: string;
    glow: string;
    color: string;
    gradient: string;
    badgeBg: string;
    glowShadow: string;
}> = {
    "Understand Yourself": {
        border: "border-purple-500/25 hover:border-purple-500/65",
        glow: "rgba(124,77,255,0.25)",
        color: "text-purple-500 dark:text-purple-400",
        gradient: "from-purple-600/10 via-purple-600/2 to-transparent",
        badgeBg: "bg-purple-500/15 border-purple-500/25 text-purple-600 dark:text-purple-400",
        glowShadow: "group-hover:shadow-[0_0_30px_rgba(124,77,255,0.2)]",
    },
    "Surviving The Internet": {
        border: "border-cyan-500/25 hover:border-cyan-500/65",
        glow: "rgba(6,182,212,0.25)",
        color: "text-cyan-500 dark:text-cyan-400",
        gradient: "from-cyan-600/10 via-cyan-600/2 to-transparent",
        badgeBg: "bg-cyan-500/15 border-cyan-500/25 text-cyan-600 dark:text-cyan-400",
        glowShadow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
    },
    "Your Body Explained": {
        border: "border-rose-500/25 hover:border-rose-500/65",
        glow: "rgba(244,63,94,0.25)",
        color: "text-rose-500 dark:text-rose-400",
        gradient: "from-rose-600/10 via-rose-600/2 to-transparent",
        badgeBg: "bg-rose-500/15 border-rose-500/25 text-rose-600 dark:text-rose-400",
        glowShadow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]",
    },
    "Think Better": {
        border: "border-amber-500/25 hover:border-amber-500/65",
        glow: "rgba(245,158,11,0.25)",
        color: "text-amber-500 dark:text-amber-400",
        gradient: "from-amber-600/10 via-amber-600/2 to-transparent",
        badgeBg: "bg-amber-500/15 border-amber-500/25 text-amber-600 dark:text-amber-400",
        glowShadow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
    },
    "Money Without The Boring Stuff": {
        border: "border-green-500/25 hover:border-green-500/65",
        glow: "rgba(76,175,80,0.25)",
        color: "text-brand-success",
        gradient: "from-green-600/10 via-green-600/2 to-transparent",
        badgeBg: "bg-green-500/15 border-green-500/25 text-brand-success",
        glowShadow: "group-hover:shadow-[0_0_30px_rgba(76,175,80,0.2)]",
    },
};

const getTheme = (season: string) => {
    return worldTheme[season] || {
        border: "border-white/10 hover:border-brand-primary/50",
        glow: "rgba(124,77,255,0.2)",
        color: "text-foreground",
        gradient: "from-brand-primary/10 to-transparent",
        badgeBg: "bg-brand-primary/15 border-brand-primary/20 text-brand-primary",
        glowShadow: "group-hover:shadow-[0_0_30px_rgba(124,77,255,0.15)]",
    };
};

export default function QuizHubPage() {
    const router = useRouter();
    const { xp, streak, hearts, level, heartsRefillStartedAt, refillHeartsIfNeeded, syncWithDatabase } = useUserStore();
    const [heartCountdown, setHeartCountdown] = useState<string>("");
    
    const cachedCompletedIds = useUserStore(state => state.completedTopicIds);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(cachedCompletedIds || []);
    const [todayTopic, setTodayTopic] = useState<Topic | null>(null);
    const [isTodayCompleted, setIsTodayCompleted] = useState<boolean>(false);
    
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSeason, setSelectedSeason] = useState<string>("All");
    const [favorites, setFavorites] = useState<string[]>([]);
    
    // Countdown state
    const [timeLeft, setTimeLeft] = useState("00:00:00");

    // Countdown Timer logic to midnight
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            const diffMs = midnight.getTime() - now.getTime();
            if (diffMs <= 0) {
                setTimeLeft("00:00:00");
                return;
            }
            const hours = Math.floor(diffMs / (3600 * 1000));
            const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
            const secs = Math.floor((diffMs % (60 * 1000)) / 1000);
            
            const pad = (n: number) => String(n).padStart(2, '0');
            setTimeLeft(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    // Heart refill timer logic
    useEffect(() => {
        refillHeartsIfNeeded();
        const interval = setInterval(() => {
            refillHeartsIfNeeded();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (hearts >= 3 || !heartsRefillStartedAt) {
            setHeartCountdown("");
            return;
        }
        const updateCountdown = () => {
            const start = new Date(heartsRefillStartedAt).getTime();
            const nextRefill = start + 60 * 60 * 1000;
            const diff = nextRefill - Date.now();
            if (diff <= 0) {
                setHeartCountdown("00:00");
                refillHeartsIfNeeded();
            } else {
                const minutes = Math.floor(diff / (60 * 1000));
                const seconds = Math.floor((diff % (60 * 1000)) / 1000);
                setHeartCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [hearts, heartsRefillStartedAt]);

    useEffect(() => {
        async function loadData() {
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: tz });

                // 1. Fetch user activities to filter completed quizzes and sync stats
                const statsRes = await fetch(`/api/user/stats?tz=${encodeURIComponent(tz)}`);
                let doneIds: string[] = [];
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    
                    // Sync Zustand store stats directly from response
                    useUserStore.setState({
                        xp: statsData.stats.xp,
                        streak: statsData.stats.streak,
                        level: statsData.stats.level,
                        streakShields: statsData.stats.streakShields
                    });

                    const completed = statsData.activities?.filter((a: any) => a.status === "COMPLETED") || [];
                    doneIds = completed.map((a: any) => a.topicId);
                    setCompletedTopicIds(doneIds);
                }

                // 2. Fetch today's topic
                const todayRes = await fetch(`/api/topics/today?tz=${encodeURIComponent(tz)}&date=${todayKey}`);
                let currentTodayTopic: Topic | null = null;
                if (todayRes.ok) {
                    currentTodayTopic = await todayRes.json();
                    setTodayTopic(currentTodayTopic);
                    if (currentTodayTopic && doneIds.includes(currentTodayTopic.id)) {
                        setIsTodayCompleted(true);
                    }
                }

                // 3. Fetch all topics
                const res = await fetch("/api/topics");
                if (res.ok) {
                    const data = await res.json();
                    setTopics(data);
                }
            } catch (e) {
                console.error("Error loading hub data:", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();

        // Load favorites from local storage
        const savedFavorites = localStorage.getItem("lsd-favorite-decks");
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (_) {}
        }
    }, []);

    const toggleFavorite = (cluster: string) => {
        const updated = favorites.includes(cluster)
            ? favorites.filter(f => f !== cluster)
            : [...favorites, cluster];
        setFavorites(updated);
        localStorage.setItem("lsd-favorite-decks", JSON.stringify(updated));
    };

    const seasons = ["All", "Understand Yourself", "Surviving The Internet", "Your Body Explained", "Think Better", "Money Without The Boring Stuff"];

    // Filter topics that:
    // 1. Match search & season selectors
    // 2. Have NOT been completed by the user
    const filteredTopics = topics.filter(t => {
        const isCompleted = completedTopicIds.includes(t.id);
        if (isCompleted) return false;

        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.cluster.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeason = selectedSeason === "All" || t.season === selectedSeason;
        return matchesSearch && matchesSeason;
    });

    const favoriteTopics = filteredTopics.filter(t => favorites.includes(t.cluster));
    const normalTopics = filteredTopics.filter(t => !favorites.includes(t.cluster));

    if (loading) {
        return (
            <main className="min-h-screen bg-world-quest text-foreground flex items-center justify-center">
                <div className="text-center space-y-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="text-5xl">⚔️</motion.div>
                    <p className="font-game text-xl">Loading Arena Hub...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-world-quest text-foreground pb-24 relative overflow-hidden">
            {/* Nav component */}
            <Navbar />
            
            {/* Atmospheric floating particles matching dashboard */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`absolute w-1 h-1 rounded-full ${
                            ["bg-brand-primary/30", "bg-brand-success/30", "bg-brand-gold/30", "bg-brand-error/30"][i % 4]
                        }`}
                        style={{ left: `${15 + i * 15}%`, top: `${15 + i * 12}%` }}
                        animate={{ y: [0, -100, 0], opacity: [0, 0.7, 0] }}
                        transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.9 }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-6 pt-28 max-w-4xl space-y-8 relative z-10">
                
                {/* 1. HERO STATS HEADER WITH HIGH FIDELITY GRADIENTS & NEON SHADOWS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div 
                        whileHover={{ y: -4 }} 
                        className="game-card p-5 rounded-3xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 via-card/60 to-card shadow-[0_8px_30px_rgba(124,77,255,0.05)] text-center relative overflow-hidden group flex flex-col justify-between"
                    >
                        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary block">Hearts</span>
                        
                        <div className="flex justify-center gap-3 mt-3">
                            {[0, 1, 2].map((i) => {
                                const filled = i < hearts;
                                return (
                                    <Heart 
                                        key={i} 
                                        className={`w-7 h-7 transition-all duration-300 ${
                                            filled 
                                                ? 'text-[#ff4b4b] fill-[#ff4b4b] filter drop-shadow-[0_2px_8px_rgba(255,75,75,0.6)] animate-pulse' 
                                                : 'text-white/10 fill-none stroke-white/20'
                                        }`}
                                    />
                                );
                            })}
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary mt-2.5 block font-mono">
                            {hearts === 3 ? "FULL" : heartCountdown ? `${heartCountdown}` : ""}
                        </span>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4 }} 
                        className="game-card p-5 rounded-3xl border border-brand-gold/20 bg-gradient-to-br from-brand-gold/10 via-card/60 to-card shadow-[0_8px_30px_rgba(247,201,72,0.05)] text-center relative overflow-hidden group flex flex-col justify-between items-center"
                    >
                        <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold block">Quest Streak</span>
                        
                        <div className="flex items-center gap-2 mt-3">
                            <Flame className="w-7 h-7 text-brand-gold fill-brand-gold filter drop-shadow-[0_2px_8px_rgba(247,201,72,0.6)]" />
                            <span className="font-game text-2xl text-foreground filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{streak} Days</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary mt-2.5 block font-mono">
                            STREAK ACTIVE
                        </span>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4 }} 
                        className="game-card p-5 rounded-3xl border border-brand-success/20 bg-gradient-to-br from-brand-success/10 via-card/60 to-card shadow-[0_8px_30px_rgba(76,175,80,0.05)] text-center relative overflow-hidden group flex flex-col justify-between items-center"
                    >
                        <div className="absolute inset-0 bg-brand-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-success block">Rank Level</span>
                        
                        <div className="flex items-center gap-2 mt-3">
                            <Crown className="w-7 h-7 text-brand-success fill-brand-success filter drop-shadow-[0_2px_8px_rgba(34,197,94,0.6)]" />
                            <span className="font-game text-base text-foreground truncate max-w-[120px]">{level}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary mt-2.5 block font-mono">
                            TIER TACTICAL
                        </span>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -4 }} 
                        className="game-card p-5 rounded-3xl border border-brand-orange/20 bg-gradient-to-br from-brand-orange/10 via-card/60 to-card shadow-[0_8px_30px_rgba(255,159,67,0.05)] text-center relative overflow-hidden group flex flex-col justify-between items-center"
                    >
                        <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange block">XP Volume</span>
                        
                        <div className="flex items-center gap-2 mt-3">
                            <Zap className="w-7 h-7 text-brand-orange fill-brand-orange filter drop-shadow-[0_2px_8px_rgba(255,159,67,0.6)]" />
                            <span className="font-game text-2xl text-foreground filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{xp} XP</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary mt-2.5 block font-mono">
                            TOTAL SCORE
                        </span>
                    </motion.div>
                </div>

                {/* 2. DYNAMIC QUEST HERO BANNER WITH VIBRANT ANIMATED SHINE & GRADIENTS */}
                <AnimatePresence mode="wait">
                    {!isTodayCompleted && todayTopic ? (
                        <motion.div
                            key="quest-active"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="relative overflow-hidden rounded-[2.5rem] border-2 border-brand-primary/45 shadow-[0_20px_50px_rgba(124,77,255,0.25)] bg-gradient-to-br from-card via-card/90 to-brand-primary/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            {/* Radial neon backdrops */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/25 rounded-full blur-[90px] pointer-events-none animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/20 rounded-full blur-[90px] pointer-events-none" />

                            <div className="space-y-4 flex-grow text-center md:text-left relative z-10">
                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-primary text-[10px] font-black uppercase tracking-widest animate-bounce">
                                    <Sparkles className="w-3.5 h-3.5 fill-current" /> Active Daily Quest
                                </div>
                                <h2 className="font-game text-3xl md:text-4xl leading-snug max-w-lg text-foreground filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                                    {todayTopic.emoji} {todayTopic.title}
                                </h2>
                                <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
                                    {todayTopic.summary}
                                </p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-black uppercase tracking-wider text-brand-gold">
                                    <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 fill-brand-gold" /> +50 XP Reward</span>
                                    <span className="text-text-secondary">•</span>
                                    <span>🧠 {todayTopic.season}</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-full md:w-auto relative z-10">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push(`/learn?slug=${todayTopic.slug}`)}
                                    className="game-btn-gold w-full md:w-auto px-8 py-4 text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-gold/25"
                                >
                                    START QUEST <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="quest-completed"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="relative overflow-hidden rounded-[2.5rem] border-2 border-brand-success/45 bg-gradient-to-br from-card via-card/90 to-brand-success/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(76,175,80,0.12)]"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-success/20 rounded-full blur-[80px] pointer-events-none" />
                            
                            <div className="space-y-4 flex-grow text-center md:text-left relative z-10">
                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-success/15 border border-brand-success/30 text-brand-success text-[10px] font-black uppercase tracking-widest">
                                    🏆 Quest Complete
                                </div>
                                <h2 className="font-game text-2xl text-foreground">
                                    Daily Mission Accomplished!
                                </h2>
                                <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
                                    You have completed today's cognitive challenge and secured your streak. Tomorrow's next operation is preparing.
                                </p>
                            </div>
                            <div className="flex-shrink-0 bg-white dark:bg-card border border-border/40 px-6 py-4 rounded-3xl flex flex-col items-center justify-center min-w-[180px] w-full md:w-auto text-center relative z-10 shadow-sm">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 mb-1">
                                    <Lock className="w-3.5 h-3.5 text-brand-gold" /> Unlocks In
                                </span>
                                <span className="font-game text-2xl text-brand-primary tracking-wider font-bold">{timeLeft}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. SEARCH & SEASON SELECTOR */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/40 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-md">
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search active operations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-card border border-border/40 rounded-xl text-sm focus:outline-none focus:border-brand-primary text-foreground placeholder:text-text-secondary/50 font-medium transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {seasons.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedSeason(s)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                                    selectedSeason === s 
                                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25 scale-105" 
                                        : "bg-white/5 hover:bg-white/10 text-text-secondary"
                                }`}
                            >
                                {s === "All" ? "🌍 All Worlds" : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. BOOKMARKED DECKS */}
                {favoriteTopics.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="font-game text-lg text-brand-gold flex items-center gap-2">
                            <Star className="w-5 h-5 fill-brand-gold stroke-brand-gold" /> Bookmarked Operations
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {favoriteTopics.map((topic) => (
                                <DeckCard key={topic.id} topic={topic} isFavorite={true} onToggleFavorite={toggleFavorite} />
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. ACTIVE DECKS */}
                <div className="space-y-4">
                    <h2 className="font-game text-lg text-foreground flex items-center gap-2">
                        <Compass className="w-5 h-5 text-brand-primary animate-spin" style={{ animationDuration: "12s" }} /> Active Operations
                    </h2>
                    {filteredTopics.length === 0 ? (
                        <div className="p-12 text-center text-text-secondary border border-white/5 rounded-[2rem] bg-card/25 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                            <BookOpen className="w-10 h-10 text-text-secondary/35" />
                            <p className="font-medium text-sm">No new operations available. You have conquered all quizzes in this world!</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {normalTopics.slice(0, visibleCount).map((topic) => (
                                    <DeckCard key={topic.id} topic={topic} isFavorite={false} onToggleFavorite={toggleFavorite} />
                                ))}
                            </div>
                            {normalTopics.length > visibleCount && (
                                <div className="flex justify-center mt-8">
                                    <button 
                                        onClick={() => setVisibleCount(prev => prev + 20)}
                                        className="px-8 py-3 bg-brand-primary text-white font-game text-sm uppercase tracking-wider rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_5px_15px_rgba(124,77,255,0.4)]"
                                    >
                                        Load More Operations
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </main>
    );
}

function DeckCard({ topic, isFavorite, onToggleFavorite }: { topic: Topic, isFavorite: boolean, onToggleFavorite: (c: string) => void }) {
    const config = getTheme(topic.season);

    return (
        <motion.div
            layout
            whileHover={{ y: -6 }}
            className={`group game-card p-6 rounded-[2rem] border transition-all flex flex-col justify-between shadow-lg relative overflow-hidden bg-gradient-to-br ${config.gradient} ${config.border} ${config.glowShadow}`}
        >
            {/* Subtle glow highlight in top right */}
            <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
                style={{ backgroundColor: config.glow }}
            />

            <div>
                <div className="flex justify-between items-start mb-4">
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        className="w-12 h-12 rounded-2xl bg-black/10 dark:bg-black/35 border border-white/5 flex items-center justify-center text-3xl shadow-md"
                    >
                        {topic.emoji || "💡"}
                    </motion.div>
                    <button
                        onClick={() => onToggleFavorite(topic.cluster)}
                        className="p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                    >
                        <Star className={`w-5 h-5 transition-transform group-hover:scale-110 ${isFavorite ? "fill-brand-gold stroke-brand-gold" : "text-text-secondary"}`} />
                    </button>
                </div>
                
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border w-fit block mb-2 ${config.badgeBg}`}>
                    {topic.cluster}
                </span>

                <h3 className="font-game text-lg text-foreground leading-snug group-hover:text-brand-primary transition-colors">{topic.title}</h3>
                
                <p className="text-xs text-text-secondary mt-2.5 leading-relaxed line-clamp-2">
                    {topic.summary}
                </p>
                
                <div className="flex items-center gap-2 mt-4 bg-white dark:bg-card px-3.5 py-1.5 rounded-full border border-border/40 shadow-sm w-fit">
                    <ShieldCheck className="w-4 h-4 text-brand-gold fill-brand-gold/15" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Difficulty: <span className="text-foreground font-black">{topic.difficultyRating || 1200} Elo</span></span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/5 relative z-10">
                <Link href={`/learn?slug=${topic.slug}`} className="w-full">
                    <button className="w-full py-3 rounded-xl border border-brand-primary/30 hover:bg-brand-primary/5 text-brand-primary font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all">
                        <Zap className="w-3.5 h-3.5" /> SOLO QUEST
                    </button>
                </Link>
                <Link href={`/learn?slug=${topic.slug}&pvp=true`} className="w-full">
                    <button className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-primary/10">
                        <Users className="w-3.5 h-3.5" /> PVP DUEL
                    </button>
                </Link>
            </div>
        </motion.div>
    );
}
