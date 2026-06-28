"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MessageCircle, Mail, HelpCircle, ChevronDown, ChevronUp, Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportPage() {
    const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
    const [liveChatOpen, setLiveChatOpen] = useState(false);
    const [emailFormOpen, setEmailFormOpen] = useState(false);
    
    // Live Chat state
    const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "agent"; text: string }>>([
        { sender: "agent", text: "Hello! Thanks for reaching out. How can I help you today?" }
    ]);
    const [inputMessage, setInputMessage] = useState("");

    // Email state
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    const toggleFaq = (index: number) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;
        setChatMessages(prev => [...prev, { sender: "user", text: inputMessage }]);
        const currentInput = inputMessage;
        setInputMessage("");

        // Simulate agent typing/response
        setTimeout(() => {
            let response = "That's an interesting question! Let me check that for you.";
            if (currentInput.toLowerCase().includes("premium") || currentInput.toLowerCase().includes("subscribe")) {
                response = "LSD Premium doubles all daily quest XP and unlocks over 50+ specialized topics! You can subscribe in the Premium tab.";
            } else if (currentInput.toLowerCase().includes("reset") || currentInput.toLowerCase().includes("progress")) {
                response = "You can reset your daily quest progress by navigating to the Sanctuary dashboard and choosing 'Restart Daily Loop'.";
            } else if (currentInput.toLowerCase().includes("streak") || currentInput.toLowerCase().includes("shield")) {
                response = "Streak shields automatically prevent your streak from breaking on days you skip. You get one free shield per week!";
            }
            setChatMessages(prev => [...prev, { sender: "agent", text: response }]);
        }, 1000);
    };

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailSubject || !emailMessage) return;
        setEmailSent(true);
        setTimeout(() => {
            setEmailSent(false);
            setEmailSubject("");
            setEmailMessage("");
            setEmailFormOpen(false);
        }, 3000);
    };

    const faqs = [
        {
            q: "What is LSD?",
            a: "LSD (Learn Something Daily) is a premium gamified micro-learning platform. It translates complex cognitive theories, behavioral psychology, and tech models into digestible 3-minute game quests."
        },
        {
            q: "How do I secure my streak?",
            a: "Simply log in and complete your daily quest in the Nexus screen every day. You can also equip Streak Shields from your dashboard profile to protect your progress."
        },
        {
            q: "What benefits does Premium give me?",
            a: "Premium unlocks advanced worlds (like Dark Persuasion or Advanced Models 2.0), double XP multipliers, and full access to historical quest archives."
        },
        {
            q: "How does the World Map work?",
            a: "The World Map (Expedition tab) contains regional learning loops. Entering a region lets you explore past quests at your own pace and earn badges."
        }
    ];

    return (
        <main className="min-h-screen bg-world-quest text-foreground pb-20">
            <Navbar />
            <div className="container mx-auto px-4 pt-28 max-w-md">

                {/* Support Illustration Header */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4 border border-brand-primary/20 shadow-lg">
                        <span className="text-5xl">🎧</span>
                    </div>
                    <h1 className="font-game text-2xl mb-2">Hello, How can we help you?</h1>
                    <p className="text-xs text-text-secondary">Reach out to our guides or browse FAQs</p>
                </div>

                <div className="space-y-4">
                    {/* Action Card: Live Chat */}
                    <div className="game-card p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-success/15 text-brand-success rounded-2xl">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-game text-sm text-foreground">Contact Live Chat</h3>
                                    <p className="text-[10px] text-text-secondary">Chat live with our support bot</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setLiveChatOpen(true); setEmailFormOpen(false); }}
                                className="game-btn-primary text-xs px-4 py-2"
                            >
                                Start Chat
                            </button>
                        </div>
                    </div>

                    {/* Action Card: Send Email */}
                    <div className="game-card p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/15 text-brand-primary rounded-2xl">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-game text-sm text-foreground">Send us an E-mail</h3>
                                    <p className="text-[10px] text-text-secondary">Get a response within 12 hours</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setEmailFormOpen(true); setLiveChatOpen(false); }}
                                className="game-btn-primary text-xs px-4 py-2"
                            >
                                Send Email
                            </button>
                        </div>
                    </div>

                    {/* FAQ Accordion List */}
                    <div className="game-card p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
                            <HelpCircle className="w-4 h-4 text-brand-gold" />
                            <h3 className="font-game text-xs text-foreground uppercase tracking-widest">Frequently Asked Questions</h3>
                        </div>

                        {faqs.map((faq, i) => (
                            <div key={i} className="border-b border-border/20 last:border-0 pb-3 last:pb-0">
                                <button
                                    onClick={() => toggleFaq(i)}
                                    className="w-full flex items-center justify-between text-left text-xs font-bold py-1.5 hover:text-brand-primary transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    {faqOpen[i] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                                <AnimatePresence>
                                    {faqOpen[i] && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-[11px] text-text-secondary leading-relaxed mt-1.5 pl-1 overflow-hidden"
                                        >
                                            {faq.a}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Chat Modal Drawer */}
                <AnimatePresence>
                    {liveChatOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center">
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                className="bg-card w-full max-w-md h-[80vh] rounded-t-[2.5rem] border-t border-border flex flex-col justify-between overflow-hidden shadow-2xl"
                            >
                                {/* Header */}
                                <div className="p-5 border-b border-border flex items-center justify-between bg-card/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 bg-brand-success rounded-full animate-pulse" />
                                        <h3 className="font-game text-sm">LSD Assistant</h3>
                                    </div>
                                    <button
                                        onClick={() => setLiveChatOpen(false)}
                                        className="text-xs text-text-secondary hover:text-foreground font-semibold"
                                    >
                                        Close
                                    </button>
                                </div>

                                {/* Message Log */}
                                <div className="flex-1 p-5 overflow-y-auto space-y-4 no-scrollbar">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-[1.25rem] text-xs leading-relaxed ${
                                                msg.sender === "user"
                                                    ? "bg-brand-primary text-white rounded-tr-none"
                                                    : "bg-background/80 text-foreground rounded-tl-none border border-border/40"
                                            }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input bar */}
                                <div className="p-4 border-t border-border bg-card flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                        className="flex-1 bg-background border border-border px-4 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-primary"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/95"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Email Submission Modal Drawer */}
                <AnimatePresence>
                    {emailFormOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center">
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                className="bg-card w-full max-w-md rounded-t-[2.5rem] border-t border-border p-6 shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-game text-sm">Send Email</h3>
                                    <button
                                        onClick={() => setEmailFormOpen(false)}
                                        className="text-xs text-text-secondary hover:text-foreground font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {emailSent ? (
                                    <div className="text-center py-10 space-y-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-success/10 text-brand-success flex items-center justify-center mx-auto">
                                            <Check className="w-6 h-6 stroke-[3]" />
                                        </div>
                                        <h4 className="font-game text-sm text-foreground">Message Sent!</h4>
                                        <p className="text-xs text-text-secondary">We'll review your report and get back to you.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendEmail} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="What can we help you with?"
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                                className="w-full bg-background border border-border px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-brand-primary"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Message</label>
                                            <textarea
                                                required
                                                rows={4}
                                                placeholder="Write details of your problem here..."
                                                value={emailMessage}
                                                onChange={(e) => setEmailMessage(e.target.value)}
                                                className="w-full bg-background border border-border px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-brand-primary"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="game-btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2"
                                        >
                                            <Send className="w-4 h-4" /> Send Message
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}
