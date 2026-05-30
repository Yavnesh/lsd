"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Lock, Play, Clock, Star, Brain, BookOpen } from "lucide-react";
import Link from "next/link";

export default function TopicsPage() {
    const categories = [
        { title: "Psychology 101", icon: Brain, color: "text-brand-primary", bg: "bg-brand-primary/10" },
        { title: "Social Skills", icon: Star, color: "text-brand-secondary", bg: "bg-brand-secondary/10" },
        { title: "Money Intelligence", icon: Clock, color: "text-brand-success", bg: "bg-brand-success/10" },
    ];

    const topics = [
        {
            title: "Gaslighting 101",
            category: "Psychology",
            time: "60s",
            difficulty: "Easy",
            status: "Available",
            description: "Spot reality distortion before it spots you.",
            locked: false
        },
        {
            title: "Sunk Cost Fallacy",
            category: "Decision Making",
            time: "90s",
            difficulty: "Medium",
            status: "Available",
            description: "Why you keep doing things that make you miserable.",
            locked: false
        },
        {
            title: "Dark Persuasion",
            category: "Social Skills",
            time: "2m",
            difficulty: "Hard",
            status: "Premium",
            description: "The subtle art of making people say yes. Ethically-ish.",
            locked: true
        },
        {
            title: "Active Listening",
            category: "Social Skills",
            time: "60s",
            difficulty: "Easy",
            status: "Available",
            description: "Stop waiting for your turn to speak.",
            locked: false
        },
        {
            title: "Dopamine Detox",
            category: "Biology",
            time: "90s",
            difficulty: "Medium",
            status: "Premium",
            description: "Reset your brain's pleasure center.",
            locked: true
        },
        {
            title: "The Halo Effect",
            category: "Psychology",
            time: "60s",
            difficulty: "Easy",
            status: "Available",
            description: "Why pretty people get away with everything.",
            locked: false
        },
    ];

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
                    {categories.map((cat, i) => (
                        <button key={i} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border shadow-sm whitespace-nowrap hover:border-brand-primary transition-all group btn-push">
                            <div className={`${cat.bg} ${cat.color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-foreground font-display">{cat.title}</span>
                        </button>
                    ))}
                </div>

                {/* Topics Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {topics.map((topic, i) => (
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
                                        {topic.category}
                                    </span>
                                    {topic.locked ? (
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
                                    {topic.title}
                                </h3>
                                <p className="text-text-secondary font-medium font-sans leading-relaxed mb-6">
                                    {topic.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs font-black text-text-secondary/60 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {topic.time}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Brain className="w-3.5 h-3.5" />
                                        {topic.difficulty}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8">
                                {topic.locked ? (
                                    <button className="w-full py-4 bg-foreground/5 text-foreground/40 rounded-2xl font-bold font-display flex items-center justify-center gap-2 cursor-not-allowed group-hover:bg-foreground/10 transition-all">
                                        <Lock className="w-5 h-5" />
                                        Premium Access
                                    </button>
                                ) : (
                                    <Link href="/learn" className="block">
                                        <button className="w-full py-4 gradient-primary text-white rounded-2xl font-bold font-display flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 active:scale-95 transition-all btn-push">
                                            <Play className="w-5 h-5 fill-current" />
                                            Start IQ Grind
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
