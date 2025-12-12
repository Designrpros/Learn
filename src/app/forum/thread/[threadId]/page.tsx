import { getThreadById } from "@/lib/db-queries";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ArrowBigUp, ArrowBigDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreatePostForm } from "@/components/forum/create-post-form";

export const revalidate = 0;

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
    const { threadId } = await params;
    const thread = await getThreadById(threadId);

    if (!thread) {
        notFound();
    }

    // Separate main post from comments if posts exist
    const mainPost = thread.posts[0];
    const comments = thread.posts.slice(1);

    // Mock votes and images for now (in real app, fetched from DB)
    const mockVotes = Math.floor(Math.random() * 100) + 10;
    const images = (thread as any).images as string[] | undefined;

    return (
        <div className="max-w-7xl mx-auto pt-24 pb-32 px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Main Content (8 cols) */}
                <div className="lg:col-span-8">
                    {(thread as any).topic?.slug ? (
                        <Link href={`/wiki/${(thread as any).topic.slug}/forum`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to {(thread as any).topic.title} Forum
                        </Link>
                    ) : (
                        <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Forum
                        </Link>
                    )}

                    {/* Main Thread Card (Expanded) */}
                    <div className="bg-card border border-border rounded-md overflow-hidden flex mb-8">
                        {/* Vote Column */}
                        <div className="w-12 bg-muted/10 flex flex-col items-center py-4 gap-2 border-r border-border/30 shrink-0">
                            <button className="text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 p-1.5 rounded transition-colors">
                                <ArrowBigUp className="w-7 h-7" />
                            </button>
                            <span className="text-sm font-bold text-foreground">{mockVotes}</span>
                            <button className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 p-1.5 rounded transition-colors">
                                <ArrowBigDown className="w-7 h-7" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 md:p-6 flex-1 min-w-0">
                            {/* Meta */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                {(thread as any).topic?.slug ? (
                                    <Link href={`/wiki/${(thread as any).topic.slug}/forum`} className="font-bold text-foreground hover:underline">
                                        w/{(thread as any).topic.title}
                                    </Link>
                                ) : (
                                    <span className="font-bold text-foreground">w/{thread.category}</span>
                                )}
                                <span>•</span>
                                <span>Posted by <span className="font-medium text-foreground">u/{thread.authorName}</span></span>
                                <span>•</span>
                                <span>{formatDistanceToNow(thread.createdAt, { addSuffix: true })}</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">
                                {thread.title}
                            </h1>

                            {/* Images */}
                            {images && images.length > 0 && (
                                <div className="mb-6 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                                    <img src={images[0]} alt={thread.title} className="w-full h-auto max-h-[600px] object-contain" />
                                </div>
                            )}

                            {/* Body Text (Main Post) */}
                            <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                {mainPost ? mainPost.content : <p className="italic text-muted-foreground">[No content]</p>}
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-border/50 text-sm font-medium text-muted-foreground">
                                <div className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded transition-colors cursor-pointer">
                                    <MessageSquare className="w-4 h-4" />
                                    {comments.length} Comments
                                </div>
                                <div className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded transition-colors cursor-pointer">
                                    <ArrowBigUp className="w-4 h-4" />
                                    Share
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Create Comment */}
                    <div className="mb-10">
                        <CreatePostForm threadId={thread.id} />
                    </div>

                    {/* Section Identifier */}
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
                        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Comments</span>
                        {/* Sort Dropdown could go here */}
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.map((post) => (
                            <div key={post.id} className="bg-card border border-border rounded-lg p-4 flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 border border-border">
                                    {post.authorName[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-foreground">{post.authorName}</span>
                                        <span className="text-xs text-muted-foreground">• {formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
                                    </div>
                                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {post.content}
                                    </div>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-medium">
                                        <button className="hover:text-foreground flex items-center gap-1">
                                            <ArrowBigUp className="w-4 h-4" /> Reply
                                        </button>
                                        <button className="hover:text-foreground">Share</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {comments.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground italic">
                                No comments yet. Be the first to share your thoughts!
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar (Optional for detail page but good for navigation) */}
                <div className="hidden lg:block lg:col-span-4 pl-4">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-card border border-border rounded-lg p-4">
                            {(thread as any).topic?.slug ? (
                                <>
                                    <h3 className="font-bold text-foreground mb-2">About {(thread as any).topic.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        This discussion is part of the {(thread as any).topic.title} community.
                                    </p>
                                    <Link href={`/wiki/${(thread as any).topic.slug}/forum`}>
                                        <button className="w-full bg-muted hover:bg-muted/80 text-foreground text-sm font-medium py-2 rounded-md transition-colors">
                                            View Community
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <h3 className="font-bold text-foreground mb-2">r/{thread.category}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        You are viewing a discussion in the {thread.category} community.
                                    </p>
                                    {/* Link to generic category if implemented later */}
                                    <button className="w-full bg-muted hover:bg-muted/80 text-foreground text-sm font-medium py-2 rounded-md transition-colors">
                                        View Community
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
