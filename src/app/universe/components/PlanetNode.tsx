import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

export type NodeState = 'locked' | 'normal' | 'current' | 'mastered' | 'new';

export interface PlanetNodeData {
    name: string;
    emoji: string;
    isHidden?: boolean;
    progress?: number; // 0-100
    state?: NodeState;
    color?: string; // e.g., 'purple', 'blue', 'green'
}

export const PlanetNode = memo(({ data, selected }: { data: PlanetNodeData; selected: boolean }) => {
    const isLocked = data.state === 'locked' || data.isHidden;
    const isMastered = data.state === 'mastered' || data.progress === 100;
    const isCurrent = data.state === 'current' || selected;

    // Define colors based on the node's theme or fallback to brand primary
    const glowColor = data.color || 'rgba(124, 77, 255, 0.5)'; // default purple
    
    // Core styling based on state
    let ringClass = "border-brand-primary bg-brand-primary/20";
    let glowClass = "shadow-[0_0_30px_rgba(124,77,255,0.3)]";
    let iconOpacity = "opacity-100";

    if (isLocked) {
        ringClass = "border-dashed border-text-secondary bg-black/50";
        glowClass = "shadow-none";
        iconOpacity = "opacity-30 blur-[1px]";
    } else if (isMastered) {
        ringClass = "border-brand-gold bg-brand-gold/20";
        glowClass = "shadow-[0_0_40px_rgba(247,201,72,0.5)]";
    } else if (isCurrent) {
        ringClass = "border-white bg-white/20";
        glowClass = "shadow-[0_0_50px_rgba(255,255,255,0.6)]";
    }

    return (
        <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`relative flex flex-col items-center gap-3 cursor-pointer ${isLocked ? 'grayscale' : ''}`}
        >
            {/* React Flow Handles - Invisible but necessary for edges */}
            <Handle type="target" position={Position.Top} className="opacity-0 w-full h-full absolute inset-0 z-0 pointer-events-none" />
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full absolute inset-0 z-0 pointer-events-none" />

            {/* The Planet itself */}
            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 transition-all duration-500 z-10
                ${ringClass} ${glowClass}`}
            >
                {/* Subtle orbit ring animation for 'current' node */}
                {isCurrent && (
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="absolute inset-[-10px] border border-white/30 rounded-full border-t-transparent"
                    />
                )}

                {/* Progress Ring (SVG) */}
                {!isLocked && data.progress !== undefined && data.progress > 0 && data.progress < 100 && (
                    <svg className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] -rotate-90 pointer-events-none">
                        <circle 
                            cx="50%" cy="50%" r="48%" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            className="text-white/20"
                        />
                        <circle 
                            cx="50%" cy="50%" r="48%" 
                            fill="none" 
                            stroke={isMastered ? "#F7C948" : "#7C4DFF"} 
                            strokeWidth="2" 
                            strokeDasharray="100 100"
                            strokeDashoffset={100 - data.progress}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                )}

                <span className={`z-10 ${iconOpacity} transition-all`}>
                    {isLocked ? "☁️" : data.emoji}
                </span>
            </div>

            {/* Labels below the planet */}
            <div className="text-center bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 pointer-events-none shadow-xl">
                <span className="font-bold text-sm text-white block">
                    {isLocked ? "Unknown Region" : data.name}
                </span>
                
                {!isLocked && data.progress !== undefined && (
                    <span className={`text-[10px] font-black uppercase tracking-wider block mt-1 ${isMastered ? 'text-brand-gold' : 'text-brand-primary'}`}>
                        {data.progress}% Mastered
                    </span>
                )}
            </div>
        </motion.div>
    );
});
