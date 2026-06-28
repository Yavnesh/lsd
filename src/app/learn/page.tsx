"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LearningBlock } from "@/components/learning/LearningBlock";
import { HookBlock, MemeBlock, SummaryBlock } from "@/components/learning/ContentBlocks";
import { QuizBlock } from "@/components/learning/QuizBlock";
import { PollBlock } from "@/components/learning/PollBlock";
import { GameHUD, QuestProgressBar } from "@/components/gamification/Stats";
import { ShareCard } from "@/components/learning/ShareCard";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { CountdownTimer } from "@/components/learning/CountdownTimer";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

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

// Stage "Next" button — scrolls to next section after advancing
const StageRevealButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <div className="flex justify-center mt-10">
        <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className="game-btn-gold text-base px-8 py-4 flex items-center gap-3"
        >
            <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                🗝️
            </motion.span>
            {label}
            <span>→</span>
        </motion.button>
    </div>
);

// Tinder-style card component for prediction voting
const TinderSwipeCard = ({
    statement,
    emoji,
    onVote
}: {
    statement: string;
    emoji: string;
    onVote: (vote: boolean) => void;
}) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Dynamic rotation and scale changes during drag
    const rotate = useTransform(x, [-200, 200], [-12, 12]);
    const scale = useTransform(x, [-150, 0, 150], [1.02, 1, 1.02]);

    // Visually premium green/red overlay badges based on swipe direction
    const yesOpacity = useTransform(x, [0, 80], [0, 1]);
    const noOpacity = useTransform(x, [-80, 0], [1, 0]);

    const handleDragEnd = (event: any, info: any) => {
        const threshold = 120;
        if (info.offset.x > threshold) {
            onVote(true);
        } else if (info.offset.x < -threshold) {
            onVote(false);
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto h-[360px] flex items-center justify-center">
            {/* Background decorative stacked cards for visual depth */}
            <div className="absolute inset-0 bg-card/40 rounded-[2.5rem] border border-white/5 rotate-2 translate-y-3 scale-95 pointer-events-none blur-[1px]" />
            <div className="absolute inset-0 bg-card/65 rounded-[2.5rem] border border-white/5 -rotate-2 translate-y-1 scale-98 pointer-events-none blur-[0.5px]" />

            <motion.div
                style={{ x, y, rotate, scale }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                whileDrag={{ cursor: "grabbing" }}
                className="absolute inset-0 game-card-parchment cursor-grab p-8 flex flex-col justify-between overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.45)] border border-brand-primary/20 bg-gradient-to-b from-card/98 to-card/95"
            >
                {/* Drag status indicators (YES / NO badges) */}
                <motion.div
                    style={{ opacity: yesOpacity }}
                    className="absolute top-6 right-6 border-4 border-brand-success text-brand-success font-game text-sm uppercase tracking-widest px-3 py-1.5 rounded-xl rotate-12 z-20 pointer-events-none font-bold"
                >
                    TRUE 👍
                </motion.div>
                <motion.div
                    style={{ opacity: noOpacity }}
                    className="absolute top-6 left-6 border-4 border-brand-error text-brand-error font-game text-sm uppercase tracking-widest px-3 py-1.5 rounded-xl -rotate-12 z-20 pointer-events-none font-bold"
                >
                    FALSE 👎
                </motion.div>

                {/* Floating game energy beam at the top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent rounded-full" />

                {/* Topic emoji & statement */}
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6">
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="text-6xl"
                    >
                        {emoji}
                    </motion.div>
                    <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed italic px-2">
                        "{statement}"
                    </p>
                </div>

                {/* Swiping tutorial text */}
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-text-secondary border-t border-border/40 pt-4">
                    <span className="text-brand-error">← Swipe False</span>
                    <span className="text-brand-primary">•</span>
                    <span className="text-brand-success">Swipe True →</span>
                </div>
            </motion.div>
        </div>
    );
};

function LearnQuestContent() {
    const searchParams = useSearchParams();
    const topicSlug = searchParams.get("slug");
    const { xp, streak, level, addXp, incrementStreak, streakShields } = useUserStore();

    const [topic, setTopic] = useState<any>(null);
    const [activity, setActivity] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [predictionAnswered, setPredictionAnswered] = useState(false);
    const [predictionChoice, setPredictionChoice] = useState<boolean | null>(null);
    const [chestReward, setChestReward] = useState<any>(null);
    const [currentStage, setCurrentStage] = useState(0);

    // Stable ref map for section scroll targets
    const blockNodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const getBlockRef = (i: number) => (el: HTMLDivElement | null) => { blockNodeRefs.current[i] = el; };
    const scrollToBlock = (i: number) => {
        setTimeout(() => {
            blockNodeRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
    };

    useEffect(() => {
        async function loadData() {
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

                let selectedTopic: any = null;

                if (topicSlug) {
                    // Specific slug requested — load from topics list
                    const [topicsRes, statsRes] = await Promise.all([
                        fetch("/api/topics"),
                        fetch(`/api/user/stats?tz=${encodeURIComponent(tz)}`)
                    ]);
                    if (topicsRes.ok) {
                        const allTopics = await topicsRes.json();
                        selectedTopic = allTopics.find((t: any) => t.slug === topicSlug);
                        if (selectedTopic) {
                            // Ensure content blocks are parsed correctly
                            const parsedContent = Array.isArray(selectedTopic.content)
                                ? selectedTopic.content
                                : (selectedTopic.content ? JSON.parse(selectedTopic.content) : []);
                            
                            const hookText = parsedContent.find((b: any) => b.type === "hook")?.text
                                || "Every day is an opportunity to learn something surprising about how you think.";
                            
                            selectedTopic.content = parsedContent;
                            selectedTopic.prediction = {
                                statement: hookText,
                                correctAnswer: true,
                                explanation: parsedContent.find((b: any) => b.type === "meme")?.explanation || "Teachable moment."
                            };

                            const related = allTopics
                                .filter((t: any) => t.id !== selectedTopic.id && (t.cluster === selectedTopic.cluster || t.season === selectedTopic.season))
                                .slice(0, 2);
                            setSuggestions(related);
                        }
                        if (statsRes.ok) {
                            const statsData = await statsRes.json();
                            if (selectedTopic) {
                                const userAct = statsData.activities?.find((a: any) => a.topicId === selectedTopic.id);
                                if (userAct) { setActivity(userAct); if (userAct.status === "COMPLETED") setPredictionAnswered(true); }
                            }
                        }
                    }
                } else {
                    // No slug — always fetch today's topic fresh (includes prediction + tomorrow)
                    // Using cache-busting param so a new day always gets fresh content
                    const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
                    const [todayRes, statsRes] = await Promise.all([
                        fetch(`/api/topics/today?tz=${encodeURIComponent(tz)}&date=${todayKey}`),
                        fetch(`/api/user/stats?tz=${encodeURIComponent(tz)}`)
                    ]);
                    if (todayRes.ok) selectedTopic = await todayRes.json();
                    if (statsRes.ok && selectedTopic) {
                        const statsData = await statsRes.json();
                        const userAct = statsData.activities?.find((a: any) => a.topicId === selectedTopic.id);
                        if (userAct) { setActivity(userAct); if (userAct.status === "COMPLETED") setPredictionAnswered(true); }
                        // Suggestions from same cluster
                        setSuggestions(
                            (statsData.activities || [])
                                .filter((a: any) => a.topic?.cluster === selectedTopic.cluster && a.topicId !== selectedTopic.id)
                                .slice(0, 2)
                                .map((a: any) => ({ title: a.topic?.title, slug: a.topic?.slug, emoji: a.topic?.emoji }))
                        );
                    }
                }

                if (selectedTopic) {
                    setTopic(selectedTopic);
                }
            } catch (err) {
                console.error("Failed to load daily learning data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [topicSlug]);

    const handleQuizSuccess = async (selectedIdx: number) => {
        if (topic) {
            const data = await addXp(50, topic.id, true, selectedIdx, true);
            if (data?.unlockedChest) setChestReward(data.unlockedChest);
            const statsRes = await fetch("/api/user/stats");
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                const userAct = statsData.activities?.find((a: any) => a.topicId === topic.id);
                if (userAct) setActivity(userAct);
            }
        } else {
            await addXp(50);
        }
    };

    const handleQuizFailure = async (selectedIdx: number) => {
        if (topic) {
            await addXp(0, topic.id, false, selectedIdx, false);
            const statsRes = await fetch("/api/user/stats");
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                const userAct = statsData.activities?.find((a: any) => a.topicId === topic.id);
                if (userAct) setActivity(userAct);
            }
        }
    };

    const handlePredictionVote = (choice: boolean) => {
        setPredictionChoice(choice);
        setPredictionAnswered(true);
    };

    // Loading state
    if (loading) {
        return (
            <main className="min-h-screen bg-world-quest text-foreground flex items-center justify-center">
                <div className="text-center space-y-6">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-8xl"
                    >
                        🧠
                    </motion.div>
                    <div className="space-y-2">
                        <p className="font-game text-2xl text-foreground">Entering the Nexus...</p>
                        <p className="text-text-secondary text-sm">Preparing today's quest</p>
                    </div>
                    <div className="w-48 mx-auto">
                        <motion.div
                            className="h-1.5 bg-brand-primary/30 rounded-full overflow-hidden"
                        >
                            <motion.div
                                className="h-full gradient-primary rounded-full"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </motion.div>
                    </div>
                </div>
            </main>
        );
    }

    if (!topic) {
        return (
            <main className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="container mx-auto pt-40 px-6 text-center space-y-6">
                    <div className="text-8xl">🏔️</div>
                    <h1 className="font-game text-4xl">No Quest Available</h1>
                    <p className="text-text-secondary max-w-md mx-auto">The knowledge realm is preparing your next adventure. Check back soon, brave learner.</p>
                </div>
            </main>
        );
    }

    const totalStages = topic.content?.length || 1;

    // === MISSION BRIEFING SCREEN ===
    if (!predictionAnswered && activity?.status !== "COMPLETED") {
        return (
            <main className="min-h-screen bg-world-quest text-foreground flex flex-col pb-20">
                <Navbar />

                {/* Dark cinematic overlay */}
                <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20 pointer-events-none z-0" />

                <div className="flex-grow flex items-center justify-center pt-24 px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="max-w-xl w-full relative"
                    >
                        {/* Atmospheric glow */}
                        <div className="absolute inset-0 bg-brand-primary/15 rounded-[3rem] blur-3xl scale-110" />

                        <div className="relative bg-gradient-to-b from-card/95 to-card/90 backdrop-blur-xl rounded-[3rem] border border-brand-primary/20 p-8 md:p-10 text-center overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
                            {/* Top light beam */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl -translate-y-16" />

                            {/* Mission Briefing label */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-2 bg-brand-primary/15 border border-brand-primary/25 rounded-full px-4 py-2 mb-6"
                            >
                                <motion.span
                                    animate={{ rotate: [0, 20, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-lg"
                                >
                                    📜
                                </motion.span>
                                <span className="font-game text-xs text-brand-primary uppercase tracking-widest">Mission Briefing</span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="font-game text-2xl md:text-3xl mb-6 text-foreground leading-tight"
                            >
                                Do you believe this is true?
                            </motion.h2>

                            {/* Tinder swiping card container */}
                            <div className="my-6">
                                <TinderSwipeCard
                                    statement={topic.prediction?.statement}
                                    emoji={topic.emoji}
                                    onVote={handlePredictionVote}
                                />
                            </div>

                            <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] mt-8">
                                Drag card left for False, right for True
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>
        );
    }

    // === MAIN QUEST VIEW ===
    return (
        <main className="min-h-screen pb-32 md:pb-24 bg-world-quest text-foreground">
            <Navbar />

            {/* Thin glowing progress bar at top */}
            <div className="fixed top-0 left-0 right-0 h-0.5 z-[60]">
                <motion.div
                    className="h-full bg-gradient-to-r from-brand-gold to-brand-primary shadow-[0_0_8px_rgba(247,201,72,0.6)]"
                    animate={{ width: `${((currentStage + 1) / totalStages) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                {/* Quest header section */}
                <div className="pt-24 pb-8">
                    {/* Inline HUD */}
                    <div className="mb-6">
                        <GameHUD xp={xp} streak={streak} level={level} shields={streakShields} />
                    </div>

                    {/* Brain Upgrade pill */}
                    <div className="flex items-center justify-between bg-card/60 backdrop-blur-sm border border-border/50 px-4 py-3 rounded-2xl mb-6">
                        <div className="flex items-center gap-2.5">
                            <span className="bg-brand-primary/15 text-brand-primary font-black uppercase text-[9px] px-2.5 py-1 rounded-full tracking-wider">
                                ⚡ Brain Upgrade
                            </span>
                            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                                <span>⏱️ 2 min</span>
                                <span className="text-border">·</span>
                                <span>🔥 Hard</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-brand-gold font-bold bg-brand-gold/10 px-3 py-1.5 rounded-full border border-brand-gold/20">
                            Top 4% today
                        </div>
                    </div>

                    {/* Quest stage progress */}
                    <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-text-secondary">
                        <span>Quest Progress</span>
                        <span className="text-brand-gold">{Math.min(currentStage + 1, totalStages)}/{totalStages}</span>
                    </div>
                    <QuestProgressBar stages={totalStages} current={currentStage} />

                    {/* Topic title */}
                    <CountdownTimer hasCompletedToday={activity?.status === "COMPLETED"} />
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-game text-2xl md:text-3xl text-foreground capitalize mt-6 mb-2 leading-tight"
                    >
                        {topic.title.replace(/\s*\(Day\s+\d+\)\s*/i, "").trim()} {topic.emoji}
                    </motion.h1>
                </div>

                {/* Content blocks */}
                <section className="space-y-6">
                    {topic.content.map((block: any, index: number) => {
                        const isCompleted = activity?.status === "COMPLETED";
                        const isVisible = isCompleted || index <= currentStage;

                        if (!isVisible) return null;

                        // Advance stage and auto-scroll to the newly revealed next block
                        const advanceStage = () => {
                            setCurrentStage(p => p + 1);
                            scrollToBlock(index + 1);
                        };

                        switch (block.type) {
                            case "hook":
                                return (
                                    <div key={index} ref={getBlockRef(index)}>
                                        <LearningBlock>
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                                <HookBlock text={block.text || ""} />
                                                {!isCompleted && currentStage === index && (
                                                    <StageRevealButton label="Reveal the Truth" onClick={advanceStage} />
                                                )}
                                            </motion.div>
                                        </LearningBlock>
                                    </div>
                                );

                            case "meme":
                                return (
                                    <div key={index} ref={getBlockRef(index)}>
                                        <LearningBlock>
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                                <MemeBlock
                                                    imageUrl={block.imageUrl || ""}
                                                    caption={block.caption || ""}
                                                    explanation={block.explanation || ""}
                                                />
                                                {!isCompleted && currentStage === index && (
                                                    <StageRevealButton label="Decode the Concept" onClick={advanceStage} />
                                                )}
                                            </motion.div>
                                        </LearningBlock>
                                    </div>
                                );

                            case "summary":
                                return (
                                    <div key={index} ref={getBlockRef(index)}>
                                        <LearningBlock>
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                                <SummaryBlock
                                                    title={block.title || ""}
                                                    bulletPoints={block.bulletPoints || []}
                                                />
                                                {!isCompleted && currentStage === index && (
                                                    <StageRevealButton label="Face the Final Boss" onClick={advanceStage} />
                                                )}
                                            </motion.div>
                                        </LearningBlock>
                                    </div>
                                );

                            case "poll":
                                return (
                                    <div key={index} ref={getBlockRef(index)}>
                                        <LearningBlock>
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                                <PollBlock
                                                    question={block.question || ""}
                                                    options={block.options || []}
                                                />
                                                {!isCompleted && currentStage === index && (
                                                    <StageRevealButton label="Continue Quest" onClick={advanceStage} />
                                                )}
                                            </motion.div>
                                        </LearningBlock>
                                    </div>
                                );

                            case "quiz":
                                return (
                                    <div key={index} ref={getBlockRef(index)}>
                                        <LearningBlock>
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                                <QuizBlock
                                                    question={block.question || ""}
                                                    options={block.options || []}
                                                    correctIndex={block.correctIndex ?? 0}
                                                    explanation={block.explanation || ""}
                                                    onSuccess={handleQuizSuccess}
                                                    onFailure={handleQuizFailure}
                                                    initialSelected={activity?.selectedAnswerIndex ?? null}
                                                    isLocked={activity?.status === "COMPLETED"}
                                                    suggestions={suggestions}
                                                />
                                                {!isCompleted && currentStage === index && (
                                                    <StageRevealButton label="Claim Your Reward" onClick={advanceStage} />
                                                )}
                                            </motion.div>
                                        </LearningBlock>
                                    </div>
                                );

                            case "share_card":
                                return (
                                    <div key={index} ref={getBlockRef(index)}>
                                        <LearningBlock>
                                            <ShareCard
                                                title={block.title || ""}
                                                summary={block.summary || ""}
                                                teaser={block.teaser || ""}
                                            />

                                            {/* Quest complete end card */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="mt-8 game-card p-8 relative overflow-hidden text-center"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/8 to-brand-primary/5 pointer-events-none" />
                                                <div className="relative z-10 space-y-5">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-success bg-brand-success/10 px-3 py-1.5 rounded-full inline-block">
                                                        🎯 Prediction Result
                                                    </div>
                                                    <h3 className="font-game text-xl text-foreground">
                                                        You guessed: <span className="text-brand-primary">{predictionChoice === null ? "Locked" : (predictionChoice ? "YES, True" : "NO, False")}</span>
                                                    </h3>
                                                    <p className="text-text-secondary leading-relaxed text-sm">
                                                        <strong className="text-foreground">Surprise! It was TRUE.</strong> {topic.prediction?.explanation}
                                                    </p>

                                                    {topic.tomorrow && (
                                                        <div className="border-t border-border pt-6 mt-6">
                                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full inline-block mb-4">
                                                                🚀 Next Brain Drop
                                                            </div>
                                                            <div className="flex items-center gap-4 text-left bg-background/50 rounded-2xl p-4">
                                                                <span className="text-4xl">{topic.tomorrow?.emoji || "💡"}</span>
                                                                <div>
                                                                    <h4 className="font-game text-base text-foreground">{topic.tomorrow?.title || "Tomorrow's Core Model"}</h4>
                                                                    <p className="text-text-secondary text-xs mt-1">
                                                                        {topic.tomorrow?.isPremium ? "⭐ Premium Drop" : "⚡ Free Drop"} · Unlocks at midnight
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </LearningBlock>
                                    </div>
                                );

                            default:
                                return null;
                        }
                    })}
                </section>
            </div>

            {/* Chest Reward Modal */}
            <AnimatePresence>
                {chestReward && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6"
                        onClick={() => setChestReward(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="max-w-sm w-full text-center relative"
                        >
                            {/* Glow */}
                            <div className="absolute inset-0 bg-brand-gold/20 rounded-[3rem] blur-3xl scale-110" />

                            <div className="relative bg-gradient-to-b from-card to-card/95 border-2 border-brand-gold/40 p-10 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/8 to-transparent pointer-events-none" />

                                <motion.div
                                    animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-7xl mb-6 relative z-10"
                                >
                                    🎁
                                </motion.div>

                                <h3 className="font-game text-3xl text-foreground mb-2 relative z-10">Bonus Chest!</h3>
                                <p className="text-text-secondary text-sm mb-6 relative z-10">Your consistency unlocked a reward:</p>

                                <div className="gradient-gold p-5 rounded-2xl inline-block w-full mb-6 relative z-10 shadow-lg shadow-brand-gold/30">
                                    <span className="font-game text-2xl text-amber-900 font-bold block">{chestReward.label}</span>
                                    {chestReward.type === "SHIELD" && (
                                        <span className="text-xs text-amber-800/80 mt-1 block">🛡️ Protects your streak if you miss a day</span>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setChestReward(null)}
                                    className="game-btn-gold w-full py-4 text-lg relative z-10"
                                >
                                    ✨ Collect Reward
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default function LearnPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-world-quest text-foreground flex items-center justify-center">
                <div className="text-center space-y-5">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="text-7xl"
                    >
                        🧠
                    </motion.div>
                    <p className="font-game text-xl text-foreground">Entering Quest Nexus...</p>
                </div>
            </main>
        }>
            <LearnQuestContent />
        </Suspense>
    );
}
