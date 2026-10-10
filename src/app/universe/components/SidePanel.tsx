import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, BookOpen, Clock, Trophy } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';
import { Node } from '@xyflow/react';

interface SidePanelProps {
    node: Node | null;
    onClose: () => void;
    onExplore: (nodeId: string) => void;
}

export function SidePanel({ node, onClose, onExplore }: SidePanelProps) {
    if (!node) return null;

    const data = node.data as any;
    const isLocked = data.state === 'locked' || data.isHidden;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-black/60 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${isLocked ? 'bg-white/5 grayscale' : 'bg-brand-primary/20 border border-brand-primary/50'}`}>
                            {isLocked ? "☁️" : data.emoji}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">
                                {isLocked ? "Unknown Region" : data.name}
                            </h2>
                            {!isLocked && (
                                <p className="text-brand-primary text-xs font-black uppercase tracking-wider mt-1">
                                    {data.progress || 0}% Mastered
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                    {isLocked ? (
                        <div className="text-center py-10">
                            <p className="text-text-secondary">This sector is shrouded in the Fog of War.</p>
                            <p className="text-sm mt-2 text-white/50">Complete prerequisites to reveal this path.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                {data.description || "Dive into this domain to uncover hidden mechanics and earn rare artifacts."}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 text-text-secondary mb-1">
                                        <BookOpen className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Topics</span>
                                    </div>
                                    <span className="text-xl font-game text-white">{data.topicsCount || 5}</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 text-text-secondary mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Time</span>
                                    </div>
                                    <span className="text-xl font-game text-white">{data.estTime || "15m"}</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <Trophy className="w-4 h-4 text-brand-gold" />
                                        <span className="text-xs font-bold uppercase">Reward</span>
                                    </div>
                                    <span className="text-brand-gold font-bold text-sm">+250 XP</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Action */}
                <div className="pt-6 border-t border-white/10 mt-auto">
                    <button
                        disabled={isLocked}
                        onClick={() => onExplore(node.id)}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                            isLocked 
                            ? 'bg-white/5 text-text-secondary cursor-not-allowed' 
                            : 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-[0_0_20px_rgba(124,77,255,0.4)]'
                        }`}
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Explore Sector
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
