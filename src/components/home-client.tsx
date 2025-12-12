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
                            Wikits
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground font-sans font-light drop-shadow-sm">
                            What do you want to master today?
                        </p>

                        <form onSubmit={handleSubmit} className={cn(
                            "relative max-w-lg mx-auto transition-all duration-300 bg-background/80 backdrop-blur-xl border border-border shadow-lg",
                            searchResults.length > 0 ? "rounded-[2rem]" : "rounded-full hover:shadow-xl focus-within:shadow-2xl focus-within:scale-105"
                        )}>
                            <div className="relative flex items-center z-20 pr-1.5">
                                <div className="pl-4 flex items-center pointer-events-none text-muted-foreground shrink-0">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Quantum Physics, Renaissance Art..."
                                    className="flex-1 w-full h-14 pl-3 pr-4 bg-transparent border-none text-lg focus:outline-none placeholder:text-muted-foreground/50 font-sans min-w-0"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!topic.trim() || isResolving}
                                    className={cn(
                                        "px-6 h-12 rounded-full bg-primary text-primary-foreground text-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-md shrink-0 mb-0.5 mr-0.5",
                                        (!topic.trim() && !isResolving) ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100 hover:scale-105",
                                        isResolving && "cursor-wait opacity-80"
                                    )}
                                >
                                    {isResolving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Go <ArrowRight className="h-5 w-5" /></>
                                    )}
                                </button>
                            </div>

                            {/* Autocomplete Results */}
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden border-t border-border/10"
                                    >
                                        <div className="py-2">
                                            {searchResults.map((result) => (
                                                <Link
                                                    key={result.id}
                                                    href={`/wiki/${result.slug}`}
                                                    className="block text-left px-6 py-3 hover:bg-primary/5 transition-colors"
                                                >
                                                    <div className="font-medium text-foreground">{result.title}</div>
                                                </Link>
                                            ))}
                                            <div className="px-4 py-2 text-xs text-muted-foreground text-center opacity-50">
                                                Press Enter to generate fresh content
                                            </div>
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
