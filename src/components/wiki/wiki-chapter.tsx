"use client";

import { useGenerationStore } from "@/lib/generation-store";
import { ChevronDown, ChevronRight, Sparkles, Loader2, Copy, Image as ImageIcon, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { WikiLink } from "./wiki-link";
import { WikiImageGrid } from "./wiki-image-grid";
import React, { useEffect } from "react";

interface WikiChapterProps {
    chapter: {
        id: string;
        title: string;
        slug: string;
        content?: string | null;
        description?: string | null;
    };
    topicId: string;
    index: number;
}

export function WikiChapter({ chapter, topicId, index }: WikiChapterProps) {
    const { activeJob, startJob } = useGenerationStore();
    // Use local content to bridge stream gap
    const [localContent, setLocalContent] = React.useState<string | null | undefined>(chapter.content);

    // Accordion State: Open if content exists, Closed otherwise
    // User Update: Collapsed by default
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [justCopied, setJustCopied] = React.useState(false);

    // Sync local content with DB content when it changes
    useEffect(() => {
        if (chapter.content) {
            setLocalContent(chapter.content);
            // If content arrives (e.g. from background gen), allow it to stay as user preference, 
            // OR auto-open? Let's respect user interaction but maybe auto-open if we just generated it?
        }
    }, [chapter.content]);

    // Check if THIS chapter is the one being generated
    // CRITICAL FIX: Only consider it "generating" if status is actually 'generating'
    const isGenerating = activeJob?.topicId === topicId &&
        activeJob?.chapterId === chapter.id &&
        activeJob?.status === 'generating';

    // Sync local content with Streaming Content
    useEffect(() => {
        // Even if status is 'completed' or 'failed', we might want to sync the final content once more
        // But the main streaming sync relies on 'content' update
        if (activeJob?.topicId === topicId && activeJob?.chapterId === chapter.id && activeJob?.content) {
            setLocalContent(activeJob.content);
            if (!isOpen && activeJob.status === 'generating') setIsOpen(true); // Auto-open when generation starts
        }
    }, [activeJob, topicId, chapter.id, isOpen]); // Depend on full activeJob object to catch status changes

    const handleGenerate = () => {
        startJob({
            type: 'chapter',
            topicId,
            chapterId: chapter.id
        });
    };

    const toggleOpen = () => {
        if (isOpen) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
            // AUTO TRIGGER GENERATION ON OPEN if empty
            if (!localContent && !isGenerating) {
                handleGenerate();
            }
        }
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent accordion toggle
        if (localContent) {
            navigator.clipboard.writeText(localContent);
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000);
        }
    };

    // Local images state (merged with DB images)
    const [localImages, setLocalImages] = React.useState<string[]>(
        (chapter.images as string[]) || []
    );
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // ... existing copy handler ...

    const handleUploadClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview URL
        const objectUrl = URL.createObjectURL(file);

        // Update local state to show immediately in the grid (Top)
        setLocalImages(prev => [objectUrl, ...prev]);

        // In a real app, we would upload 'file' to a server here and then save the returned URL to DB.
        // For now, this preview persists only for the session.
    };

    return (
        <section id={chapter.slug} className="scroll-mt-32 border-b border-border/40 pb-8 last:border-0">
            {/* Header / Trigger */}
            <div
                onClick={toggleOpen}
                className="flex items-start gap-4 cursor-pointer group select-none transition-colors hover:text-primary relative"
            >
                <div className="pt-1 text-muted-foreground group-hover:text-primary transition-colors">
                    {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-4 mb-2">
                            <span className="text-sm font-bold text-muted-foreground/30 font-mono">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <h2 className="text-xl font-serif font-medium group-hover:text-primary transition-colors">
                                {chapter.title}
                            </h2>
                        </div>

                        {/* Action Buttons (Visible on Hover or Open) */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                            {localContent && (
                                <>
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                        title="Copy Content"
                                    >
                                        {justCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={handleUploadClick}
                                        className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                        title="Upload Image"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                    {/* Hidden Input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description Teaser (Visible when closed relative to header? Or just always?) 
                        User asked: "closed by default with that short description". 
                    */}
                    {!isOpen && chapter.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mt-2 pl-[3.25rem]">
                            {chapter.description}
                        </p>
                    )}
                </div>

                {/* Status Indicator */}
                <div className="pt-1">
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                        !localContent && <Sparkles className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50" />
                    )}
                </div>
            </div>



            {/* Content Body */}
            {isOpen && (
                <div className="pl-[3.25rem] mt-6">
                    {/* Chapter Images */}
                    <WikiImageGrid images={localImages} className="mb-6" />

                    {localContent ? (
                        <article className={cn(
                            "prose prose-stone dark:prose-invert max-w-none prose-lg prose-p:leading-loose prose-p:mb-6 prose-headings:font-serif prose-headings:mt-8 prose-headings:mb-4",
                            // Fade in
                            isGenerating && "opacity-80 transition-opacity duration-300"
                        )}>
                            <ReactMarkdown
                                components={{
                                    a: WikiLink as any,
                                    // Custom paragraph to allow future hover/comment logic
                                    p: ({ node, ...props }) => (
                                        <p {...props} className="mb-6 leading-relaxed hover:bg-muted/5 rounded-lg px-2 -mx-2 transition-colors relative group/p">
                                            {props.children}
                                            {/* Potential for paragraph-level actions here */}
                                        </p>
                                    )
                                }}
                            >
                                {localContent}
                            </ReactMarkdown>
                            {isGenerating && (
                                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle" />
                            )}
                        </article>
                    ) : (
                        // Loading State (Auto-Triggered, so this might be brief)
                        <div className="flex items-center gap-2 text-sm text-muted-foreground italic animate-pulse">
                            <Sparkles className="w-4 h-4" />
                            Generating content...
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
