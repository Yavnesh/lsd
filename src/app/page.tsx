"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/layout/Hero";
import { motion } from "framer-motion";
import { CheckCircle2, Star, Quote } from "lucide-react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/learn");
    }
  }, [status, router]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />

      {/* Why Section - Playful & Modern */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-foreground"
          >
            Daily Knowledge, <span className="text-brand-primary italic">Actually</span> Fun.
          </motion.h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-20 text-lg font-sans">
            We take complex concepts from psychology, sociology, and life and turn them into
            viral-style micro-lessons. Stop scrolling garbage, start stacking IQ.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: "🤯",
                title: "Hooked in 3 Seconds",
                desc: "Every topic starts with a punchy hook that makes you go 'Wait, have I been doing this wrong?'"
              },
              {
                emoji: "🎭",
                title: "Meme-Style",
                desc: "Complex ideas explained via relatable memes. No more textbook dry-heaves, we promise."
              },
              {
                emoji: "⚡",
                title: "Apply Instantly",
                desc: "Practical intelligence you can actually use in your social life, career, or dinner table arguments."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-10 rounded-[2.5rem] bg-card border border-border hover:border-brand-primary/30 transition-all text-left card-shadow group"
              >
                <div className="text-4xl mb-6 bg-background w-16 h-16 rounded-2xl flex items-center justify-center border border-border shadow-sm group-hover:bg-brand-primary/5 transition-colors">
                  {item.emoji}
                </div>
                <h3 className="text-2xl font-bold mb-4 font-display text-foreground">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed font-sans">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Playful UI */}
      <section className="py-24 bg-brand-primary/5">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-sm font-bold font-display mb-16 uppercase tracking-[0.3em] text-brand-primary">The 1% Club Feed</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "School taught me the mitochondria is the powerhouse of the cell. LSD taught me how to handle my toxic boss. I know which one is more useful.",
                author: "Sarah J.",
                handle: "@sj_analyst"
              },
              {
                quote: "It's like Duolingo but for your character stats. I'm 10% less awkward at parties now. Maybe 15%.",
                author: "Marc K.",
                handle: "@marck_strat"
              },
              {
                quote: "Finally, someone explained confirmation bias without using words I have to Google. The memes are 10/10.",
                author: "Alex L.",
                handle: "@alex_theory"
              }
            ].map((test, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-card p-8 rounded-[2rem] border border-border card-shadow relative group"
              >
                <Quote className="absolute -top-4 -left-2 w-10 h-10 text-brand-primary/20 fill-brand-primary/10" />
                <p className="text-foreground font-medium mb-8 relative z-10 leading-relaxed italic">"{test.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center font-bold text-brand-secondary">
                    {test.author[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground font-display">{test.author}</p>
                    <p className="text-xs text-text-secondary">{test.handle}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Vibrant Gradient */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="gradient-primary rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl overflow-hidden relative"
          >
            {/* Decorative Background Circles */}
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <div className="w-64 h-64 border-[16px] border-white rounded-full translate-x-32 -translate-y-32" />
            </div>
            <div className="absolute bottom-0 left-0 p-10 opacity-10">
              <div className="w-48 h-48 bg-white rounded-full -translate-x-24 translate-y-24" />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 font-display leading-tight">Ready to level up?</h2>
              <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto font-sans">
                Join 50,000+ others who are actually learning something useful while scrolling. 60 seconds is all it takes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-white text-brand-primary px-10 py-5 rounded-[2rem] font-bold text-lg hover:shadow-xl hover:scale-105 transition-all btn-push">
                  Get Started for Free
                </button>
                <button className="bg-black/20 text-white backdrop-blur-sm border border-white/20 px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-black/30 transition-all btn-push">
                  View Demo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-border bg-card text-center">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-brand-primary fill-brand-primary" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">LSD</span>
          </div>
          <p className="text-text-secondary text-sm font-sans mb-2">Learn Something Daily. Smart is the new savage.</p>
          <p className="text-text-secondary/50 text-xs font-sans italic">© 2026 LSD Interactive Ecosystem. Handcrafted for the curious.</p>
        </div>
      </footer>
    </main>
  );
}

const Zap = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
