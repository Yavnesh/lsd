"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface QuizProps {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    onSuccess?: () => void;
}

export const QuizBlock = ({ question, options, correctIndex, explanation, onSuccess }: QuizProps) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleSelect = (index: number) => {
        if (selected !== null) return;

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
            if (onSuccess) onSuccess();
        }
    };

    return (
        <div className="bg-card p-8 md:p-12 rounded-[3.5rem] card-shadow border border-border relative overflow-hidden">
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
                        whileHover={selected === null ? { x: 5 } : {}}
                        whileTap={selected === null ? { scale: 0.98 } : {}}
                        onClick={() => handleSelect(i)}
                        disabled={selected !== null}
                        className={`w-full p-6 text-left rounded-2xl border-2 font-bold font-sans transition-all flex items-center justify-between text-lg
              ${selected === null ? 'border-border bg-background hover:border-brand-accent hover:bg-brand-accent/5 text-foreground' :
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
                        className={`p-8 rounded-[2rem] border-2 relative overflow-hidden flex flex-col items-center text-center
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
                        <p className="text-lg text-text-secondary leading-relaxed font-sans max-w-lg">
                            {explanation}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
