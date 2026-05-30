"use client";

import { motion } from "framer-motion";
import { Share2, Instagram, Twitter, MessageCircle, Sparkles } from "lucide-react";

export const ShareCard = ({ title, summary, teaser }: { title: string, summary: string, teaser: string }) => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="bg-card p-10 rounded-[3rem] card-shadow border border-border max-w-sm mx-auto overflow-hidden relative group"
        >
            {/* Playful background glow */}
            <div className="absolute top-0 right-0 p-8 bg-brand-primary/5 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-brand-primary/10 transition-colors" />

            <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="p-2 bg-brand-primary/10 rounded-xl">
                        <Sparkles className="w-5 h-5 text-brand-primary fill-brand-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">LSD Daily Insight</span>
                </div>

                <div>
                    <h3 className="text-3xl font-bold font-display text-foreground leading-tight">{title}</h3>
                </div>

                <div className="bg-background p-6 rounded-2xl border-l-[6px] border-brand-primary italic shadow-inner">
                    <p className="text-text-secondary font-medium leading-relaxed font-sans">
                        "{summary}"
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-50">Brain Teaser</p>
                    <p className="text-lg font-bold text-foreground font-display leading-snug">
                        {teaser}
                    </p>
                </div>

                <div className="pt-8 border-t border-border">
                    <p className="text-center text-[10px] font-black text-text-secondary mb-6 uppercase tracking-[0.2em]">Savage Challenge Sent To:</p>
                    <div className="flex justify-center gap-5">
                        <motion.button whileHover={{ scale: 1.2, y: -5 }} className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center border border-pink-100 shadow-sm transition-all">
                            <Instagram className="w-6 h-6" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.2, y: -5 }} className="w-12 h-12 bg-brand-secondary/10 text-brand-secondary rounded-2xl flex items-center justify-center border border-brand-secondary/20 shadow-sm transition-all">
                            <Twitter className="w-6 h-6 fill-current" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.2, y: -5 }} className="w-12 h-12 bg-brand-success/10 text-brand-success rounded-2xl flex items-center justify-center border border-brand-success/20 shadow-sm transition-all">
                            <MessageCircle className="w-6 h-6 fill-current" />
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="mt-10 text-center">
                <span className="gradient-text font-black text-[10px] uppercase tracking-[0.3em]">Learn Something Daily on LSD.app</span>
            </div>
        </motion.div>
    );
};
