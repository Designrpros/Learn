"use client";

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ForumThreadCard } from './forum-thread-card';

export function ForumList({ initialThreads }: { initialThreads: any[] }) {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'new';

    // State
    const [threads, setThreads] = useState(initialThreads);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialThreads.length >= 10);

    // Infinite Scroll Ref
    const { ref, inView } = useInView();

    // Load More Logic
    useEffect(() => {
        if (inView) {
            loadMore();
        }
    }, [inView]);

    // Reset when query/sort changes
    useEffect(() => {
        setThreads(initialThreads);
        setPage(1);
        setHasMore(initialThreads.length >= 10);
    }, [initialThreads, query, sort]);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const nextPage = page + 1;
            const res = await fetch(`/api/threads/list?page=${nextPage}&limit=10&q=${encodeURIComponent(query)}&sort=${sort}`);
            if (res.ok) {
                const newThreads = await res.json();
                if (newThreads.length < 10) {
                    setHasMore(false);
                }
                setThreads(prev => {
                    const existingIds = new Set(prev.map(t => t.id));
                    const uniqueNewThreads = newThreads.filter((t: any) => !existingIds.has(t.id));
                    return [...prev, ...uniqueNewThreads];
                });
                setPage(nextPage);
            }
        } catch (error) {
            console.error("Failed to load more threads", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* List */}
            <div className="flex flex-col gap-4">
                {threads.map((thread) => (
                    <ForumThreadCard key={thread.id} thread={thread} />
                ))}
            </div>

            {/* Loading Indicator */}
            {hasMore && (
                <div ref={ref} className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
                </div>
            )}

            {!hasMore && threads.length > 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground/50 italic">
                    You've reached the end.
                </div>
            )}

            {!loading && threads.length === 0 && (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground opacity-50">No threads found.</p>
                </div>
            )}
        </div>
    );
}
