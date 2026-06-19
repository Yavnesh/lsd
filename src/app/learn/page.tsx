"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LearningBlock } from "@/components/learning/LearningBlock";
import { HookBlock, MemeBlock, SummaryBlock } from "@/components/learning/ContentBlocks";
import { QuizBlock } from "@/components/learning/QuizBlock";
import { PollBlock } from "@/components/learning/PollBlock";
import { GamificationHeader } from "@/components/gamification/Stats";
import { ShareCard } from "@/components/learning/ShareCard";
import { motion, useScroll, useSpring } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";

interface TopicBlock {
    type: "hook" | "meme" | "summary" | "poll" | "quiz" | "fact" | "share_card";
    text?: string;
    imageUrl?: string;
    caption?: string;
    explanation?: string;
    title?: string;
    bulletPoints?: string[];
    question?: string;
    options?: any[];
    correctIndex?: number;
    summary?: string;
    teaser?: string;
}

interface Topic {
    id: string;
    title: string;
    emoji: string;
    content: TopicBlock[];
}

export default function LearnPage() {
    const { xp, streak, level, addXp } = useUserStore();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [topic, setTopic] = useState<Topic | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTodayTopic() {
            try {
                const res = await fetch("/api/topics/today");
                if (res.ok) {
                    const data = await res.json();
                    setTopic(data);
                }
            } catch (err) {
                console.error("Failed to load today's topic", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTodayTopic();
    }, []);

    const handleQuizSuccess = () => {
        if (topic) {
            addXp(50, topic.id);
        } else {
            addXp(50);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-lg text-text-secondary font-bold font-display uppercase tracking-widest">Loading Today's Intel...</p>
                </div>
            </main>
        );
    }

    if (!topic) {
        return (
            <main className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="container mx-auto pt-40 px-6 text-center space-y-6">
                    <h1 className="text-4xl font-bold font-display">No Topic Available</h1>
                    <p className="text-text-secondary">Please check back later or contact admin to seed topics.</p>
                </div>
            </main>
        );
    }

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
                        {topic.title} {topic.emoji}
                    </motion.h1>
                </div>

                {topic.content.map((block, index) => {
                    switch (block.type) {
                        case "hook":
                            return (
                                <LearningBlock key={index}>
                                    <HookBlock text={block.text || ""} />
                                </LearningBlock>
                            );
                        case "meme":
                            return (
                                <LearningBlock key={index}>
                                    <MemeBlock
                                        imageUrl={block.imageUrl || ""}
                                        caption={block.caption || ""}
                                        explanation={block.explanation || ""}
                                    />
                                </LearningBlock>
                            );
                        case "summary":
                            return (
                                <LearningBlock key={index}>
                                    <SummaryBlock
                                        title={block.title || ""}
                                        bulletPoints={block.bulletPoints || []}
                                    />
                                </LearningBlock>
                            );
                        case "poll":
                            return (
                                <LearningBlock key={index}>
                                    <PollBlock
                                        question={block.question || ""}
                                        options={block.options || []}
                                    />
                                </LearningBlock>
                            );
                        case "fact":
                            return (
                                <LearningBlock key={index}>
                                    <div className="bg-brand-primary/5 p-12 rounded-[3.5rem] border-2 border-brand-primary/10 relative overflow-hidden group">
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/5 rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                        <h3 className="text-3xl font-bold mb-6 font-display text-brand-primary drop-shadow-sm">{block.title || "Why this matters 🧠"}</h3>
                                        <p className="text-xl text-text-secondary leading-[1.6] font-sans">
                                            {block.text || ""}
                                        </p>
                                    </div>
                                </LearningBlock>
                            );
                        case "quiz":
                            return (
                                <LearningBlock key={index}>
                                    <QuizBlock
                                        question={block.question || ""}
                                        options={block.options || []}
                                        correctIndex={block.correctIndex !== undefined ? block.correctIndex : 0}
                                        explanation={block.explanation || ""}
                                        onSuccess={handleQuizSuccess}
                                    />
                                </LearningBlock>
                            );
                        case "share_card":
                            return (
                                <LearningBlock key={index}>
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

                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            className="pt-24 border-t border-border"
                                        >
                                            <h4 className="text-xs font-black text-text-secondary uppercase tracking-[0.4em] mb-12">Viral Takeaway</h4>
                                            <ShareCard
                                                title={block.title || ""}
                                                summary={block.summary || ""}
                                                teaser={block.teaser || ""}
                                            />
                                        </motion.div>
                                    </div>
                                </LearningBlock>
                            );
                        default:
                            return null;
                    }
                })}
            </section>
        </main>
    );
}
