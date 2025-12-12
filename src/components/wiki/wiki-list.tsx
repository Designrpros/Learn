"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function WikiList({ initialTopics }: { initialTopics: any[] }) {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const parentId = searchParams.get('parentId') || '';

    // State
    const [topics, setTopics] = useState(initialTopics);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialTopics.length >= 12);
    const [loading, setLoading] = useState(false);

    // Reset when query changes
    useEffect(() => {
        setTopics(initialTopics);
        setPage(1);
        setHasMore(initialTopics.length >= 12);
    }, [initialTopics, query, parentId]);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const nextPage = page + 1;
            const res = await fetch(`/api/topics/list?page=${nextPage}&limit=12&q=${encodeURIComponent(query)}&parentId=${parentId}`);
            if (res.ok) {
                const newTopics = await res.json();
                if (newTopics.length < 12) {
                    setHasMore(false);
                }
                setTopics(prev => [...prev, ...newTopics]);
                setPage(nextPage);
            }
        } catch (err) {
            console.error("Failed to load more topics", err);
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

        const sentinel = document.getElementById('wiki-scroll-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => observer.disconnect();
    }, [loading, hasMore, page, topics]); // Re-bind when state changes to ensure fresh closures

    return (
        <>
            {topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-muted/20">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium text-foreground">
                        {query ? "No matches found" : "No Topics Yet"}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                        {query ? `No topics matching "${query}"` : "Generate a syllabus on the home page to start your library."}
                    </p>
                    {!query && (
                        <Link href="/" className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity">
                            Create New Topic
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topics.map((topic) => (
                            <Link
                                key={topic.id}
                                href={`/wiki/${topic.slug}`}
                                className="group relative flex flex-col p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>

                                <h2 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {topic.title}
                                </h2>

                                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                                    {topic.overview || "No overview available."}
                                </p>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground/70 pt-4 border-t border-border/50">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{new Date(topic.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Sentinel for Intersection Observer */}
                    <div id="wiki-scroll-sentinel" className="h-20 flex justify-center items-center">
                        {loading && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
                        {!hasMore && topics.length > 0 && (
                            <p className="text-sm text-muted-foreground">No more topics</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
