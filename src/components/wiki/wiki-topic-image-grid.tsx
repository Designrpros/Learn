"use client";

import { useEffect } from "react";
import { WikiImageGrid } from "./wiki-image-grid";
import { useTopicImagesStore } from "@/lib/topic-images-store";

interface WikiTopicImageGridProps {
    topicId: string;
    initialImages?: string[];
    className?: string;
}

export function WikiTopicImageGrid({ topicId, initialImages = [], className }: WikiTopicImageGridProps) {
    const { images, setImages } = useTopicImagesStore();
    // Safe accessor for initial images to handle null from DB
    const safeInitialImages = initialImages || [];

    // Sync initial images to store on mount (only if store is empty for this topic?)
    // Actually, we should probably treat props as source of truth initially.
    useEffect(() => {
        // If we haven't set images for this topic yet, set them.
        // This ensures hydration matches.
        if (!images[topicId] && safeInitialImages.length > 0) {
            setImages(topicId, safeInitialImages);
        }
    }, [topicId, safeInitialImages, setImages, images]);

    // Use the store's version if available (triggered by Client interactions), otherwise fallback to props
    const displayImages = images[topicId] || safeInitialImages;

    return <WikiImageGrid images={displayImages} className={className} />;
}
