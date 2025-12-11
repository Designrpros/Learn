"use client";

import { cn } from "@/lib/utils";
import { Image as ImageIcon, Maximize2, X } from "lucide-react";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface WikiImageGridProps {
    images?: string[];
    className?: string;
}

export function WikiImageGrid({ images = [], className }: WikiImageGridProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // If no images (or empty array), don't render anything
    if (!images || images.length === 0) return null;

    return (
        <>
            <div className={cn("w-full mb-8 relative group", className)}>
                {/* Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                    {images.map((src, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedImage(src)}
                            className="flex-shrink-0 w-64 h-40 rounded-xl overflow-hidden border border-border/50 relative cursor-zoom-in snap-center hover:shadow-lg transition-all group/item bg-muted/20"
                        >
                            {/* Just use img for now, or Next/Image if domains configured. 
                                Using img for flexibility with external URLs. 
                            */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={src}
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                            />

                            <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />

                            <div className="absolute bottom-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <span className="bg-black/50 text-white p-1.5 rounded-md backdrop-blur-sm block">
                                    <Maximize2 className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Placeholder / Upload Hint if we were to adding styling for "Add more" */}
                </div>

                {/* Fade indicators for scrolling */}
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-4 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            </div>

            {/* Lightbox / Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
                    >
                        <button
                            className="absolute top-4 right-4 p-2 bg-muted/50 hover:bg-muted rounded-full transition-colors z-50 text-foreground"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Allow clicking image without closing? Actually clicking background closes.
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={selectedImage}
                                alt="Full size"
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
