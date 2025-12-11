import { getThreadById } from "@/lib/db-queries";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ArrowBigUp, ArrowLeft } from "lucide-react";
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

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 pb-32">
            <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Forum
            </Link>

            {/* Main Thread Post */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 bg-muted/30 p-2 rounded-lg h-fit min-w-[3rem]">
                        <ArrowBigUp className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                        <span className="text-sm font-bold text-foreground">0</span>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {thread.tags.map(({ tag }) => (
                                <span key={tag.id} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {tag.name}
                                </span>
                            ))}
                            <span className="text-xs text-muted-foreground">
                                Posted by <span className="font-medium text-foreground">{thread.authorName}</span> {formatDistanceToNow(thread.createdAt)} ago
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-medium font-serif text-foreground mb-4">
                            {thread.title}
                        </h1>

                        <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                            {/* Assuming content might be in the first post or we add a content field to threads? 
                                Checking schema... 'threads' table only has title. 'posts' has content. 
                                So the "original post" is likely the first post in the thread.
                            */}
                            <p className="italic text-sm">[Thread starter content would go here content model depends on if OP text is stored on thread or first post]</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments / Posts */}
            <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-border pb-2 mb-6">Comments ({thread.posts.length})</h3>

                {thread.posts.map((post) => (
                    <div key={post.id} className="bg-card/50 border border-border rounded-xl p-4 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                            {post.authorName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-sm">{post.authorName}</span>
                                <span className="text-xs text-muted-foreground">{formatDistanceToNow(post.createdAt)} ago</span>
                            </div>
                            <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                                {post.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply area */}
            <CreatePostForm threadId={thread.id} />
        </div>
    );
}
