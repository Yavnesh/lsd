"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Trophy, Map, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { name: "Nexus", href: "/learn", icon: Zap, emoji: "⚡", color: "text-brand-primary", glow: "rgba(124,77,255,0.5)" },
    { name: "Sanctuary", href: "/dashboard", icon: Trophy, emoji: "🏆", color: "text-brand-gold", glow: "rgba(247,201,72,0.5)" },
    { name: "Expedition", href: "/topics", icon: Map, emoji: "🗺️", color: "text-brand-forest", glow: "rgba(76,175,80,0.5)" },
    { name: "Arena", href: "/leaderboard", icon: Swords, emoji: "⚔️", color: "text-brand-error", glow: "rgba(255,107,107,0.5)" },
];

export const BottomNav = () => {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            aria-label="Mobile navigation"
        >
            {/* Glow rim above nav */}
            <div className="h-px bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />

            <div className="glass-dark px-2 pt-2 pb-safe-area-inset-bottom pb-3">
                <div className="flex items-stretch justify-around max-w-sm mx-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex-1"
                                aria-label={item.name}
                            >
                                <motion.div
                                    whileTap={{ scale: 0.88 }}
                                    className="relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl cursor-pointer"
                                >
                                    {/* Active background pill */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="bottomNavActive"
                                            className="absolute inset-0 rounded-2xl"
                                            style={{
                                                background: `radial-gradient(ellipse at center, ${item.glow} 0%, transparent 70%)`,
                                                opacity: 0.25,
                                            }}
                                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                        />
                                    )}

                                    {/* Icon */}
                                    <motion.div
                                        animate={isActive ? { scale: [1, 1.2, 1], y: [0, -3, 0] } : {}}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className={`relative w-7 h-7 flex items-center justify-center ${isActive ? item.color : "text-text-secondary"}`}
                                    >
                                        <item.icon
                                            className={`w-6 h-6 transition-all duration-300 ${isActive ? "fill-current drop-shadow-[0_0_6px_currentColor]" : ""}`}
                                        />
                                    </motion.div>

                                    {/* Label */}
                                    <span className={`text-[9px] font-black uppercase tracking-wider leading-none transition-colors duration-300 ${
                                        isActive ? item.color : "text-text-secondary/60"
                                    }`}>
                                        {item.name}
                                    </span>

                                    {/* Active dot indicator */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                                style={{ background: item.glow.replace("0.5)", "1)") }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
