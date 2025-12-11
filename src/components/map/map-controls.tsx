"use client";

import { useUIStore } from "@/lib/ui-store";
import { Box, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function MapControls() {
    const { mapViewMode, setMapViewMode } = useUIStore();

    return (
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border pointer-events-auto mt-2 w-fit">
            <button
                onClick={() => setMapViewMode('3d')}
                className={cn(
                    "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    mapViewMode === '3d' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Box className="w-3.5 h-3.5" /> 3D
            </button>
            <button
                onClick={() => setMapViewMode('2d')}
                className={cn(
                    "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    mapViewMode === '2d' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Layers className="w-3.5 h-3.5" /> 2D
            </button>
        </div>
    );
}
