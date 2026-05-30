"use client";

import Link from "next/link";
import { Zap, Menu, Chrome as Home, BarChart3, User, LogOut, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useUserStore } from "@/store/useUserStore";

export const Navbar = () => {
    const { data: session, status } = useSession();
    const userStore = useUserStore();
    
    // Unpack functions and properties safely from the single store hook
    const { xp, level, setAvatar, logout, userName: storeUserName, userAvatar: storeUserAvatar, suggestedAvatars: storeSuggestedAvatars } = userStore;

    // Default to Zustand store, but override with session if it exists.
    const isAuthenticated = status === "authenticated";
    const userName = session?.user?.name || storeUserName;
    const userAvatar = (session?.user as any)?.defaultAvatar || storeUserAvatar;
    const suggestedAvatars = (session?.user as any)?.suggestedAvatars || storeSuggestedAvatars;

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass flex items-center justify-between w-full max-w-5xl px-6 py-3 rounded-full shadow-lg"
            >
                <Link href={isAuthenticated ? "/learn" : "/"} className="flex items-center gap-2 group">
                    <div className="bg-brand-primary p-1.5 rounded-xl group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="font-display text-2xl font-bold tracking-tight text-foreground">LSD</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 font-medium text-sm text-text-secondary">
                    {/* Public Links */}
                    {!isAuthenticated && <Link href="/about" className="hover:text-brand-primary transition-colors">How it Works</Link>}
                    {!isAuthenticated && <Link href="/premium" className="hover:text-brand-primary transition-colors">Premium</Link>}

                    {/* Private Links */}
                    {isAuthenticated && <Link href="/learn" className="hover:text-brand-primary transition-colors">Learn Daily</Link>}
                    {isAuthenticated && <Link href="/dashboard" className="hover:text-brand-primary transition-colors">My Stats</Link>}
                    {isAuthenticated && <Link href="/topics" className="hover:text-brand-primary transition-colors">Intel Hub</Link>}
                </div>

                <div className="flex items-center gap-3">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-full text-text-secondary hover:text-foreground hover:bg-brand-primary/10 transition-colors mr-2 relative"
                            aria-label="Toggle theme"
                        >
                            <Sun className="h-5 w-5 dark:hidden" />
                            <Moon className="h-5 w-5 hidden dark:block" />
                        </button>
                    )}
                    
                    {!isAuthenticated ? (
                        <>
                            <Link href="/login">
                                <button className="px-5 py-2 text-sm font-bold text-text-secondary hover:text-foreground transition-colors">
                                    Log in
                                </button>
                            </Link>
                            <Link href="/signup">
                                <button className="gradient-primary px-6 py-2.5 text-sm font-bold text-white rounded-full shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:scale-105 active:scale-95 transition-all btn-push">
                                    Get Started
                                </button>
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            {/* Mini Status for Logged In User */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20 text-xs shadow-sm">
                                <span className="font-bold text-brand-primary">{level}</span>
                                <span className="opacity-50 text-brand-primary">|</span>
                                <span className="font-black text-brand-primary">{xp} XP</span>
                            </div>

                            <div className="flex items-center gap-3 md:border-l border-border md:pl-4">
                                <div className="hidden md:flex flex-col text-right">
                                    <span className="text-sm font-bold text-foreground leading-none">{userName}</span>
                                    <span className="text-[10px] font-medium text-text-secondary uppercase tracking-widest mt-1">LSD Member</span>
                                </div>
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center font-bold text-sm text-brand-secondary shadow-sm overflow-hidden border-2 border-transparent hover:border-brand-primary transition-all cursor-pointer"
                                    >
                                        {userAvatar?.startsWith('http') ? (
                                            <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover scale-110" />
                                        ) : (
                                            userAvatar
                                        )}
                                    </button>

                                    {/* Profile Avatar Dropdown */}
                                    {isProfileMenuOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-[2rem] p-5 shadow-2xl shadow-brand-primary/10 z-50 origin-top-right"
                                        >
                                            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 text-center">Select Profile Persona</h4>
                                            
                                            <div className="grid grid-cols-3 gap-3">
                                                {suggestedAvatars?.map((url: string, i: number) => (
                                                    <button 
                                                        key={i} 
                                                        onClick={() => { setAvatar(url); setIsProfileMenuOpen(false); }}
                                                        className={`w-full aspect-square rounded-2xl bg-brand-primary/5 hover:bg-brand-primary/20 border-2 transition-all flex items-center justify-center group ${
                                                            userAvatar === url ? 'border-brand-primary shadow-md shadow-brand-primary/20' : 'border-transparent hover:border-brand-primary/50'
                                                        }`}
                                                    >
                                                        <img 
                                                            src={url} 
                                                            alt={`Avatar ${i}`} 
                                                            className="w-[120%] h-[120%] object-cover group-hover:scale-110 group-hover:rotate-[5deg] group-hover:-translate-y-1 transition-all duration-300"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            {(!suggestedAvatars || suggestedAvatars.length === 0) && (
                                                <p className="text-xs text-text-secondary text-center py-4">No avatars available.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <button onClick={() => { logout(); signOut({ callbackUrl: '/' }); }} className="p-2 text-text-secondary hover:text-brand-error transition-colors group">
                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </nav>
    );
};
