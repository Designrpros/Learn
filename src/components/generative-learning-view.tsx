"use client";

import { useEffect, useState } from "react";
import { experimental_useObject as useObject, useCompletion } from "@ai-sdk/react";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// --- SKELETONS ---
function SyllabusSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-6 h-6 rounded-full bg-muted/50" />
                    <div className="h-4 bg-muted/50 rounded w-3/4" />
                </div>
            ))}
        </div>
    );
}

function ContentSkeleton() {
    return (
        <div className="space-y-6 animate-pulse mt-8 max-w-3xl">
            <div className="h-8 bg-muted/30 rounded w-2/3 mb-8" />
            <div className="space-y-3">
                <div className="h-4 bg-muted/20 rounded w-full" />
                <div className="h-4 bg-muted/20 rounded w-5/6" />
                <div className="h-4 bg-muted/20 rounded w-4/5" />
            </div>
            <div className="space-y-3 pt-4">
                <div className="h-4 bg-muted/20 rounded w-full" />
                <div className="h-4 bg-muted/20 rounded w-11/12" />
                <div className="h-4 bg-muted/20 rounded w-3/4" />
            </div>
            <div className="h-32 bg-muted/10 rounded mt-6 w-full" />
        </div>
    );
}

// Schema must match the one in API
const syllabusSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    courseOverview: z.string().optional(),
    chapters: z.array(z.object({
        title: z.string().optional(),
        id: z.string().optional(),
        description: z.string().optional(),
    })).optional(),
});

interface GenerativeLearningViewProps {
    topic: string;
}

