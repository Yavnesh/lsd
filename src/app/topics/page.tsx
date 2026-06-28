"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Play, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Topic {
    id: string;
    title: string;
    slug: string;
    emoji: string;
    summary: string;
    season: string;
    cluster: string;
    isPremium: boolean;
    dayOfWeek: number;
}

// World region configurations mapped by Season/Theme
const worldMeta: Record<string, {
    name: string;
    desc: string;
    emoji: string;
    icon: string;
    gradient: string;
    border: string;
    glow: string;
    color: string;
    bgWorld: string;
}> = {
    "Understand Yourself": {
        name: "Self Awareness Sanctuary",
        desc: "Decode energy recharge patterns, attachment styles, introvert types, and the human mind.",
        emoji: "🧠",
        icon: "🪐",
        gradient: "from-purple-600/25 to-indigo-600/10",
        border: "border-purple-500/25",
        glow: "rgba(124,77,255,0.25)",
        color: "text-purple-400",
        bgWorld: "bg-world-magic",
    },
    "Surviving The Internet": {
        name: "Internet Nexus",
        desc: "Master the psychology of attention economy, echo chambers, and dopamine loops.",
        emoji: "📱",
        icon: "🔮",
        gradient: "from-cyan-600/25 to-blue-600/10",
        border: "border-cyan-500/25",
        glow: "rgba(6,182,212,0.25)",
        color: "text-cyan-400",
        bgWorld: "bg-world-sky",
    },
    "Your Body Explained": {
        name: "Bio-Dome Arena",
        desc: "Uncover sleep cycles, nutrition science, stress biology, and brain health.",
        emoji: "🧬",
        icon: "⚗️",
        gradient: "from-rose-600/25 to-pink-600/10",
        border: "border-rose-500/25",
        glow: "rgba(244,63,94,0.25)",
        color: "text-rose-400",
        bgWorld: "bg-world-magic",
    },
    "Think Better": {
        name: "Cognitive Spire",
        desc: "Discover cognitive biases, mental models, decision-making, and critical thinking.",
        emoji: "⚡",
        icon: "🧠",
        gradient: "from-amber-600/25 to-orange-600/10",
        border: "border-amber-500/25",
        glow: "rgba(245,158,11,0.25)",
        color: "text-amber-400",
        bgWorld: "bg-world-quest",
    },
    "Money Without The Boring Stuff": {
        name: "Earning Mindset World",
        desc: "Learn compound interest, behavioral finance, the wealth mindset, and card psychology.",
        emoji: "📈",
        icon: "💰",
        gradient: "from-green-600/25 to-emerald-600/10",
        border: "border-green-500/25",
        glow: "rgba(76,175,80,0.25)",
        color: "text-brand-success",
        bgWorld: "bg-world-forest",
    },
};

const getWorldMeta = (season: string, index: number) => {
    return worldMeta[season] || {
        name: `${season} World`,
        desc: `Explore specialized knowledge about ${season}.`,
        emoji: ["🌋", "🌊", "🏜️", "❄️"][index % 4],
        icon: ["🔮", "💎", "⚗️", "🎭"][index % 4],
        gradient: ["from-cyan-600/25 to-blue-600/10", "from-rose-600/25 to-pink-600/10"][index % 2],
        border: ["border-cyan-500/25", "border-rose-500/25"][index % 2],
        glow: ["rgba(41,182,246,0.2)", "rgba(244,63,94,0.2)"][index % 2],
        color: ["text-brand-secondary", "text-brand-error"][index % 2],
        bgWorld: "bg-world-sky",
    };
};

