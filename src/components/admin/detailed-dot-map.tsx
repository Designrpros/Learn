
"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";

const DOT_SIZE = 1.2;
const DOT_SPACING = 3.5; // Controls density. Lower = more dots (Detailed).

// Map Color Palette
const COLOR_BG = "#171717"; // Neutral-900
const COLOR_DOT_BASE = "#525252"; // Neutral-600
const COLOR_DOT_ACTIVE = "#ef4444"; // Red-500

export default function DetailedDotMap() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

    useEffect(() => {
        const fetchMap = async () => {
            // 1. Fetch Topology
            const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json");
            const topology = await response.json();
            const land = topojson.feature(topology, topology.objects.land);

            // 2. Setup Canvas
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;

            // 3. Setup Projection
            const projection = d3.geoEquirectangular()
                .fitSize([width, height], land as any);

            const path = d3.geoPath(projection, ctx);

            // 4. Create Offscreen Canvas for "Hit Testing" (The Script)
            // We draw the map solid black on a temp canvas to know where dots should be.
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext("2d");
            if (!tempCtx) return;

            tempCtx.fillStyle = "#FFFFFF";
            tempCtx.beginPath();
            path.context(tempCtx)(land as any);
            tempCtx.fill();

            // 5. Generate Dots
            const imgData = tempCtx.getImageData(0, 0, width, height).data;
            const dots = [];

            for (let y = 0; y < height; y += DOT_SPACING) {
                for (let x = 0; x < width; x += DOT_SPACING) {
                    const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                    // If Alpha > 0 or Red > 0 (it's white), it's land
                    if (imgData[idx] > 128) {
                        dots.push({ x, y });
                    }
                }
            }

            // 6. Draw Final Map
            ctx.clearRect(0, 0, width, height);

            // Draw Dots
            dots.forEach(dot => {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, DOT_SIZE / 2, 0, 2 * Math.PI);

                // Mock "High Activity" in specific areas
                // (Using coordinate bounding boxes similar to previous map)
                // Normalize x/y to 0-1
                const nx = dot.x / width;
                const ny = dot.y / height;

                let isHot = false;
                if (nx > 0.15 && nx < 0.25 && ny > 0.25 && ny < 0.45) isHot = true; // US East
                if (nx > 0.48 && nx < 0.53 && ny > 0.2 && ny < 0.35) isHot = true; // EU

                ctx.fillStyle = isHot ? COLOR_DOT_ACTIVE : COLOR_DOT_BASE;
                if (isHot) {
                    ctx.globalAlpha = 0.8;
                } else {
                    ctx.globalAlpha = 0.4;
                }
                ctx.fill();
            });

        };

        fetchMap();
    }, []);

    return (
        <div className="w-full aspect-[16/9] bg-neutral-900 border border-neutral-800 rounded-md overflow-hidden relative flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-contain"
            />
            {/* Overlay Labels */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    High Activity
                </div>
            </div>
        </div>
    );
}
