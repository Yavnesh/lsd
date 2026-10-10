"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Map, Swords, Trophy, LogOut, Sun, Moon, Bell, User, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useSyncExternalStore } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useUserStore } from "@/store/useUserStore";
import { NotificationCenter } from "./NotificationCenter";
import { BottomNav } from "./BottomNav";

const navItems = [
    {
        name: "Mind Gym",
        href: "/quizzes",
        icon: Zap,
        emoji: "⚡",
        desc: "Daily Quizzes",
        activeColor: "text-brand-primary",
        activeBg: "bg-brand-primary/15",
        glowColor: "rgba(124,77,255,0.3)",
    },
    {
        name: "Sanctuary",
        href: "/dashboard",
        icon: Trophy,
        emoji: "🏆",
        desc: "My Progress",
        activeColor: "text-brand-gold",
        activeBg: "bg-brand-gold/15",
        glowColor: "rgba(247,201,72,0.3)",
    },
    {
        name: "Expedition",
        href: "/universe",
        icon: Map,
        emoji: "🗺️",
        desc: "World Map",
        activeColor: "text-brand-success",
        activeBg: "bg-brand-success/15",
        glowColor: "rgba(76,175,80,0.3)",
    },
    {
        name: "Arena",
        href: "/leaderboard",
        icon: Swords,
        emoji: "⚔️",
        desc: "Rankings",
        activeColor: "text-brand-error",
        activeBg: "bg-brand-error/15",
        glowColor: "rgba(255,107,107,0.3)",
    },
];

