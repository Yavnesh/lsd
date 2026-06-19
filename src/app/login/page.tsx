"use client";

import { motion } from "framer-motion";
import { Chrome as Google, Mail, ArrowRight, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useUserStore } from "@/store/useUserStore";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();
    const { login } = useUserStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/learn");
        }
    }, [status, router]);

    const handleGoogleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        signIn("google", { callbackUrl: "/learn" });
    };

    const [email, setEmail] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        const res = await signIn("credentials", {
            email,
            redirect: false,
            callbackUrl: "/learn"
        });

        if (res?.ok) {
            router.replace("/learn");
        } else {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-6 pt-32 lg:pt-20">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-10 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-brand-secondary/5 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-card w-full max-w-md p-10 md:p-14 rounded-[3.5rem] card-shadow border border-border relative z-10"
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/5 rounded-full mb-6 border border-brand-primary/10">
                            <Sparkles className="w-4 h-4 text-brand-primary fill-brand-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">The 1% Club</span>
                        </div>
                        <h1 className="text-4xl font-bold font-display mb-3 text-foreground tracking-tight">Welcome Back.</h1>
                        <p className="text-text-secondary font-medium font-sans">Ready to get your daily brain boost?</p>
                    </div>

                    <div className="space-y-4 mb-10 text-sans">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-4 py-4 border-2 border-border rounded-2xl font-bold text-foreground hover:bg-background hover:border-brand-secondary transition-all group btn-push"
                        >
                            <Google className="w-5 h-5 text-brand-secondary" />
                            <span>Continue with Google</span>
                        </button>
                        <button
                            onClick={handleLogin}
                            className="w-full flex items-center justify-center gap-4 py-4 border-2 border-border rounded-2xl font-bold text-foreground hover:bg-background hover:border-brand-primary transition-all group btn-push"
                        >
                            <Mail className="w-5 h-5 text-brand-primary" />
                            <span>Continue with Email</span>
                        </button>
                    </div>

                    <div className="relative mb-10 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <span className="relative bg-card px-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Or use magic link</span>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Work Email</label>
                            <input
                                type="email"
                                placeholder="you@mastermind.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-5 bg-background border-2 border-transparent focus:border-brand-primary focus:bg-card rounded-2xl outline-none transition-all font-medium text-foreground placeholder:opacity-30"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="gradient-primary w-full py-5 rounded-[2rem] text-white font-bold text-xl shadow-xl shadow-brand-primary/25 flex items-center justify-center gap-3 group btn-push disabled:opacity-70"
                        >
                            <span>{loading ? "Authenticating..." : "Enter the Portal"}</span>
                            {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-12 text-center space-y-4">
                        <p className="text-sm text-text-secondary font-medium font-sans">
                            Don't have an account? <Link href="/signup" className="text-brand-primary font-bold hover:underline">Join the 1% for Free</Link>
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="py-10 text-center">
                <div className="flex items-center justify-center gap-2 opacity-20">
                    <Zap className="w-4 h-4" />
                    <span className="font-display font-black text-xs uppercase tracking-widest text-foreground">LSD • Learn Something Daily</span>
                </div>
            </div>
        </main>
    );
}
