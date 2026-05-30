"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LearningBlock } from "@/components/learning/LearningBlock";
import { HookBlock, MemeBlock, SummaryBlock } from "@/components/learning/ContentBlocks";
import { QuizBlock } from "@/components/learning/QuizBlock";
import { PollBlock } from "@/components/learning/PollBlock";
import { GamificationHeader } from "@/components/gamification/Stats";
import { ShareCard } from "@/components/learning/ShareCard";
import { motion, useScroll, useSpring } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";

export default function LearnPage() {
    const { xp, streak, level, addXp } = useUserStore();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const handleQuizSuccess = () => {
        addXp(50);
    };

    return (
        <main className="min-h-screen pb-40 bg-background text-foreground">
            <Navbar />

            {/* Dynamic Progress Bar - Electric Purple */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 gradient-primary z-[60] origin-left shadow-[0_2px_10px_rgba(108,92,231,0.3)]"
                style={{ scaleX }}
            />

            <GamificationHeader xp={xp} streak={streak} level={level} />

            <section className="pt-40">
                <div className="container mx-auto px-6 mb-12 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-bold text-foreground capitalize"
                    >
                        learn something daily
                    </motion.h1>
                </div>

                <LearningBlock>
                    <HookBlock text="You’ve been doing this wrong. Or maybe they just wanted you to think that?" />
                </LearningBlock>

                <LearningBlock>
                    <MemeBlock
                        imageUrl="https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=1000"
                        caption="Me: *Shows proof of them lying* | Them: 'Why are you always so paranoid? You're literally hallucinating things now.'"
                        explanation="Gaslighting isn't just a fancy word for lying. It's a calculated move to make you doubt your own memories. If someone makes you feel guilty for being right... congrats, you met a pro."
                    />
                </LearningBlock>

                <LearningBlock>
                    <SummaryBlock
                        title="The Gaslighter's Playbook 🚩"
                        bulletPoints={[
                            "The 'I never said that' classic (Memory Denial)",
                            "Blame Shifting: Turning your valid concern into YOUR mistake",
                            "Dismissal: Calling you 'crazy', 'too sensitive', or 'irrational'",
                            "Reality Distortion: Their words never match their actions"
                        ]}
                    />
                </LearningBlock>

                <LearningBlock>
                    <PollBlock
                        question="Have you ever felt like you were 'crazy' during an argument, only to find out you were actually right?"
                        options={[
                            { label: "Daily occurrence 💀", votes: 1420 },
                            { label: "Once or twice", votes: 2850 },
                            { label: "Never, I'm the one gaslighting (don't)", votes: 120 }
                        ]}
                    />
                </LearningBlock>

                <LearningBlock>
                    <div className="bg-brand-primary/5 p-12 rounded-[3.5rem] border-2 border-brand-primary/10 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/5 rounded-full group-hover:scale-150 transition-transform duration-1000" />
                        <h3 className="text-3xl font-bold mb-6 font-display text-brand-primary drop-shadow-sm">Why this matters 🧠</h3>
                        <p className="text-xl text-text-secondary leading-[1.6] font-sans">
                            Gaslighters win when they wear you down. Once you doubt your own perception, they own your reality.
                            Naming the behavior is your shield. You stop arguing about 'what happened' and start recognizing the manipulation.
                        </p>
                    </div>
                </LearningBlock>

                <LearningBlock>
                    <QuizBlock
                        question="Your friend eats your sandwich. When you show them the video, they say: 'The lighting is weird, that's not me. Why are you stalking me with cameras anyway? You're obsessed.' What's the play?"
                        options={[
                            "Textbook Gaslighting (The 'Glitch' edition)",
                            "Honesty (They are helpfully critiquing your lighting)",
                            "Professional Sarcasm",
                            "Simple Misunderstanding"
                        ]}
                        correctIndex={0}
                        explanation="Winner! Instead of owning up to the stolen sandwich, they are attacking your sanity (calling you obsessed) and denying objective proof (the video). Classic deflection."
                        onSuccess={handleQuizSuccess}
                    />
                </LearningBlock>

                {/* Completion Block */}
                <LearningBlock>
                    <div className="text-center space-y-16">
                        <div className="relative inline-block">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                whileInView={{ scale: 1, rotate: 0 }}
                                className="w-40 h-40 bg-brand-success rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-brand-success/20 relative z-10"
                            >
                                <span className="text-7xl">🏆</span>
                            </motion.div>
                            <div className="absolute inset-0 bg-brand-success/20 blur-3xl rounded-full scale-150 animate-pulse" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-5xl font-bold font-display text-foreground">Daily Lesson: Mastered!</h2>
                            <p className="text-brand-success font-black text-2xl uppercase tracking-widest">+50 XP Earned</p>
                        </div>

                        <div className="flex flex-col items-center gap-6 pt-10">
                            <button className="gradient-primary px-12 py-5 rounded-[2.5rem] text-white font-bold text-2xl shadow-xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all btn-push">
                                Check My Dashboard
                            </button>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="pt-24 border-t border-border"
                        >
                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-[0.4em] mb-12">Viral Moment</h4>
                            <ShareCard
                                title="Gaslighting 101"
                                summary="If someone makes you apologize for something THEY did... congrats, you just met a manipulator."
                                teaser="Are you overreacting or being gaslit? Take the test on LSD."
                            />
                        </motion.div>
                    </div>
                </LearningBlock>
            </section>
        </main>
    );
}
