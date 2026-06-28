"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

// Inline XP progress bar — used inside pages (not fixed)
export const XPProgressBar = ({ currentXp, maxXp }: { currentXp: number, maxXp: number }) => {
    const progress = Math.min(100, (currentXp / maxXp) * 100);

    return (
        <div className="xp-bar-track w-full h-4">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="xp-bar-fill h-full relative overflow-hidden"
            >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 shimmer opacity-40" />
            </motion.div>
        </div>
    );
};

// Inline Quest Progress Bar — used on learn page
export const QuestProgressBar = ({ stages, current }: { stages: number, current: number }) => {
    const pct = Math.min(100, (current / Math.max(stages - 1, 1)) * 100);
    return (
        <div className="w-full bg-black/30 rounded-full h-3 border border-white/10 p-0.5 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-primary shadow-[0_0_10px_rgba(247,201,72,0.6)]"
            />
        </div>
    );
};

// Inline HUD strip — used at top of learn page
export const GameHUD = ({ xp, streak, level, shields }: { xp: number, streak: number, level: string, shields?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-black/40 backdrop-blur-lg border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] w-fit mx-auto font-game"
        >
            {/* Brain avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/30 border border-brand-primary/50 flex items-center justify-center text-lg shadow-inner">
                    🧠
                </div>
                <span className="absolute -bottom-1 -right-1 bg-brand-primary text-[7px] font-black text-white px-1 py-0.5 rounded-full border border-black/30 leading-none">
                    Lv{Math.floor(xp / 1000) + 1}
                </span>
            </div>

            {/* XP bar */}
            <div className="flex-1 min-w-[100px] space-y-1">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-brand-primary opacity-80">
                    <span>XP</span>
                    <span>{xp % 1000}/1000</span>
                </div>
                <div className="xp-bar-track h-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(xp % 1000) / 10}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="xp-bar-fill h-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                {/* Streak */}
                <div className="flex items-center gap-1">
                    <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-base"
                    >
                        🔥
                    </motion.span>
                    <span className="font-black text-brand-orange text-sm">{streak}</span>
                </div>

                {/* Shield */}
                {shields !== undefined && (
                    <div className="flex items-center gap-1">
                        <span className="text-sm">🛡️</span>
                        <span className="font-black text-brand-secondary text-xs">{shields}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Legacy alias — kept so existing imports don't break
export const GamificationHeader = ({ xp, streak, level }: { xp: number, streak: number, level: string }) => {
    return <GameHUD xp={xp} streak={streak} level={level} />;
};
