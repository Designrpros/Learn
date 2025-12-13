"use client";

import { useMemo } from "react";
import { WORLD_DOT_GRID } from "@/lib/world-dot-grid";

// Simplified dot coordinates representing rough continents (normalized 0-100)
// This is a stylistic representation suitable for "AI/Tech" aesthetics.
// In a real app, you'd use a GeoJSON to Dot converter, but for this task I'll use a preset pattern.
const DOT_GRID_HEIGHT = WORLD_DOT_GRID.length;
const DOT_GRID_WIDTH = WORLD_DOT_GRID[0].length;

// "Active" regions (simulate traffic)
// format: [x_range_start, x_range_end, y_range_start, y_range_end, intensity]
// Normalized coordinates (0-1)
const ACTIVE_REGIONS = [
    [0.15, 0.25, 0.2, 0.35, 0.8], // USA East
    [0.48, 0.52, 0.2, 0.28, 0.9], // Central Europe
    [0.8, 0.85, 0.2, 0.3, 0.6],   // East Asia
];

function getIntensity(x: number, y: number) {
    const nx = x / DOT_GRID_WIDTH;
    const ny = y / DOT_GRID_HEIGHT;

    for (const [x1, x2, y1, y2, val] of ACTIVE_REGIONS) {
        if (nx >= x1 && nx <= x2 && ny >= y1 && ny <= y2) return val;
    }
    return 0;
}

export default function DotMap() {
    const dots = useMemo(() => {
        const d = [];
        for (let y = 0; y < DOT_GRID_HEIGHT; y++) {
            const row = WORLD_DOT_GRID[y];
            for (let x = 0; x < DOT_GRID_WIDTH; x++) {
                if (row[x] === '1') {
                    d.push({ x, y, intensity: getIntensity(x, y) });
                }
            }
        }
        return d;
    }, []);

    return (
        <div className="w-full h-[400px] bg-neutral-900 border border-neutral-800 rounded-md flex items-center justify-center overflow-hidden relative">
            {/* Grid Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

            <svg viewBox={`0 0 ${DOT_GRID_WIDTH} ${DOT_GRID_HEIGHT}`} className="w-full h-full p-4">
                {dots.map((dot, i) => (
                    <circle
                        key={i}
                        cx={dot.x}
                        cy={dot.y}
                        r={0.25} // Smaller radius for higher resolution
                        className="transition-all duration-500"
                        fill={dot.intensity > 0.5 ? "#ef4444" : dot.intensity > 0 ? "#f87171" : "#525252"}
                        fillOpacity={dot.intensity > 0 ? dot.intensity : 0.6}
                    >
                        {dot.intensity > 0 && (
                            <animate
                                attributeName="opacity"
                                values={`${dot.intensity};${dot.intensity * 0.5};${dot.intensity}`}
                                dur={`${2 + Math.random() * 2}s`}
                                repeatCount="indefinite"
                            />
                        )}
                    </circle>
                ))}
            </svg>

            {/* Overlay Labels */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    High Activity
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-neutral-600" />
                    Low Activity
                </div>
            </div>
        </div>
    );
}
