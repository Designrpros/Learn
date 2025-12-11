import { getThreads } from "@/lib/db-queries";
import Link from "next/link";
import { MessageSquare, ArrowBigUp, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ForumDockActions } from "@/components/forum/forum-dock-actions";

export const revalidate = 0;

export default async function ForumPage() {
    const threads = await getThreads();

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 pb-32">
            <header className="mb-12 text-center relative">
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-foreground mb-4">Community Forum</h1>
                <p className="text-muted-foreground text-lg mb-6">Discuss topics, ask questions, and share knowledge.</p>
                <ForumDockActions />
            </header>

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
                                    {thread.tags.map(({ tag }) => (
                                        <span key={tag.id} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                            {tag.name}
                                        </span>
                                    ))}
                                    <span className="text-xs text-muted-foreground">
                                        • Posted by <span className="font-medium text-foreground">{thread.authorName}</span> {formatDistanceToNow(thread.createdAt)} ago
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
                        <p className="text-muted-foreground mb-4">No discussions yet.</p>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium text-sm">
                            Start a Discussion
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
