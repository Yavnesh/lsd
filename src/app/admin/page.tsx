"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Check, AlertCircle, Save } from "lucide-react";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [emoji, setEmoji] = useState("🧠");
    const [summary, setSummary] = useState("");
    const [season, setSeason] = useState("Understand Yourself");
    const [cluster, setCluster] = useState("Personality");
    const [dayOfWeek, setDayOfWeek] = useState("1");
    const [isPremium, setIsPremium] = useState(false);

    // Form states for Content Blocks
    const [hookText, setHookText] = useState("");
    const [memeUrl, setMemeUrl] = useState("");
    const [memeCaption, setMemeCaption] = useState("");
    const [memeExplanation, setMemeExplanation] = useState("");
    const [summaryTitle, setSummaryTitle] = useState("");
    const [summaryPoints, setSummaryPoints] = useState("");
    const [quizQuestion, setQuizQuestion] = useState("");
    const [quizOption1, setQuizOption1] = useState("");
    const [quizOption2, setQuizOption2] = useState("");
    const [quizOption3, setQuizOption3] = useState("");
    const [quizOption4, setQuizOption4] = useState("");
    const [quizCorrectIndex, setQuizCorrectIndex] = useState("0");
    const [quizExplanation, setQuizExplanation] = useState("");
    const [factText, setFactText] = useState("");
    const [shareTitle, setShareTitle] = useState("");
    const [shareSummary, setShareSummary] = useState("");
    const [shareTeaser, setShareTeaser] = useState("");

    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState(false);

    if (status === "loading") {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-lg text-text-secondary font-bold font-display uppercase tracking-widest">Loading...</p>
                </div>
            </main>
        );
    }

    if (status === "unauthenticated") {
        router.replace("/login");
        return null;
    }

    if (session && (session.user as any)?.role !== "ADMIN") {
        router.replace("/learn");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage("Saving topic...");
        setError(false);

        const contentBlocks = [
            { type: "hook", text: hookText },
            {
                type: "meme",
                imageUrl: memeUrl || "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=1000",
                caption: memeCaption,
                explanation: memeExplanation
            },
            {
                type: "summary",
                title: summaryTitle,
                bulletPoints: summaryPoints.split("\n").filter(p => p.trim() !== "")
            },
            {
                type: "quiz",
                question: quizQuestion,
                options: [quizOption1, quizOption2, quizOption3, quizOption4].filter(Boolean),
                correctIndex: parseInt(quizCorrectIndex),
                explanation: quizExplanation
            },
            {
                type: "fact",
                title: "Mind-Blowing Fact 🧠",
                text: factText
            },
            {
                type: "share_card",
                title: shareTitle,
                summary: shareSummary,
                teaser: shareTeaser
            }
        ];

        try {
            const res = await fetch("/api/admin/topics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    slug,
                    emoji,
                    summary,
                    season,
                    cluster,
                    dayOfWeek,
                    isPremium,
                    contentBlocks
                })
            });

            if (res.ok) {
                setStatusMessage("Topic created successfully!");
                setError(false);
                // Reset form
                setTitle("");
                setSlug("");
                setHookText("");
                setMemeUrl("");
                setMemeCaption("");
                setMemeExplanation("");
                setSummaryTitle("");
                setSummaryPoints("");
                setQuizQuestion("");
                setQuizOption1("");
                setQuizOption2("");
                setQuizOption3("");
                setQuizOption4("");
                setQuizExplanation("");
                setFactText("");
                setShareTitle("");
                setShareSummary("");
                setShareTeaser("");
            } else {
                const data = await res.json();
                setError(true);
                setStatusMessage(data.error || "Failed to save topic.");
            }
        } catch (err) {
            setError(true);
            setStatusMessage("Failed to submit request.");
        }
    };

    return (
        <main className="min-h-screen pb-24 bg-background text-foreground">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 max-w-4xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold font-display text-foreground mb-2">Admin Dashboard</h1>
                    <p className="text-text-secondary text-lg">Create, schedule, and author daily learning modules.</p>
                </header>

                {statusMessage && (
                    <div className={`p-5 rounded-2xl mb-8 flex items-center gap-3 border ${error ? 'bg-brand-error/10 border-brand-error/20 text-brand-error' : 'bg-brand-success/10 border-brand-success/20 text-brand-success'}`}>
                        {error ? <AlertCircle /> : <Check />}
                        <span className="font-bold">{statusMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* General Metadata */}
                    <section className="bg-card p-10 rounded-[2.5rem] card-shadow border border-border space-y-6">
                        <h2 className="text-2xl font-bold font-display text-brand-primary">1. Topic Metadata</h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-black uppercase tracking-wider text-text-secondary">Title</label>
                                <input value={title} onChange={e => { setTitle(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} required placeholder="e.g. Cognitive Dissonance" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-black uppercase tracking-wider text-text-secondary">Slug</label>
                                <input value={slug} onChange={e => setSlug(e.target.value)} required placeholder="cognitive-dissonance" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-black uppercase tracking-wider text-text-secondary">Emoji</label>
                                <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🧠" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-black uppercase tracking-wider text-text-secondary">Season</label>
                                <select value={season} onChange={e => setSeason(e.target.value)} className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none">
                                    <option value="Understand Yourself">Understand Yourself</option>
                                    <option value="Surviving The Internet">Surviving The Internet</option>
                                    <option value="Your Body Explained">Your Body Explained</option>
                                    <option value="Think Better">Think Better</option>
                                    <option value="Money Without The Boring Stuff">Money Without The Boring Stuff</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-black uppercase tracking-wider text-text-secondary">Cluster</label>
                                <input value={cluster} onChange={e => setCluster(e.target.value)} required placeholder="e.g. Personality" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-black uppercase tracking-wider text-text-secondary">Weekly Rhythm (Day)</label>
                                <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)} className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none">
                                    <option value="1">Monday (Understand Yourself)</option>
                                    <option value="2">Tuesday (Understand Others)</option>
                                    <option value="3">Wednesday (Understand World)</option>
                                    <option value="4">Thursday (Understand Body)</option>
                                    <option value="5">Friday (Understand Money)</option>
                                    <option value="6">Saturday (Think Better)</option>
                                    <option value="7">Sunday (Connect Dots)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2 justify-center">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="w-5 h-5 accent-brand-primary" />
                                    <span className="text-sm font-black uppercase tracking-wider text-text-secondary">Is Premium Access?</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-black uppercase tracking-wider text-text-secondary">Short Summary</label>
                            <textarea value={summary} onChange={e => setSummary(e.target.value)} required placeholder="Brief description to show in topic grids" rows={2} className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                        </div>
                    </section>

                    {/* Content Blocks Builder */}
                    <section className="bg-card p-10 rounded-[2.5rem] card-shadow border border-border space-y-8">
                        <h2 className="text-2xl font-bold font-display text-brand-primary">2. Content Blocks</h2>

                        {/* Hook */}
                        <div className="border-t border-border pt-6 space-y-4">
                            <h3 className="font-bold text-lg font-display text-brand-secondary">Block 1: The Hook</h3>
                            <textarea value={hookText} onChange={e => setHookText(e.target.value)} required placeholder="A punchy statement to grab attention..." rows={2} className="w-full bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                        </div>

                        {/* Meme */}
                        <div className="border-t border-border pt-6 space-y-4">
                            <h3 className="font-bold text-lg font-display text-brand-secondary">Block 2: Meme & Explanation</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input value={memeUrl} onChange={e => setMemeUrl(e.target.value)} placeholder="Unsplash/Imgur Image URL" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                                <input value={memeCaption} onChange={e => setMemeCaption(e.target.value)} required placeholder="Meme Caption Text" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            </div>
                            <textarea value={memeExplanation} onChange={e => setMemeExplanation(e.target.value)} required placeholder="Simplified 60-second explanation..." rows={3} className="w-full bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                        </div>

                        {/* Summary / Explanation */}
                        <div className="border-t border-border pt-6 space-y-4">
                            <h3 className="font-bold text-lg font-display text-brand-secondary">Block 3: Key Takeaway Summary</h3>
                            <input value={summaryTitle} onChange={e => setSummaryTitle(e.target.value)} required placeholder="Summary Card Title (e.g. Red Flags)" className="w-full bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            <textarea value={summaryPoints} onChange={e => setSummaryPoints(e.target.value)} required placeholder="Enter bullet points (one per line)..." rows={4} className="w-full bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                        </div>

                        {/* Quiz */}
                        <div className="border-t border-border pt-6 space-y-4">
                            <h3 className="font-bold text-lg font-display text-brand-secondary">Block 4: Brain Test (Quiz)</h3>
                            <input value={quizQuestion} onChange={e => setQuizQuestion(e.target.value)} required placeholder="Quiz Question" className="w-full bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            <div className="grid md:grid-cols-2 gap-4">
                                <input value={quizOption1} onChange={e => setQuizOption1(e.target.value)} required placeholder="Option 1" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                                <input value={quizOption2} onChange={e => setQuizOption2(e.target.value)} required placeholder="Option 2" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                                <input value={quizOption3} onChange={e => setQuizOption3(e.target.value)} placeholder="Option 3 (Optional)" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                                <input value={quizOption4} onChange={e => setQuizOption4(e.target.value)} placeholder="Option 4 (Optional)" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black uppercase text-text-secondary">Correct Answer Index</label>
                                    <select value={quizCorrectIndex} onChange={e => setQuizCorrectIndex(e.target.value)} className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none">
                                        <option value="0">Option 1</option>
                                        <option value="1">Option 2</option>
                                        <option value="2">Option 3</option>
                                        <option value="3">Option 4</option>
                                    </select>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <input value={quizExplanation} onChange={e => setQuizExplanation(e.target.value)} required placeholder="Explanation when user answers correctly" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Fact */}
                        <div className="border-t border-border pt-6 space-y-4">
                            <h3 className="font-bold text-lg font-display text-brand-secondary">Block 5: Mind-Blowing Fact</h3>
                            <textarea value={factText} onChange={e => setFactText(e.target.value)} required placeholder="Unexpected insight, study, or statistic..." rows={3} className="w-full bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                        </div>

                        {/* Share Card */}
                        <div className="border-t border-border pt-6 space-y-4">
                            <h3 className="font-bold text-lg font-display text-brand-secondary">Block 6: Takeaway Share Card</h3>
                            <input value={shareTitle} onChange={e => setShareTitle(e.target.value)} required placeholder="Share Card Header (e.g. Cognitive Dissonance 101)" className="w-full bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            <div className="grid md:grid-cols-2 gap-4">
                                <input value={shareSummary} onChange={e => setShareSummary(e.target.value)} required placeholder="One-line takeaway message" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                                <input value={shareTeaser} onChange={e => setShareTeaser(e.target.value)} required placeholder="CTA (e.g. Decode your brain loops on LSD)" className="bg-background p-4 rounded-xl border border-border focus:border-brand-primary focus:outline-none" />
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="gradient-primary text-white px-10 py-5 rounded-2xl font-bold font-display shadow-2xl shadow-brand-primary/30 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all btn-push">
                            <Save className="w-6 h-6" /> Save Topic Intel
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
