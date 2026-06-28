"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Bell, Sparkles, Trophy, Brain, X, Info, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface NotificationItem {
    id: string;
    type: "offer" | "warning" | "success" | "info" | "error";
    title: string;
    text: string;
    time: string;
    link?: string;
    unread: boolean;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        {
            id: "1",
            type: "offer",
            title: "Best offer for you!",
            text: "LSD Premium Active! Upgrade to double all XP rewards and unlock premium loops.",
            time: "Just now",
            link: "/premium",
            unread: true
        },
        {
            id: "2",
            type: "warning",
            title: "Warning.",
            text: "Your streak is vulnerable! Set up a streak shield to secure your daily rank.",
            time: "1 hour ago",
            link: "/dashboard",
            unread: true
        },
        {
            id: "3",
            type: "success",
            title: "Congratulations!",
            text: "Success! You successfully completed your today's learning quest.",
            time: "3 hours ago",
            link: "/learn",
            unread: true
        },
        {
            id: "4",
            type: "info",
            title: "Did you know?",
            text: "You can challenge other players in the Arena rankings starting tomorrow.",
            time: "1 day ago",
            link: "/leaderboard",
            unread: false
        },
        {
            id: "5",
            type: "error",
            title: "Something went wrong!",
            text: "XP sync error detected last night. It was resolved automatically.",
            time: "2 days ago",
            unread: false
        }
    ]);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, unread: false } : n))
        );
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const deleteNotification = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getTypeDetails = (type: string) => {
        switch (type) {
            case "offer":
                return { icon: Sparkles, color: "text-brand-success", bg: "bg-brand-success/15 border-brand-success/20" };
            case "warning":
                return { icon: ShieldAlert, color: "text-brand-gold", bg: "bg-brand-gold/15 border-brand-gold/20" };
            case "success":
                return { icon: CheckCircle2, color: "text-purple-400", bg: "bg-purple-400/15 border-purple-400/20" };
            case "info":
                return { icon: Info, color: "text-cyan-400", bg: "bg-cyan-400/15 border-cyan-400/20" };
            default:
                return { icon: Brain, color: "text-brand-error", bg: "bg-brand-error/15 border-brand-error/20" };
        }
    };

    return (
        <main className="min-h-screen bg-world-quest text-foreground pb-20">
            <Navbar />
            <div className="container mx-auto px-4 pt-28 max-w-2xl">
                <header className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <h1 className="font-game text-xl">Notification Feed</h1>
                            <p className="text-xs text-text-secondary">Updates on your learning empire</p>
                        </div>
                    </div>

                    {notifications.some(n => n.unread) && (
                        <button
                            onClick={markAllRead}
                            className="text-[10px] font-black uppercase tracking-wider text-brand-primary hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </header>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="game-card p-12 text-center">
                            <Bell className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
                            <p className="font-game text-sm text-text-secondary">All caught up!</p>
                            <p className="text-xs text-text-secondary/70 mt-1">We'll alert you when fresh quests drop.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const { icon: Icon, color, bg } = getTypeDetails(notif.type);
                            return (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => markAsRead(notif.id)}
                                    className={`game-card p-5 relative overflow-hidden transition-all flex items-start gap-4 cursor-pointer group ${
                                        notif.unread ? "border-brand-primary/20 bg-brand-primary/5" : "border-border/30 hover:border-border/60"
                                    }`}
                                >
                                    <div className={`p-3 rounded-2xl ${bg} ${color} flex-shrink-0 shadow-md`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-game text-sm text-foreground">{notif.title}</h4>
                                            {notif.unread && (
                                                <span className="w-2 h-2 bg-brand-primary rounded-full" />
                                            )}
                                        </div>
                                        <p className="text-xs text-text-secondary leading-relaxed mb-3 pr-2">
                                            {notif.text}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-text-secondary">{notif.time}</span>
                                            {notif.link && (
                                                <Link href={notif.link} className="text-[10px] font-black uppercase tracking-wider text-brand-primary hover:underline">
                                                    View more...
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => deleteNotification(notif.id, e)}
                                        className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-foreground"
                                        aria-label="Delete notification"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}
