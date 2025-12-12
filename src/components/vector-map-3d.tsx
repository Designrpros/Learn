"use client";

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Float, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
// @ts-ignore
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force-3d';
import { Search, Plus, Minus, RefreshCw, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/ui-store';
import { motion, AnimatePresence } from 'framer-motion';
import { MapIcon } from '@/components/map-icon';

interface Topic {
    id: string;
    title: string;
}

interface Relation {
    sourceTopicId: string;
    targetTopicId: string;
}

interface VectorMap3DProps {
    topics: Topic[];
    edgesData: Relation[];
}

// --- MOUSE FORCE HOOK ---
function MouseForce({ simulation }: { simulation: any }) {
    const { mouse, camera } = useThree();
    const vec = new THREE.Vector3();

    useFrame(() => {
        if (!simulation.current) return;

        vec.set(mouse.x, mouse.y, 0.5);
        vec.unproject(camera);
        vec.sub(camera.position).normalize();
        const distance = -camera.position.z / vec.z;
        const targetPos = camera.position.clone().add(vec.multiplyScalar(distance));

        const nodes = simulation.current.nodes();
        const repulsionRadius = 20;
        const forceStrength = 5;

        nodes.forEach((node: any) => {
            const dx = node.x - targetPos.x;
            const dy = node.y - targetPos.y;
            const dz = node.z - targetPos.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < repulsionRadius) {
                const force = (repulsionRadius - dist) / repulsionRadius * forceStrength;
                node.vx += (dx / dist) * force;
                node.vy += (dy / dist) * force;
                node.vz += (dz / dist) * force;
            }
        });

        simulation.current.alpha(0.3).restart();
    });

    return null;
}

// --- UI OVERLAY COMPONENT (INSIDE CANVAS) ---
function MapOverlay({
    selectedNode,
    setSelectedNode,
    onOpenTopic
}: {
    selectedNode: any;
    setSelectedNode: (n: any) => void;
    onOpenTopic: () => void;
}) {
    const { camera } = useThree();
    // @ts-ignore
    const controls = useThree((state) => state.controls);
    const { setCenterActions } = useUIStore();

    // Zoom Handlers
    const handleZoomIn = () => {
        camera.position.multiplyScalar(0.8);
        camera.updateProjectionMatrix();
    };

    const handleZoomOut = () => {
        camera.position.multiplyScalar(1.2);
        camera.updateProjectionMatrix();
    };

    const handleReset = () => {
        if (controls) {
            (controls as any).reset();
        }
        setSelectedNode(null);
    };

    // Push Controls to Global Dock
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

        // Cleanup actions on unmount
        return () => setCenterActions(null);
    }, [camera, controls]); // Re-run if camera/controls change (though stable)

    return (
        <Html fullscreen className="pointer-events-none">
            <div className="w-full h-full relative p-6">
                {/* Selected Node Card - Bottom Left */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="absolute bottom-24 left-4 md:left-8 pointer-events-auto"
                        >
                            <div className="w-80 bg-background/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-serif text-xl font-semibold leading-tight text-foreground">{selectedNode.title}</h3>
                                            <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                Topic
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedNode(null)} className="p-1 rounded-full hover:bg-muted transition-colors">
                                            <X className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={onOpenTopic}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background text-sm font-semibold rounded-xl hover:bg-foreground/90 transition-transform active:scale-95"
                                        >
                                            <ExternalLink className="w-4 h-4" /> Open Topic
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Html>
    );
}

