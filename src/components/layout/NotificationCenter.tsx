"use client";

import { useState } from "react";
import { Bell, Sparkles, Trophy, Brain, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface NotificationItem {
    id: string;
    icon: any;
    color: string;
    bg: string;
    text: string;
    time: string;
    link?: string;
    unread: boolean;
}

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        {
            id: "1",
            icon: Sparkles,
            color: "text-brand-accent",
            bg: "bg-brand-accent/15",
            text: "LSD Premium Active! Upgrade to double all XP rewards and unlock premium loops.",
            time: "Just now",
            link: "/premium",
            unread: true
        },
        {
            id: "2",
            icon: Trophy,
            color: "text-brand-primary",
            bg: "bg-brand-primary/15",
            text: "Unlocks ahead: Reach 100 XP to advance from 'Curious Mind' to 'Thinker' status.",
            time: "1 hour ago",
            link: "/dashboard",
            unread: true
        },
        {
            id: "3",
            icon: Brain,
            color: "text-brand-secondary",
            bg: "bg-brand-secondary/15",
            text: "Intel Hub active: New Cognitive Biases content cluster is now live for all users.",
            time: "1 day ago",
            link: "/topics",
            unread: false
        }
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, unread: false } : n))
        );
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-full text-text-secondary hover:text-foreground hover:bg-brand-primary/10 transition-all cursor-pointer relative"
                aria-label="Notifications"
            >
                <Bell className="h-5.5 w-5.5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-orange rounded-full ring-2 ring-card animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay backdrop to close */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-[2rem] p-5 shadow-2xl shadow-brand-primary/10 z-50 origin-top-right text-left"
                        >
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-brand-primary" />
                                    <h4 className="font-bold font-display text-base text-foreground">Notifications</h4>
                                </div>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllRead}
                                        className="text-[10px] font-black uppercase tracking-wider text-brand-primary hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <p className="text-xs text-text-secondary text-center py-8 font-sans">No notifications yet.</p>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                                    {notifications.map((notif) => {
                                        const Icon = notif.icon;
                                        return (
                                            <div
                                                key={notif.id}
                                                onClick={() => {
                                                    markAsRead(notif.id);
                                                    if (!notif.link) setIsOpen(false);
                                                }}
                                                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative group ${
                                                    notif.unread
                                                        ? "bg-brand-primary/5 border-brand-primary/10"
                                                        : "bg-background/40 border-transparent hover:border-border"
                                                }`}
                                            >
                                                <div className={`p-2.5 rounded-xl ${notif.bg} ${notif.color} flex-shrink-0`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    {notif.link ? (
                                                        <Link 
                                                            href={notif.link}
                                                            onClick={() => setIsOpen(false)}
                                                            className="text-xs font-semibold text-foreground hover:text-brand-primary leading-relaxed block font-sans"
                                                        >
                                                            {notif.text}
                                                        </Link>
                                                    ) : (
                                                        <p className="text-xs font-semibold text-foreground leading-relaxed font-sans">{notif.text}</p>
                                                    )}
                                                    <span className="text-[10px] text-text-secondary font-medium mt-1.5 block">{notif.time}</span>
                                                </div>
                                                {notif.unread && (
                                                    <span className="absolute top-4 right-4 w-2 h-2 bg-brand-primary rounded-full" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
