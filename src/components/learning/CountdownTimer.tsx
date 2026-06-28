"use client";

import { useEffect, useState } from "react";
import { Flame, Clock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface CountdownProps {
    hasCompletedToday: boolean;
}

export function CountdownTimer({ hasCompletedToday }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        function updateTimer() {
            const now = new Date();
            
            // Calculate midnight tonight in the local timezone
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            
            const diffMs = midnight.getTime() - now.getTime();
            
            if (diffMs <= 0) {
                setTimeLeft("00:00:00");
                return;
            }

            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            const hh = String(hours).padStart(2, "0");
            const mm = String(minutes).padStart(2, "0");
            const ss = String(seconds).padStart(2, "0");

            setTimeLeft(`${hh}:${mm}:${ss}`);
        }

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-xl mx-auto p-6 rounded-3xl border mb-10 card-shadow text-left flex items-center gap-5 relative overflow-hidden ${
                hasCompletedToday
                    ? "bg-brand-success/5 border-brand-success/20 text-brand-success"
                    : "bg-brand-orange/5 border-brand-orange/20 text-brand-orange animate-pulse"
            }`}
        >
            <div className={`p-4 rounded-2xl ${hasCompletedToday ? "bg-brand-success/15" : "bg-brand-orange/15"}`}>
                {hasCompletedToday ? (
                    <ShieldCheck className="w-8 h-8 text-brand-success" />
                ) : (
                    <Flame className="w-8 h-8 text-brand-orange fill-brand-orange" />
                )}
            </div>

            <div className="flex-1">
                <h4 className="font-bold font-display text-lg mb-1">
                    {hasCompletedToday ? "Streak Secured!" : "Streak at Risk!"}
                </h4>
                <p className="text-text-secondary text-sm font-medium font-sans">
                    {hasCompletedToday
                        ? "Great job! Your daily learning habit is safe. Next drop in:"
                        : "Take today's daily test now to save your streak from breaking! Time left:"}
                </p>
            </div>

            <div className="flex items-center gap-2 font-display font-black text-2xl tracking-wider">
                <Clock className="w-5 h-5 opacity-60" />
                <span>{timeLeft}</span>
            </div>
        </motion.div>
    );
}
