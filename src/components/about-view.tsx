"use client";

import { motion } from "framer-motion";
import { X, Heart, Coffee } from "lucide-react";
import Image from "next/image";

interface AboutViewProps {
    onClose: () => void;
}

export function AboutView({ onClose }: AboutViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="flex flex-col items-center text-center p-8 space-y-6">
                    {/* Brand Logo */}
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-border/50">
                        <Image
                            src="/wikits.png"
                            alt="Wikits Logo"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-serif font-medium text-foreground">Wikits</h2>
                        <p className="text-muted-foreground text-sm font-light max-w-xs mx-auto">
                            Master any topic with AI-generated interactive syllabi and community-driven knowledge.
                        </p>
                    </div>

                    <div className="w-full h-px bg-border/50" />

                    <div className="space-y-4 w-full">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Support the Project
                        </p>

                        <a
                            href="https://buymeacoffee.com/Alcatelz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-3 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-medium rounded-xl transition-all hover:scale-[1.02] shadow-sm group"
                        >
                            <Coffee className="w-5 h-5" />
                            <span>Buy me a coffee</span>
                        </a>

                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60 pt-2">
                            <span>Built with</span>
                            <Heart className="w-3 h-3 text-red-500 fill-red-500/20" />
                            <span>by Alcatelz</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