// --- SCENE COMPONENT ---
function GraphScene({
    topics,
    edgesData,
    searchTerm,
    onNodeSelect,
    selectedNodeId,
    isDark
}: VectorMap3DProps & {
    searchTerm: string,
    onNodeSelect: (node: any) => void,
    selectedNodeId: string | null,
    isDark: boolean
}) {
    const router = useRouter();
    // Use state only for the *list* of nodes/links, not their positions
    const [nodes, setNodes] = useState<any[]>([]);
    const [links, setLinks] = useState<any[]>([]);

    // Refs for direct manipulation
    const nodeRefs = useRef<(THREE.Group | null)[]>([]);
    const linkRefs = useRef<(any | null)[]>([]);
    const simulation = useRef<any>(null);

    // Initialize Data
    useMemo(() => {
        const d3Nodes = topics.map(t => ({
            ...t,
            x: (Math.random() - 0.5) * 50,
            y: (Math.random() - 0.5) * 50,
            z: (Math.random() - 0.5) * 50
        }));
        const d3Links = edgesData.map(e => ({ source: e.sourceTopicId, target: e.targetTopicId }));

        setNodes(d3Nodes);
        setLinks(d3Links);

        // Reset refs array when data changes
        nodeRefs.current = new Array(d3Nodes.length).fill(null);
        linkRefs.current = new Array(d3Links.length).fill(null);
    }, [topics, edgesData]);

    // Setup Simulation
    useEffect(() => {
        if (nodes.length === 0) return;

        simulation.current = forceSimulation(nodes)
            .numDimensions(3)
            .force('link', forceLink(links).id((d: any) => d.id).distance(60))
            .force('charge', forceManyBody().strength(-150))
            .force('center', forceCenter(0, 0, 0));

        // No auto-restart here, we rely on the loop or interaction
        simulation.current.active = true;

        return () => simulation.current?.stop();
    }, [nodes, links]);

    // Animation Loop: Imperative Updates
    useFrame(() => {
        if (!simulation.current) return;

        // Advance physics
        simulation.current.tick();

        // Update Nodes
        nodes.forEach((node, i) => {
            const ref = nodeRefs.current[i];
            if (ref) {
                ref.position.set(node.x || 0, node.y || 0, node.z || 0);
            }
        });

        // Update Links
        links.forEach((link, i) => {
            const ref = linkRefs.current[i];
            const start = link.source as any;
            const end = link.target as any;

            if (ref && typeof start === 'object' && typeof end === 'object') {
                // Optimization: Only update lines if we have a ref to a standard THREE.Line
                // and update its geometry.attributes.position.
            }
        });
    });

    const handleOpenTopic = () => {
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node) {
            router.push(`/learn/${encodeURIComponent(node.title)}`);
        }
    };

    // Helper to get selected node object for UI
    const selectedNodeObj = nodes.find(n => n.id === selectedNodeId);

    // Theme Colors
    const textColor = isDark ? "#ffffff" : "#1c1917"; // Stone-900 for Light
    const matchColor = isDark ? "#fbbf24" : "#d97706"; // Amber-400 (Dark) / Amber-600 (Light)
    const highlightColor = "#ef4444"; // Red-500
    const defaultColor = isDark ? "#D4AF37" : "#0f766e"; // Gold (Dark) / Teal-700 (Light)
    const dimColor = isDark ? "#555" : "#a8a29e"; // Stone-500 (Light)

    return (
        <group>
            <MouseForce simulation={simulation} />

            <MapOverlay
                selectedNode={selectedNodeObj}
                setSelectedNode={(n) => onNodeSelect(n || null)}
                onOpenTopic={handleOpenTopic}
            />

            {/* Nodes */}
            {nodes.map((node, i) => {
                const isMatch = searchTerm && node.title.toLowerCase().includes(searchTerm.toLowerCase());
                const isSelected = selectedNodeId === node.id;
                const isDimmed = (searchTerm && !isMatch) || (selectedNodeId && !isSelected);

                const color = isSelected ? highlightColor : (isMatch ? matchColor : defaultColor);
                // Increased visual scale for icons
                const scale = isSelected ? 4 : (isMatch ? 3.5 : 2.5);

                return (
                    <group
                        key={i}
                        ref={(el) => { nodeRefs.current[i] = el; }}
                        // Initial position
                        position={[node.x || 0, node.y || 0, node.z || 0]}
                    >
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <Billboard>
                                {/* Icon Container - HTML Overlay ensures crisp vectors */}
                                <Html
                                    transform
                                    occlude
                                    position={[0, 1.5, 0]} // Float above text center
                                    style={{
                                        pointerEvents: 'none',
                                        display: isDimmed ? 'none' : 'flex', // Hide dimmed icons for performance/focus
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: color
                                    }}
                                >
                                    <div className="flex items-center justify-center w-8 h-8">
                                        <MapIcon name={node.icon || "Circle"} className="w-full h-full drop-shadow-md" strokeWidth={2} />
                                    </div>
                                </Html>

                                <Text
                                    position={[0, -0.5, 0]} // Shift text down
                                    fontSize={scale * 0.5} // Text relative to node
                                    color={color}
                                    anchorX="center"
                                    anchorY="top"
                                    fillOpacity={isDimmed ? 0.2 : 1}
                                    outlineWidth={isDark ? 0.05 : 0.02}
                                    outlineColor={isDark ? "#000" : "#fff"}
                                    outlineOpacity={0.5}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNodeSelect(node);
                                    }}
                                    onPointerOver={() => { document.body.style.cursor = 'pointer' }}
                                    onPointerOut={() => { document.body.style.cursor = 'auto' }}
                                >
                                    {node.title}
                                </Text>
                            </Billboard>
                        </Float>
                    </group>
                );
            })}

            <LinkSet links={links} nodes={nodes} searchTerm={searchTerm} isDark={isDark} />
        </group>
    );
}

