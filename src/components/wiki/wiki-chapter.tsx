"use client";

import { useGenerationStore } from "@/lib/generation-store";
import { ChevronDown, ChevronRight, Sparkles, Loader2, Copy, Image as ImageIcon, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { WikiLink } from "./wiki-link";
import { WikiImageGrid } from "./wiki-image-grid";
import React, { useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

interface WikiChapterProps {
    chapter: {
        id: string;
        title: string;
        slug: string;
        content?: string | null;
        description?: string | null;
        images?: string[] | null;
    };
    topicId: string;
    index: number;
}

export function WikiChapter({ chapter, topicId, index }: WikiChapterProps) {
    const { activeJob, startJob } = useGenerationStore();
    const { isSignedIn } = useUser();
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
        }
    }, [chapter.content]);

    // Check if THIS chapter is the one being generated
    const isGenerating = activeJob?.topicId === topicId &&
        activeJob?.chapterId === chapter.id &&
        activeJob?.status === 'generating';

    // Sync local content with Streaming Content
    useEffect(() => {
        if (activeJob?.topicId === topicId && activeJob?.chapterId === chapter.id && activeJob?.content) {
            setLocalContent(activeJob.content);
            if (!isOpen && activeJob.status === 'generating') setIsOpen(true);
        }
    }, [activeJob, topicId, chapter.id, isOpen]);

    const handleGenerate = () => {
        if (!isSignedIn) return;

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
            // AUTO TRIGGER GENERATION ON OPEN if empty AND signed in
            if (!localContent && !isGenerating && isSignedIn) {
                handleGenerate();
            }
        }
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (localContent) {
            navigator.clipboard.writeText(localContent);
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000);
        }
    };

    // Local images state
    const [localImages, setLocalImages] = React.useState<string[]>(
        (chapter.images as string[]) || []
    );
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUploadClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setLocalImages(prev => [objectUrl, ...prev]);
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

                        {/* Action Buttons */}
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
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </>
                            )}
                        </div>
                    </div>

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
                    <WikiImageGrid images={localImages} className="mb-6" />

                    {localContent ? (
                        <article className={cn(
                            "prose prose-stone dark:prose-invert max-w-none prose-lg prose-p:leading-loose prose-p:mb-6 prose-headings:font-serif prose-headings:mt-8 prose-headings:mb-4",
                            isGenerating && "opacity-80 transition-opacity duration-300"
                        )}>
                            <ReactMarkdown components={{ a: WikiLink as any }}>
                                {localContent}
                            </ReactMarkdown>
                            {isGenerating && (
                                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle" />
                            )}
                        </article>
                    ) : (
                        // Empty State Handling
                        <div className="py-8">
                            {!isSignedIn ? (
                                <div className="flex flex-col items-start gap-3 bg-red-500/5 border border-red-500/10 rounded-xl p-6">
                                    <div className="flex items-center gap-2 text-red-500 font-medium">
                                        <Sparkles className="w-4 h-4" />
                                        <span>Authentication Required</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        You must be signed in to generate this section's content.
                                    </p>
                                    <SignInButton mode="modal">
                                        <button className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors">
                                            Sign In to Generate
                                        </button>
                                    </SignInButton>
                                </div>
                            ) : isGenerating ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground italic animate-pulse">
                                    <Sparkles className="w-4 h-4" />
                                    Generating content...
                                </div>
                            ) : (
                                <button
                                    onClick={handleGenerate}
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <Sparkles className="w-4 h-4" /> Generate Section
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
