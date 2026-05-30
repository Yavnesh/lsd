"use client";

import { motion } from "framer-motion";
import { ArrowRight, Brain, Zap, Sparkles } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
    return (
        <section className="relative pt-40 pb-20 overflow-hidden">
            {/* Background Blobs with Refined Colors */}
            <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
            <div className="absolute top-0 -right-4 w-96 h-96 bg-brand-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700" />
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-brand-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-1000" />

            <div className="container mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white dark:bg-card shadow-lg border border-border text-sm font-bold text-brand-primary mb-10"
                >
                    <Sparkles className="w-4 h-4 fill-brand-primary" />
                    <span>LSD: Learn Something Daily</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 tracking-tight text-foreground"
                >
                    Become <span className="gradient-text italic">1% Smarter</span> <br /> Every Single Day.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed font-sans"
                >
                    Ditch total boring textbooks. Learn the things school never taught you — in 60 seconds of pure micro-entertainment.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link href="/learn">
                        <button className="gradient-primary flex items-center gap-2 px-10 py-5 rounded-[2rem] text-white font-bold text-lg shadow-xl shadow-brand-primary/25 hover:scale-105 active:scale-95 transition-all btn-push">
                            Start Learning Today
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                    <Link href="#how-it-works">
                        <button className="px-10 py-5 rounded-[2rem] bg-card border-2 border-border text-foreground font-bold text-lg shadow-sm hover:border-brand-primary/50 transition-all btn-push">
                            See How It Works
                        </button>
                    </Link>
                </motion.div>

                {/* Stats Preview with Playful Knowledge Palette */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
                >
                    {[
                        { label: "Daily Streaks", icon: Zap, color: "text-brand-orange", bg: "bg-brand-orange/10" },
                        { label: "Meme Power", icon: Brain, color: "text-brand-primary", bg: "bg-brand-primary/10" },
                        { label: "Savage Quizzes", icon: Brain, color: "text-brand-secondary", bg: "bg-brand-secondary/10" },
                        { label: "Practical IQ", icon: Sparkles, color: "text-brand-success", bg: "bg-brand-success/10" }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                <item.icon className="w-8 h-8 fill-current" />
                            </div>
                            <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">{item.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
