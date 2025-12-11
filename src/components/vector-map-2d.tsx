'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/navigation';

interface VectorMap2DProps {
    topics: any[];
    edgesData: any[];
}

export default function VectorMap2D({ topics, edgesData }: VectorMap2DProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const nodes = useMemo(() => topics.map(t => ({ ...t })), [topics]);
    const links = useMemo(() => edgesData.map(e => ({
        source: e.sourceTopicId,
        target: e.targetTopicId,
        ...e
    })), [edgesData]);

    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

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

        svg.call(zoom as any);

        // Links
        const link = g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1.5);

        // Nodes
        const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("g")
            .data(nodes)
            .join("g")
            .style("cursor", "pointer")
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

        node.append("circle")
            .attr("r", 10) // Size could depend on "weight" or connections
            .attr("fill", "#69b3a2");

        node.append("text")
            .text((d: any) => d.title)
            .attr("x", 12)
            .attr("y", 4)
            .attr("fill", "currentColor")
            .style("font-size", "12px")
            .style("fill", "var(--foreground)")
            .style("pointer-events", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [nodes, links, router]);

    return (
        <div ref={containerRef} className="w-full h-full bg-background/50">
            <svg ref={svgRef} className="w-full h-full block" />
        </div>
    );
}
