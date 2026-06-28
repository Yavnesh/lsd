"use client";

import { motion } from "framer-motion";
import { Chrome as Google, Mail, ArrowRight, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useUserStore } from "@/store/useUserStore";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SignupPage() {
    const { status } = useSession();
    const router = useRouter();
    const { login } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/learn");
        }
    }, [status, router]);

    const handleGoogleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        signIn("google", { callbackUrl: "/learn" });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong.");
                setLoading(false);
                return;
            }

            // Successfully registered, now sign in
            const signRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: "/learn"
            });

            if (signRes?.ok) {
                // Pre-populate user store to sync on next render
                login(name || email.split("@")[0], email, "", []);
                router.replace("/learn");
            } else {
                setError("Account created but failed to log in automatically. Please sign in.");
                setLoading(false);
            }
        } catch (err) {
            setError("Failed to register. Please try again.");
            setLoading(false);
        }
    };

    const perks = [
        "One savage lesson daily",
        "Track your IQ growth",
        "Join a club of 50k+ minds"
    ];

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-6 pt-32 lg:pt-20">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-card w-full max-w-xl grid md:grid-cols-5 rounded-[4rem] card-shadow border border-border relative z-10 overflow-hidden"
                >
                    {/* Left Side: Branding / Perks */}
                    <div className="md:col-span-2 gradient-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <div className="w-32 h-32 border-8 border-white rounded-full translate-x-16 -translate-y-16" />
                        </div>

                        <div>
                            <Zap className="w-10 h-10 mb-8 fill-white" />
                            <h2 className="text-3xl font-bold font-display mb-6 leading-tight">Join the smartest corner of the internet.</h2>
                            <ul className="space-y-4">
                                {perks.map((perk, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/90">
                                        <CheckCircle2 className="w-5 h-5 text-brand-accent flex-shrink-0" />
                                        {perk}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Smart is the new savage.</p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="md:col-span-3 p-10 md:p-14 bg-card">
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl font-bold font-display mb-2 text-foreground">Create Account</h1>
                            <p className="text-text-secondary font-medium font-sans">Stop scrolling garbage, start stacking IQ.</p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl mb-6 bg-brand-error/10 border border-brand-error/20 text-brand-error text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4 mb-8 font-sans">
                            <button
                                onClick={handleGoogleSignup}
                                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-border rounded-2xl font-bold text-foreground hover:bg-background hover:border-brand-secondary transition-all btn-push"
                            >
                                <Google className="w-5 h-5 text-brand-secondary" />
                                <span className="text-sm">Sign up with Google</span>
                            </button>
                        </div>

                        <div className="relative mb-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <span className="relative bg-card px-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">or use your email</span>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Display Name</label>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full p-4 bg-background border-2 border-transparent focus:border-brand-primary rounded-2xl outline-none transition-all font-medium text-foreground placeholder:opacity-30"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full p-4 bg-background border-2 border-transparent focus:border-brand-primary rounded-2xl outline-none transition-all font-medium text-foreground placeholder:opacity-30"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="Min 6 characters"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full p-4 bg-background border-2 border-transparent focus:border-brand-primary rounded-2xl outline-none transition-all font-medium text-foreground placeholder:opacity-30"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="gradient-primary w-full py-5 rounded-[2rem] text-white font-bold text-lg shadow-xl shadow-brand-primary/25 flex items-center justify-center gap-2 btn-push disabled:opacity-70"
                            >
                                <span>{loading ? "Creating..." : "Start Learning"}</span>
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-text-secondary font-medium font-sans">
                            Already a member? <Link href="/login" className="text-brand-primary font-bold hover:underline">Log in</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
