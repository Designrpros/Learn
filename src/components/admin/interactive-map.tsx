
"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";

const DOT_SIZE = 1.3;
const DOT_SPACING = 4;

const COLOR_BG = "transparent";
const COLOR_DOT_BASE = "#404040"; // Neutral-700
const COLOR_DOT_HOVER = "#ffffff"; // White
const COLOR_DOT_ACTIVE = "#10b981"; // Emerald-500
const COLOR_DOT_ACTIVE_HOVER = "#34d399"; // Emerald-400

interface InteractiveMapProps {
    selectedIds: string[]; // ISO Numeric Codes (e.g. "840" for US)
    onToggleRegion: (id: string, name: string) => void;
    onDataLoaded?: (countries: { id: string; name: string }[]) => void;
}

export default function InteractiveMap({ selectedIds, onToggleRegion, onDataLoaded }: InteractiveMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [topologyData, setTopologyData] = useState<any>(null);
    const [features, setFeatures] = useState<any[]>([]);

    // Mouse Interaction State
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // 1. Load Data
    useEffect(() => {
        const fetchMap = async () => {
            try {
                const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
                const topology = await response.json();
                const land = topojson.feature(topology, topology.objects.land);
                // Force IDs to strings immediately
                const countryFeatures = topojson.feature(topology, topology.objects.countries).features.map((f: any) => ({
                    ...f,
                    id: String(f.id)
                }));

                setTopologyData(land);
                setFeatures(countryFeatures);

                // Notify parent of available countries for "Select All" logic
                if (onDataLoaded) {
                    onDataLoaded(countryFeatures.map((f: any) => ({
                        id: String(f.id),
                        name: f.properties.name
                    })));
                }
            } catch (e) {
                console.error("Failed to load map data", e);
            }
        };
        fetchMap();
    }, [onDataLoaded]);

    // 2. Render & Interaction Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !topologyData) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Auto-Resize
        const width = container.clientWidth || 800;
        const height = width * 0.6; // Aspect Ratio
        if (canvas.width !== width) {
            canvas.width = width;
            canvas.height = height;
        }

        // Projection
        const projection = d3.geoEquirectangular().fitSize([width, height], topologyData);
        const path = d3.geoPath(projection, ctx);

        // --- REAL-TIME INTERACTION ---
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            // Handle scaling if CSS size differs from Canvas actual size
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            // Invert to GeoCoords
            const coords = projection.invert?.([x, y]);
            if (!coords) return;

            // Find feature containing coords
            // Note: d3.geoContains can be slow, but for 110m it's usually acceptable (~177 features)
            const found = features.find(f => d3.geoContains(f, coords));
            if (found) {
                setHoveredId(String(found.id)); // Ensure ID is string
                canvas.style.cursor = 'pointer';
            } else {
                setHoveredId(null);
                canvas.style.cursor = 'default';
            }
        };

        const handleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            const coords = projection.invert?.([x, y]);
            if (!coords) return;

            const found = features.find(f => d3.geoContains(f, coords));
            if (found) {
                onToggleRegion(String(found.id), found.properties.name); // Ensure ID is string
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);


        // --- DRAW LOOP ---
        // Pre-render map to offscreen canvas to "scan" for land
        const lookupCanvas = document.createElement('canvas');
        lookupCanvas.width = width;
        lookupCanvas.height = height;
        const lookupCtx = lookupCanvas.getContext('2d', { willReadFrequently: true });

        if (lookupCtx) {
            lookupCtx.fillStyle = '#000000';
            lookupCtx.fillRect(0, 0, width, height);
            lookupCtx.fillStyle = '#FFFFFF'; // Land is white
            const lookupPath = d3.geoPath(projection, lookupCtx);
            lookupPath(topologyData);
            lookupCtx.fill();

            const imgData = lookupCtx.getImageData(0, 0, width, height).data;

            // Clear
            ctx.clearRect(0, 0, width, height);

            // Helper to draw a batch of dots
            const drawDotBatch = (color: string, clipFeature?: any) => {
                ctx.save();
                ctx.fillStyle = color;

                if (clipFeature) {
                    ctx.beginPath();
                    path(clipFeature); // Draws path to ctx
                    ctx.clip(); // Clips to current path
                }

                for (let y = 0; y < height; y += DOT_SPACING) {
                    for (let x = 0; x < width; x += DOT_SPACING) {
                        const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                        if (imgData[idx] > 100) { // Land
                            ctx.beginPath();
                            ctx.arc(x, y, DOT_SIZE / 2, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    }
                }
                ctx.restore();
            }

            // 1. Draw All Dots Base
            drawDotBatch(COLOR_DOT_BASE);

            // 2. Highlighting Strategy:
            // Since we can't easily associate every single dot with a country ID without an expensive lookup map,
            // We use the "Clipping" strategy.
            // We redraw the DOTS grid, but clipped to the specific country features that are active.

            // Draw Selected
            selectedIds.forEach(id => {
                const feature = features.find(f => String(f.id) === id); // Ensure comparison is string to string
                if (feature) {
                    ctx.save();
                    ctx.beginPath();
                    path(feature);
                    ctx.clip();

                    ctx.fillStyle = COLOR_DOT_ACTIVE;
                    // Redraw dots in this region
                    // Optimization: Only scan bounding box of feature?
                    // For now, fullscan is "okay" if country count is low.
                    // To optimize, strictly we'd scan only the bounds.
                    const bounds = path.bounds(feature);
                    const [x0, y0] = bounds[0];
                    const [x1, y1] = bounds[1];

                    for (let y = Math.floor(y0); y < y1; y += DOT_SPACING) {
                        for (let x = Math.floor(x0); x < x1; x += DOT_SPACING) {
                            const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                            if (imgData[idx] > 100) {
                                ctx.beginPath();
                                ctx.arc(x, y, DOT_SIZE / 2, 0, 2 * Math.PI);
                                ctx.fill();
                            }
                        }
                    }
                    ctx.restore();
                }
            });

            // Draw Hovered
            if (hoveredId && !selectedIds.includes(hoveredId)) {
                const feature = features.find(f => String(f.id) === hoveredId); // Ensure comparison is string to string
                if (feature) {
                    ctx.save();
                    ctx.beginPath();
                    path(feature);
                    ctx.clip();
                    ctx.fillStyle = COLOR_DOT_HOVER;

                    const bounds = path.bounds(feature);
                    const [x0, y0] = bounds[0];
                    const [x1, y1] = bounds[1];

                    for (let y = Math.floor(y0); y < y1; y += DOT_SPACING) {
                        for (let x = Math.floor(x0); x < x1; x += DOT_SPACING) {
                            const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
                            if (imgData[idx] > 100) {
                                ctx.beginPath();
                                ctx.arc(x, y, DOT_SIZE / 2, 0, 2 * Math.PI);
                                ctx.fill();
                            }
                        }
                    }
                    ctx.restore();
                }
            }
        }

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
        }

    }, [topologyData, features, selectedIds, hoveredId, onToggleRegion]);

    return (
        <div ref={containerRef} className="w-full relative bg-neutral-900/50 rounded-lg border border-neutral-800 overflow-hidden">
            <canvas ref={canvasRef} className="block w-full" />

            {/* Legend / Tooltip could go here */}
            {hoveredId && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none">
                    {features.find(f => f.id === hoveredId)?.properties.name}
                </div>
            )}
        </div>
    );
}
