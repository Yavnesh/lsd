"use client";

import { useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export function SpaceBackground() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        loadSlim(tsParticles).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    return (
        <div className="absolute inset-0 z-0 bg-world-quest pointer-events-none overflow-hidden">
            {/* Soft global lighting gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-success/5 via-transparent to-transparent pointer-events-none opacity-50 z-10 mix-blend-screen" />
            
            <Particles
                id="tsparticles-space"
                className="absolute inset-0 z-0"
                options={{
                    background: {
                        color: {
                            value: "transparent",
                        },
                    },
                    fpsLimit: 60,
                    interactivity: {
                        events: {
                            onHover: {
                                enable: true,
                                mode: "bubble",
                            },
                        },
                        modes: {
                            bubble: {
                                distance: 250,
                                duration: 2,
                                size: 0,
                                opacity: 0,
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: ["#ffffff", "#7C4DFF", "#4CAF50", "#F7C948"], // Stars and nebulae dust
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: {
                                default: "out",
                            },
                            random: true,
                            speed: 0.2, // Very slow ambient movement
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                width: 800,
                                height: 800
                            },
                            value: 150, // Dense enough to feel like space
                        },
                        opacity: {
                            value: { min: 0.1, max: 0.8 },
                            animation: {
                                enable: true,
                                speed: 0.5,
                                sync: false,
                            }
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 0.5, max: 3 }, // Distant stars vs close dust
                            animation: {
                                enable: true,
                                speed: 1,
                                sync: false
                            }
                        },
                    },
                    detectRetina: true,
                }}
            />
        </div>
    );
}
