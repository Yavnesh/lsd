"use client";

import { motion } from "framer-motion";

export const HookBlock = ({ text }: { text: string }) => {
    return (
        <div className="text-center px-4 py-8">
            {/* Chapter label */}
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-primary/40 max-w-[80px]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                    Hook
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-primary/40 max-w-[80px]" />
            </div>

            <motion.h2
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="font-game text-4xl md:text-6xl lg:text-7xl leading-[1.15] mb-8 text-foreground"
                style={{ textShadow: "0 4px 30px rgba(124,77,255,0.2)" }}
            >
                {text}
            </motion.h2>

            {/* Animated divider */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="w-24 h-1.5 gradient-gold mx-auto rounded-full shadow-[0_0_12px_rgba(247,201,72,0.5)]"
            />
        </div>
    );
};

export const MemeBlock = ({ imageUrl, caption, explanation }: { imageUrl: string, caption: string, explanation: string }) => {
    return (
        <div className="space-y-8">
            {/* Polaroid-style meme frame */}
            <motion.div
                initial={{ opacity: 0, rotate: -2, y: 20 }}
                animate={{ opacity: 1, rotate: -1, y: 0 }}
                whileHover={{ rotate: 0, scale: 1.01 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative aspect-video rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_0_8px_rgba(255,255,255,0.08)] cursor-default border border-white/10"
            >
                <img src={imageUrl} alt="Meme Concept" className="w-full h-full object-cover" />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Caption */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-0 inset-x-0 py-8 px-6 text-white font-game text-xl md:text-2xl text-center drop-shadow-lg"
                >
                    {caption}
                </motion.p>
                {/* Corner decorations */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-brand-gold/60 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-brand-gold/60 rounded-tr-lg" />
            </motion.div>

            {/* Explanation scroll */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="parchment-card p-8 rounded-[2rem] relative overflow-hidden"
            >
                {/* Decorative wax seal */}
                <div className="absolute -top-3 left-8 w-7 h-7 rounded-full gradient-primary shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                </div>
                <h3 className="font-game text-xl text-brand-primary mb-4 mt-2">Basically...</h3>
                <p className="text-lg text-foreground/80 leading-[1.8] italic">{explanation}</p>
            </motion.div>
        </div>
    );
};

export const SummaryBlock = ({ title, bulletPoints }: { title: string, bulletPoints: string[] }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden"
        >
            {/* Scroll-like parchment card */}
            <div className="parchment-card p-10 rounded-[2.5rem] relative overflow-hidden">
                {/* Top scroll decoration */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-brand-gold/20 via-brand-gold/40 to-brand-gold/20 rounded-t-[2.5rem]" />

                {/* Background glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/8 rounded-full blur-3xl -translate-y-12 translate-x-12" />

                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-brand-primary/30">
                        <span className="text-white font-bold">📜</span>
                    </div>
                    <h3 className="font-game text-2xl text-foreground">{title}</h3>
                </div>

                <ul className="space-y-5 relative z-10">
                    {bulletPoints.map((point, i) => (
                        <motion.li
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
                            key={i}
                            className="flex items-start gap-4 group"
                        >
                            <motion.div
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-brand-primary/30"
                            >
                                <span className="text-white text-xs font-black">{i + 1}</span>
                            </motion.div>
                            <span className="text-foreground/85 font-medium leading-[1.7] text-base">{point}</span>
                        </motion.li>
                    ))}
                </ul>

                {/* Bottom scroll decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-brand-gold/20 via-brand-gold/40 to-brand-gold/20 rounded-b-[2.5rem]" />
            </div>
        </motion.div>
    );
};
