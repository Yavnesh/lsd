"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { QuizBlock } from "./QuizBlock";

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
                className="parchment-card p-8 rounded-[2rem] relative overflow-visible"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-full gradient-primary shadow-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <h3 className="font-game text-xl text-brand-primary">Basically...</h3>
                </div>
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

export const StoryBlock = ({ text }: { text: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="parchment-card p-8 rounded-[2rem] relative overflow-hidden border border-brand-primary/20"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-xl shadow-lg">
                    🎬
                </div>
                <h3 className="font-game text-xl text-brand-primary">Mental Movie</h3>
            </div>
            <p className="text-lg text-foreground/90 leading-[1.8] font-medium whitespace-pre-line">
                {text}
            </p>
        </motion.div>
    );
};

export const PsychologyBlock = ({ text }: { text: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="parchment-card p-8 rounded-[2rem] relative overflow-hidden border border-brand-gold/20"
        >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-gold/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-xl shadow-lg">
                    🧠
                </div>
                <h3 className="font-game text-xl text-brand-gold">The Psychology</h3>
            </div>
            <p className="text-lg text-foreground/95 leading-[1.8] font-semibold">
                {text}
            </p>
        </motion.div>
    );
};

export const ExamplesBlock = ({ items }: { items: string[] }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="parchment-card p-8 rounded-[2rem] relative overflow-hidden"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-brand-success/15 flex items-center justify-center text-xl shadow-lg">
                    💡
                </div>
                <h3 className="font-game text-xl text-brand-success">In the Real World</h3>
            </div>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/5"
                    >
                        <span className="text-xl mt-0.5">📌</span>
                        <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-medium">
                            {item}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export const CheatCodeBlock = ({ text }: { text: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="game-card p-8 rounded-[2.5rem] relative overflow-hidden border border-brand-success/30 shadow-[0_20px_50px_rgba(76,175,80,0.15)] bg-gradient-to-b from-brand-success/10 to-brand-success/5"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-success/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-brand-success/20 flex items-center justify-center text-xl shadow-lg shadow-brand-success/20">
                    🛠️
                </div>
                <h3 className="font-game text-xl text-brand-success">Cheat Code</h3>
            </div>
            <p className="text-lg text-foreground/90 leading-[1.8] font-bold">
                {text}
            </p>
        </motion.div>
    );
};

export const ShortcutBlock = ({ text }: { text: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="game-card p-8 rounded-[2.5rem] text-center border-2 border-brand-primary/30 relative overflow-hidden bg-brand-primary/10 shadow-[0_20px_50px_rgba(124,77,255,0.15)]"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-transparent to-brand-primary/5 pointer-events-none" />
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary bg-brand-primary/20 px-3.5 py-1.5 rounded-full inline-block mb-4">
                ⚡ Memory Shortcut
            </div>
            <p className="font-game text-xl md:text-2xl text-foreground max-w-lg mx-auto leading-relaxed drop-shadow-md">
                "{text}"
            </p>
        </motion.div>
    );
};

export const VictoryBlock = ({ text }: { text: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="game-card p-8 rounded-[2.5rem] text-center border border-brand-gold/30 relative overflow-hidden bg-brand-gold/10 shadow-[0_20px_50px_rgba(247,201,72,0.15)]"
        >
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-brand-gold/10 rounded-full blur-2xl" />
            <div className="text-5xl mb-4 animate-bounce">🎉</div>
            <h3 className="font-game text-2xl text-brand-gold mb-3">Victory!</h3>
            <p className="text-base text-foreground/80 leading-relaxed font-semibold max-w-md mx-auto">
                {text}
            </p>
        </motion.div>
    );
};

export const MissionBriefBlock = ({ text }: { text: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="game-card p-8 rounded-[2.5rem] relative overflow-hidden border border-brand-primary/30 shadow-[0_20px_50px_rgba(124,77,255,0.1)] bg-gradient-to-b from-brand-primary/10 to-brand-primary/5"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-2xl shadow-lg shadow-brand-primary/20">
                    📜
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary block">Quest Active</span>
                    <h3 className="font-game text-xl text-foreground">Mission Objective</h3>
                </div>
            </div>
            <p className="text-lg text-foreground/90 leading-[1.8] font-bold">
                {text}
            </p>
        </motion.div>
    );
};

export const DecisionPointBlock = ({ 
    question, 
    options, 
    reactions,
    onComplete
}: { 
    question: string; 
    options: string[]; 
    reactions: string[];
    onComplete?: () => void;
}) => {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const handleSelect = (idx: number) => {
        setSelectedIdx(idx);
        if (onComplete) onComplete();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="parchment-card p-8 rounded-[2rem] relative overflow-hidden border border-brand-gold/30"
        >
            <h3 className="text-base text-foreground font-semibold mb-6">
                {question}
            </h3>

            <div className="space-y-3">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        disabled={selectedIdx !== null}
                        onClick={() => handleSelect(idx)}
                        className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer flex justify-between items-center ${
                            selectedIdx === idx 
                                ? "bg-brand-primary/15 border-brand-primary text-foreground shadow-lg shadow-brand-primary/10" 
                                : selectedIdx !== null
                                    ? "bg-white/5 border-white/5 opacity-55 text-text-secondary"
                                    : "bg-white/5 border-white/10 hover:border-brand-primary/30 hover:bg-brand-primary/5 text-text-secondary hover:text-foreground"
                        }`}
                    >
                        <span>{opt}</span>
                        {selectedIdx === idx && <span className="text-brand-primary">⚡</span>}
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {selectedIdx !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-5 bg-black/20 rounded-2xl border border-white/5 text-sm leading-relaxed text-foreground font-medium"
                    >
                        {reactions[selectedIdx]}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const ExperimentBlock = ({ 
    title, 
    prompt, 
    options, 
    explanations,
    onComplete
}: { 
    title: string; 
    prompt: string; 
    options: string[]; 
    explanations: string[];
    onComplete?: () => void;
}) => {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const handleSelect = (idx: number) => {
        setSelectedIdx(idx);
        if (onComplete) onComplete();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="parchment-card p-8 rounded-[2rem] relative overflow-hidden border border-brand-success/30 shadow-[0_20px_50px_rgba(76,175,80,0.05)]"
        >
            <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-brand-success/15 flex items-center justify-center text-2xl shadow-lg">
                    🧪
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-success block">Interactive Lab</span>
                    <h3 className="font-game text-lg text-foreground">{title}</h3>
                </div>
            </div>
            
            <p className="text-base text-foreground font-semibold mb-6">
                {prompt}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`text-center p-6 rounded-2xl border text-sm font-semibold transition-all cursor-pointer flex flex-col justify-center items-center gap-3 ${
                            selectedIdx === idx 
                                ? "bg-brand-success/15 border-brand-success text-foreground shadow-lg shadow-brand-success/10 scale-105" 
                                : "bg-white/5 border-white/10 hover:border-brand-success/30 hover:bg-brand-success/5 text-text-secondary hover:text-foreground"
                        }`}
                    >
                        <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-text-secondary">
                            {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {selectedIdx !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-5 bg-brand-success/5 rounded-2xl border border-brand-success/10 text-sm leading-relaxed text-foreground font-medium"
                    >
                        <strong className="text-brand-success block mb-1">Result Analysis:</strong>
                        {explanations[selectedIdx]}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const MissionBlock = ({ text }: { text: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="game-card p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden bg-black/40"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-lg">
                    🎯
                </div>
                <h3 className="font-game text-xl text-foreground">Real World Mission</h3>
            </div>
            <p className="text-base text-text-secondary leading-relaxed font-medium">
                {text}
            </p>
        </motion.div>
    );
};

export const BossBattleBlock = ({ 
    questions, 
    onComplete,
    isLocked
}: { 
    questions: any[]; 
    onComplete: () => void;
    isLocked: boolean;
}) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    if (!questions || questions.length === 0) return null;

    const activeQ = questions[currentIdx];

    const handleSuccess = () => {
        setTimeout(() => {
            if (currentIdx + 1 < questions.length) {
                setCurrentIdx(currentIdx + 1);
                setSelectedIdx(null);
            } else {
                onComplete();
            }
        }, 1600);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-black uppercase text-brand-gold tracking-wider mb-2">
                <span>Boss Battle Quest</span>
                <span>Question {currentIdx + 1} of {questions.length}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-6">
                <div 
                    className="bg-brand-gold h-full transition-all duration-300"
                    style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                />
            </div>

            <QuizBlock
                question={activeQ.question || ""}
                options={activeQ.options || []}
                correctIndex={activeQ.correctIndex ?? 0}
                explanation={activeQ.explanations?.[selectedIdx ?? 0] || activeQ.explanation || "Answer to reveal analysis."}
                onSuccess={(idx) => {
                    setSelectedIdx(idx);
                    handleSuccess();
                }}
                onFailure={(idx) => {
                    setSelectedIdx(idx);
                }}
                initialSelected={selectedIdx}
                isLocked={isLocked}
                suggestions={[]}
            />
        </div>
    );
};

