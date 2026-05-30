"use client";

import { motion } from "framer-motion";
import { Zap, Trophy, Star } from "lucide-react";

export const GamificationHeader = ({ xp, streak, level }: { xp: number, streak: number, level: string }) => {
    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 flex gap-4 p-2 bg-card/60 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20">
            {/* Streak Badge */}
            <div className="flex items-center gap-2 px-5 py-2 bg-brand-orange/10 rounded-full border border-brand-orange/20">
                <motion.div
                    animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Zap className="w-5 h-5 text-brand-orange fill-brand-orange" />
                </motion.div>
                <span className="font-display font-black text-brand-orange leading-none">{streak}</span>
            </div>

            {/* XP Badge */}
            <div className="flex items-center gap-2 px-5 py-2 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                <Trophy className="w-5 h-5 text-brand-primary fill-brand-primary/20" />
                <span className="font-display font-black text-brand-primary leading-none">{xp} <span className="text-[10px] font-bold opacity-60">XP</span></span>
            </div>

            {/* Level Badge */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 bg-brand-secondary/10 rounded-full border border-brand-secondary/20">
                <Star className="w-4 h-4 text-brand-secondary fill-brand-secondary/20" />
                <span className="text-xs font-black text-brand-secondary uppercase tracking-widest">{level}</span>
            </div>
        </div>
    );
};

export const XPProgressBar = ({ currentXp, maxXp }: { currentXp: number, maxXp: number }) => {
    const progress = (currentXp / maxXp) * 100;

    return (
        <div className="w-full bg-background h-5 rounded-full overflow-hidden shadow-inner border border-border/50 p-1">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-full gradient-primary rounded-full shadow-[0_0_15px_rgba(108,92,231,0.3)] relative"
            >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
        </div>
    );
};
