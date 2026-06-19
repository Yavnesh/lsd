"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Lock, Play, Clock, Star, Brain, BookOpen } from "lucide-react";
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
    dayOfWeek: number;
}

export default function TopicsPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTopics() {
            try {
                const res = await fetch("/api/topics");
                if (res.ok) {
                    const data = await res.json();
                    setTopics(data);
                }
            } catch (err) {
                console.error("Failed to load topics", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTopics();
    }, []);

    // Dynamically calculate unique clusters for categories filter
    const clusters = Array.from(new Set(topics.map(t => t.cluster).filter(Boolean))) as string[];

    const filteredTopics = selectedCluster 
        ? topics.filter(t => t.cluster === selectedCluster)
        : topics;

    if (loading) {
        return (
            <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-lg text-text-secondary font-bold font-display uppercase tracking-widest">Loading Topics Archive...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pb-24 bg-background">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 max-w-6xl">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold font-display mb-4 text-foreground tracking-tight">Daily <span className="text-brand-primary">Intel</span></h1>
                    <p className="text-text-secondary text-xl font-medium max-w-2xl">Pick your poison. 60 seconds of pure, unfiltered micro-entertainment.</p>
                </header>

                {/* Categories Scroller */}
                <div className="flex gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar">
                    <button 
                        onClick={() => setSelectedCluster(null)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-sm whitespace-nowrap transition-all group btn-push ${!selectedCluster ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'bg-card border-border text-foreground hover:border-brand-primary'}`}
                    >
                        <Brain className="w-5 h-5" />
                        <span className="font-bold font-display">All Topics</span>
                    </button>
                    {clusters.map((cluster, i) => (
                        <button 
                            key={i} 
                            onClick={() => setSelectedCluster(cluster)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-sm whitespace-nowrap transition-all group btn-push ${selectedCluster === cluster ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'bg-card border-border text-foreground hover:border-brand-primary'}`}
                        >
                            <span className="font-bold font-display">{cluster}</span>
                        </button>
                    ))}
                </div>

                {/* Topics Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTopics.map((topic, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -8 }}
                            className="bg-card rounded-[2.5rem] card-shadow border border-border overflow-hidden flex flex-col group"
                        >
                            <div className="p-8 flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full">
                                        {topic.cluster || topic.season}
                                    </span>
                                    {topic.isPremium ? (
                                        <div className="p-2 bg-foreground/5 rounded-xl text-foreground/40">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-brand-success/10 rounded-xl text-brand-success">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-2xl font-bold font-display text-foreground mb-3 leading-tight group-hover:text-brand-primary transition-colors">
                                    {topic.title} {topic.emoji}
                                </h3>
                                <p className="text-text-secondary font-medium font-sans leading-relaxed mb-6">
                                    {topic.summary}
                                </p>

                                <div className="flex items-center gap-4 text-xs font-black text-text-secondary/60 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        60s
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Brain className="w-3.5 h-3.5" />
                                        {topic.season}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8">
                                {topic.isPremium ? (
                                    <button className="w-full py-4 bg-foreground/5 text-foreground/40 rounded-2xl font-bold font-display flex items-center justify-center gap-2 cursor-not-allowed group-hover:bg-foreground/10 transition-all">
                                        <Lock className="w-5 h-5" />
                                        Premium Access
                                    </button>
                                ) : (
                                    <Link href="/learn" className="block">
                                        <button className="w-full py-4 gradient-primary text-white rounded-2xl font-bold font-display flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 active:scale-95 transition-all btn-push">
                                            <Play className="w-5 h-5 fill-current" />
                                            Start Lesson
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Premium Upgrade Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-20 p-12 bg-foreground rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                        <div className="absolute top-1/2 left-1/4 w-64 h-64 border-8 border-white rounded-full animate-pulse" />
                    </div>

                    <div className="text-center md:text-left relative z-10">
                        <h2 className="text-3xl font-bold font-display mb-3">Unlock Daily Superpowers</h2>
                        <p className="text-white/60 font-medium max-w-sm">Get access to Dark Persuasion, Mental Models 2.0, and 50+ premium intelligence drops.</p>
                    </div>

                    <button className="bg-brand-accent text-foreground px-10 py-5 rounded-[2rem] font-black font-display text-lg shadow-2xl shadow-brand-accent/30 hover:scale-105 active:scale-95 transition-all btn-push relative z-10">
                        Go Premium Now
                    </button>
                </motion.div>
            </div>
        </main>
    );
}

const CheckCircle2 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);
