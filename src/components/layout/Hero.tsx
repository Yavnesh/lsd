"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const floatVariants = {
    initial: { y: 0 },
    animate: { y: [-10, 10, -10], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } }
};

const worldFeatures = [
    {
        emoji: "🌋",
        title: "Psychology Mountains",
        desc: "Conquer the peaks of cognitive biases and mental models.",
        gradient: "from-rose-500/20 to-orange-500/10",
        border: "border-rose-500/20",
    },
    {
        emoji: "🌊",
        title: "Decision River",
        desc: "Navigate the currents of behavioral economics and choices.",
        gradient: "from-blue-500/20 to-cyan-500/10",
        border: "border-blue-500/20",
    },
    {
        emoji: "🌿",
        title: "Memory Garden",
        desc: "Grow your recall and sharpen your mental clarity.",
        gradient: "from-green-500/20 to-emerald-500/10",
        border: "border-green-500/20",
    },
];

export const Hero = () => {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-28 pb-16 bg-world-magic">

            {/* === Atmospheric layers === */}
            {/* Top sky gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/8 via-transparent to-brand-success/5 pointer-events-none" />

            {/* Floating ambient orbs */}
            <motion.div
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-[10%] w-72 h-72 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
                animate={{ x: [0, -25, 0], y: [0, 15, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-32 right-[8%] w-64 h-64 bg-brand-success/12 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
                animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                className="absolute bottom-40 left-[20%] w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"
            />

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-brand-gold/50 pointer-events-none"
                    style={{ left: `${15 + i * 14}%`, top: `${30 + (i % 3) * 20}%` }}
                    animate={{ y: [0, -60, 0], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
                />
            ))}

            <div className="container mx-auto px-6 text-center relative z-10 max-w-5xl">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-sm font-bold text-brand-primary mb-8 backdrop-blur-sm"
                >
                    <motion.span
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                        ✨
                    </motion.span>
                    Your Learning World Awaits
                </motion.div>

                {/* Main headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-game mb-6 leading-[1.1] tracking-tight"
                >
                    <span className="text-foreground">Become </span>
                    <span className="gradient-text-gold">1% Smarter</span>
                    <br />
                    <span className="text-foreground">Every </span>
                    <span className="gradient-text italic">Single Day.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="text-lg md:text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed"
                >
                    Enter your personal learning universe. Collect knowledge, battle quizzes,
                    grow your streak, and evolve — one epic lesson at a time.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <Link href="/signup">
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="game-btn-gold text-lg px-8 py-4 flex items-center gap-3"
                        >
                            <span>⚡</span>
                            Begin Your Quest
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                    <Link href="/learn">
                        <motion.button
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            className="px-8 py-4 rounded-[1.25rem] bg-card/60 backdrop-blur-sm border border-border text-foreground font-bold text-lg hover:border-brand-primary/40 transition-all"
                        >
                            Try a Quest
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Floating brain mascot island */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
                    className="relative mx-auto w-fit mb-20"
                >
                    {/* Island platform */}
                    <div className="relative">
                        {/* Glow beneath */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-12 bg-brand-primary/25 rounded-full blur-2xl" />

                        {/* Central brain orb */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-36 h-36 mx-auto"
                        >
                            <div className="w-full h-full rounded-full gradient-primary flex items-center justify-center shadow-[0_0_60px_rgba(124,77,255,0.4),0_20px_40px_rgba(0,0,0,0.3)] border-4 border-white/10">
                                <span className="text-6xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">🧠</span>
                            </div>
                            {/* Orbit ring */}
                            <div className="absolute inset-[-16px] rounded-full border-2 border-brand-primary/20 border-dashed orbit-spin-slow" />
                            {/* Orbiting XP orb */}
                            <div className="absolute inset-[-16px] orbit-spin-slow">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(247,201,72,0.8)] flex items-center justify-center">
                                    <span className="text-[8px]">⭐</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats floating around */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -left-16 top-8 bg-card/80 backdrop-blur-sm border border-border rounded-2xl px-3 py-2 text-center shadow-xl floating-slow"
                        >
                            <div className="font-game text-brand-gold text-lg font-bold">🔥 7</div>
                            <div className="text-[9px] text-text-secondary uppercase tracking-wider">Streak</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 }}
                            className="absolute -right-16 top-8 bg-card/80 backdrop-blur-sm border border-border rounded-2xl px-3 py-2 text-center shadow-xl"
                            style={{ animation: "float 4s 1s ease-in-out infinite" }}
                        >
                            <div className="font-game text-brand-primary text-lg font-bold">⚡ 2.4k</div>
                            <div className="text-[9px] text-text-secondary uppercase tracking-wider">XP</div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* World Regions Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                >
                    {worldFeatures.map((world, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`game-card p-6 text-left bg-gradient-to-br ${world.gradient} border ${world.border} cursor-pointer`}
                        >
                            <div className="text-4xl mb-4 floating" style={{ animationDelay: `${i * 0.5}s` }}>
                                {world.emoji}
                            </div>
                            <h3 className="font-game text-lg font-bold text-foreground mb-2">{world.title}</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">{world.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