export const Navbar = () => {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const userStore = useUserStore();
    const { xp, streak, level, setAvatar, logout, userName: storeUserName, userAvatar: storeUserAvatar, suggestedAvatars: storeSuggestedAvatars } = userStore;

    const isAuthenticated = status === "authenticated";
    const userName = session?.user?.name || storeUserName;
    const userAvatar = (session?.user as any)?.selectedAvatar || (session?.user as any)?.defaultAvatar || storeUserAvatar;
    const suggestedAvatars = (session?.user as any)?.suggestedAvatars || storeSuggestedAvatars;
    const { theme, setTheme } = useTheme();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    const activeItem = navItems.find(item => item.href === pathname);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 pb-0">
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
                    className="w-full max-w-5xl"
                >
                    {/* Main nav pill */}
                    <div className="glass flex items-center justify-between px-4 py-2 rounded-[1.75rem] shadow-[0_8px_32px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.08)] border border-white/10 relative">

                        {/* Subtle warm gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/3 via-transparent to-brand-success/3 pointer-events-none" />

                        {/* LEFT: Logo */}
                        <Link href={isAuthenticated ? "/quizzes" : "/"} className="flex items-center gap-2.5 group relative z-10 mr-3 flex-shrink-0">
                            <motion.div
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="w-9 h-9 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-brand-primary/30"
                            >
                                <Zap className="w-5 h-5 text-white fill-white" />
                            </motion.div>
                            <div className="hidden sm:block">
                                <span className="font-game text-xl font-bold text-foreground tracking-tight leading-none block">LSD</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary leading-none">Learn Daily</span>
                            </div>
                        </Link>

                        {/* CENTER: Game nav destinations (desktop only) */}
                        {isAuthenticated && (
                            <div className="hidden md:flex items-center gap-1 relative z-10">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link key={item.href} href={item.href}>
                                            <motion.div
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.94 }}
                                                className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                                                    isActive
                                                        ? `${item.activeBg} ${item.activeColor}`
                                                        : "text-text-secondary hover:text-foreground hover:bg-white/5"
                                                }`}
                                            >
                                                {/* Active glow */}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="navGlow"
                                                        className="absolute inset-0 rounded-2xl"
                                                        style={{
                                                            boxShadow: `inset 0 0 20px ${item.glowColor}`,
                                                            border: `1px solid ${item.glowColor}`,
                                                        }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                    />
                                                )}
                                                <item.icon className={`w-4 h-4 relative z-10 ${isActive ? "fill-current drop-shadow-[0_0_4px_currentColor]" : ""}`} />
                                                <div className="relative z-10">
                                                    <div className={`font-game text-xs font-bold leading-none ${isActive ? "" : ""}`}>
                                                        {item.name}
                                                    </div>
                                                    <div className="text-[8px] opacity-60 leading-none mt-0.5 uppercase tracking-wider">{item.desc}</div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                         {/* RIGHT: Controls */}
                        <div className="flex items-center gap-2 relative z-10 flex-shrink-0">
                            {mounted && (
                                <>
                                    {isAuthenticated && (
                                        <>
                                            {/* Desktop Popover */}
                                            <div className="hidden md:block">
                                                <NotificationCenter />
                                            </div>
                                            {/* Mobile Direct Link */}
                                            <Link 
                                                href="/notifications" 
                                                className="md:hidden p-2.5 rounded-full text-text-secondary hover:text-foreground hover:bg-brand-primary/10 transition-all cursor-pointer relative"
                                            >
                                                <Bell className="h-5.5 w-5.5" />
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer"
                                        aria-label="Toggle theme"
                                    >
                                        <Sun className="h-4 w-4 dark:hidden" />
                                        <Moon className="h-4 w-4 hidden dark:block" />
                                    </button>
                                </>
                            )}

                            {!isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <Link href="/login">
                                        <button className="px-4 py-1.5 text-sm font-bold text-text-secondary hover:text-foreground transition-colors cursor-pointer">
                                            Log in
                                        </button>
                                    </Link>
                                    <Link href="/signup">
                                        <button className="game-btn-primary text-sm px-5 py-2">
                                            Play Now
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    {/* XP/Streak mini HUD chip - desktop only */}
                                    <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-black/20 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-1">
                                            <span className="text-brand-gold text-xs">🔥</span>
                                            <span className="font-game text-xs font-bold text-brand-gold">{streak}</span>
                                        </div>
                                        <div className="w-px h-3 bg-white/10" />
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs">⚡</span>
                                            <span className="font-game text-xs font-bold text-brand-primary">{xp.toLocaleString()}</span>
                                        </div>
                                        <div className="w-px h-3 bg-white/10" />
                                        <span className="text-[9px] font-black text-text-secondary uppercase tracking-wider">{level}</span>
                                    </div>

                                    {/* Mobile Direct Avatar Link */}
                                    <Link href="/profile" className="md:hidden">
                                        <div className="w-9 h-9 rounded-2xl bg-brand-primary/20 flex items-center justify-center font-bold text-sm text-brand-primary overflow-hidden border-2 border-brand-primary/30 hover:border-brand-primary transition-all cursor-pointer shadow-lg shadow-brand-primary/10">
                                            {userAvatar?.startsWith('http') ? (
                                                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover scale-110" />
                                            ) : (
                                                <span>{userAvatar || "🧠"}</span>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Desktop Avatar Dropdown */}
                                    <div className="hidden md:block relative">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                            className="w-9 h-9 rounded-2xl bg-brand-primary/20 flex items-center justify-center font-bold text-sm text-brand-primary overflow-hidden border-2 border-brand-primary/30 hover:border-brand-primary transition-all cursor-pointer shadow-lg shadow-brand-primary/10"
                                        >
                                            {userAvatar?.startsWith('http') ? (
                                                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover scale-110" />
                                            ) : (
                                                <span>{userAvatar || "🧠"}</span>
                                            )}
                                        </motion.button>

                                        {/* Profile Dropdown */}
                                        <AnimatePresence>
                                            {isProfileMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.94 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.94 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                    className="absolute right-0 mt-3 w-[300px] bg-card/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-black/50 z-50 origin-top-right"
                                                >
                                                    {/* Profile header */}
                                                    <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/10">
                                                        <div className="w-14 h-14 rounded-2xl bg-brand-primary/20 flex items-center justify-center overflow-hidden border-2 border-brand-primary/30 shadow-inner">
                                                            {userAvatar?.startsWith('http') ? (
                                                                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                                            ) : <span className="text-3xl">{userAvatar || "🧠"}</span>}
                                                        </div>
                                                        <div>
                                                            <p className="font-game font-bold text-foreground text-lg leading-tight">{userName}</p>
                                                            <p className="text-[10px] text-brand-primary uppercase tracking-[0.2em] font-black mt-1">{level}</p>
                                                        </div>
                                                    </div>

                                                    <h4 className="text-[10px] font-black text-brand-success uppercase tracking-[0.2em] mb-3">Choose Avatar</h4>
                                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                                        {suggestedAvatars?.map((url: string, i: number) => (
                                                            <motion.button
                                                                key={i}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => { setAvatar(url); setIsProfileMenuOpen(false); }}
                                                                className={`aspect-square rounded-2xl transition-all flex items-center justify-center overflow-hidden cursor-pointer ${
                                                                    userAvatar === url ? 'bg-brand-primary/10 border-2 border-brand-primary shadow-[0_0_15px_rgba(124,77,255,0.3)]' : 'bg-black/20 border-2 border-transparent hover:border-white/20'
                                                                }`}
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={`Avatar ${i}`}
                                                                    className="w-[85%] h-[85%] object-cover rounded-xl"
                                                                />
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                    {(!suggestedAvatars || suggestedAvatars.length === 0) && (
                                                        <p className="text-xs text-text-secondary text-center py-4 bg-black/20 rounded-2xl mb-5">No avatars available.</p>
                                                    )}

                                                    <div className="flex flex-col gap-2.5 pt-4 border-t border-white/10">
                                                        <Link href="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block">
                                                            <button className="w-full py-3 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-[1.25rem] text-center font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                                                <User className="w-4 h-4" /> Edit Profile
                                                            </button>
                                                        </Link>
                                                        <Link href="/support" onClick={() => setIsProfileMenuOpen(false)} className="block">
                                                            <button className="w-full py-3 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded-[1.25rem] text-center font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                                                <MessageSquare className="w-4 h-4" /> Support & FAQs
                                                            </button>
                                                        </Link>
                                                        <Link href="/leaderboard" onClick={() => setIsProfileMenuOpen(false)} className="block">
                                                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-[1.25rem] text-center font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                                                <Trophy className="w-4 h-4" /> View Leaderboard
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={() => { logout(); signOut({ callbackUrl: '/' }); }}
                                                            className="w-full py-3 bg-brand-error/10 hover:bg-brand-error/20 text-brand-error rounded-[1.25rem] text-center font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                                        >
                                                            <LogOut className="w-4 h-4" /> Sign Out
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </nav>

            {/* Mobile bottom navigation (authenticated only) */}
            {isAuthenticated && <BottomNav />}
        </>
    );
};
