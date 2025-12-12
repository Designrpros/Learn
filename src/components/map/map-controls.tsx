"use client";

import { useUIStore } from "@/lib/ui-store";
import { Box, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function MapControls() {
    const { mapViewMode, setMapViewMode, mapSearchTerm, setMapSearchTerm } = useUIStore();

    return (
        <div className="flex flex-col gap-2 mt-2 w-full max-w-xs pointer-events-auto">
            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Filter topics..."
                    value={mapSearchTerm}
                    onChange={(e) => setMapSearchTerm(e.target.value)}
                    className="w-full h-9 pl-3 pr-8 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans placeholder:text-muted-foreground/50"
                />
            </div>

            {/* View Toggles */}
            <div className="flex bg-muted/50 p-1 rounded-lg border border-border w-fit">
                <button
                    onClick={() => setMapViewMode('2d')}
                    className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        mapViewMode === '2d' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Layers className="w-3.5 h-3.5" /> 2D
                </button>
                <button
                    onClick={() => setMapViewMode('3d')}
                    className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        mapViewMode === '3d' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Box className="w-3.5 h-3.5" /> 3D
                </button>
            </div>
        </div>
    );
}
