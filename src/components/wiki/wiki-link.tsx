"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface WikiLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href?: string;
}

interface PreviewData {
    title: string;
    overview: string;
    slug: string;
}

export function WikiLink({ href, children, ...props }: WikiLinkProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Only enable for internal wiki links
    const isWikiLink = href && href.startsWith('/wiki/');
    const slug = isWikiLink ? href.split('/wiki/')[1] : null;

    useEffect(() => {
        if (isHovered && slug && !preview && !loading) {
            setLoading(true);
            fetch(`/api/wiki/preview?slug=${slug}`)
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error("Failed");
                })
                .then(data => {
                    setPreview(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                    // Don't retry automatically to avoid loops
                });
        }
    }, [isHovered, slug, preview, loading]);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 500); // 500ms delay before showing
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 300); // Small grace period
    };

    if (!isWikiLink || !href) {
        return <a href={href} {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">{children}</a>;
    }

    return (
        <span
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                href={href}
                className="text-primary hover:bg-primary/10 rounded-sm px-0.5 -mx-0.5 transition-colors font-medium decoration-primary/30 hover:decoration-primary underline underline-offset-4"
                {...props}
            >
                {children}
            </Link>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-popover text-popover-foreground rounded-lg shadow-xl border border-border z-50 pointer-events-none"
                    >
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : preview ? (
                            <div className="text-left">
                                <h4 className="font-serif font-bold text-base mb-1">{preview.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                                    {preview.overview}
                                </p>
                            </div>
                        ) : (
                            // Fallback if data not found
                            <div className="text-xs text-muted-foreground italic text-center">
                                Topic preview unavailable
                            </div>
                        )}
                        {/* Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2 h-2 bg-popover border-r border-b border-border rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}
