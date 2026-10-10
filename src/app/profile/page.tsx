"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useSession, signOut } from "next-auth/react";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, MapPin, Edit3, Save, LogOut, MessageSquare, ChevronRight, Check, Award, Compass, TrendingUp, Sparkles, Settings } from "lucide-react";
import Link from "next/link";
import { getMasteryTitle, getMasteryColor } from "@/lib/rating";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const userStore = useUserStore();
    const { 
        userName: storeUserName, 
        userAvatar: storeUserAvatar, 
        suggestedAvatars: storeSuggestedAvatars,
        setAvatar,
        logout 
    } = userStore;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Field states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [location, setLocation] = useState("San Francisco, CA");
    const [selectedAvatar, setSelectedAvatar] = useState("");

    // Stats states
    const [stats, setStats] = useState<any>(null);
    const [topicRatings, setTopicRatings] = useState<any[]>([]);
    const [ratingHistory, setRatingHistory] = useState<any[]>([]);
    const [artifacts, setArtifacts] = useState<any[]>([]);
    const [identityTitle, setIdentityTitle] = useState("Curious Human");

    // Expand settings
    const [showSettings, setShowSettings] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);

    // Editing mode toggles
    const [editName, setEditName] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [editPassword, setEditPassword] = useState(false);
    const [editLocation, setEditLocation] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setName(data.user.name || "");
                        setEmail(data.user.email || "");
                        setSelectedAvatar(data.user.selectedAvatar || data.user.defaultAvatar || storeUserAvatar || "🧠");
                    }
                }
                const statsRes = await fetch("/api/user/stats");
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData.stats);
                    setTopicRatings(statsData.topicRatings || []);
                    setRatingHistory(statsData.ratingHistory || []);
                    setIdentityTitle(statsData.stats?.identityTitle || "Curious Human");
                    // Mocking artifacts for the UI for now
                    setArtifacts([
                        { id: 1, name: "Crystal of Cognition", rarity: "RARE", emoji: "🔮", buff: "+5% XP in Psychology" },
                        { id: 2, name: "Scroll of Habits", rarity: "COMMON", emoji: "📜", buff: "Streak Protection" }
                    ]);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [storeUserAvatar]);

    const handleSave = async (fieldName: string, value: string, setEdit: (val: boolean) => void) => {
        setSaving(true);
        try {
            const bodyPayload: any = {};
            if (fieldName === "password") {
                bodyPayload.password = value;
            } else {
                bodyPayload[fieldName] = value;
            }

            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload)
            });

            if (res.ok) {
                setSuccessMessage(`${fieldName.toUpperCase()} updated successfully!`);
                setTimeout(() => setSuccessMessage(""), 3000);
                setEdit(false);
                if (fieldName === "name") {
                    userStore.xp > 0 && userStore.addXp(0);
                }
                update();
            }
        } catch (err) {
            console.error("Failed to update profile field", err);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarSelect = async (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        setAvatar(avatarUrl);
        try {
            await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: avatarUrl })
            });
            setSuccessMessage("Avatar updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
            update();
        } catch (err) {
            console.error("Failed to save avatar choice", err);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-world-quest text-foreground flex items-center justify-center">
                <p className="font-game text-xl">Entering Sanctuary...</p>
            </main>
        );
    }

    const currentGlobalRating = stats?.globalRating || 1000;
    const peakGlobalRating = stats?.peakRating || 1000;
    const globalTitle = getMasteryTitle(currentGlobalRating);
    const globalColor = getMasteryColor(currentGlobalRating);

    // Calculate strongest / weakest
    const sortedRatings = [...topicRatings].sort((a, b) => b.rating - a.rating);
    const strongestTopic = sortedRatings[0];
    const weakestTopic = sortedRatings.length > 1 ? sortedRatings[sortedRatings.length - 1] : null;

    return (
        <main className="min-h-screen bg-world-quest text-foreground pb-20">
            <Navbar />
            <div className="container mx-auto px-6 pt-28 max-w-xl space-y-6">
                
                {/* 1. HERO SECTION */}
                <div className="relative text-center p-8 rounded-[3rem] bg-gradient-to-br from-brand-primary/10 via-brand-primary/5 to-transparent border border-brand-primary/20 shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative inline-block mb-4">
                        <div 
                            className="w-32 h-32 rounded-full overflow-hidden border-4 shadow-2xl bg-card transition-all"
                            style={{ borderColor: globalColor }}
                        >
                            {selectedAvatar.startsWith("http") ? (
                                <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl bg-brand-primary/15">
                                    {selectedAvatar || "🧠"}
                                </div>
                            )}
                        </div>
                        <div 
                            className="absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-wider text-black flex items-center gap-1 shadow-lg"
                            style={{ backgroundColor: globalColor }}
                        >
                            <Sparkles className="w-3 h-3" /> {globalTitle}
                        </div>
                    </div>

                    <h1 className="font-game text-2xl text-foreground mt-2">{name || "Learner"}</h1>
                    <p className="text-sm font-bold text-brand-gold uppercase tracking-widest mt-1">{identityTitle}</p>
                    <p className="text-xs text-text-secondary mt-1">Level {stats?.level || 1} • {stats?.xp || 0} XP</p>
                </div>

                {/* 2. RATING HUD */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="game-card p-6 text-center rounded-[2rem] border border-brand-gold/20 relative overflow-hidden bg-gradient-to-b from-brand-gold/5 to-transparent">
                        <span className="text-[10px] font-black uppercase text-brand-gold tracking-widest block mb-2">Brain Rating</span>
                        <span className="font-game text-4xl text-foreground block">{currentGlobalRating}</span>
                        <span className="text-[10px] text-text-secondary mt-1 block">Peak Rating: {peakGlobalRating}</span>
                    </div>

                    <div className="game-card p-6 text-center rounded-[2rem] border border-brand-primary/20 relative overflow-hidden bg-gradient-to-b from-brand-primary/5 to-transparent">
                        <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest block mb-2">Quest Streak</span>
                        <span className="font-game text-4xl text-foreground block">🔥 {stats?.streak || 0}</span>
                        <span className="text-[10px] text-text-secondary mt-1 block">{stats?.streakShields || 0} Shields Shielded</span>
                    </div>
                </div>

                {/* 3. STRONGEST / WEAKEST CATEGORIES */}
                {topicRatings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {strongestTopic && (
                            <div className="game-card p-5 rounded-2xl border border-brand-success/20 bg-brand-success/5 flex items-center justify-between">
                                <div>
                                    <span className="text-[9px] font-black uppercase text-brand-success tracking-widest block">Apex Knowledge</span>
                                    <span className="text-sm font-bold text-foreground block mt-1">{strongestTopic.cluster}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-game text-xl text-brand-success block">{strongestTopic.rating}</span>
                                    <span className="text-[9px] text-text-secondary block">Mastery Rating</span>
                                </div>
                            </div>
                        )}
                        {weakestTopic && (
                            <div className="game-card p-5 rounded-2xl border border-brand-error/20 bg-brand-error/5 flex items-center justify-between">
                                <div>
                                    <span className="text-[9px] font-black uppercase text-brand-error tracking-widest block">Needs Training</span>
                                    <span className="text-sm font-bold text-foreground block mt-1">{weakestTopic.cluster}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-game text-xl text-brand-error block">{weakestTopic.rating}</span>
                                    <span className="text-[9px] text-text-secondary block">Mastery Rating</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. RATING GRAPH */}
                {ratingHistory.length > 0 && (
                    <div className="game-card p-6 rounded-[2rem] border border-white/5 bg-black/20">
                        <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest block mb-4">Rating Progression</span>
                        
                        {/* Custom SVG line graph showing history */}
                        <div className="w-full h-32 relative">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                {(() => {
                                    const min = Math.min(...ratingHistory.map(h => h.rating)) - 50;
                                    const max = Math.max(...ratingHistory.map(h => h.rating)) + 50;
                                    const delta = max - min || 1;
                                    const pts = ratingHistory.map((h, i) => {
                                        const x = (i / (ratingHistory.length - 1)) * 100;
                                        const y = 100 - ((h.rating - min) / delta) * 100;
                                        return `${x},${y}`;
                                    }).join(" ");
                                    
                                    const fillPts = `0,100 ${pts} 100,100`;

                                    return (
                                        <>
                                            <polygon points={fillPts} fill="url(#chartGrad)" />
                                            <polyline points={pts} fill="none" stroke="#7C4DFF" strokeWidth="3.5" strokeLinecap="round" />
                                        </>
                                    );
                                })()}
                            </svg>
                            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[8px] text-text-secondary pt-2">
                                <span>Day 1</span>
                                <span>Recent</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. TOPIC RATINGS LIST */}
                <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest block mb-1">Knowledge Categories</span>
                    {topicRatings.length === 0 ? (
                        <div className="p-6 text-center text-text-secondary text-xs game-card rounded-2xl border border-white/5">
                            No topic ratings recorded yet. Complete a quest to start ranking!
                        </div>
                    ) : (
                        <>
                            {topicRatings.slice(0, showAllCategories ? undefined : 5).map((tr, idx) => {
                                const title = getMasteryTitle(tr.rating);
                                const color = getMasteryColor(tr.rating);
                                return (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="game-card p-4 rounded-2xl border border-white/5 hover:border-brand-primary/20 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-lg">
                                                🧠
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-foreground block">{tr.cluster}</span>
                                                <span 
                                                    className="text-[8px] font-bold uppercase tracking-wider block mt-0.5"
                                                    style={{ color }}
                                                >
                                                    {title}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-game text-lg text-foreground block">{tr.rating}</span>
                                            <span className="text-[8px] text-text-secondary block">Peak: {tr.peakRating}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {topicRatings.length > 5 && (
                                <button 
                                    onClick={() => setShowAllCategories(!showAllCategories)}
                                    className="w-full py-3 mt-2 game-card rounded-2xl border border-white/5 hover:bg-white/5 text-xs font-bold text-text-secondary transition-all cursor-pointer"
                                >
                                    {showAllCategories ? "Show Less" : `View ${topicRatings.length - 5} More Categories`}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* ARTIFACT VAULT (NEW) */}
                <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-brand-gold tracking-widest block mb-1">Artifact Vault</span>
                    <div className="grid grid-cols-2 gap-4">
                        {artifacts.map((artifact, idx) => (
                            <div key={idx} className="game-card p-4 rounded-2xl border border-brand-gold/20 bg-gradient-to-br from-brand-gold/5 to-transparent text-center flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-brand-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-4xl mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                                    {artifact.emoji}
                                </div>
                                <span className="font-bold text-xs text-foreground block">{artifact.name}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest block mt-1" style={{ color: artifact.rarity === 'RARE' ? '#7C4DFF' : '#A0AEC0' }}>
                                    {artifact.rarity}
                                </span>
                                <span className="text-[9px] text-text-secondary mt-2 block">{artifact.buff}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. SETTINGS ACCORDION */}
                <div className="game-card p-5 rounded-[2rem] border border-white/5">
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="w-full flex items-center justify-between font-game text-sm text-foreground cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-brand-primary" /> Account & Settings
                        </span>
                        <ChevronRight className={`w-4 h-4 text-text-secondary transition-transform ${showSettings ? "rotate-90" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {showSettings && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-5 space-y-4"
                            >
                                {/* Success Notification */}
                                {successMessage && (
                                    <div className="bg-brand-success/15 border border-brand-success/30 text-brand-success text-center py-2 px-4 rounded-xl text-xs">
                                        {successMessage}
                                    </div>
                                )}

                                {/* Name Field */}
                                <div className="p-3 bg-black/10 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <User className="w-4 h-4 text-text-secondary" />
                                        {editName ? (
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="bg-background border border-border px-3 py-1 text-xs w-full focus:outline-none focus:border-brand-primary rounded"
                                            />
                                        ) : (
                                            <span className="text-xs font-semibold">{name || "Set name"}</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => editName ? handleSave("name", name, setEditName) : setEditName(true)}
                                        className="p-1 hover:bg-white/5 rounded"
                                    >
                                        {editName ? <Save className="w-3.5 h-3.5 text-brand-success" /> : <Edit3 className="w-3.5 h-3.5 text-text-secondary" />}
                                    </button>
                                </div>

                                {/* Email Field */}
                                <div className="p-3 bg-black/10 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Mail className="w-4 h-4 text-text-secondary" />
                                        {editEmail ? (
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-background border border-border px-3 py-1 text-xs w-full focus:outline-none focus:border-brand-primary rounded"
                                            />
                                        ) : (
                                            <span className="text-xs font-semibold">{email || "Set email"}</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => editEmail ? handleSave("email", email, setEditEmail) : setEditEmail(true)}
                                        className="p-1 hover:bg-white/5 rounded"
                                    >
                                        {editEmail ? <Save className="w-3.5 h-3.5 text-brand-success" /> : <Edit3 className="w-3.5 h-3.5 text-text-secondary" />}
                                    </button>
                                </div>

                                {/* Password Field */}
                                <div className="p-3 bg-black/10 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Lock className="w-4 h-4 text-text-secondary" />
                                        {editPassword ? (
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-background border border-border px-3 py-1 text-xs w-full focus:outline-none focus:border-brand-primary rounded"
                                            />
                                        ) : (
                                            <span className="text-xs font-semibold">**********</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => editPassword ? handleSave("password", password, setEditPassword) : setEditPassword(true)}
                                        className="p-1 hover:bg-white/5 rounded"
                                    >
                                        {editPassword ? <Save className="w-3.5 h-3.5 text-brand-success" /> : <Edit3 className="w-3.5 h-3.5 text-text-secondary" />}
                                    </button>
                                </div>

                                {/* Avatar selector grid */}
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 block text-center">Change Avatar</span>
                                    <div className="grid grid-cols-6 gap-2">
                                        {storeSuggestedAvatars?.map((url: string, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAvatarSelect(url)}
                                                className={`aspect-square rounded-xl bg-card border-2 overflow-hidden cursor-pointer relative ${
                                                    selectedAvatar === url ? 'border-brand-primary' : 'border-transparent hover:border-white/20'
                                                }`}
                                            >
                                                <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                                                {selectedAvatar === url && (
                                                    <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white stroke-[3]" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Log Out Button */}
                                <button
                                    onClick={() => { logout(); signOut({ callbackUrl: '/' }); }}
                                    className="w-full py-3 bg-brand-error/10 hover:bg-brand-error/15 border border-brand-error/20 text-brand-error rounded-xl text-center font-game text-[10px] transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                                >
                                    <LogOut className="w-3.5 h-3.5" /> Log Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Support Link */}
                <Link href="/support" className="block">
                    <div className="game-card p-5 rounded-[1.5rem] flex items-center justify-between hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-brand-primary" />
                            <span className="text-sm font-semibold text-foreground">Support & FAQs</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-secondary" />
                    </div>
                </Link>

            </div>
        </main>
    );
}
