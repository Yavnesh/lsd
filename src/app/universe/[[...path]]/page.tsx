"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { UniverseCanvas } from "../components/UniverseCanvas";
import { SpaceBackground } from "../components/SpaceBackground";
import { UniverseHUD } from "../components/UniverseHUD";
import { useUniverseStore } from "@/store/useUniverseStore";
import { useParams } from "next/navigation";

export default function UniversePage() {
    const params = useParams();
    const { isLoading, setLoading, pushBreadcrumb, breadcrumbs } = useUniverseStore();
    const [initialWorlds, setInitialWorlds] = useState<any[]>([]);
    
    // Load from Database / API
    useEffect(() => {
        const fetchInitialWorlds = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/universe');
                const data = await res.json();
                if (data.nodes) {
                    setInitialWorlds(data.nodes);
                }
            } catch (err) {
                console.error("Failed to fetch root universe:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialWorlds();
    }, [setLoading]);

    // Deep linking simulation
    // If a user navigates directly to /universe/science/physics, we'd want to populate the breadcrumbs
    // and load that specific node tree.
    useEffect(() => {
        if (params.path && Array.isArray(params.path)) {
            // Very naive simulation: just inject them into the breadcrumbs
            params.path.forEach((slug, index) => {
                // Ignore if it's already there to prevent infinite loops
                if (!breadcrumbs.some(b => b.slug === slug)) {
                    pushBreadcrumb({
                        id: `path-${index}`,
                        label: slug.charAt(0).toUpperCase() + slug.slice(1),
                        slug: slug
                    });
                }
            });
        }
    }, [params.path, pushBreadcrumb]); // Intentionally omitting breadcrumbs to prevent loops

    return (
        <main className="h-screen w-screen bg-black text-foreground overflow-hidden relative selection:bg-brand-primary/30">
            {/* The persistent top navbar */}
            <Navbar />
            
            {/* The ambient deep space particles (z-0) */}
            <SpaceBackground />
            
            {/* The interactive HUD (Breadcrumbs, Search) (z-40) */}
            <UniverseHUD />

            {/* Global Loading Overlay */}
            {isLoading && initialWorlds.length === 0 && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-brand-primary/20 border-t-brand-primary animate-spin" />
                        <p className="font-game tracking-widest text-brand-primary animate-pulse">Initializing Universe Engine...</p>
                    </div>
                </div>
            )}

            {/* The React Flow Canvas Engine (z-10) */}
            {initialWorlds.length > 0 && (
                <div className="absolute top-[80px] left-0 right-0 bottom-0">
                    <UniverseCanvas initialWorlds={initialWorlds} />
                </div>
            )}
        </main>
    );
}
