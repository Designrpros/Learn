
import { getOrCreateTopicStub, getTopicFAQs, getThreadsByTopic } from '@/lib/db-queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ArrowBigUp, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CreatePostForm } from '@/components/forum/create-post-form';
import { CreateDiscussionDialog } from '@/components/forum/create-discussion-dialog';
import { WikiContextDrawer } from '@/components/wiki/wiki-context-drawer';
import { WikiArticleView } from '@/components/wiki/wiki-article-view';

export const revalidate = 0;

export default async function WikiForumPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const topic = await getOrCreateTopicStub(slug);

    if (!topic) {
        notFound();
    }

    const threads = await getThreadsByTopic(topic.id);
    const faqs = await getTopicFAQs(topic.id); // Fetch FAQs for the drawer context

    return (
        <div className="max-w-4xl mx-auto px-6 md:px-12 pt-8 pb-32">

            {/* Forum Actions Bar */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-medium text-muted-foreground">
                    Discussions related to <span className="text-foreground font-serif italic">{topic.title}</span>
                </h2>
                <CreateDiscussionDialog topicId={topic.id} topicTitle={topic.title} />
            </div>

            {/* Threads List */}
            <div className="space-y-4">
                {threads.map((thread) => (
                    <Link key={thread.id} href={`/forum/${thread.id}`} className="block group">
                        <div className="bg-card/50 hover:bg-card border border-border p-4 rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/20 flex gap-4">
                            {/* Vote Column */}
                            <div className="flex flex-col items-center gap-1 bg-muted/30 p-2 rounded-lg h-fit min-w-[3rem]">
                                <ArrowBigUp className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                                <span className="text-sm font-bold text-foreground">0</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {/* Local Topic Tag (Implicit) or extra tags */}
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
                        <p className="text-muted-foreground mb-4">No discussions yet for this topic.</p>
                        <Button variant="outline">
                            Start the first discussion
                        </Button>
                    </div>
                )}
            </div>

            {/* Wiki Context Drawer */}
            <WikiContextDrawer>
                <div className="pb-20">
                    <WikiArticleView topic={topic} faqs={faqs} />
                </div>
            </WikiContextDrawer>
        </div>
    );
}