export default function TopicsPage() {
    const { data: session } = useSession();
    const isUserPremium = (session?.user as any)?.isPremium === true;
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTopics() {
            try {
                const res = await fetch("/api/topics");
                if (res.ok) setTopics(await res.json());
            } catch (err) {
                console.error("Failed to load topics", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTopics();
    }, []);

    const seasons = Array.from(new Set(topics.map(t => t.season).filter(Boolean))) as string[];
    // De-duplicate topics in list view by title so we show the unique topics in the season regardless of dayOfWeek
    const getUniqueTopicsForSeason = (season: string) => {
        const seasonTopics = topics.filter(t => t.season === season);
        const uniqueMap = new Map<string, Topic>();
        seasonTopics.forEach(t => {
            if (!uniqueMap.has(t.title)) {
                uniqueMap.set(t.title, t);
            }
        });
        return Array.from(uniqueMap.values());
    };

    const filteredTopics = selectedSeason ? getUniqueTopicsForSeason(selectedSeason) : [];
    const selectedMeta = selectedSeason ? getWorldMeta(selectedSeason, seasons.indexOf(selectedSeason)) : null;

    if (loading) {
        return (
            <main className="min-h-screen bg-world-forest text-foreground flex items-center justify-center">
                <div className="text-center space-y-5">
                    <motion.div
                        animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-7xl"
                    >
                        🗺️
                    </motion.div>
                    <p className="font-game text-2xl text-foreground">Loading World Map...</p>
                    <div className="w-48 mx-auto h-1.5 bg-brand-success/20 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full gradient-forest rounded-full"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                        />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={`min-h-screen pb-28 md:pb-16 text-foreground relative overflow-hidden ${selectedMeta?.bgWorld || "bg-world-forest"}`}>

            {/* Atmospheric ambient effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-brand-success/50"
                        style={{ left: `${10 + i * 25}%`, top: `${15 + i * 18}%` }}
                        animate={{ y: [0, -70, 0], opacity: [0, 0.7, 0] }}
                        transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, delay: i * 0.7 }}
                    />
                ))}
            </div>

            <Navbar />

            <div className="container mx-auto px-4 md:px-6 pt-24 max-w-5xl relative z-10">

                <AnimatePresence mode="wait">
                    {selectedSeason === null ? (
                        /* === WORLD MAP VIEW === */
                        <motion.div
                            key="world-map"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                        >
                            <header className="mb-12 text-center">
                                <motion.div
                                    animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="text-6xl mb-5"
                                >
                                    🗺️
                                </motion.div>
                                <span className="inline-block text-[9px] font-black uppercase tracking-[0.3em] text-brand-success bg-brand-success/10 px-4 py-2 rounded-full mb-4">
                                    The Expedition
                                </span>
                                <h1 className="font-game text-4xl md:text-5xl text-foreground mb-4">
                                    Choose Your <span className="gradient-text">World</span>
                                </h1>
                                <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                                    Every world holds unique knowledge. Explore regions, complete quests, and expand your cognitive empire.
                                </p>
                            </header>

                            {seasons.length === 0 ? (
                                <div className="game-card p-16 text-center">
                                    <div className="text-6xl mb-4 floating">🌱</div>
                                    <p className="font-game text-xl text-foreground mb-2">The world is growing</p>
                                    <p className="text-text-secondary">New knowledge regions are being discovered. Check back soon!</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {seasons.map((season, i) => {
                                        const meta = getWorldMeta(season, i);
                                        const seasonTopics = getUniqueTopicsForSeason(season);
                                        return (
                                            <motion.div
                                                key={season}
                                                initial={{ opacity: 0, y: 25 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                onClick={() => setSelectedSeason(season)}
                                                className={`game-card p-7 cursor-pointer relative overflow-hidden group bg-gradient-to-br ${meta.gradient} border ${meta.border} min-h-[260px] flex flex-col justify-between`}
                                                style={{ boxShadow: `0 8px 30px ${meta.glow}, 0 4px 6px rgba(0,0,0,0.2)` }}
                                            >
                                                {/* Background glow */}
                                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-8 translate-x-8 pointer-events-none bg-gradient-to-br ${meta.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

                                                {/* Fog of war overlay for future worlds */}
                                                {seasonTopics.length === 0 && (
                                                    <div className="absolute inset-0 fog-of-war rounded-[2rem] flex items-center justify-center z-20">
                                                        <div className="text-center">
                                                            <span className="text-4xl opacity-50">🌫️</span>
                                                            <p className="font-game text-sm text-white/50 mt-2">Coming Soon</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="relative z-10 space-y-4">
                                                    {/* World icon */}
                                                    <div className="flex items-start justify-between">
                                                        <motion.div
                                                            animate={{ y: [0, -6, 0] }}
                                                            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                                                            className="text-5xl"
                                                        >
                                                            {meta.emoji}
                                                        </motion.div>
                                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${meta.color} bg-current/10 px-2.5 py-1 rounded-full`} style={{ backgroundColor: `${meta.glow}` }}>
                                                            {seasonTopics.length} Quests
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h3 className="font-game text-xl text-foreground group-hover:text-white transition-colors mb-2">
                                                            {meta.name}
                                                        </h3>
                                                        <p className="text-text-secondary text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                                                            {meta.desc}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className={`flex items-center justify-between pt-5 relative z-10 text-xs font-black uppercase tracking-wider ${meta.color} border-t border-current/15 mt-4`}>
                                                    <span>Enter World</span>
                                                    <motion.span
                                                        animate={{ x: [0, 4, 0] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        →
                                                    </motion.span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Premium upgrade */}
                            {!isUserPremium && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="mt-12 game-card p-10 md:p-14 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-brand-primary/5 to-transparent pointer-events-none" />
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                        <div>
                                            <div className="text-4xl mb-3 floating">⭐</div>
                                            <h2 className="font-game text-2xl text-foreground mb-2">Unlock Premium Worlds</h2>
                                            <p className="text-text-secondary max-w-sm text-sm">Dark Persuasion, Mental Models 2.0, and 50+ premium knowledge drops.</p>
                                        </div>
                                        <Link href="/premium">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="game-btn-gold px-8 py-4 text-base"
                                            >
                                                ⭐ Go Premium
                                            </motion.button>
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                    ) : (
                        /* === REGION VIEW === */
                        <motion.div
                            key="region-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {/* Back button */}
                            <motion.button
                                whileHover={{ x: -4 }}
                                onClick={() => setSelectedSeason(null)}
                                className={`flex items-center gap-2 font-game text-xs uppercase tracking-wider cursor-pointer mb-8 ${selectedMeta?.color || "text-brand-primary"}`}
                            >
                                <ChevronLeft className="w-4 h-4" /> Back to World Map
                            </motion.button>

                            {/* Region header */}
                            <div className="mb-8 text-center">
                                <div className="text-5xl mb-4 floating">{selectedMeta?.emoji}</div>
                                <h2 className="font-game text-3xl md:text-4xl text-foreground mb-2">{selectedMeta?.name}</h2>
                                <div className="flex items-center justify-center gap-3">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${selectedMeta?.color} bg-current/10 px-3 py-1.5 rounded-full`}
                                        style={{ backgroundColor: selectedMeta?.glow }}>
                                        {filteredTopics.length} Quests Available
                                    </span>
                                </div>
                            </div>

                            {/* Quest cards grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredTopics.map((topic, i) => {
                                    const isLocked = topic.isPremium && !isUserPremium;
                                    return (
                                        <motion.div
                                            key={topic.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            whileHover={{ y: -5 }}
                                            className="game-card overflow-hidden flex flex-col"
                                        >
                                            <div className="p-6 flex-1">
                                                <div className="flex justify-between items-start mb-5">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${selectedMeta?.color || "text-brand-primary"} px-2.5 py-1 rounded-full`}
                                                        style={{ backgroundColor: selectedMeta?.glow || "rgba(124,77,255,0.15)" }}>
                                                        Quest {topic.dayOfWeek || i + 1}
                                                    </span>
                                                    {isLocked ? (
                                                        <div className="p-1.5 bg-brand-gold/10 rounded-xl text-brand-gold">
                                                            <Lock className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="p-1.5 bg-brand-success/10 rounded-xl text-brand-success">
                                                            <Sparkles className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-3xl mb-3">{topic.emoji}</div>
                                                <h3 className="font-game text-base text-foreground mb-2 leading-tight">
                                                    {topic.title}
                                                </h3>
                                                <p className="text-text-secondary text-xs leading-relaxed">{topic.summary}</p>
                                            </div>

                                            <div className="px-6 pb-6">
                                                {isLocked ? (
                                                    <Link href="/premium" className="block">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            className="w-full py-3 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-amber-900 rounded-2xl font-game text-xs flex items-center justify-center gap-2 transition-all"
                                                        >
                                                            <Lock className="w-3.5 h-3.5" /> Unlock Premium
                                                        </motion.button>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/learn?slug=${topic.slug}`} className="block">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            className="game-btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
                                                        >
                                                            <Play className="w-4 h-4 fill-current" /> Start Quest
                                                        </motion.button>
                                                    </Link>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
