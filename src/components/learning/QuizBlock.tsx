"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Swords, BookOpen, RotateCcw } from "lucide-react";
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
    const [isShaking, setIsShaking] = useState(false);

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
            import("canvas-confetti").then((module) => {
                const confetti = module.default || module;
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.55 },
                    colors: ['#F7C948', '#7C4DFF', '#4CAF50', '#29B6F6', '#FF9F43']
                });
            });
            if (onSuccess) onSuccess(index);
        } else {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 600);
            if (onFailure) onFailure(index);
        }
    };

    return (
        <div className="relative">
            {/* Boss Battle Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-[2.5rem] border-2 ${
                    isCorrect === true
                        ? "border-brand-success/40 shadow-[0_0_40px_rgba(76,175,80,0.2)]"
                        : isCorrect === false
                        ? "border-brand-error/40"
                        : "border-brand-primary/25 shadow-[0_0_40px_rgba(124,77,255,0.1)]"
                }`}
                style={{ background: "linear-gradient(145deg, #0F1A0F, #1A2E1A)" }}
            >
                {/* Atmospheric top gradient */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-brand-primary/10 to-transparent pointer-events-none" />

                {/* Lightning decoration */}
                <div className="absolute top-4 right-6 text-4xl opacity-10 pointer-events-none select-none font-game">⚔️</div>

                <div className="p-8 md:p-12 relative z-10">
                    {/* Boss Battle header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-brand-primary/20 rounded-2xl border border-brand-primary/30">
                            <Swords className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="font-game text-xs text-brand-primary uppercase tracking-[0.3em]">Final Boss Battle</h3>
                            <p className="text-[9px] text-text-secondary uppercase tracking-wider">Prove your mastery</p>
                        </div>
                    </div>

                    <h2 className="font-game text-2xl md:text-3xl mb-10 text-white leading-tight">
                        {question}
                    </h2>

                    {/* Options */}
                    <div className={`space-y-3 mb-8 ${isShaking ? "shake" : ""}`}>
                        {options.map((option, i) => {
                            const isThisCorrect = i === correctIndex;
                            const isThisSelected = selected === i;
                            const revealed = selected !== null;

                            let optionStyle = "";
                            let icon = null;

                            if (!revealed) {
                                optionStyle = "border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-primary/40 text-white cursor-pointer";
                            } else if (isThisCorrect) {
                                optionStyle = "border-brand-success/50 bg-brand-success/15 text-brand-success shadow-[0_0_20px_rgba(76,175,80,0.15)]";
                                icon = <CheckCircle2 className="w-6 h-6 text-brand-success flex-shrink-0" />;
                            } else if (isThisSelected && !isThisCorrect) {
                                optionStyle = "border-brand-error/50 bg-brand-error/15 text-brand-error";
                                icon = <XCircle className="w-6 h-6 text-brand-error flex-shrink-0" />;
                            } else {
                                optionStyle = "border-white/5 bg-white/3 opacity-40 text-white/50";
                            }

                            return (
                                <motion.button
                                    key={i}
                                    whileHover={!revealed ? { x: 6, scale: 1.01 } : {}}
                                    whileTap={!revealed ? { scale: 0.98 } : {}}
                                    onClick={() => handleSelect(i)}
                                    disabled={revealed || isLocked}
                                    className={`w-full p-5 text-left rounded-2xl border-2 font-bold transition-all flex items-center justify-between text-base ${optionStyle}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Option letter badge */}
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                            !revealed ? "bg-white/10" :
                                            isThisCorrect ? "bg-brand-success/30" :
                                            isThisSelected ? "bg-brand-error/30" :
                                            "bg-white/5"
                                        }`}>
                                            {["A", "B", "C", "D"][i]}
                                        </span>
                                        <span>{option}</span>
                                    </div>
                                    <AnimatePresence>
                                        {revealed && icon && (
                                            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}>
                                                {icon}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Result panel */}
                    <AnimatePresence>
                        {selected !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`rounded-[1.5rem] border-2 p-7 relative overflow-hidden ${
                                    isCorrect
                                        ? "border-brand-success/30 bg-brand-success/10"
                                        : "border-brand-error/30 bg-brand-error/10"
                                }`}
                            >
                                {/* Victory/Defeat watermark */}
                                <div className={`absolute -right-3 -bottom-4 font-game text-7xl font-bold opacity-5 pointer-events-none select-none ${
                                    isCorrect ? "text-brand-success" : "text-brand-error"
                                }`}>
                                    {isCorrect ? "WIN!" : "OOPS"}
                                </div>

                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <span className="text-3xl">{isCorrect ? "🏆" : "💀"}</span>
                                    <p className={`font-game text-xl font-bold ${isCorrect ? "text-brand-success" : "text-brand-error"}`}>
                                        {isCorrect ? "Victory! You crushed it." : "Defeated... but you'll rise."}
                                    </p>
                                </div>

                                <p className="text-white/70 leading-relaxed text-sm mb-5 relative z-10">
                                    {explanation}
                                </p>

                                {isCorrect === false && (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => { setSelected(null); setIsCorrect(null); }}
                                        className="game-btn-primary flex items-center gap-2 text-sm relative z-10 mb-4"
                                    >
                                        <RotateCcw className="w-4 h-4" /> Try Again
                                    </motion.button>
                                )}

                                {/* Related quest suggestions */}
                                {isCorrect === false && suggestions && suggestions.length > 0 && (
                                    <div className="mt-5 pt-5 border-t border-white/10 relative z-10">
                                        <h4 className="font-game text-sm text-brand-primary flex items-center gap-2 mb-3">
                                            <BookOpen className="w-4 h-4" /> Strengthen Your Knowledge
                                        </h4>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {suggestions.map((item, idx) => (
                                                <Link href="/topics" key={idx}>
                                                    <motion.div
                                                        whileHover={{ scale: 1.02, x: 3 }}
                                                        className="p-3 bg-white/5 border border-white/10 hover:border-brand-primary/30 rounded-xl flex items-center gap-3 cursor-pointer transition-all"
                                                    >
                                                        <span className="text-xl">{item.emoji || "🧐"}</span>
                                                        <div>
                                                            <span className="text-xs font-bold text-white/80 block">{item.title}</span>
                                                            <span className="text-[9px] text-brand-primary uppercase tracking-wider">Explore Quest</span>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
