"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/layout/Hero";
import { motion } from "framer-motion";

const testimonials = [
    {
        quote: "School taught me the mitochondria is the powerhouse of the cell. LSD taught me how to handle my toxic boss. I know which one is more useful.",
        author: "Sarah J.",
        handle: "@sj_analyst",
        avatar: "🧙‍♀️",
        rank: "Mind Mage",
        xp: "4,200",
    },
    {
        quote: "It's like Duolingo but for your character stats. I'm 10% less awkward at parties now. Maybe 15%.",
        author: "Marc K.",
        handle: "@marck_strat",
        avatar: "⚔️",
        rank: "Thought Warrior",
        xp: "2,880",
    },
    {
        quote: "Finally, someone explained confirmation bias without using words I have to Google. The memes are 10/10.",
        author: "Alex L.",
        handle: "@alex_theory",
        avatar: "🔮",
        rank: "Logic Oracle",
        xp: "6,150",
    },
];

const howItWorks = [
    { step: "01", emoji: "🎯", title: "Lock In Your Prediction", desc: "A bold statement drops. You bet whether it's true or false. Dopamine primed." },
    { step: "02", emoji: "🃏", title: "Reveal the Truth", desc: "Meme, story, and concept unfold in stages. Knowledge that sticks." },
    { step: "03", emoji: "⚔️", title: "Battle the Quiz", desc: "One shot to prove you got it. Victory = XP + streak maintained." },
    { step: "04", emoji: "🏆", title: "Collect Your Reward", desc: "Chest opens. Badges, shields, and ranks evolve. You level up." },
];

export default function Home() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/quizzes");
        }
    }, [status, router]);

    return (
        <main className="min-h-screen bg-world-magic">
            <Navbar />
            <Hero />

            {/* How It Works — Quest Flow */}
            <section className="py-24 relative overflow-hidden" id="how-it-works">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/3 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 max-w-5xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-full mb-4">
                            The Quest Loop
                        </span>
                        <h2 className="font-game text-4xl md:text-5xl text-foreground mb-4">
                            How The World Works
                        </h2>
                        <p className="text-text-secondary text-lg max-w-xl mx-auto">
                            Every daily quest follows the same epic loop designed by behavioral psychologists.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {howItWorks.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="game-card p-8 relative overflow-hidden group"
                            >
                                {/* Step number watermark */}
                                <div className="absolute -top-3 -right-3 font-game text-8xl font-bold text-brand-primary/5 select-none pointer-events-none">
                                    {item.step}
                                </div>
                                <div className="relative z-10 flex gap-5 items-start">
                                    <motion.div
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                                        className="text-4xl flex-shrink-0"
                                    >
                                        {item.emoji}
                                    </motion.div>
                                    <div>
                                        <div className="font-game text-[10px] text-brand-primary uppercase tracking-widest mb-1">
                                            Stage {item.step}
                                        </div>
                                        <h3 className="font-game text-xl text-foreground mb-2">{item.title}</h3>
                                        <p className="text-text-secondary leading-relaxed text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Adventurer Chronicles — Testimonials */}
            <section className="py-24 bg-world-forest relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-success/5 via-transparent to-brand-primary/5 pointer-events-none" />
                <div className="container mx-auto px-6 max-w-5xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-brand-success bg-brand-success/10 px-4 py-2 rounded-full mb-4">
                            Adventurer Chronicles
                        </span>
                        <h2 className="font-game text-4xl md:text-5xl text-foreground mb-4">
                            Heroes of The Universe
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, type: "spring" }}
                                whileHover={{ y: -8 }}
                                className="game-card p-7 relative overflow-hidden"
                            >
                                {/* Decorative quote mark */}
                                <div className="absolute top-4 right-5 text-5xl font-black text-brand-primary/8 select-none pointer-events-none font-game">
                                    "
                                </div>

                                {/* Character header */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/15 border border-brand-primary/20 flex items-center justify-center text-2xl">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-game text-base font-bold text-foreground leading-none">{t.author}</p>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-brand-primary mt-0.5 block">{t.rank}</span>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="font-game text-xs text-brand-gold font-bold">⚡ {t.xp}</div>
                                        <div className="text-[8px] text-text-secondary uppercase tracking-wider">XP Earned</div>
                                    </div>
                                </div>

                                <p className="text-text-secondary leading-relaxed text-sm italic">"{t.quote}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative gradient-game rounded-[2.5rem] p-12 md:p-20 text-center text-white overflow-hidden shadow-[0_30px_80px_rgba(124,77,255,0.3)]"
                    >
                        {/* Background animation */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-xl"
                        />
                        <motion.div
                            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 blur-xl"
                        />

                        {/* Floating emojis */}
                        {["🧠", "⚡", "🏆", "🔥"].map((em, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-3xl pointer-events-none opacity-20"
                                style={{ left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 50}%` }}
                                animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                            >
                                {em}
                            </motion.div>
                        ))}

                        <div className="relative z-10">
                            <div className="text-5xl mb-6 floating">🌟</div>
                            <h2 className="font-game text-4xl md:text-6xl mb-6 leading-tight">
                                Ready to Level Up?
                            </h2>
                            <p className="text-white/75 text-xl mb-10 max-w-2xl mx-auto">
                                Join 50,000+ adventurers who actually learn something useful every day. Your quest starts now.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a href="/signup">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="game-btn-gold text-lg px-10 py-5 w-full sm:w-auto"
                                    >
                                        ⚡ Start for Free
                                    </motion.button>
                                </a>
                                <a href="/quizzes">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-10 py-5 rounded-[1.25rem] bg-white/15 text-white border border-white/25 font-bold text-lg hover:bg-white/25 transition-all w-full sm:w-auto"
                                    >
                                        Try One Quest
                                    </motion.button>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-border/50">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
                            <span className="text-white font-game font-bold text-sm">⚡</span>
                        </div>
                        <span className="font-game text-2xl font-bold text-foreground">LSD</span>
                    </div>
                    <p className="text-text-secondary text-sm mb-1">Learn Something Daily. Smart is the new savage.</p>
                    <p className="text-text-secondary/40 text-xs italic">© 2026 LSD Learning Universe. Handcrafted for the curious.</p>
                </div>
            </footer>
        </main>
    );
}
