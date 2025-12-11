"use client";

import { useGenerationStore } from "@/lib/generation-store";
import { RotateCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WikiRegenerateButtonProps {
    topicId: string;
}

export function WikiRegenerateButton({ topicId }: WikiRegenerateButtonProps) {
    const { startJob, activeJob } = useGenerationStore();
    const isGenerating = activeJob?.topicId === topicId;

    const handleRegenerate = () => {
        if (confirm("Are you sure you want to completely regenerate this topic? This will overwrite the current structure.")) {
            startJob({
                topicId,
                type: 'syllabus',
                force: true
            });
        }
    };

    return (
        <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className={cn(
                "flex items-center gap-2 hover:text-primary transition-colors group disabled:opacity-50 disabled:cursor-not-allowed",
                isGenerating && "text-primary"
            )}
            title="Re-generate Syllabus from scratch"
        >
            <RotateCw className={cn("w-4 h-4 transition-transform", isGenerating && "animate-spin")} />
            <span>{isGenerating ? "Generating..." : "Regenerate"}</span>
        </button>
    );
}
