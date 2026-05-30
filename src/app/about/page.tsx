"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Brain, Zap, Target, Trophy, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AboutPage() {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    const steps = [
        {
            icon: Brain,
            title: "1. The Hook",
            description: "We grab your attention with a counter-intuitive premise or a relatable scenario. No boring 'Chapter 1: History of...' intros allowed.",
            color: "text-brand-primary",
            bg: "bg-brand-primary/10"
        },
        {
            icon: Zap,
            title: "2. The Breakdown",
            description: "Complex concepts are immediately translated into bite-sized, punchy explanations. We use memes, metaphors, and brutally honest examples.",
            color: "text-brand-secondary",
            bg: "bg-brand-secondary/10"
        },
        {
            icon: Target,
            title: "3. The Interaction",
            description: "Passive reading is dead. You'll answer polls, take micro-quizzes, and actually engage with the content to prove you understand it.",
            color: "text-brand-orange",
            bg: "bg-brand-orange/10"
        },
        {
            icon: Trophy,
            title: "4. The Reward",
            description: "Nail the quiz, earn your daily XP, maintain your streak, and level up your global rank. Smart is the new savage.",
            color: "text-brand-success",
            bg: "bg-brand-success/10"
        }
    ];

    return (
        <main className="min-h-screen pb-20 bg-background text-foreground overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative">
                {/* Decorative Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[100px] -z-10" />
                
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-border bg-card shadow-sm mb-8"
                    >
                        <ShieldCheck className="w-5 h-5 text-brand-success" />
                        <span className="text-sm font-bold uppercase tracking-widest text-text-secondary">The LSD Methodology</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight text-foreground"
                    >
                        We fixed <span className="gradient-text italic">learning.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto font-sans leading-relaxed"
                    >
                        The traditional education system was designed for factory workers in 1892. We designed LSD for the modern attention span. Short, brutal, and highly effective.
                    </motion.p>
                </div>
            </section>

            {/* How It Works Grid */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">How it actually works</h2>
                        <p className="text-text-secondary">Four steps to stop doomscrolling and start leveling up.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-card p-8 rounded-[2rem] border border-border card-shadow relative group hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 text-6xl font-black font-display pointer-events-none">
                                    0{idx + 1}
                                </div>
                                <div className={`w-14 h-14 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                    <step.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold font-display text-foreground mb-4">{step.title}</h3>
                                <p className="text-text-secondary leading-relaxed font-sans">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The "Why" Gamification Section */}
            <section className="py-24 bg-card border-y border-border overflow-hidden relative">
                <div className="absolute right-0 top-0 w-[500px] h-full bg-gradient-to-l from-brand-secondary/5 to-transparent pointer-events-none" />
                
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                                Why gamify <br/><span className="text-brand-primary">intelligence?</span>
                            </h2>
                            <p className="text-lg text-text-secondary font-sans leading-relaxed">
                                Your brain releases dopamine when you check notifications or play games. We hijacked that exact exact psychological loop to map it to educational concepts instead.
                            </p>
                            <ul className="space-y-4 pt-4">
                                {[
                                    { text: "Build daily habits effortlessly", icon: Flame },
                                    { text: "Tangible proof of your knowledge via Level Ranks", icon: Trophy },
                                    { text: "Compete with yourself through daily Streaks", icon: Zap }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-foreground font-medium bg-background p-4 rounded-2xl border border-border">
                                        <div className="p-2 bg-card rounded-xl shadow-sm border border-border">
                                            <item.icon className="w-5 h-5 text-brand-primary" />
                                        </div>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual Mockup Device equivalent */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex-1 w-full"
                        >
                            <div className="gradient-primary p-1 rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="bg-card rounded-[2.8rem] p-8 aspect-square flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-brand-orange/20 rounded-full flex items-center justify-center mb-6 shadow-4xl animate-bounce">
                                        <Flame className="w-12 h-12 text-brand-orange" />
                                    </div>
                                    <h3 className="text-3xl font-black font-display mb-2">32 Day Streak</h3>
                                    <p className="text-text-secondary uppercase tracking-widest text-sm font-bold">Top 1% Global</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24">
                <div className="container mx-auto px-6 text-center max-w-3xl">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-8">
                        Stop reading textbooks. Start leveling up.
                    </h2>
                    
                    <Link href={isAuthenticated ? "/learn" : "/signup"}>
                        <button className="gradient-primary text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-brand-primary/30 flex items-center gap-3 mx-auto hover:scale-105 transition-all btn-push">
                            {isAuthenticated ? "Continue My Streak" : "Get Started Now"}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </section>
        </main>
    );
}
