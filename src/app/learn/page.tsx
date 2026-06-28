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
import { CountdownTimer } from "@/components/learning/CountdownTimer";

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
    const { xp, streak, level, addXp, incrementStreak } = useUserStore();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [topic, setTopic] = useState<any>(null);
    const [activity, setActivity] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Phase 1 Gamification States
    const [predictionAnswered, setPredictionAnswered] = useState(false);
    const [predictionChoice, setPredictionChoice] = useState<boolean | null>(null);
    const [chestReward, setChestReward] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                
                // Fetch today's topic, stats, and all topics in parallel
                const [topicRes, statsRes, topicsRes] = await Promise.all([
                    fetch(`/api/topics/today?tz=${encodeURIComponent(tz)}`),
                    fetch(`/api/user/stats?tz=${encodeURIComponent(tz)}`),
                    fetch("/api/topics")
                ]);

                if (topicRes.ok) {
                    const todayTopic = await topicRes.json();
                    setTopic(todayTopic);

                    if (statsRes.ok) {
                        const statsData = await statsRes.json();
                        const userAct = statsData.activities?.find((a: any) => a.topicId === todayTopic.id);
                        if (userAct) {
                            setActivity(userAct);
                            if (userAct.status === "COMPLETED") {
                                setPredictionAnswered(true);
                            }
                        }
                    }

                    if (topicsRes.ok) {
                        const allTopics = await topicsRes.json();
                        const related = allTopics
                            .filter((t: any) => t.id !== todayTopic.id && (t.cluster === todayTopic.cluster || t.season === todayTopic.season))
                            .slice(0, 2);
                        setSuggestions(related);
                    }
                }
            } catch (err) {
                console.error("Failed to load daily learning data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleQuizSuccess = async (selectedIdx: number) => {
        if (topic) {
            const data = await addXp(50, topic.id, true, selectedIdx, true);
            if (data?.unlockedChest) {
                setChestReward(data.unlockedChest);
            }
            // Refresh activity state
            const statsRes = await fetch("/api/user/stats");
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                const userAct = statsData.activities?.find((a: any) => a.topicId === topic.id);
                if (userAct) {
                    setActivity(userAct);
                }
            }
        } else {
            await addXp(50);
        }
    };

    const handleQuizFailure = async (selectedIdx: number) => {
        if (topic) {
            await addXp(0, topic.id, false, selectedIdx, false);
            // Refresh activity state
            const statsRes = await fetch("/api/user/stats");
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                const userAct = statsData.activities?.find((a: any) => a.topicId === topic.id);
                if (userAct) {
                    setActivity(userAct);
                }
            }
        }
    };

    const handlePredictionVote = (choice: boolean) => {
        setPredictionChoice(choice);
        setPredictionAnswered(true);
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

    // Render Dopamine Primer prediction screen overlay
    if (!predictionAnswered && activity?.status !== "COMPLETED") {
        return (
            <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
                <Navbar />
                <div className="flex-grow flex items-center justify-center pt-28 px-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full bg-card rounded-[3.5rem] border border-border p-8 md:p-12 text-center card-shadow relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -translate-y-12" />
                        
                        <div className="relative z-10 space-y-8">
                            <span className="bg-brand-primary/10 text-brand-primary font-black uppercase text-xs px-4 py-2 rounded-full tracking-[0.2em]">
                                Dopamine Primer 🧠
                            </span>
                            
                            <h2 className="text-3xl md:text-4xl font-display font-black leading-tight text-foreground">
                                Do you think this statement is true?
                            </h2>
                            
                            <div className="bg-background p-6 md:p-8 rounded-3xl border border-border flex items-center justify-center min-h-[120px]">
                                <p className="text-xl md:text-2xl font-serif text-text-secondary leading-relaxed italic">
                                    "{topic.prediction?.statement}"
                                </p>
                            </div>
                            
                            <div className="flex gap-4 max-w-md mx-auto">
                                <button 
                                    onClick={() => handlePredictionVote(true)}
                                    className="flex-grow bg-brand-success/15 hover:bg-brand-success hover:text-white border-2 border-brand-success/20 text-brand-success font-black py-4 rounded-2xl text-lg transition-all btn-push cursor-pointer"
                                >
                                    YES, True
                                </button>
                                <button 
                                    onClick={() => handlePredictionVote(false)}
                                    className="flex-grow bg-brand-danger/15 hover:bg-brand-danger hover:text-white border-2 border-brand-danger/20 text-brand-danger font-black py-4 rounded-2xl text-lg transition-all btn-push cursor-pointer"
                                >
                                    NO, False
                                </button>
                            </div>
                            
                            <p className="text-xs text-text-secondary font-medium">
                                Lock in your prediction to reveal today's lesson.
                            </p>
                        </div>
                    </motion.div>
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

            {/* Today's Brain Upgrade Stats Bar */}
            <div className="container mx-auto px-6 pt-36 max-w-4xl">
                <div className="bg-card/50 backdrop-blur-sm border border-border px-6 py-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-brand-primary/10 text-brand-primary font-black uppercase text-[10px] px-3 py-1.5 rounded-full tracking-wider">
                            Brain Upgrade
                        </span>
                        <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
                            <span>⏱️ 2 min read</span>
                            <span className="text-border">•</span>
                            <span className="text-brand-warning">🔥 Hard difficulty</span>
                        </div>
                    </div>
                    <div className="text-xs text-brand-primary font-bold bg-brand-primary/5 px-4 py-2 rounded-full border border-brand-primary/10">
                        ⚡ Only 4% of users solve this today
                    </div>
                </div>
            </div>

            <section className="pt-12">
                <CountdownTimer hasCompletedToday={activity?.status === "COMPLETED"} />
                <div className="container mx-auto px-6 mb-12 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-bold text-foreground capitalize"
                    >
                        {topic.title.replace(/\s*\(Day\s+\d+\)\s*/i, "").trim()} {topic.emoji}
                    </motion.h1>
                </div>

                {topic.content.map((block: any, index: number) => {
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
                                        onFailure={handleQuizFailure}
                                        initialSelected={activity?.selectedOptionIndex}
                                        isLocked={activity?.status === "COMPLETED"}
                                        suggestions={suggestions}
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

                                        {/* Prediction Results & Tomorrow's Teaser End Screen */}
                                        <div className="mt-16 bg-card border border-border rounded-[3rem] p-8 md:p-12 text-left relative overflow-hidden card-shadow">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl -translate-y-12 translate-x-12" />
                                            
                                            <div className="space-y-8 relative z-10">
                                                <div>
                                                    <span className="bg-brand-success/10 text-brand-success font-black uppercase text-[10px] px-3 py-1.5 rounded-full tracking-widest block w-fit mb-4">
                                                        Prediction Result 🎯
                                                    </span>
                                                    <h3 className="text-2xl font-display font-black text-foreground mb-2">
                                                        You guessed: {predictionChoice === null ? "Locked" : (predictionChoice ? "YES, True" : "NO, False")}
                                                    </h3>
                                                    <p className="text-lg text-text-secondary leading-relaxed font-sans">
                                                        <strong>Surprise! It was TRUE.</strong> {topic.prediction?.explanation}
                                                    </p>
                                                </div>

                                                <div className="border-t border-border pt-8">
                                                    <span className="bg-brand-primary/10 text-brand-primary font-black uppercase text-[10px] px-3 py-1.5 rounded-full tracking-widest block w-fit mb-4">
                                                        Next Brain Drop 🚀
                                                    </span>
                                                    <div className="flex items-start gap-4">
                                                        <span className="text-5xl">{topic.tomorrow?.emoji || "💡"}</span>
                                                        <div>
                                                            <h4 className="text-xl font-display font-black text-foreground">
                                                                {topic.tomorrow?.title || "Tomorrow's Core Model"}
                                                            </h4>
                                                            <p className="text-text-secondary text-sm mt-1">
                                                                {topic.tomorrow?.isPremium ? "⭐ Premium Upgrade Drop" : "⚡ Free Daily Drop"} • Unlocks at 00:00 local time. Keep that streak!
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </LearningBlock>
                            );
                        default:
                            return null;
                    }
                })}
            </section>

            {/* Variable Reward Chest Modal Overlay */}
            {chestReward && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md w-full bg-card border border-border p-8 rounded-[3.5rem] text-center card-shadow relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />
                        
                        <div className="space-y-6 relative z-10">
                            <span className="text-6xl animate-bounce inline-block">🎁</span>
                            <h3 className="text-3xl font-display font-black text-foreground">Bonus Chest Opened!</h3>
                            <p className="text-text-secondary text-sm">Your learning consistency secured a variable bonus reward:</p>
                            
                            <div className="bg-brand-primary/10 border-2 border-brand-primary/20 p-6 rounded-2xl inline-block w-full">
                                <span className="text-2xl font-black text-brand-primary font-display block">
                                    {chestReward.label}
                                </span>
                                {chestReward.type === "SHIELD" && (
                                    <span className="text-xs text-text-secondary mt-1 block">
                                        Automatically protects your streak if you miss a day!
                                    </span>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => setChestReward(null)}
                                className="w-full gradient-primary text-white font-bold py-4 rounded-xl btn-push cursor-pointer"
                            >
                                Collect Reward
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
