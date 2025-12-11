"use client";

import { useState, useRef } from "react";
import { Share2, Image as ImageIcon, Sparkles, Check, Loader2 } from "lucide-react";
import { useGenerationStore } from "@/lib/generation-store";
import { useRouter } from "next/navigation";
import { useTopicImagesStore } from "@/lib/topic-images-store";

interface WikiHeaderActionsProps {
    topicId: string;
    slug: string;
}

export function WikiHeaderActions({ topicId, slug }: WikiHeaderActionsProps) {
    const router = useRouter();
    const { startJob, activeJob } = useGenerationStore();
    const [justCopied, setJustCopied] = useState(false);

    // Store integration for Image Upload
    const { addImage } = useTopicImagesStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false); // Kept for potential loading states

    const isGenerating = activeJob?.topicId === topicId && activeJob?.type === 'syllabus';

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            // Simulate "processing" briefly for UX? Not strictly necessary for local preview.
            const url = URL.createObjectURL(file);
            addImage(topicId, url);
            setIsUploading(false);
        }
    };

    const handleRegenerate = () => {
        if (confirm("Regenerate entire syllabus? This will overwrite existing structure.")) {
            startJob({
                type: 'syllabus',
                topicId,
                force: true
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40 rounded-md transition-colors"
                title="Copy Link"
            >
                {justCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                Share
            </button>

            <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40 rounded-md transition-colors"
                title="Upload Cover Image"
            >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                Upload Image
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary bg-muted/20 hover:bg-primary/10 rounded-md transition-colors"
                title="Regenerate Syllabus"
            >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Regenerate'}
            </button>
        </div>
    );
}
