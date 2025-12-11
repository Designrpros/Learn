"use client";

import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { Sidebar, Activity, House, Map as MapIcon, BookOpen, Layers } from "lucide-react";
import Link from "next/link";

export function BottomDock() {
    const { isSidebarOpen, setSidebarOpen, isInspectorOpen, setInspectorOpen, centerActions } = useUIStore();

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-background/80 backdrop-blur-xl border border-border rounded-full shadow-2xl px-4 py-2 flex items-center gap-4 h-14">

                {/* Left: Sidebar Toggle */}
                <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className={cn(
                        "p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                        isSidebarOpen && "bg-muted text-foreground"
                    )}
                >
                    <Sidebar className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-border/50" />

                {/* Center: Main Navigation & Dynamic Actions */}
                <div className="flex items-center gap-2">

                    {/* Group 1: Explore */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/" className="p-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full transition-all" title="Home">
                            <House className="w-5 h-5" />
                        </Link>
                        <Link href="/map" className="p-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full transition-all" title="Map">
                            <MapIcon className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Dynamic Actions (Center) */}
                    <div className="flex items-center gap-2 px-2">
                        {centerActions && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                                {centerActions}
                            </div>
                        )}
                    </div>

                    {/* Group 2: Knowledge */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/forum" className="p-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full transition-all" title="Forum">
                            <BookOpen className="w-5 h-5" />
                        </Link>
                        <Link href="/wiki" className="p-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full transition-all" title="Wiki">
                            <Layers className="w-5 h-5" />
                        </Link>
                    </div>

                </div>

                <div className="w-px h-6 bg-border/50" />

                {/* Right: Inspector Toggle */}
                <button
                    onClick={() => setInspectorOpen(!isInspectorOpen)}
                    className={cn(
                        "p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative",
                        isInspectorOpen && "bg-muted text-foreground"
                    )}
                >
                    <Activity className="w-5 h-5" />
                </button>
            </div>


        </>
    );
}
