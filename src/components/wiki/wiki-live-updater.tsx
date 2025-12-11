"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface WikiLiveUpdaterProps {
    slug: string;
    initialChapterCount: number;
    initialChildrenCount: number;
}

export function WikiLiveUpdater({ slug, initialChapterCount, initialChildrenCount }: WikiLiveUpdaterProps) {
    const router = useRouter();
    const [lastChapterCount, setLastChapterCount] = useState(initialChapterCount);
    const [lastChildrenCount, setLastChildrenCount] = useState(initialChildrenCount);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/wiki/status?slug=${slug}`);
                if (res.ok) {
                    const data = await res.json();

                    // Check if state changed significantly
                    if (data.chapterCount !== lastChapterCount || data.childrenCount !== lastChildrenCount) {
                        console.log("[LiveUpdate] Detected change, refreshing...", data);
                        setLastChapterCount(data.chapterCount);
                        setLastChildrenCount(data.childrenCount);
                        router.refresh(); // Triggers server re-render of the page
                    }
                }
            } catch (e) {
                console.error("[LiveUpdate] Poll failed", e);
            }
        }, 4000); // Poll every 4 seconds

        return () => clearInterval(interval);
    }, [slug, lastChapterCount, lastChildrenCount, router]);

    return null; // Invisible component
}
