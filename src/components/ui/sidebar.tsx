"use client";

import { useUIStore } from '@/lib/ui-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ChevronDown, Database, Loader2, FileText } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDebounce } from 'use-debounce';

// --- LAZY TREE ITEM ---
const TreeItem = ({ item, level = 0 }: { item: any, level?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [children, setChildren] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false); // To detect if we should show arrow

    // We assume if item.children is an array with length > 0 (even if just IDs), it has children.
    // Ideally the API tells us "hasChildren: true". 
    // From our query: children: {limit: 1} exists if length > 0.
    const initiallyHasChildren = item.children && item.children.length > 0;

    const IconComponent = item.icon && (Icons as any)[item.icon] ? (Icons as any)[item.icon] : (initiallyHasChildren ? Icons.LayoutGrid : Icons.Hash);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOpen) {
            setIsOpen(false);
            return;
        }

        setIsOpen(true);

        // Fetch children if we haven't already
        if (children.length === 0) {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/topics/nodes?parentId=${item.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setChildren(data);
                }
            } catch (err) {
                console.error("Failed to load children", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="select-none text-foreground/80">
            <div
                className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors group text-sm",
                    level > 0 && "ml-3"
                )}
            >
                {/* Arrow / Spinner */}
                <div
                    className="w-5 h-5 flex items-center justify-center shrink-0 text-muted-foreground/70 cursor-pointer hover:bg-muted rounded text-foreground transition-colors"
                    onClick={initiallyHasChildren ? handleToggle : undefined}
                >
                    {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : initiallyHasChildren ? (
                        isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <div className="w-3.5 h-3.5" /> // Spacer
                    )}
                </div>

                {/* Icon */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0 text-muted-foreground/80">
                    <IconComponent className="w-4 h-4" />
                </div>

                {/* Link */}
                <Link
                    href={`/wiki/${item.slug}`}
                    className="flex-1 truncate group-hover:text-primary transition-colors font-medium cursor-pointer"
                    onClick={() => {
                        // Optional: Close sidebar on mobile
                        if (window.innerWidth < 768) {
                            useUIStore.getState().setSidebarOpen(false);
                        }
                    }}
                >
                    {item.title}
                </Link>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-l border-border/40 ml-3.5 pl-1"
                    >
                        {children.length > 0 ? (
                            children.map((child: any) => (
                                <TreeItem key={child.id} item={child} level={level + 1} />
                            ))
                        ) : (
                            !isLoading && <div className="text-xs text-muted-foreground pl-6 py-1 italic">No sub-topics</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- SIDEBAR MAIN ---
export function Sidebar() {
    const { isSidebarOpen, setSidebarOpen } = useUIStore();
    const [roots, setRoots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Initial Fetch (Roots only)
    useEffect(() => {
        async function fetchRoots() {
            setLoading(true);
            try {
                // Fetch roots (parentId=null)
                // Note: We might want to pass 'null' explicitly or let the API handle it
                const res = await fetch(`/api/topics/nodes?parentId=null`);
                if (res.ok) {
                    const data = await res.json();
                    setRoots(data);
                }
            } catch (err) {
                console.error("Failed to load roots", err);
            } finally {
                setLoading(false);
            }
        }

        if (isSidebarOpen) {
            fetchRoots();
        }
    }, [isSidebarOpen]);

    // Search Effect
    useEffect(() => {
        if (!debouncedQuery) {
            setSearchResults([]);
            return;
        }

        async function doSearch() {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search/sidebar?q=${encodeURIComponent(debouncedQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        }

        doSearch();
    }, [debouncedQuery]);

    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed left-0 top-0 h-screen border-r border-border bg-card/95 backdrop-blur-xl shrink-0 overflow-hidden z-50 flex flex-col shadow-2xl w-full md:w-80"
                >
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-border flex flex-col gap-4 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <Database className="w-4 h-4 text-primary" />
                                    <span>Database Explorer</span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <Icons.X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-4 py-2 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search topics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all shadow-sm"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                            {/* Mode Logic: Tree vs Search Results */}
                            {debouncedQuery ? (
                                // --- SEARCH RESULTS VIEW ---
                                <div className="flex flex-col gap-1">
                                    <div className="text-xs uppercase font-bold text-muted-foreground px-2 py-1 mb-1">
                                        Search Results
                                    </div>
                                    {searchResults.length > 0 ? (
                                        searchResults.map((result) => (
                                            <Link
                                                key={result.id}
                                                href={`/wiki/${result.slug}`}
                                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors group"
                                                onClick={() => {
                                                    if (window.innerWidth < 768) setSidebarOpen(false);
                                                }}
                                            >
                                                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-medium text-foreground truncate">{result.title}</span>
                                                    <span className="text-xs text-muted-foreground truncate opacity-70">
                                                        {result.overview?.slice(0, 50) || "No overview"}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        !isSearching && (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                No matches found.
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                // --- TREE VIEW (LAZY) ---
                                <div className="flex flex-col gap-0.5 pb-10">
                                    <div className="text-xs font-medium text-muted-foreground px-2 py-2 uppercase tracking-wider mb-1 flex items-center justify-between">
                                        <span>Knowledge Graph</span>
                                    </div>

                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="text-xs">Loading hierarchy...</span>
                                        </div>
                                    ) : (
                                        roots.length > 0 ? (
                                            roots.map((node) => (
                                                <TreeItem key={node.id} item={node} />
                                            ))
                                        ) : (
                                            <div className="text-xs text-muted-foreground p-4 text-center italic">
                                                No topics found.
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

