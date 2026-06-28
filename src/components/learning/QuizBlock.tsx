"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

interface QuizProps {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    onSuccess?: (selectedIdx: number) => void;
    onFailure?: (selectedIdx: number) => void;
    initialSelected?: number | null;
    isLocked?: boolean;
    suggestions?: { title: string; slug: string; emoji: string }[];
}

export const QuizBlock = ({
    question,
    options,
    correctIndex,
    explanation,
    onSuccess,
    onFailure,
    initialSelected = null,
    isLocked = false,
    suggestions = []
}: QuizProps) => {
    const [selected, setSelected] = useState<number | null>(initialSelected);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(
        initialSelected !== null ? initialSelected === correctIndex : null
    );

    // Sync state when initialSelected or isLocked changes
    useEffect(() => {
        if (initialSelected !== null && initialSelected !== undefined) {
            setSelected(initialSelected);
            setIsCorrect(initialSelected === correctIndex);
        } else if (isLocked) {
            setSelected(correctIndex);
            setIsCorrect(true);
        } else {
            setSelected(null);
            setIsCorrect(null);
        }
    }, [initialSelected, isLocked, correctIndex]);

    const handleSelect = (index: number) => {
        if (selected !== null || isLocked) return;

        setSelected(index);
        const correct = index === correctIndex;
        setIsCorrect(correct);

        if (correct) {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#6C5CE7', '#00BFFF', '#32D74B', '#00E5FF']
            });
            if (onSuccess) onSuccess(index);
        } else {
            if (onFailure) onFailure(index);
        }
    };

    return (
        <div className="bg-card p-8 md:p-12 rounded-[3.5rem] card-shadow border border-border relative overflow-hidden text-left">
            {/* Playful icon */}
            <div className="absolute -top-6 -right-6 p-12 bg-brand-primary/5 rounded-full blur-2xl" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-brand-primary/10 rounded-xl">
                    <Sparkles className="w-5 h-5 text-brand-primary fill-brand-primary" />
                </div>
                <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">Final Brain Test</h3>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-10 font-display text-foreground leading-tight relative z-10">
                {question}
            </h2>

            <div className="space-y-4 mb-10 relative z-10">
                {options.map((option, i) => (
                    <motion.button
                        key={i}
                        whileHover={(selected === null && !isLocked) ? { x: 5 } : {}}
                        whileTap={(selected === null && !isLocked) ? { scale: 0.98 } : {}}
                        onClick={() => handleSelect(i)}
                        disabled={selected !== null || isLocked}
                        className={`w-full p-6 text-left rounded-2xl border-2 font-bold font-sans transition-all flex items-center justify-between text-lg
              ${selected === null ? 'border-border bg-background hover:border-brand-accent hover:bg-brand-accent/5 text-foreground cursor-pointer' :
                                i === correctIndex ? 'border-brand-success bg-brand-success/10 text-brand-success shadow-lg shadow-brand-success/10' :
                                    selected === i ? 'border-brand-error bg-brand-error/10 text-brand-error' : 'border-border opacity-40 bg-background text-text-secondary'}
            `}
                    >
                        <span>{option}</span>
                        <AnimatePresence>
                            {selected !== null && i === correctIndex && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <CheckCircle2 className="w-7 h-7 text-brand-success fill-brand-success/10" />
                                </motion.div>
                            )}
                            {selected === i && i !== correctIndex && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <XCircle className="w-7 h-7 text-brand-error fill-brand-error/10" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {selected !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-8 rounded-[2rem] border-2 relative overflow-hidden flex flex-col items-center text-center w-full
              ${isCorrect ? 'bg-brand-success/5 border-brand-success/20' : 'bg-brand-error/5 border-brand-error/20'}
            `}
                    >
                        {/* Playful background text */}
                        <div className={`absolute -right-4 -bottom-4 text-6xl font-black opacity-5 pointer-events-none select-none
               ${isCorrect ? 'text-brand-success' : 'text-brand-error'}
            `}>
                            {isCorrect ? 'WOW' : 'OOPS'}
                        </div>

                        <p className={`text-xl font-bold font-display mb-3 ${isCorrect ? 'text-brand-success' : 'text-brand-error'}`}>
                            {isCorrect ? 'Boom! You nailed it.' : 'Close, but not quite...'}
                        </p>
                        <p className="text-lg text-text-secondary leading-relaxed font-sans max-w-lg mb-4">
                            {explanation}
                        </p>

                        {isCorrect === false && (
                            <button
                                onClick={() => {
                                    setSelected(null);
                                    setIsCorrect(null);
                                }}
                                className="mb-6 px-6 py-3 gradient-primary text-white rounded-2xl font-bold font-sans hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                                Try Again
                            </button>
                        )}
                        
                        {/* Suggestions from the Intel Hub if they answered incorrectly */}
                        {isCorrect === false && suggestions && suggestions.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-border text-left w-full relative z-10">
                                <h4 className="font-bold font-display text-lg mb-3 text-brand-primary flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" /> Recommended Intel Hub Drops
                                </h4>
                                <p className="text-text-secondary text-sm mb-4 font-sans">
                                    Strengthen your logic on this topic. Check out these related concepts in the Intel Hub:
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {suggestions.map((item, idx) => (
                                        <Link href="/topics" key={idx} className="p-4 bg-background border border-border hover:border-brand-primary rounded-2xl flex items-center gap-3 transition-all group cursor-pointer hover:scale-[1.02]">
                                            <span className="text-2xl">{item.emoji || "🧐"}</span>
                                            <div>
                                                <span className="font-bold text-sm text-foreground group-hover:text-brand-primary transition-colors leading-tight block">{item.title}</span>
                                                <p className="text-[10px] text-text-secondary font-black uppercase tracking-wider mt-0.5">Explore Drop</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
