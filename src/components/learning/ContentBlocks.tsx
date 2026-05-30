"use client";

import { motion } from "framer-motion";

export const HookBlock = ({ text }: { text: string }) => {
    return (
        <div className="text-center px-4">
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-brand-primary font-display font-bold mb-4 tracking-[0.2em] uppercase text-sm"
            >
                Block 1 — The Hook
            </motion.p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-[1.2] mb-10 text-foreground">
                {text}
            </h2>
            <div className="w-24 h-2 gradient-primary mx-auto rounded-full shadow-lg shadow-brand-primary/20" />
        </div>
    );
};

export const MemeBlock = ({ imageUrl, caption, explanation }: { imageUrl: string, caption: string, explanation: string }) => {
    return (
        <div className="space-y-10">
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-card lg:-rotate-2 hover:rotate-0 transition-transform duration-700 ease-out cursor-default">
                <img src={imageUrl} alt="Meme Concept" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 py-10 px-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <p className="text-white text-2xl md:text-3xl font-bold font-display text-center drop-shadow-lg">
                        {caption}
                    </p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-card p-10 rounded-[2.5rem] card-shadow border border-border relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="text-8xl font-black">?</span>
                </div>
                <h3 className="font-display text-2xl font-bold mb-4 text-brand-primary">Basically...</h3>
                <p className="text-xl text-text-secondary leading-[1.6] font-sans italic">
                    {explanation}
                </p>
            </motion.div>
        </div>
    );
};

export const SummaryBlock = ({ title, bulletPoints }: { title: string, bulletPoints: string[] }) => {
    return (
        <div className="bg-foreground p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            {/* Playful background texture */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary opacity-10 rounded-full blur-3xl translate-x-32 -translate-y-32" />

            <h3 className="text-3xl font-bold mb-10 font-display relative z-10">{title}</h3>
            <ul className="space-y-8 relative z-10">
                {bulletPoints.map((point, i) => (
                    <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        key={i}
                        className="flex items-start gap-5 group"
                    >
                        <div className="bg-brand-primary w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-brand-primary/40 group-hover:scale-110 transition-transform">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                            </svg>
                        </div>
                        <span className="text-lg md:text-xl text-white/90 font-sans leading-relaxed">{point}</span>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};
