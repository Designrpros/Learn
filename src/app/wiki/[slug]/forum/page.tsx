
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
import { ForumThreadCard } from '@/components/forum/forum-thread-card';

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
                    <ForumThreadCard key={thread.id} thread={{ ...thread, category: topic.title }} />
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