// Optimization: Separate component for Lines to handle geometry updates?
// Or just a simple functional one that re-renders?
// If we want 60fps lines, we can't re-render. using <line> with ref update.
// Optimization: Single draw-call LineSegments
// Optimization: Single draw-call LineSegments
function LinkSet({ links, nodes, searchTerm, isDark }: { links: any[], nodes: any[], searchTerm: string, isDark: boolean }) {
    const linesRef = useRef<THREE.LineSegments>(null);
    const geometryRef = useRef<THREE.BufferGeometry>(null);

    // Initialize/Update Geometry Size
    useEffect(() => {
        if (!geometryRef.current) return;

        // 2 points per link, 3 floats (x,y,z) per point = 6 floats per link
        const count = links.length * 6;
        if (geometryRef.current.attributes.position?.count !== count / 3) {
            geometryRef.current.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(count), 3)
            );
        }
    }, [links]);

    useFrame(() => {
        const geometry = geometryRef.current;
        if (!geometry || !links.length || !geometry.attributes.position) return;

        const positions = geometry.attributes.position.array as Float32Array;
        let p = 0;

        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const start = link.source;
            const end = link.target;

            // D3 replaces ID with Object after simulation starts
            if (start && end && typeof start === 'object' && typeof end === 'object') {
                positions[p++] = start.x || 0;
                positions[p++] = start.y || 0;
                positions[p++] = start.z || 0;

                positions[p++] = end.x || 0;
                positions[p++] = end.y || 0;
                positions[p++] = end.z || 0;
            } else {
                // Zero out invalid lines
                p += 6;
            }
        }

        geometry.attributes.position.needsUpdate = true;
    });

    const lineColor = isDark ? (searchTerm ? "#555" : "#78716c") : (searchTerm ? "#d6d3d1" : "#a8a29e");

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry ref={geometryRef} />
            <lineBasicMaterial
                color={lineColor}
                opacity={searchTerm ? 0.1 : 0.2}
                transparent
                linewidth={1}
            />
        </lineSegments>
    );
}

import { useThemeDetector } from '@/hooks/use-theme-detector';

// ... (imports remain)

// ... (GraphScene definition remains)

export default function VectorMap3D(props: VectorMap3DProps) {
    const { mapSearchTerm } = useUIStore();
    const [selectedNode, setSelectedNode] = useState<any | null>(null);
    const isDark = useThemeDetector();

    const handleNodeSelect = (node: any) => {
        setSelectedNode(node);
    };

    // Theme Colors
    const fogColor = isDark ? '#000000' : '#f5f5f4'; // Stone-100 for Light
    const lightColor = isDark ? '#ffffff' : '#0c0a09'; // Stone-950 for Light
    // Note: GraphScene needs to know about theme to color nodes/text. We should pass isDark prop.

    return (
        <div className="w-full h-full relative group/container font-sans">
            <Canvas camera={{ position: [0, 0, 100], fov: 60 }} gl={{ alpha: true }} onClick={() => setSelectedNode(null)}>
                <fog attach="fog" args={[fogColor, 50, 180]} />
                <ambientLight intensity={1.5} />
                <pointLight position={[50, 50, 50]} intensity={2} color={lightColor} />

                <GraphScene
                    {...props}
                    searchTerm={mapSearchTerm}
                    onNodeSelect={handleNodeSelect}
                    selectedNodeId={selectedNode?.id}
                    isDark={isDark}
                />

                <OrbitControls
                    makeDefault
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    autoRotate={!mapSearchTerm && !selectedNode}
                    autoRotateSpeed={0.5}
                    dampingFactor={0.05}
                />
            </Canvas>
        </div>
    );
}