export function GenerativeLearningView({ topic }: GenerativeLearningViewProps) {
    // Default to 'overview' instead of null
    const [activeChapterId, setActiveChapterId] = useState<string | null>("overview");

    // 1. Generate Syllabus
    const { object: syllabus, submit: loadSyllabus, isLoading: isSyllabusLoading } = useObject({
        api: "/api/generate-syllabus",
        schema: syllabusSchema,
    });

    // 2. Generate Content
    const {
        completion: chapterContent,
        complete: loadChapter,
        isLoading: isChapterLoading,
        error: chapterError
    } = useCompletion({
        api: "/api/generate-chapter",
        streamProtocol: 'text', // match the server's toTextStreamResponse
        onFinish: (prompt, completion) => console.log("[UI] Content Generation Finished", completion.length),
    });

    // Trigger syllabus generation on mount
    useEffect(() => {
        if (!syllabus && topic) {
            loadSyllabus({ topic });
        }
    }, [topic]);

    // No need to auto-start Chapter 1 anymore, we start at 'overview'.
    // User can navigate syllabus manually.

    // Trigger content generation when active chapter changes (if not overview)
    const [lastRequestedChapterId, setLastRequestedChapterId] = useState<string | null>(null);

    useEffect(() => {
        // Only load if NOT overview and we have data
        if (activeChapterId && activeChapterId !== "overview" && syllabus?.chapters) {
            const chapter = syllabus.chapters.find((c) => c?.id === activeChapterId);

            if (chapter?.title && activeChapterId !== lastRequestedChapterId) {
                console.log(`[UI] Requesting content for chapter: ${chapter.title}`);
                setLastRequestedChapterId(activeChapterId);
                loadChapter("", {
                    body: {
                        topic,
                        chapterTitle: chapter.title,
                        chapterSlug: chapter.id, // Pass slug for DB lookup
                        context: JSON.stringify(syllabus)
                    }
                });
            }
        }
    }, [activeChapterId, syllabus, lastRequestedChapterId, topic, loadChapter]);

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Sidebar - Syllabus */}
            <aside className="w-80 border-r border-border bg-card/50 hidden md:flex flex-col h-screen sticky top-0 overflow-y-auto z-10">
                <div className="p-6 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-20">
                    <h2 className="text-xl font-serif font-bold text-primary mb-2 leading-tight">
                        {syllabus?.title || <div className="h-6 bg-muted/50 rounded w-3/4 animate-pulse" />}
                    </h2>
                    <div className="text-sm text-muted-foreground line-clamp-3">
                        {syllabus?.description || <div className="h-4 bg-muted/30 rounded w-full mt-2 animate-pulse" />}
                    </div>
                </div>

                <div className="flex-1 p-4 space-y-2">
                    {/* OVERVIEW BUTTON (Chapter 0) */}
                    <button
                        onClick={() => setActiveChapterId("overview")}
                        className={cn(
                            "w-full text-left px-4 py-3 rounded-md text-sm transition-all duration-200 group flex items-start gap-3 border border-transparent mb-4",
                            activeChapterId === "overview"
                                ? "bg-stone-100 dark:bg-stone-800 text-primary border-border shadow-sm"
                                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        )}
                    >
                        <span className={cn(
                            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs border font-serif italic mt-0.5",
                            activeChapterId === "overview" ? "bg-white dark:bg-stone-900 border-primary/20 text-primary" : "border-border text-muted-foreground/70"
                        )}>
                            i
                        </span>
                        <div>
                            <span className="block font-medium font-serif">Topic Overview</span>
                            <span className="text-xs text-muted-foreground/70 font-sans">Start here</span>
                        </div>
                    </button>

                    <div className="h-px bg-border/50 mx-4 mb-4" />

                    {(!syllabus?.chapters || syllabus.chapters.length === 0) && isSyllabusLoading ? (
                        <SyllabusSkeleton />
                    ) : (
                        syllabus?.chapters?.map((chapter, index) => {
                            if (!chapter?.id || !chapter?.title) return null;

                            const isActive = activeChapterId === chapter.id;
                            return (
                                <button
                                    key={chapter.id}
                                    onClick={() => setActiveChapterId(chapter.id!)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded-md text-sm transition-all duration-200 group flex items-start gap-3 border border-transparent",
                                        isActive
                                            ? "bg-stone-100 dark:bg-stone-800 text-primary border-border shadow-sm"
                                            : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                    )}
                                >
                                    <span className={cn(
                                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs border font-mono mt-0.5",
                                        isActive ? "bg-white dark:bg-stone-900 border-primary/20 text-primary" : "border-border text-muted-foreground/70"
                                    )}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <span className="block font-medium font-serif">{chapter.title}</span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto">
                <div className="max-w-3xl mx-auto p-8 md:p-12 pb-32">
                    {/* Header */}
                    <div className="mb-8">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 block">
                            {activeChapterId === "overview" ? "INTRODUCTION" :
                                syllabus?.chapters && activeChapterId ?
                                    `Chapter ${syllabus.chapters.findIndex(c => c?.id === activeChapterId) + 1}` :
                                    "Peak Learn"}
                        </span>
                    </div>

                    {/* VIEW: OVERVIEW */}
                    {activeChapterId === "overview" ? (
                        <div className="min-h-[50vh]">
                            <motion.div
                                animate={{ opacity: 1 }}
                                className="prose prose-lg prose-stone dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-normal prose-headings:text-primary prose-p:font-sans prose-p:leading-relaxed prose-p:text-stone-600 dark:prose-p:text-stone-300"
                            >
                                <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">
                                    {syllabus?.title || <span className="animate-pulse bg-muted/30 rounded inline-block w-2/3 h-12"></span>}
                                </h1>

                                {syllabus?.courseOverview ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {syllabus.courseOverview}
                                    </ReactMarkdown>
                                ) : (
                                    <div className="space-y-4 animate-pulse">
                                        <div className="h-4 bg-muted/20 rounded w-full" />
                                        <div className="h-4 bg-muted/20 rounded w-5/6" />
                                        <div className="h-4 bg-muted/20 rounded w-full" />
                                        <div className="h-4 bg-muted/20 rounded w-4/5" />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    ) : (
                        /* VIEW: CHAPTER CONTENT (Same as before) */
                        (isChapterLoading || (activeChapterId && !chapterContent && !chapterError)) ? (
                            <ContentSkeleton />
                        ) : (
                            <div className="min-h-[50vh]">
                                {chapterError ? (
                                    <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg text-destructive">
                                        <h3 className="font-bold mb-1">Connection Error</h3>
                                        <p className="text-sm opacity-90">{chapterError.message || "Failed to stream content."}</p>
                                        <button
                                            onClick={() => {
                                                setLastRequestedChapterId(null);
                                                setActiveChapterId(null);
                                                setTimeout(() => activeChapterId && setActiveChapterId(activeChapterId), 10);
                                            }}
                                            className="mt-4 px-3 py-1 bg-background rounded border text-xs hover:bg-accent"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : chapterContent ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="prose prose-lg prose-stone dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-normal prose-headings:text-primary prose-p:font-sans prose-p:leading-relaxed prose-p:text-stone-600 dark:prose-p:text-stone-300 prose-strong:font-medium prose-strong:text-primary prose-pre:bg-stone-100 dark:prose-pre:bg-stone-900 prose-pre:border prose-pre:border-border rounded-lg"
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {chapterContent}
                                        </ReactMarkdown>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                        <div className="w-px h-12 bg-border mb-4" />
                                        <p className="font-serif italic text-lg">{syllabus?.chapters?.length ? "Select a chapter to begin..." : "Initializing..."}</p>
                                    </div>
                                )}

                                {isChapterLoading && chapterContent && (
                                    <span className="inline-block w-1.5 h-4 bg-primary/50 animate-pulse ml-1 align-middle" />
                                )}
                            </div>
                        ))}
                </div>
            </main>
        </div>
    );
}
