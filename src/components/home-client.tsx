"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DashboardView } from "@/components/dashboard-view";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useUIStore } from "@/lib/ui-store";



import { AboutView } from "@/components/about-view";
import Image from "next/image";

export function HomeClient() {
    const [topic, setTopic] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const { isDashboardOpen, setDashboardOpen } = useUIStore();
    const router = useRouter();
    const { isSignedIn } = useUser();

    // Branding / About View State
    const [isAboutOpen, setAboutOpen] = useState(false);

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

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // GUEST CHECK: strict gate for new topics
        if (!isSignedIn) {
            // Allow if exact match exists in search results (safe navigation)
            const exactMatch = searchResults.some(r => r.title.toLowerCase() === topic.trim().toLowerCase());

            if (!exactMatch) {
                setErrorMessage("Please sign in to generate new knowledge. Guests can only browse existing topics.");
                return;
            }
        }

        if (topic.trim() && !isResolving) {
            setIsResolving(true);
            try {
                // Log the search intent immediately
                const { logSearch } = await import('@/app/actions/log-search');
                logSearch(topic);

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

            {/* BRANDING - Top Left */}
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={() => setAboutOpen(true)}
                    className="group flex items-center gap-2 px-2 py-2 transition-transform hover:scale-105"
                >
                    <div className="relative w-8 h-8 overflow-hidden">
                        <Image
                            src="/wikits.png"
                            alt="Wikits"
                            fill
                            className="object-contain" // Changed to contain to ensure full icon visibility without crop
                        />
                    </div>
                </button>
            </div>

            {/* Dashboard Toggle - Top Right (Visible when dashboard is closed) */}
            {!isDashboardOpen && (
                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={() => setDashboardOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-md border border-border hover:bg-background transition-colors shadow-sm"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-sm font-medium">Dashboard</span>
                    </button>
                </div>
            )}

            {/* Main Content (Always Mounted, but visually hidden when dashboard is open) */}
            <div className={cn(
                "relative z-10 w-full max-w-2xl space-y-8 text-center transition-opacity duration-300",
                isDashboardOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
                <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-primary drop-shadow-sm">
                    Wikits
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground font-sans font-light drop-shadow-sm">
                    What do you want to master today?
                </p>

                <form onSubmit={handleSubmit} className={cn(
                    "relative max-w-lg mx-auto transition-all duration-300 bg-background/80 backdrop-blur-xl border border-border shadow-lg z-50 overflow-hidden",
                    // Expand if we have results OR if we have input (to show "Generate" option)
                    (searchResults.length > 0 || topic.trim().length > 0) ? "rounded-[2rem]" : "rounded-full hover:shadow-xl focus-within:shadow-2xl focus-within:scale-105"
                )}>
                    {/* Input Area */}
                    <div className="relative flex items-center z-20 pr-1.5">
                        <div className="pl-4 flex items-center pointer-events-none text-muted-foreground shrink-0">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => {
                                setTopic(e.target.value);
                                if (errorMessage) setErrorMessage(null); // Clear error on type
                            }}
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

                    {/* Autocomplete / Actions Dropdown */}
                    <AnimatePresence>
                        {(searchResults.length > 0 || topic.trim().length > 0) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full border-t border-border/10"
                            >
                                <div className="py-2 pb-4">
                                    {searchResults.length > 0 ? (
                                        <>
                                            {searchResults.map((result) => (
                                                <Link
                                                    key={result.id}
                                                    href={`/wiki/${result.slug}`}
                                                    className="block text-left px-6 py-3 hover:bg-primary/5 transition-colors group"
                                                >
                                                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">{result.title}</div>
                                                </Link>
                                            ))}
                                            <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground text-center opacity-50 mt-1">
                                                Press Enter to generate new
                                            </div>
                                        </>
                                    ) : (
                                        /* Empty State - Offer Generation */
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full text-left px-6 py-4 hover:bg-primary/5 transition-colors group flex items-center gap-4"
                                            type="button"
                                        >
                                            <div className="p-2.5 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                                                <ArrowRight className="w-4 h-4" /> {/* Or Sparkles if imported */}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-foreground truncate">Generate "<span className="text-primary">{topic}</span>"</div>
                                                <div className="text-xs text-muted-foreground">Create a new comprehensive syllabus with AI</div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 inline-block"
                    >
                        <SignInButton mode="modal">
                            <button className="text-red-500 bg-red-500/10 px-4 py-2 rounded-lg text-sm border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer">
                                {errorMessage}
                            </button>
                        </SignInButton>
                    </motion.div>
                )}

                <div className="pt-4 flex justify-center gap-6 text-xs md:text-sm text-muted-foreground/80 font-serif italic">
                    {/* Footer / Status Area */}
                </div>
            </div>

            {/* Dashboard Overlay */}
            <AnimatePresence>
                {isDashboardOpen && (
                    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col">
                        <DashboardView onClose={() => setDashboardOpen(false)} />
                    </div>
                )}
                {isAboutOpen && (
                    <AboutView onClose={() => setAboutOpen(false)} />
                )}
            </AnimatePresence>
        </main>
    );
}

