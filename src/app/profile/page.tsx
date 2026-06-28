"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useSession, signOut } from "next-auth/react";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, MapPin, Edit3, Save, LogOut, MessageSquare, ChevronRight, Check } from "lucide-react";
import Link from "next/link";

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
    const [location, setLocation] = useState("Sirajganj, Bangladesh"); // Default from screenshot mockup
    const [selectedAvatar, setSelectedAvatar] = useState("");

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
                    userStore.xp > 0 && userStore.addXp(0); // Trigger store sync/reload
                }
                // Force next-auth session refresh
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
            <main className="min-h-screen bg-world-forest text-foreground flex items-center justify-center">
                <p className="font-game text-xl">Entering Sanctuary...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-world-quest text-foreground pb-20">
            <Navbar />
            <div className="container mx-auto px-4 pt-28 max-w-md">
                
                {/* Header title */}
                <h1 className="font-game text-2xl text-center mb-6">Profile Settings</h1>

                <div className="space-y-6">
                    {/* Profile avatar section */}
                    <div className="text-center relative">
                        <div className="relative inline-block">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-brand-primary shadow-xl bg-card">
                                {selectedAvatar.startsWith("http") ? (
                                    <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl bg-brand-primary/10">
                                        {selectedAvatar || "🧠"}
                                    </div>
                                )}
                            </div>
                            
                            {/* Avatar selector modal/drawer trigger */}
                            <div className="absolute bottom-0 right-0 p-2 bg-brand-primary text-white rounded-full shadow-lg border border-white/20 cursor-pointer">
                                <Edit3 className="w-4 h-4" />
                            </div>
                        </div>
                        
                        <p className="font-game text-lg mt-3">{name || "Learner"}</p>
                    </div>

                    {/* Success notification banner */}
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-brand-success/15 border border-brand-success/30 text-brand-success text-center py-2 px-4 rounded-xl text-xs"
                            >
                                {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Editable fields container */}
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div className="game-card p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                                <User className="w-5 h-5 text-text-secondary" />
                                {editName ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-background border border-border px-3 py-1.5 rounded-lg text-sm w-full focus:outline-none focus:border-brand-primary"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold">{name || "Set your name"}</span>
                                )}
                            </div>
                            {editName ? (
                                <button 
                                    onClick={() => handleSave("name", name, setEditName)} 
                                    className="p-2 text-brand-success hover:bg-brand-success/10 rounded-xl"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setEditName(true)} 
                                    className="p-2 text-text-secondary hover:text-foreground rounded-xl"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="game-card p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                                <Mail className="w-5 h-5 text-text-secondary" />
                                {editEmail ? (
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-background border border-border px-3 py-1.5 rounded-lg text-sm w-full focus:outline-none focus:border-brand-primary"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold">{email || "Set your email"}</span>
                                )}
                            </div>
                            {editEmail ? (
                                <button 
                                    onClick={() => handleSave("email", email, setEditEmail)} 
                                    className="p-2 text-brand-success hover:bg-brand-success/10 rounded-xl"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setEditEmail(true)} 
                                    className="p-2 text-text-secondary hover:text-foreground rounded-xl"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="game-card p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                                <Lock className="w-5 h-5 text-text-secondary" />
                                {editPassword ? (
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-background border border-border px-3 py-1.5 rounded-lg text-sm w-full focus:outline-none focus:border-brand-primary"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold">**********</span>
                                )}
                            </div>
                            {editPassword ? (
                                <button 
                                    onClick={() => handleSave("password", password, setEditPassword)} 
                                    className="p-2 text-brand-success hover:bg-brand-success/10 rounded-xl"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setEditPassword(true)} 
                                    className="p-2 text-text-secondary hover:text-foreground rounded-xl"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Location Field */}
                        <div className="game-card p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                                <MapPin className="w-5 h-5 text-text-secondary" />
                                {editLocation ? (
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="bg-background border border-border px-3 py-1.5 rounded-lg text-sm w-full focus:outline-none focus:border-brand-primary"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold">{location}</span>
                                )}
                            </div>
                            {editLocation ? (
                                <button 
                                    onClick={() => setEditLocation(false)} 
                                    className="p-2 text-brand-success hover:bg-brand-success/10 rounded-xl"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setEditLocation(true)} 
                                    className="p-2 text-text-secondary hover:text-foreground rounded-xl"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Support Link */}
                        <Link href="/support" className="block">
                            <div className="game-card p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-5 h-5 text-brand-primary" />
                                    <span className="text-sm font-semibold text-foreground">Support & FAQs</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-text-secondary" />
                            </div>
                        </Link>

                        {/* Log Out Button */}
                        <button
                            onClick={() => { logout(); signOut({ callbackUrl: '/' }); }}
                            className="w-full py-4 bg-brand-error/10 hover:bg-brand-error/15 border border-brand-error/20 text-brand-error rounded-[1.25rem] text-center font-game text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-6 shadow-md"
                        >
                            <LogOut className="w-4 h-4" /> Log Out
                        </button>
                    </div>

                    {/* Avatar selection grid */}
                    <div className="pt-6 border-t border-border/40">
                        <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 text-center">Unlockable Avatars</h4>
                        <div className="grid grid-cols-4 gap-3">
                            {storeSuggestedAvatars?.map((url: string, i: number) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAvatarSelect(url)}
                                    className={`aspect-square rounded-2xl bg-card border-2 transition-all flex items-center justify-center overflow-hidden cursor-pointer relative group ${
                                        selectedAvatar === url ? 'border-brand-primary shadow-lg shadow-brand-primary/20' : 'border-transparent hover:border-brand-primary/40'
                                    }`}
                                >
                                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                                    {selectedAvatar === url && (
                                        <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                                            <Check className="w-6 h-6 text-white stroke-[3]" />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
