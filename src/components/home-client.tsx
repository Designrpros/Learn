"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DashboardView } from "@/components/dashboard-view";
import { useUser } from "@clerk/nextjs";


export function HomeClient() {
    const [topic, setTopic] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const router = useRouter();
    const { isSignedIn } = useUser();

    useEffect(() => {
        const fetchResults = async () => {
            if (topic.length > 2) {
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(topic)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(data);
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                setSearchResults([]);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [topic]);

    const [isResolving, setIsResolving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim() && !isResolving) {
            setIsResolving(true);
            try {
                // Dynamic import to avoid server-action issues in client component if strict
                // But normally we can just import. Let's try direct import at top? 
                // Wait, Next.js server actions can be imported.
                // But for now, let's do the async call here.

                const { resolveTopic } = await import('@/app/actions/resolve-topic');
                const resolvedSlug = await resolveTopic(topic);

                router.push(`/wiki/${resolvedSlug}`); // Redirect to resolved slug
            } catch (e) {
                // Fallback
                router.push(`/wiki/${encodeURIComponent(topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}`);
            } finally {
                // setIsResolving(false); // No need to reset if we navigate away (prevents flicker)
            }
        }
    };

    return (
        <main className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 selection:bg-stone-200 dark:selection:bg-stone-800 relative z-10 overflow-hidden">

            {/* Dashboard Toggle - Top Right */}


            {/* Dashboard Toggle - Top Right */}
            {isSignedIn && (
                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-md border border-border hover:bg-background transition-colors shadow-sm"
                    >
                        {isDashboardOpen ? <X className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                        <span className="text-sm font-medium">{isDashboardOpen ? "Close Dashboard" : "Dashboard"}</span>
                    </button>
                </div>
            )}

            <AnimatePresence mode="wait">
                {isDashboardOpen ? (
                    <DashboardView key="dashboard" />
                ) : (
                    <motion.div
                        key="home"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 w-full max-w-2xl space-y-8 text-center"
                    >
                        <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-primary drop-shadow-sm">
                            Peak Learn
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground font-sans font-light drop-shadow-sm">
                            What do you want to master today?
                        </p>

                        <form onSubmit={handleSubmit} className="relative group max-w-lg mx-auto">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Quantum Physics, Renaissance Art..."
                                className="w-full h-14 pl-12 pr-16 rounded-full border border-border bg-background/80 backdrop-blur-xl text-lg shadow-lg hover:shadow-xl focus:shadow-2xl focus:scale-105 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 font-sans relative z-10"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!topic.trim() || isResolving}
                                className={cn(
                                    "absolute inset-y-1.5 right-1.5 px-4 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 transition-all duration-300 z-20 shadow-md",
                                    (!topic.trim() && !isResolving) ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100 hover:scale-105",
                                    isResolving && "cursor-wait opacity-80"
                                )}
                            >
                                {isResolving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Go <ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>

                            {/* Autocomplete Results */}
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-3 bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-0"
                                    >
                                        {searchResults.map((result) => (
                                            <Link
                                                key={result.id}
                                                href={`/wiki/${result.slug}`}
                                                className="block text-left px-6 py-3 hover:bg-primary/5 transition-colors border-b border-border/10 last:border-0"
                                            >
                                                <div className="font-medium text-foreground">{result.title}</div>
                                            </Link>
                                        ))}
                                        <div className="px-4 py-2 bg-muted/20 text-xs text-muted-foreground text-center">
                                            Press Enter to generate fresh content
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        <div className="pt-8 flex justify-center gap-6 text-xs md:text-sm text-muted-foreground/80 font-serif italic">
                            {/* Optional Status or Footer text */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </main>
    );
}
