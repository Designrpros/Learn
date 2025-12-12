"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowBigUp, Loader2, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from "date-fns";

export function ForumList({ initialThreads }: { initialThreads: any[] }) {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    // State
    const [threads, setThreads] = useState(initialThreads);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialThreads.length >= 10);
    const [loading, setLoading] = useState(false);

    // Reset when query changes
    useEffect(() => {
        setThreads(initialThreads);
        setPage(1);
        setHasMore(initialThreads.length >= 10);
    }, [initialThreads, query]);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const nextPage = page + 1;
            const res = await fetch(`/api/threads/list?page=${nextPage}&limit=10&q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const newThreads = await res.json();
                if (newThreads.length < 10) {
                    setHasMore(false);
                }
                setThreads(prev => [...prev, ...newThreads]);
                setPage(nextPage);
            }
        } catch (err) {
            console.error("Failed to load more threads", err);
        } finally {
            setLoading(false);
        }
    };

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        if (loading || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const sentinel = document.getElementById('forum-scroll-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => observer.disconnect();
    }, [loading, hasMore, page, threads]);

    return (
        <div className="space-y-4">
            {threads.map((thread) => (
                <Link key={thread.id} href={`/forum/${thread.id}`} className="block group">
                    <div className="bg-card/50 hover:bg-card border border-border p-4 rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/20 flex gap-4">
                        {/* Vote Column (Visual Only) */}
                        <div className="flex flex-col items-center gap-1 bg-muted/30 p-2 rounded-lg h-fit min-w-[3rem]">
                            <ArrowBigUp className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                            <span className="text-sm font-bold text-foreground">0</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {thread.tags.map(({ tag }: { tag: { id: string, name: string } }) => (
                                    <span key={tag.id} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                        {tag.name}
                                    </span>
                                ))}
                                <span className="text-xs text-muted-foreground">
                                    • Posted by <span className="font-medium text-foreground">{thread.authorName}</span> {formatDistanceToNow(new Date(thread.createdAt))} ago
                                </span>
                            </div>

                            <h2 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors mb-2 truncate">
                                {thread.title}
                            </h2>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{thread.posts.length} comments</span>
                                </div>
                                <div className="bg-muted/30 px-2 py-1 rounded text-xs">
                                    {thread.category}
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}

            {threads.length === 0 && (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                        {query ? `No discussions matching "${query}"` : "No discussions yet."}
                    </p>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium text-sm">
                        Start a Discussion
                    </button>
                </div>
            )}

            {/* Sentinel for Intersection Observer */}
            <div id="forum-scroll-sentinel" className="h-20 flex justify-center items-center">
                {loading && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
                {!hasMore && threads.length > 0 && (
                    <p className="text-sm text-muted-foreground">No more discussions</p>
                )}
            </div>
        </div>
    );
}
