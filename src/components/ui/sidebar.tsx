"use client";

import { useUIStore } from '@/lib/ui-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ChevronDown, Database, Hash } from 'lucide-react';
import * as Icons from 'lucide-react'; // Dynamic icon loading
import { useState, useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Recursive Tree Component
const TreeItem = ({ item, level = 0 }: { item: any, level?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    // Resolve Dynamic Icon
    const IconComponent = item.icon && (Icons as any)[item.icon] ? (Icons as any)[item.icon] : (hasChildren ? Icons.LayoutGrid : Icons.Hash);

    return (
        <div className="select-none text-foreground/80">
            <div
                className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors group text-sm",
                    level > 0 && "ml-3"
                )}
            >
                {/* Arrow / Spacer - EXCLUSIVE TOGGLE CLICK */}
                <div
                    className="w-5 h-5 flex items-center justify-center shrink-0 text-muted-foreground/70 cursor-pointer hover:bg-muted rounded text-foreground transition-colors"
                    onClick={(e) => {
                        if (hasChildren) {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }
                    }}
                >
                    {hasChildren && (
                        isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                    )}
                </div>

                {/* Icon - Visual Only */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0 text-muted-foreground/80">
                    <IconComponent className="w-4 h-4" />
                </div>

                {/* Link or Text - EXCLUSIVE NAVIGATION */}
                <Link
                    href={`/wiki/${item.slug}`}
                    className="flex-1 truncate group-hover:text-primary transition-colors font-medium cursor-pointer"
                >
                    {item.title}
                </Link>
            </div>

            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-l border-border/40 ml-3.5 pl-1"
                    >
                        {item.children.map((child: any) => (
                            <TreeItem key={child.id} item={child} level={level + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Function to recursively filter tree based on mode and creatorId
const filterTree = (nodes: any[], mode: 'global' | 'personal', currentUserId: string): any[] => {
    if (mode === 'global') return nodes;

    return nodes.reduce((filtered, node) => {
        // Check if current node is user-owned
        const isUserOwned = node.creatorId === currentUserId;

        // Recursively filter children
        const filteredChildren = node.children && node.children.length > 0
            ? filterTree(node.children, mode, currentUserId)
            : [];

        // Keep node if:
        // 1. It is user owned
        // 2. OR it has children that are user owned (path to content)
        // 3. OR it is a "System" stub but we are in Personal mode? 
        //    (Maybe we only show what user created? Strict mode.)
        //    Let's go with "Show user content and path to it".

        if (isUserOwned || filteredChildren.length > 0) {
            filtered.push({ ...node, children: filteredChildren });
        }

        return filtered;
    }, []);
};

export function Sidebar() {
    const { isSidebarOpen, databaseViewMode, setDatabaseViewMode } = useUIStore();
    const [treeData, setTreeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Simulated auth
    const currentUserId = "user_2qD5DQ5D5Q5D5Q5D5D5D5D5D5";

    // Fetch Hierarchy with Polling (Real-Time)
    useEffect(() => {
        let isMounted = true;

        async function fetchTree() {
            try {
                // Pass mode if we want server filtering later, but for now filtering is client-side
                const res = await fetch(`/api/topics/tree?mode=${databaseViewMode}`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        // Optimization: stringify comparison to avoid spamming state updates?
                        // For now, React's diffing is fast enough for this tree size.
                        setTreeData(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load topic tree", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        // Initial Fetch
        fetchTree();

        // Poll every 5 seconds to catch new sub-concepts (e.g. "Batting" appearing under "Cricket")
        const interval = setInterval(fetchTree, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [databaseViewMode]);

    const filteredData = filterTree(treeData, databaseViewMode, currentUserId);

    // Further filter by search query if needed
    // ...

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
                                {/* Close Button (Mobile/Desktop) */}
                                <button
                                    onClick={() => useUIStore.getState().setSidebarOpen(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <Icons.X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex bg-muted/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setDatabaseViewMode('personal')}
                                    className={cn(
                                        "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                        databaseViewMode === 'personal'
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground/80"
                                    )}
                                >
                                    Personal
                                </button>
                                <button
                                    onClick={() => setDatabaseViewMode('global')}
                                    className={cn(
                                        "flex-1 text-xs font-medium py-1.5 rounded-md transition-all",
                                        databaseViewMode === 'global'
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground/80"
                                    )}
                                >
                                    Global
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-4 py-2 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Filter topics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Tree View */}
                        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                            <div className="text-xs font-medium text-muted-foreground px-2 py-2 uppercase tracking-wider mb-1 flex items-center justify-between">
                                <span>{databaseViewMode === 'personal' ? 'My Knowledge' : 'Global Graph'}</span>
                            </div>

                            {loading ? (
                                <div className="text-xs text-muted-foreground p-4 text-center animate-pulse">Loading hierarchy...</div>
                            ) : (
                                <div className="flex flex-col gap-0.5 pb-10">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((node) => (
                                            <TreeItem key={node.id} item={node} />
                                        ))
                                    ) : (
                                        <div className="text-xs text-muted-foreground p-4 text-center italic">
                                            {databaseViewMode === 'personal'
                                                ? "No personal topics found. Generate something!"
                                                : "No topics found."}
                                        </div>
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
