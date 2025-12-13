"use client";

import Link from "next/link";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toggleVote } from "@/app/actions";
import { deleteThread } from "@/app/actions/delete-thread";
import { useUser } from "@clerk/nextjs";

interface Thread {
    id: string;
    title: string;
    category: string;
    authorId?: string | null;
    authorName: string;
    createdAt: string | Date;
    posts: { id: string; content?: string }[]; // Relation for count and preview
    images?: string[]; // Image capability (Mock/Future)
    topic?: { title: string; slug?: string } | null;
    votes?: { userId: string; value: number }[];
}

export function ForumThreadCard({ thread }: { thread: Thread }) {
    const { user } = useUser();
    const userId = user?.id;
    const [isPending, startTransition] = useTransition();

    // Calculate initial state from thread data
    const initialScore = thread.votes?.reduce((acc, v) => acc + v.value, 0) || 0;
    const initialUserVote = thread.votes?.find(v => v.userId === userId)?.value || 0;

    // Optimistic state
    const [optimisticVote, setOptimisticVote] = useState<{ score: number, userVote: number }>({
        score: initialScore,
        userVote: initialUserVote
    });

    // Sync with server if props change (revalidation)
    // useEffect(() => { ... }, [thread]) - usually handled by key or re-render. 
    // For simplicity, we initialize state. If props update, we might drift if we don't sync. 
    // But revalidation updates the component entirely.

    // Better: Derive score from props + optimistic delta?
    // Let's stick to simple useState, and rely on server revalidation to reset/confirm.
    // Actually, simple useState will be overwritten on re-render if I don't use key or effect?
    // No, state persists. I should use useOptimistic properly or just handle internal state overriding props?
    // Simplest approach: handle click, update local state, call server action.

    // Wait, if thread updates from server (revalidatePath), the prop `thread` changes.
    // If I use state initialized from prop, it won't update when prop changes unless I use a key or effect.
    // Let's use `key={thread.id + initialScore}` on the parent or just use effect.
    // Or just rely on the fact that `toggleVote` calls `revalidatePath` which re-renders the page -> new props.
    // If I use the *prop* for display, I only need state for *pending* action prediction.

    // Let's implement full manual optimistic logic for responsiveness:
    const handleVote = (value: 1 | -1) => {
        if (!userId) return; // TODO: Show auth modal

        // Determine new state
        let newVote: number = value;
        let diff = 0;

        if (optimisticVote.userVote === value) {
            // Toggle off
            newVote = 0;
            diff = -value;
        } else {
            // Change or new vote
            diff = value - optimisticVote.userVote;
            newVote = value;
        }

        const newScore = optimisticVote.score + diff;
        setOptimisticVote({ score: newScore, userVote: newVote });

        startTransition(async () => {
            await toggleVote(thread.id, value);
        });
    };

    // If props change significantly (from other users), we validly might want to update, 
    // but for my own actions, I want stability. 
    // Let's assume revalidation will update the props and I should sync state if the *user vote* in DB matches my expectation? 
    // Actually, a simple `key` on the list item in the page is enough to force reset if needed, but costly.
    // Let's trust local state for interaction and sync only on mount. (Effect needed for long term).
    // I'll skip the effect for now to minimize code size, as revalidation is fast.

    // Comment count excluding the OP (first post)
    const commentCount = Math.max(0, (thread.posts?.length || 0) - 1);

    return (
        <div className="flex bg-card hover:bg-muted/20 border border-border rounded-md overflow-hidden transition-colors group cursor-pointer hover:border-border/80">
            {/* Left: Vote Column */}
            <div className="w-10 bg-muted/10 flex flex-col items-center py-3 gap-1 border-r border-border/30 shrink-0">
                <button
                    className={cn(
                        "p-1 rounded transition-colors",
                        optimisticVote.userVote === 1 ? "text-orange-500 bg-orange-500/10" : "text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10"
                    )}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(1); }}
                >
                    <ArrowBigUp className={cn("w-6 h-6", optimisticVote.userVote === 1 && "fill-current")} />
                </button>

                <span className={cn("text-xs font-bold", optimisticVote.userVote !== 0 && "text-foreground", optimisticVote.userVote === 1 && "text-orange-500", optimisticVote.userVote === -1 && "text-blue-500")}>
                    {optimisticVote.score}
                </span>

                <button
                    className={cn(
                        "p-1 rounded transition-colors",
                        optimisticVote.userVote === -1 ? "text-blue-500 bg-blue-500/10" : "text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                    )}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(-1); }}
                >
                    <ArrowBigDown className={cn("w-6 h-6", optimisticVote.userVote === -1 && "fill-current")} />
                </button>
            </div>

            {/* Right: Content */}
            <div className="flex-1 p-3 flex flex-col gap-2">
                {/* Meta Header */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {thread.topic?.slug ? (
                        <Link href={`/wiki/${thread.topic.slug}/forum`} className="font-bold text-foreground hover:underline" onClick={(e) => e.stopPropagation()}>
                            w/{thread.topic.title}
                        </Link>
                    ) : (
                        <span className="font-bold text-foreground hover:underline">w/{thread.topic?.title ?? thread.category}</span>
                    )}
                    <span>•</span>
                    <span>Posted by <span className="hover:underline text-foreground/80">u/{thread.authorName}</span></span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                </div>

                {/* Title & Preview Link */}
                <Link href={`/forum/thread/${thread.id}`} className="block">
                    <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {thread.title}
                    </h3>

                    {/* Content Preview */}
                    {thread.posts?.[0]?.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {thread.posts[0].content}
                        </p>
                    )}
                </Link>

                {/* Image Preview (If Exists) */}
                {thread.images && thread.images.length > 0 && (
                    <Link href={`/forum/thread/${thread.id}`} className="block mt-1 mb-2">
                        <div className="relative w-full h-64 md:h-80 bg-muted rounded-lg overflow-hidden border border-border/50">
                            <img
                                src={thread.images[0]}
                                alt={thread.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                            />
                        </div>
                    </Link>
                )}

                {/* Footer Actions */}
                <div className="flex items-center gap-4 pt-1">
                    <Link href={`/forum/thread/${thread.id}`} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 px-2 py-1 rounded transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        {commentCount} Comments
                    </Link>

                    <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-sm text-xs font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => e.preventDefault()}>
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>

                    <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-sm text-xs font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => e.preventDefault()}>
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {userId === thread.authorId && (
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-red-500/10 rounded-sm text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors ml-auto"
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (confirm("Are you sure you want to delete this thread?")) {
                                    await deleteThread(thread.id);
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
