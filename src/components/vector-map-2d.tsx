'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/ui-store';
import { Minus, Plus, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

import { useThemeDetector } from '@/hooks/use-theme-detector';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapIcon } from '@/components/map-icon';

interface VectorMap2DProps {
    topics: any[];
    edgesData: any[];
}

export default function VectorMap2D({ topics, edgesData }: VectorMap2DProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const isDark = useThemeDetector();

    // UI State
    const { setCenterActions, mapSearchTerm } = useUIStore();
    const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);
    const svgSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

    const nodes = useMemo(() => topics.map(t => ({ ...t })), [topics]);
    const links = useMemo(() => edgesData.map(e => ({
        source: e.sourceTopicId,
        target: e.targetTopicId,
        ...e
    })), [edgesData]);

    // Zoom Handlers
    const handleZoomIn = () => {
        if (svgSelectionRef.current && zoomRef.current) {
            (svgSelectionRef.current.transition().duration(300) as any).call(zoomRef.current.scaleBy, 1.2);
        }
    };

    const handleZoomOut = () => {
        if (svgSelectionRef.current && zoomRef.current) {
            (svgSelectionRef.current.transition().duration(300) as any).call(zoomRef.current.scaleBy, 0.8);
        }
    };

    const handleReset = () => {
        if (svgSelectionRef.current && zoomRef.current) {
            (svgSelectionRef.current.transition().duration(750) as any).call(zoomRef.current.transform, d3.zoomIdentity);
        }
    };

    // Controls in Dock
    useEffect(() => {
        setCenterActions(
            <div className="hidden md:flex items-center gap-2">
                <button
                    onClick={handleZoomOut}
                    className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Zoom Out"
                >
                    <Minus className="w-4 h-4" />
                </button>

                <button
                    onClick={handleReset}
                    className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Reset View"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                    onClick={handleZoomIn}
                    className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Zoom In"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        );
        return () => setCenterActions(null);
    }, []);

    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

        svgSelectionRef.current = svg;
        svg.selectAll("*").remove(); // Clear previous

        const simulation = d3.forceSimulation(nodes as any)
            .force("link", d3.forceLink(links as any).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        // Zoom Group
        const g = svg.append("g");

        const zoom = d3.zoom()
            .scaleExtent([0.1, 8])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        zoomRef.current = zoom as any;
        svg.call(zoom as any);

        // Theme Colors
        const linkColor = isDark ? "#999" : "#a8a29e";
        const nodeStroke = isDark ? "#fff" : "#1c1917"; // White vs Stone-900
        const nodeFill = isDark ? "#69b3a2" : "#0f766e"; // Teal
        const iconColor = isDark ? "#fff" : "#fff"; // White icons on Teal

        // Search Highlighting Colors
        const dimOpacity = 0.1;
        const matchFill = "#d97706"; // Amber

        // Links
        const link = g.append("g")
            .attr("stroke", linkColor)
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1.5)
            .attr("class", "link");

        // Nodes Group
        const node = g.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .style("cursor", "pointer")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", (event, d: any) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d: any) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d: any) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }) as any)
            .on("click", (event, d: any) => {
                const url = `/learn/${d.slug}`;
                router.push(url);
            });

        // Node Circle (Background)
        node.append("circle")
            .attr("r", 20) // Increased size for icon
            .attr("fill", nodeFill)
            .attr("stroke", nodeStroke)
            .attr("stroke-width", 1.5);

        // Icon injection
        node.append("g")
            .attr("transform", "translate(-10, -10)") // Center 20x20 icon
            .attr("color", iconColor) // Cascade color
            .html((d: any) => {
                return renderToStaticMarkup(
                    <MapIcon
                        name={d.icon || "Circle"}
                        size={20}
                        strokeWidth={2}
                    />
                );
            });

        // Title Label
        node.append("text")
            .text((d: any) => d.title)
            .attr("x", 0)
            .attr("y", 32)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", isDark ? "#ffffff" : "#1c1917") // Explicit color
            .style("pointer-events", "none")
            .style("font-weight", "500")
            .style("text-shadow", isDark ? "0px 1px 2px #000" : "none");

        // Use requestAnimationFrame for smoother ticks if possible, but d3 .on("tick") is standard
        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        // Expose simulation for search updates if needed, logic handled in separate effect below

        return () => {
            simulation.stop();
        };
    }, [nodes, links, router, isDark]);

    // Search Effect
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const term = mapSearchTerm.toLowerCase();

        svg.selectAll(".node").style("opacity", (d: any) => {
            if (!term) return 1;
            return d.title.toLowerCase().includes(term) ? 1 : 0.1;
        });

        svg.selectAll(".link").style("opacity", (d: any) => {
            if (!term) return 0.6;
            const sourceMatch = d.source.title?.toLowerCase().includes(term);
            const targetMatch = d.target.title?.toLowerCase().includes(term);
            return (sourceMatch || targetMatch) ? 0.6 : 0.05;
        });

    }, [mapSearchTerm]);


    return (
        <div className="w-full h-full relative group/container font-sans">
            <div ref={containerRef} className="w-full h-full bg-background/50">
                <svg ref={svgRef} className="w-full h-full block" />
            </div>
        </div>
    );
}
