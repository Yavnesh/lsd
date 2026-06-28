"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LearningBlockProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const LearningBlock = ({ children, className = "", delay = 0 }: LearningBlockProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
            className={`min-h-[50vh] flex flex-col justify-center items-center py-20 px-6 perspective-depth ${className}`}
        >
            <motion.div 
                className="max-w-3xl w-full transform-gpu"
                whileHover={{ 
                    rotateY: 6, 
                    rotateX: -4, 
                    scale: 1.01,
                    z: 8
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};
