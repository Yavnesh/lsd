"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Swords, Timer, Zap, X, CheckCircle, AlertTriangle, ChevronRight, RefreshCw, Trophy, Lock, Unlock, Smile, ThumbsUp } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import Link from "next/link";

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

    const rotate = useTransform(x, [-200, 200], [-12, 12]);
    const scale = useTransform(x, [-150, 0, 150], [1.02, 1, 1.02]);
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

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent rounded-full" />

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

                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-text-secondary border-t border-border/40 pt-4">
                    <span className="text-brand-error">← Swipe False</span>
                    <span className="text-brand-primary">•</span>
                    <span className="text-brand-success">Swipe True →</span>
                </div>
            </motion.div>
        </div>
    );
};

import { useMotionValue, useTransform } from "framer-motion";

interface TopicBlock {
    type: "hook" | "meme" | "summary" | "poll" | "quiz" | "fact" | "share_card" | "prediction" | "reveal" | "story" | "psychology" | "examples" | "cheat_code" | "shortcut" | "victory" | "mission" | "experiment" | "boss_battle";
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
    items?: string[];
    explanations?: string[];
    prompt?: string;
    questions?: any[];
}

interface Topic {
    id: string;
    title: string;
    emoji: string;
    content: TopicBlock[];
    prediction?: {
        statement: string;
        correctAnswer: boolean;
        explanation: string;
    };
    tomorrow?: {
        title: string;
        emoji: string;
        isPremium: boolean;
    };
}

function LearnQuestContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const topicSlug = searchParams.get("slug");
    const isPvp = searchParams.get("pvp") === "true";

    const { xp, streak, addXp, hearts, loseHeart, resetHearts, refillHeartsIfNeeded, heartsRefillStartedAt, setMultiplier } = useUserStore();

    const [topic, setTopic] = useState<Topic | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStage, setCurrentStage] = useState(0);
    const [isAlreadyCompleted, setIsAlreadyCompleted] = useState<boolean>(false);
    const [heartCountdown, setHeartCountdown] = useState<string>("");

    // PvP specific states
    const [pvpOpponent, setPvpOpponent] = useState<any>(null);
    const [pvpGhost, setPvpGhost] = useState<any>(null);
    const [pvpMatchId, setPvpMatchId] = useState<string>("");
    const [pvpAnswers, setPvpAnswers] = useState<any[]>([]);
    const pvpAnswersRef = useRef<any[]>([]);
    const [pvpCompleteResult, setPvpCompleteResult] = useState<any | null>(null);

    // Timer states
    const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(15);
    const [timerActive, setTimerActive] = useState<boolean>(false);
    const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

    // Active screen selection states
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

    // Tinder prediction swipe states
    const [predictionVoted, setPredictionVoted] = useState<boolean>(false);
    const [predictionChoice, setPredictionChoice] = useState<boolean | null>(null);

    // Interactive deck state for reading cards
    const [unlockedBulletPoints, setUnlockedBulletPoints] = useState<number[]>([]);
    const [memeDecoded, setMemeDecoded] = useState<boolean>(false);
    const [reactionSelected, setReactionSelected] = useState<string | null>(null);
    const [pollChoice, setPollChoice] = useState<number | null>(null);

    // Boss Battle sub-stage state
    const [bossQuestionIndex, setBossQuestionIndex] = useState<number>(0);

    // Countdown Timer Effect
    useEffect(() => {
        let interval: any = null;
        if (timerActive && questionTimeLeft > 0) {
            interval = setInterval(() => {
                setQuestionTimeLeft(t => t - 1);
                setSecondsElapsed(s => s + 1);
            }, 1000);
        } else if (questionTimeLeft === 0 && timerActive) {
            setTimerActive(false);
            handleCheckAnswer(true); // Treat as incorrect timeout
        }
        return () => clearInterval(interval);
    }, [timerActive, questionTimeLeft]);

    const startTimerForQuestion = () => {
        setQuestionTimeLeft(15);
        setSecondsElapsed(0);
        setTimerActive(true);
        setSelectedOption(null);
        setIsCorrectAnswer(null);
    };

    const stopTimer = () => {
        setTimerActive(false);
    };

    // Load Data
    useEffect(() => {
        refillHeartsIfNeeded();
        const interval = setInterval(() => {
            refillHeartsIfNeeded();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (hearts >= 3 || !heartsRefillStartedAt) {
            setHeartCountdown("");
            return;
        }
        const updateCountdown = () => {
            const start = new Date(heartsRefillStartedAt).getTime();
            const nextRefill = start + 60 * 60 * 1000;
            const diff = nextRefill - Date.now();
            if (diff <= 0) {
                setHeartCountdown("00:00");
                refillHeartsIfNeeded();
            } else {
                const minutes = Math.floor(diff / (60 * 1000));
                const seconds = Math.floor((diff % (60 * 1000)) / 1000);
                setHeartCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [hearts, heartsRefillStartedAt]);

    useEffect(() => {
        async function loadData() {
            try {
                pvpAnswersRef.current = [];
                setPvpAnswers([]);
                setSelectedOption(null);
                setIsCorrectAnswer(null);
                setIsAnswerChecked(false);
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                let selectedTopic: any = null;

                if (topicSlug) {
                    const res = await fetch("/api/topics");
                    if (res.ok) {
                        const allTopics = await res.json();
                        selectedTopic = allTopics.find((t: any) => t.slug === topicSlug);
                    }
                } else {
                    const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: tz });
                    const todayRes = await fetch(`/api/topics/today?tz=${encodeURIComponent(tz)}&date=${todayKey}`);
                    if (todayRes.ok) selectedTopic = await todayRes.json();
                }

                if (selectedTopic) {
                    const parsedContent = Array.isArray(selectedTopic.content)
                        ? selectedTopic.content
                        : (selectedTopic.content ? JSON.parse(selectedTopic.content) : []);

                    // Filter out decision_point blocks completely
                    const cleanContent = parsedContent.filter((b: any) => b.type !== "decision_point");
                    
                    selectedTopic.content = cleanContent;
                    selectedTopic.prediction = {
                        statement: cleanContent.find((b: any) => b.type === "hook")?.text || "Every day is an opportunity to learn.",
                        correctAnswer: true,
                        explanation: cleanContent.find((b: any) => b.type === "meme")?.explanation || "Teachable moment."
                    };

                    setTopic(selectedTopic);

                    // Check if already completed using cached completedTopicIds in Zustand
                    const storeState = useUserStore.getState();
                    if (storeState.completedTopicIds.includes(selectedTopic.id)) {
                        setIsAlreadyCompleted(true);
                    }

                    if (isPvp) {
                        const matchRes = await fetch("/api/pvp/match", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ topicId: selectedTopic.id })
                        });
                        if (matchRes.ok) {
                            const matchData = await matchRes.json();
                            setPvpOpponent(matchData.opponent);
                            setPvpGhost(matchData.opponentGhost);
                            setPvpMatchId(matchData.matchId);
                            // PvP focuses only on interactive quiz challenges
                            selectedTopic.content = cleanContent.filter(
                                (b: any) => b.type === "quiz" || b.type === "mini_challenge"
                            );
                            setTopic({ ...selectedTopic });
                        }
                    }

                    // Start Redis game session
                    await fetch("/api/game/start", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ topicId: selectedTopic.id, isPvp })
                    });
                }
            } catch (err) {
                console.error("Failed to load daily learning data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [topicSlug, isPvp]);

    const activeBlocks = topic?.content || [];

    // Trigger confetti on successful quest completion
    useEffect(() => {
        if (topic && activeBlocks.length > 0 && currentStage >= activeBlocks.length) {
            const isVictory = !isPvp || (pvpCompleteResult && (pvpCompleteResult.status === "VICTORY" || pvpCompleteResult.status === "DRAW"));
            if (isVictory) {
                const duration = 2.5 * 1000;
                const end = Date.now() + duration;
                (function frame() {
                    confetti({
                        particleCount: 4,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0.1, y: 0.8 }
                    });
                    confetti({
                        particleCount: 4,
                        angle: 120,
                        spread: 55,
                        origin: { x: 0.9, y: 0.8 }
                    });
                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            }
        }
    }, [currentStage, activeBlocks.length, isPvp, pvpCompleteResult, topic]);
    const showPrediction = topic?.prediction && !isPvp && !predictionVoted;
    const currentBlock = activeBlocks[currentStage];
    
    // Quiz matching logic supporting Boss Battles as well
    const isQuizQuestion = currentBlock && (currentBlock.type === "quiz" || (currentBlock.type as string) === "mini_challenge" || currentBlock.type === "boss_battle");

    // Dynamic active question payload
    const activeQuestion = currentBlock?.type === "boss_battle"
        ? currentBlock.questions?.[bossQuestionIndex]
        : currentBlock;

    // Automatically trigger timer for quiz question
    useEffect(() => {
        if (isQuizQuestion && !isAnswerChecked && !timerActive) {
            startTimerForQuestion();
        }
    }, [currentStage, isQuizQuestion, isAnswerChecked, bossQuestionIndex]);

    const handleCheckAnswer = async (timedOut = false, optionOverride?: number | null) => {
        stopTimer();
        setIsAnswerChecked(true);

        const correctIndex = activeQuestion?.correctIndex ?? 0;
        const activeOption = optionOverride !== undefined ? optionOverride : selectedOption;
        const correct = !timedOut && activeOption === correctIndex;
        
        console.log("CLIENT CHECK:", { activeQuestion, optionOverride, correctIndex, activeOption, correct });

        setIsCorrectAnswer(correct);

        if (isPvp) {
            const answerObj = {
                questionId: activeQuestion?.question || `q-${currentStage}-${bossQuestionIndex}`,
                selectedIndex: activeOption || 0,
                timeTaken: secondsElapsed,
                isCorrect: correct
            };
            console.log("CLIENT PUSH ANSWER (SYNC):", answerObj);
            pvpAnswersRef.current = [...pvpAnswersRef.current, answerObj];
            setPvpAnswers(pvpAnswersRef.current);
        }

        if (!correct) {
            loseHeart();
        } else {
            let multiplier = 1.0;
            if (secondsElapsed <= 3) multiplier = 2.0;
            else if (secondsElapsed <= 8) multiplier = 1.5;
            setMultiplier(multiplier);

            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.8 }
            });
            await addXp(Math.round(20 * multiplier), topic?.id, true, activeOption || 0);
        }

        // Update Redis game session cache
        try {
            fetch("/api/game/answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId: activeQuestion?.question || `q-${currentStage}-${bossQuestionIndex}`,
                    selectedIndex: activeOption || 0,
                    timeTaken: secondsElapsed,
                    isCorrect: correct,
                    xpGained: correct ? Math.round(20 * (secondsElapsed <= 3 ? 2.0 : secondsElapsed <= 8 ? 1.5 : 1.0)) : 0
                })
            });
        } catch (e) {
            console.error("Failed to cache answer on server:", e);
        }
    };
    const handleContinue = async () => {
        // If inside a boss battle and has more questions, advance boss battle question index instead
        if (currentBlock?.type === "boss_battle" && bossQuestionIndex + 1 < (currentBlock.questions?.length || 0)) {
            setBossQuestionIndex(prev => prev + 1);
            setIsAnswerChecked(false);
            return;
        }

        if (currentStage + 1 < activeBlocks.length) {
            setIsAnswerChecked(false);
            setUnlockedBulletPoints([]);
            setMemeDecoded(false);
            setReactionSelected(null);
            setPollChoice(null);
            setBossQuestionIndex(0);
            setCurrentStage(prev => prev + 1);
        } else {
            if (isPvp) {
                console.log("CLIENT SUBMITTING PVP ANSWERS:", pvpAnswersRef.current);
                try {
                    const res = await fetch("/api/pvp/submit", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            topicId: topic?.id,
                            opponentScore: pvpGhost?.score || 0,
                            opponentTime: pvpGhost?.totalTime || 0,
                            opponentRating: pvpOpponent?.rating || 1000,
                            opponentName: pvpOpponent?.name || "Opponent",
                            answers: pvpAnswersRef.current
                        })
                    });
                    if (res.ok) {
                        const result = await res.json();
                        console.log("CLIENT SUBMIT RECEIVED:", result);
                        setPvpCompleteResult(result);
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                try {
                    await fetch("/api/game/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" }
                    });
                } catch (e) {
                    console.error("Failed to call complete route:", e);
                }
            }
            setCurrentStage(prev => prev + 1);
        }
    };
    const handleRestoreHearts = () => {
        resetHearts();
    };

    // Verify if footer continue should be enabled for interactive reading tasks
    const isContinueDisabled = () => {
        if (showPrediction) return true;
        if (!currentBlock) return false;

        if (isQuizQuestion) {
            return !isAnswerChecked;
        }



        if (currentBlock.type === "summary" || currentBlock.type === "examples") {
            const listLen = currentBlock.bulletPoints?.length || currentBlock.items?.length || 0;
            return unlockedBulletPoints.length < listLen;
        }

        if (currentBlock.type === "poll" || currentBlock.type === "experiment") {
            return pollChoice === null;
        }

        // Require reaction click for raw text components
        const rawTexts = ["hook", "story", "psychology", "fact", "reveal", "cheat_code", "shortcut", "victory", "mission", "share_card"];
        if (rawTexts.includes(currentBlock.type)) {
            return reactionSelected === null;
        }

        return false;
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-world-quest text-foreground flex items-center justify-center">
                <div className="text-center space-y-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="text-5xl">🧠</motion.div>
                    <p className="font-game text-lg">Entering World...</p>
                </div>
            </main>
        );
    }

    if (isAlreadyCompleted) {
        return (
            <main className="min-h-screen bg-world-quest text-foreground flex flex-col justify-between p-6">
                <div className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-brand-gold/15 flex items-center justify-center text-4xl shadow-lg border border-brand-gold/30">🏆</div>
                    <h1 className="font-game text-3xl">Quest Completed!</h1>
                    <p className="text-text-secondary leading-relaxed">
                        You have already completed this quest. Re-attempting completed quests is not allowed to keep the arena fair.
                    </p>
                </div>
                <div className="max-w-md mx-auto w-full pb-8">
                    <button onClick={() => router.push("/quizzes")} className="w-full py-4 rounded-2xl bg-brand-primary text-white font-bold cursor-pointer hover:opacity-90">
                        Return to Arena Hub
                    </button>
                </div>
            </main>
        );
    }

    if (hearts === 0) {
        return (
            <main className="min-h-screen bg-world-quest text-foreground flex flex-col justify-between p-6">
                <div className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-brand-error/15 flex items-center justify-center text-4xl shadow-lg border border-brand-error/30">💀</div>
                    <h1 className="font-game text-3xl">No Hearts Remaining!</h1>
                    <p className="text-text-secondary leading-relaxed">
                        You have run out of hearts. Hearts are shared across all quests.
                    </p>
                    {heartCountdown && (
                        <div className="bg-black/30 border border-white/5 px-6 py-4 rounded-2xl flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Next Heart Refill In</span>
                            <span className="font-game text-2xl text-brand-gold">{heartCountdown}</span>
                        </div>
                    )}
                </div>
                <div className="max-w-md mx-auto w-full pb-8">
                    <button onClick={() => router.push("/quizzes")} className="w-full py-4 rounded-2xl bg-brand-primary text-white font-bold cursor-pointer hover:opacity-90">
                        Exit to Arena Hub
                    </button>
                </div>
            </main>
        );
    }

    const progressPercent = Math.min(100, Math.round(((currentStage) / Math.max(1, activeBlocks.length)) * 100));

    // Get block theme mapping
    const getBlockTheme = (type: string) => {
        switch (type) {
            case "hook": return { emoji: "🧐", label: "Brain Hook", color: "text-brand-primary" };
            case "story": return { emoji: "🎭", label: "Mental Movie", color: "text-brand-primary" };
            case "psychology": return { emoji: "🧠", label: "Psychology Core", color: "text-brand-primary" };
            case "fact": return { emoji: "📊", label: "Fast Fact", color: "text-brand-gold" };
            case "reveal": return { emoji: "🔓", label: "The Reveal", color: "text-brand-success" };
            case "cheat_code": return { emoji: "💡", label: "The Cheat Code", color: "text-brand-gold" };
            case "shortcut": return { emoji: "⚡", label: "The Shortcut", color: "text-brand-primary" };
            case "victory": return { emoji: "🏆", label: "Victory!", color: "text-brand-success" };
            case "mission": return { emoji: "🎯", label: "Daily Mission", color: "text-foreground" };
            case "share_card": return { emoji: "📱", label: "Share Progress", color: "text-brand-primary" };
            default: return { emoji: "📝", label: "Intel drop", color: "text-foreground" };
        }
    };

    const blockTheme = currentBlock ? getBlockTheme(currentBlock.type) : { emoji: "📝", label: "Intel Drop", color: "text-foreground" };

    return (
        <main className="min-h-screen bg-world-quest text-foreground flex flex-col justify-between">
            {/* 1. TOP HEADER */}
            <header className="px-6 py-4 flex items-center justify-between gap-6 max-w-4xl mx-auto w-full border-b border-white/5">
                <button onClick={() => router.push("/quizzes")} className="p-1 hover:bg-white/5 rounded-xl cursor-pointer">
                    <X className="w-6 h-6 text-text-secondary" />
                </button>
                <div className="flex-grow h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                    <motion.div
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-gold shadow-[0_0_8px_rgba(124,77,255,0.4)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-brand-error/15 px-3 py-1.5 rounded-full border border-brand-error/20 text-brand-error font-bold">
                    <Heart className="w-4 h-4 fill-brand-error" /> {hearts}
                    {hearts < 3 && heartCountdown && (
                        <span className="text-[10px] opacity-75 border-l border-brand-error/30 pl-1.5 font-mono">{heartCountdown}</span>
                    )}
                </div>
            </header>

            {/* 2. MAIN CENTER CONTENT */}
            <div className="flex-grow flex items-center justify-center p-6 max-w-2xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {showPrediction && (
                        <motion.div
                            key="prediction"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full text-center space-y-6"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-gold block">Swipe Prediction</span>
                            <TinderSwipeCard
                                statement={topic.prediction?.statement || ""}
                                emoji={topic.emoji || "🧐"}
                                onVote={(choice) => {
                                    setPredictionChoice(choice);
                                    setPredictionVoted(true);
                                }}
                            />
                        </motion.div>
                    )}

                    {!showPrediction && currentStage < activeBlocks.length && (
                        <motion.div
                            key={currentStage}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full space-y-6"
                        >
                            {/* A. MISSION BRIEF */}
                            {(currentBlock.type as string) === "mission_brief" && (
                                <div className="space-y-6 text-center">
                                    <div className="text-5xl">📜</div>
                                    <h2 className="font-game text-2xl">Mission Objective</h2>
                                    <p className="text-lg leading-relaxed text-foreground/90">{currentBlock.text}</p>
                                </div>
                            )}

                            {/* B. DYNAMIC EMOJI READING SLIDES */}
                            {["story", "hook", "psychology", "fact", "reveal", "cheat_code", "shortcut", "victory", "mission", "share_card"].includes(currentBlock.type) && (
                                <div className="space-y-6 text-center">
                                    <div className="text-5xl mb-2">{blockTheme.emoji}</div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider block ${blockTheme.color}`}>
                                        {blockTheme.label}
                                    </span>
                                    <p className="text-xl md:text-2xl leading-relaxed text-foreground/90 font-medium italic">
                                        "{currentBlock.text || currentBlock.summary || ""}"
                                    </p>
                                    {currentBlock.type === "share_card" && currentBlock.teaser && (
                                        <p className="text-xs text-brand-primary italic">"{currentBlock.teaser}"</p>
                                    )}
                                    
                                    {/* Tap Reaction Interaction */}
                                    <div className="pt-6">
                                        <p className="text-xs text-text-secondary mb-3">How does this resonate with you?</p>
                                        <div className="flex justify-center gap-3">
                                            {["🤯 Mind Blown", "💡 Makes Sense", "🤔 Curious", "✅ Got It"].map((label) => (
                                                <button
                                                    key={label}
                                                    onClick={() => setReactionSelected(label)}
                                                    className={`px-4 py-2 text-xs rounded-xl border font-bold cursor-pointer transition-all ${
                                                        reactionSelected === label
                                                            ? "bg-brand-primary border-brand-primary text-white scale-105"
                                                            : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* C. MEME */}
                            {currentBlock.type === "meme" && (
                                <div className="space-y-6 text-center">
                                    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl aspect-video max-w-md mx-auto">
                                        <img src={currentBlock.imageUrl} alt="Concept" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <p className="absolute bottom-0 inset-x-0 py-6 px-4 text-white font-game text-lg">{currentBlock.caption}</p>
                                    </div>
                                </div>
                            )}

                            {/* D. SUMMARY / EXAMPLES */}
                            {(currentBlock.type === "summary" || currentBlock.type === "examples") && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-game text-xl text-brand-gold">{currentBlock.title || "Key Insights"}</h3>
                                        <span className="text-xs text-text-secondary">Tap points to unlock progress</span>
                                    </div>
                                    <div className="space-y-3">
                                        {(currentBlock.bulletPoints || currentBlock.items || []).map((pt: string, idx: number) => {
                                            const isUnlocked = unlockedBulletPoints.includes(idx);
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        if (!isUnlocked) {
                                                            setUnlockedBulletPoints(prev => [...prev, idx]);
                                                        }
                                                    }}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                                                        isUnlocked
                                                            ? "border-white/10 bg-black/10 text-foreground"
                                                            : "border-brand-gold/30 bg-brand-gold/5 text-text-secondary hover:bg-brand-gold/10"
                                                    }`}
                                                >
                                                    <span className="text-sm">{isUnlocked ? pt : "••••••••••••••••••••••••••••"}</span>
                                                    {isUnlocked ? <Unlock className="w-4 h-4 text-brand-success flex-shrink-0" /> : <Lock className="w-4 h-4 text-brand-gold flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* E. POLL */}
                            {currentBlock.type === "poll" && (
                                <div className="space-y-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary block">Opinion Poll</span>
                                    <h2 className="font-game text-xl leading-snug">{currentBlock.question}</h2>
                                    <div className="space-y-3">
                                        {currentBlock.options?.map((opt: string, idx: number) => {
                                            const chosen = pollChoice === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setPollChoice(idx)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                                                        chosen
                                                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                                                            : "border-black/10 bg-black/5 text-foreground hover:bg-black/10"
                                                    }`}
                                                >
                                                    <span>{opt}</span>
                                                    {pollChoice !== null && (
                                                        <span className="text-xs font-bold text-brand-primary">
                                                            {chosen ? "56% (Your Choice)" : `${[18, 12, 14][idx % 3] || 15}%`}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* F. EXPERIMENT */}
                            {currentBlock.type === "experiment" && (
                                <div className="space-y-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold block">Interactive Experiment</span>
                                    <h3 className="font-game text-lg text-foreground">{currentBlock.title}</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed mb-4">{currentBlock.prompt}</p>
                                    <div className="space-y-3">
                                        {currentBlock.options?.map((opt: string, idx: number) => {
                                            const chosen = pollChoice === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setPollChoice(idx)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col cursor-pointer ${
                                                        chosen
                                                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
                                                            : "border-black/10 bg-black/5 text-foreground hover:bg-black/10"
                                                    }`}
                                                >
                                                    <span className="font-bold text-sm">{opt}</span>
                                                    {chosen && currentBlock.explanations?.[idx] && (
                                                        <motion.span
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            className="text-xs text-text-secondary mt-2 block border-t border-white/5 pt-2"
                                                        >
                                                            {currentBlock.explanations[idx]}
                                                        </motion.span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* G. QUIZ & BOSS BATTLE SUB-QUESTIONS */}
                            {isQuizQuestion && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                                            {currentBlock.type === "boss_battle" ? `Boss Battle (${bossQuestionIndex + 1}/${currentBlock.questions?.length})` : "Quiz Challenge"}
                                        </span>
                                        <span className="text-xs bg-brand-gold/10 text-brand-gold px-2.5 py-1 rounded-lg border border-brand-gold/25 flex items-center gap-1">
                                            <Timer className="w-3.5 h-3.5" /> {questionTimeLeft}s
                                        </span>
                                    </div>
                                    <h2 className="font-game text-xl md:text-2xl leading-snug">{activeQuestion?.question}</h2>
                                    <div className="space-y-3">
                                        {activeQuestion?.options?.map((opt: string, idx: number) => {
                                            const isSelected = selectedOption === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    disabled={isAnswerChecked}
                                                    onClick={() => {
                                                        setSelectedOption(idx);
                                                        if (isPvp) {
                                                            handleCheckAnswer(false, idx);
                                                        }
                                                    }}
                                                    className={`w-full text-left p-5 rounded-2xl border-2 font-bold transition-all text-sm flex items-center gap-4 cursor-pointer ${
                                                        isSelected 
                                                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary" 
                                                            : "border-black/10 bg-black/5 hover:border-black/15 text-foreground"
                                                    }`}
                                                >
                                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                                                        isSelected ? "bg-brand-primary text-white" : "bg-black/10 text-text-secondary"
                                                    }`}>
                                                        {["A", "B", "C", "D"][idx]}
                                                    </span>
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {!showPrediction && currentStage >= activeBlocks.length && (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full text-center space-y-6 max-w-md"
                        >
                            {isPvp && pvpCompleteResult ? (
                                <>
                                    {pvpCompleteResult.status === "VICTORY" ? (
                                        <>
                                            <Trophy className="w-20 h-20 text-brand-gold mx-auto animate-bounce" />
                                            <h1 className="font-game text-3xl text-brand-gold">Match Won!</h1>
                                        </>
                                    ) : pvpCompleteResult.status === "DEFEAT" ? (
                                        <>
                                            <motion.div 
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                className="w-20 h-20 bg-brand-error/10 border border-brand-error/20 rounded-full flex items-center justify-center text-4xl mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                            >
                                                💀
                                            </motion.div>
                                            <h1 className="font-game text-3xl text-brand-error tracking-wide uppercase">Match Lost</h1>
                                        </>
                                    ) : (
                                        <>
                                            <Smile className="w-20 h-20 text-brand-primary mx-auto" />
                                            <h1 className="font-game text-3xl text-[#7c4dff]">Match Draw!</h1>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Trophy className="w-20 h-20 text-brand-gold mx-auto" />
                                    <h1 className="font-game text-3xl">Mission Accomplished!</h1>
                                </>
                            )}
                            <p className="text-text-secondary text-sm leading-relaxed">
                                {isPvp ? "The match has concluded. Check out your results below!" : "You have successfully navigated the world and completed this cognitive challenge."}
                            </p>

                            {isPvp && pvpCompleteResult && (
                                <div className="bg-black/35 border border-white/5 p-6 rounded-2xl text-left space-y-3">
                                    <div className="flex justify-between items-center text-sm font-bold pb-2 border-b border-white/5">
                                        <span>Outcome</span>
                                        <span className={pvpCompleteResult.status === "VICTORY" ? "text-brand-success" : pvpCompleteResult.status === "DEFEAT" ? "text-brand-error" : "text-[#7c4dff]"}>
                                            {pvpCompleteResult.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 border-b border-white/5 pb-2 text-xs text-text-secondary">
                                        <div className="flex justify-between items-center">
                                            <span>Your Score: {pvpCompleteResult.playerScore}</span>
                                            <span>Opponent Score: {pvpCompleteResult.opponentScore}</span>
                                        </div>
                                        <div className="flex justify-between items-center opacity-75">
                                            <span>Your Time: {pvpCompleteResult.playerTime !== undefined ? `${pvpCompleteResult.playerTime.toFixed(1)}s` : "0.0s"}</span>
                                            <span>Opponent Time: {pvpCompleteResult.opponentTime !== undefined ? `${pvpCompleteResult.opponentTime.toFixed(1)}s` : "0.0s"}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold pt-1 text-brand-gold">
                                        <span>Elo Rating Change</span>
                                        <span>{pvpCompleteResult.eloChange >= 0 ? `+${pvpCompleteResult.eloChange}` : pvpCompleteResult.eloChange} ({pvpCompleteResult.newRating})</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <button onClick={() => router.push("/quizzes")} className="game-btn-gold px-8 py-3.5 text-base cursor-pointer">
                                    Return to Arena Hub
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. STICKY BOTTOM CHECK / CONTINUE DRAWER (Duolingo Style) */}
            <footer className="w-full border-t border-white/5 bg-card/60 backdrop-blur-md">
                {!showPrediction && currentStage < activeBlocks.length ? (
                    <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
                        {isQuizQuestion ? (
                            <div className="w-full">
                                <AnimatePresence mode="wait">
                                    {!isAnswerChecked ? (
                                        !isPvp && (
                                            <motion.div key="check" className="flex justify-end w-full">
                                                <button
                                                    disabled={selectedOption === null}
                                                    onClick={() => handleCheckAnswer(false)}
                                                    className={`px-8 py-4 rounded-2xl font-bold text-sm cursor-pointer transition-all ${
                                                        selectedOption === null 
                                                            ? "bg-white/10 text-white/30 cursor-not-allowed" 
                                                            : "bg-brand-primary text-white hover:bg-brand-primary/95"
                                                    }`}
                                                >
                                                    CHECK ANSWER
                                                </button>
                                            </motion.div>
                                        )
                                    ) : (
                                        !isPvp && (
                                            <motion.div
                                                key="result"
                                                initial={{ y: 80, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: 80, opacity: 0 }}
                                                className={`w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border-2 ${
                                                    isCorrectAnswer 
                                                        ? "bg-brand-success/15 border-brand-success/30 text-brand-success" 
                                                        : "bg-brand-error/15 border-brand-error/30 text-brand-error"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">{isCorrectAnswer ? "✅" : "❌"}</span>
                                                    <div>
                                                        <h4 className="font-bold text-base">{isCorrectAnswer ? "Awesome job!" : "Incorrect"}</h4>
                                                        <p className="text-xs opacity-80 mt-1">
                                                            {currentBlock?.type === "boss_battle"
                                                                ? activeQuestion?.explanations?.[selectedOption || 0] || currentBlock?.explanation
                                                                : currentBlock?.explanation}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleContinue}
                                                    className="px-6 py-3 bg-foreground text-background font-bold text-xs rounded-xl cursor-pointer hover:opacity-90 flex items-center gap-2 self-end md:self-center"
                                                >
                                                    CONTINUE <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        )
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="w-full flex justify-end">
                                <button
                                    disabled={isContinueDisabled()}
                                    onClick={handleContinue}
                                    className={`px-8 py-4 font-bold text-sm rounded-2xl cursor-pointer flex items-center gap-2 transition-all ${
                                        isContinueDisabled()
                                            ? "bg-white/10 text-white/30 cursor-not-allowed"
                                            : "bg-brand-primary hover:bg-brand-primary/95 text-white"
                                    }`}
                                >
                                    CONTINUE <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-6" />
                )}
            </footer>

            {/* PvP Result Slide-In Drawer */}
            <AnimatePresence>
                {isPvp && isAnswerChecked && currentStage < activeBlocks.length && (
                    <motion.div
                        key="pvp-result-drawer"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed bottom-0 left-0 right-0 z-50 border-t-4 p-6 md:py-8 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                            isCorrectAnswer 
                                ? "bg-[#132f21] border-brand-success text-brand-success shadow-[0_-10px_40px_rgba(22,101,52,0.3)]" 
                                : "bg-[#3b1812] border-brand-error text-[#ff6b6b] shadow-[0_-10px_40px_rgba(153,27,27,0.3)]"
                        }`}
                    >
                        <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4 md:gap-6">
                                <span className="text-4xl md:text-5xl flex-shrink-0 animate-bounce">
                                    {isCorrectAnswer ? "🎉" : "💀"}
                                </span>
                                <div>
                                    <h4 className="font-game text-xl md:text-2xl tracking-wide uppercase">
                                        {isCorrectAnswer ? "Victory is Near!" : "Ouch! Strike!"}
                                    </h4>
                                    <p className="text-sm opacity-90 mt-1 md:mt-2 max-w-2xl leading-relaxed text-foreground/90 font-medium">
                                        {currentBlock?.type === "boss_battle"
                                            ? activeQuestion?.explanations?.[selectedOption || 0] || currentBlock?.explanation
                                            : currentBlock?.explanation}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleContinue}
                                className={`px-8 py-4 font-game text-sm uppercase tracking-wider rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-end md:self-center ${
                                    isCorrectAnswer
                                        ? "bg-brand-success text-white shadow-[0_5px_15px_rgba(34,197,94,0.4)]"
                                        : "bg-brand-error text-white shadow-[0_5px_15px_rgba(239,68,68,0.4)]"
                                }`}
                            >
                                CONTINUE <ChevronRight className="w-5 h-5 stroke-[3]" />
                            </button>
                        </div>
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
                <p className="font-game text-xl">Entering Quest Nexus...</p>
            </main>
        }>
            <LearnQuestContent />
        </Suspense>
    );
}
