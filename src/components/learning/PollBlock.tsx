"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Users } from "lucide-react";

interface PollProps {
    question: string;
    options: { label: string, votes: number }[];
}

export const PollBlock = ({ question, options: initialOptions }: PollProps) => {
    const [voted, setVoted] = useState(false);
    const [choices, setChoices] = useState(initialOptions);
    const totalVotes = choices.reduce((acc, curr) => acc + curr.votes, 0) + (voted ? 1 : 0);

    const handleVote = (index: number) => {
        if (voted) return;
        const newChoices = [...choices];
        newChoices[index].votes += 1;
        setChoices(newChoices);
        setVoted(true);
    };

    return (
        <div className="bg-card p-10 rounded-[3rem] card-shadow border border-border relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-secondary/10 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-brand-secondary" />
                </div>
                <h3 className="text-xs font-black text-brand-secondary uppercase tracking-[0.3em]">Majority Opinion</h3>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-8 font-display text-foreground leading-tight">
                {question}
            </h2>

            <div className="space-y-4">
                {choices.map((option, i) => {
                    const percentage = Math.round((option.votes / totalVotes) * 100);

                    return (
                        <button
                            key={i}
                            onClick={() => handleVote(i)}
                            disabled={voted}
                            className="w-full relative group"
                        >
                            <div
                                className={`w-full p-5 rounded-2xl border-2 font-bold font-sans transition-all flex items-center justify-between relative z-10
                  ${voted ? 'border-border bg-background' : 'border-border bg-background hover:border-brand-secondary hover:bg-brand-secondary/5'}
                `}
                            >
                                <span className="relative z-10">{option.label}</span>
                                {voted && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-brand-secondary font-black"
                                    >
                                        {percentage}%
                                    </motion.span>
                                )}
                            </div>

                            <AnimatePresence>
                                {voted && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, ease: "circOut" }}
                                        className="absolute inset-0 bg-brand-secondary/10 rounded-2xl z-0"
                                    />
                                )}
                            </AnimatePresence>
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 flex items-center gap-2 text-text-secondary">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium font-sans">
                    {totalVotes.toLocaleString()} people have weighed in
                </span>
            </div>
        </div>
    );
};
