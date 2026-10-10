import { motion } from 'framer-motion';
import { ChevronRight, Search, Map as MapIcon } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UniverseHUD() {
    const router = useRouter();
    const { breadcrumbs, popToBreadcrumb } = useUniverseStore();

    const handleBreadcrumbClick = (id: string, slug: string, index: number) => {
        // If it's already the last breadcrumb, do nothing
        if (index === breadcrumbs.length - 1) return;
        
        popToBreadcrumb(id);
        
        // Construct the new URL by slicing the slugs up to this point
        const pathSlugs = breadcrumbs.slice(1, index + 1).map(b => b.slug);
        const url = pathSlugs.length > 0 ? `/universe/${pathSlugs.join('/')}` : '/universe';
        router.push(url);
    };

    return (
        <div className="absolute top-28 left-0 right-0 z-40 p-6 pointer-events-none flex flex-col gap-4">
            
            {/* Top Bar: Breadcrumbs & Search */}
            <div className="flex items-center justify-between pointer-events-auto">
                
                {/* Breadcrumbs (Glass Panel) */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-lg"
                >
                    <Link href="/universe" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30">
                            <MapIcon className="w-3 h-3 text-brand-primary" />
                        </div>
                    </Link>

                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.id} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="w-4 h-4 text-white/30" />}
                            <button
                                onClick={() => handleBreadcrumbClick(crumb.id, crumb.slug, index)}
                                className={`text-sm font-bold transition-colors hover:text-white ${
                                    index === breadcrumbs.length - 1 ? 'text-white' : 'text-text-secondary'
                                }`}
                            >
                                {crumb.label}
                            </button>
                        </div>
                    ))}
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative"
                >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Search className="w-4 h-4 text-text-secondary" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search the universe..." 
                        className="bg-black/40 backdrop-blur-xl border border-white/10 pl-11 pr-4 py-3 rounded-full text-sm text-white placeholder-text-secondary w-64 focus:outline-none focus:border-brand-primary/50 focus:w-80 transition-all duration-300 shadow-lg"
                    />
                </motion.div>

            </div>
        </div>
    );
}
