"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function PremiumPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpgrade = async () => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/premium");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/user/premium", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                // Trigger success state
                setSuccess(true);
                import("canvas-confetti").then((module) => {
                    const confetti = module.default || module;
                    confetti({
                        particleCount: 200,
                        spread: 100,
                        origin: { y: 0.5 },
                        colors: ['#6C5CE7', '#FFD700', '#00BFFF', '#32D74B']
                    });
                });

                // Update session state so client components pick up the new role/premium status
                await update();

                setTimeout(() => {
                    router.push("/topics");
                }, 2500);
            } else {
                alert("Failed to process simulated upgrade. Please try again.");
                setLoading(false);
            }
        } catch (e) {
            console.error("Upgrade error:", e);
            alert("Error connecting to server. Please try again.");
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-lg text-text-secondary font-bold font-display uppercase tracking-widest">Loading Premium Lounge...</p>
                </div>
            </main>
        );
    }

    const perks = [
        "Full access to 50+ Premium intelligence drops",
        "Double XP multiplier on all lessons and quizzes",
        "Exclusive premium-only avatar drops and persona packs",
        "Ad-free experience across the entire portal",
        "Early access to new topic clusters"
    ];

    const isPremium = (session?.user as any)?.isPremium === true;

    return (
        <main className="min-h-screen pb-24 bg-background text-foreground">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 max-w-4xl">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/10 border border-brand-accent/20 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-brand-accent fill-brand-accent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent">LSD VIP Lounge</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight mb-4">
                        Unlock the <span className="gradient-text italic">Full Brain.</span>
                    </h1>
                    <p className="text-text-secondary text-lg max-w-xl mx-auto">
                        Get the ultimate cognitive edge. Standard is good. Savage is better.
                    </p>
                </header>

                <div className="grid md:grid-cols-5 gap-8 bg-card rounded-[3.5rem] card-shadow border border-border overflow-hidden">
                    {/* Left: Perks */}
                    <div className="md:col-span-3 p-10 md:p-14 space-y-8">
                        <h3 className="text-2xl font-bold font-display">Premium Benefits</h3>
                        <ul className="space-y-4">
                            {perks.map((perk, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-brand-success/10 text-brand-success flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-text-secondary font-medium font-sans leading-relaxed">{perk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Checkout Box */}
                    <div className="md:col-span-2 gradient-primary p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden text-center md:text-left">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <div className="w-48 h-48 border-8 border-white rounded-full translate-x-24 -translate-y-24" />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-2">Monthly Pass</p>
                                <div className="flex items-baseline justify-center md:justify-start gap-2">
                                    <span className="text-5xl font-black font-display">$9.99</span>
                                    <span className="text-sm opacity-60">/ month</span>
                                </div>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed font-sans">
                                Cancel anytime with a single click. No hidden fees.
                            </p>
                        </div>

                        <div className="pt-8 relative z-10">
                            {isPremium ? (
                                <div className="w-full bg-white/20 border border-white/30 py-5 rounded-[2rem] font-bold text-center flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-6 h-6" /> Premium Active
                                </div>
                            ) : success ? (
                                <div className="w-full bg-brand-success py-5 rounded-[2rem] font-bold text-center flex items-center justify-center gap-2">
                                    🎉 Welcome to VIP!
                                </div>
                            ) : (
                                <button
                                    onClick={handleUpgrade}
                                    disabled={loading}
                                    className="w-full bg-white text-brand-primary py-5 rounded-[2rem] font-bold text-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all btn-push flex items-center justify-center gap-3"
                                >
                                    <span>{loading ? "Authorizing..." : "Upgrade Now"}</span>
                                    {!loading && <ArrowRight className="w-5 h-5" />}
                                </button>
                            )}
                            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] text-center mt-4">
                                Simulated Checkout Hook
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
