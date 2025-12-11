
import React from 'react';
import Link from 'next/link';
import { Book, GitGraph } from 'lucide-react';
import { WikiContentMonitor } from '@/components/wiki/wiki-content-monitor';
import { WikiLiveUpdater } from '@/components/wiki/wiki-live-updater';
import { WikiFAQ } from '@/components/wiki/wiki-faq';
import { WikiComments } from '@/components/wiki/wiki-comments';
import { WikiChapter } from '@/components/wiki/wiki-chapter';
import { WikiTopicImageGrid } from '@/components/wiki/wiki-topic-image-grid';

interface WikiArticleViewProps {
    topic: any;
    faqs: any[];
}

export function WikiArticleView({ topic, faqs }: WikiArticleViewProps) {
    // Relationships Logic
    const children = topic.children || [];
    const related = [...(topic.outgoing || []), ...(topic.incoming || [])].filter((rel: any) => {
        return true;
    });

    return (
        <div className="max-w-5xl mx-auto px-6 md:px-12 pt-12 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16">

            {/* Sidebar / Syllabus (Sticky on LG) */}
            <aside className="hidden lg:block h-fit sticky top-32">
                <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        Contents
                    </h3>
                    <nav className="flex flex-col space-y-3 relative">
                        <div className="absolute left-0 top-2 bottom-2 w-px bg-border/50" />
                        {topic.chapters?.map((chapter: any) => (
                            <a
                                key={chapter.id}
                                href={`#${chapter.slug}`}
                                className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all py-1 pl-4 block border-l-2 border-transparent hover:border-primary -ml-[1px]"
                            >
                                {chapter.title}
                            </a>
                        ))}

                        {/* Static Sections */}
                        {children.length > 0 && (
                            <a href="#subtopics" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all py-1 pl-4 block border-l-2 border-transparent hover:border-primary -ml-[1px]">
                                Sub-Topics & Concepts
                            </a>
                        )}
                        {related.length > 0 && (
                            <a href="#connections" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all py-1 pl-4 block border-l-2 border-transparent hover:border-primary -ml-[1px]">
                                Connected Topics
                            </a>
                        )}
                        <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all py-1 pl-4 block border-l-2 border-transparent hover:border-primary -ml-[1px]">
                            Frequently Asked Questions
                        </a>
                        <a href="#discussion" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all py-1 pl-4 block border-l-2 border-transparent hover:border-primary -ml-[1px]">
                            Discussion
                        </a>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="min-w-0">

                <WikiContentMonitor
                    topic={topic}
                    initialContent={topic.overview || ""}
                />

                {/* Image Grid for Topic */}
                <WikiTopicImageGrid topicId={topic.id} initialImages={topic.images as string[]} className="mt-8" />

                <WikiLiveUpdater
                    slug={topic.slug}
                    initialChapterCount={topic.chapters?.length || 0}
                    initialChildrenCount={children.length}
                />

                <hr className="my-16 border-border/40" />

                {/* Render Chapters Static if exist (and not being regenerated) */}
                <div className="space-y-20">
                    <div className="space-y-20">
                        {topic.chapters?.map((chapter: any, index: number) => (
                            <WikiChapter
                                key={chapter.id}
                                chapter={chapter}
                                topicId={topic.id}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                <hr className="my-16 border-border/40" />

                <div className="space-y-16">
                    {/* Children / Sub-Topics */}
                    {children.length > 0 && (
                        <div id="subtopics" className="scroll-mt-32">
                            <h3 className="text-xl font-serif font-bold mb-8 flex items-center gap-2">
                                <Book className="w-5 h-5 text-primary" /> Sub-Topics & Concepts
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {children.map((child: any) => (
                                    <Link
                                        key={child.id}
                                        href={`/wiki/${child.slug}`}
                                        className="group flex flex-col p-5 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                                                Sub-Topic
                                            </span>
                                        </div>
                                        <span className="font-serif font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                                            {child.title}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related / Connected Topics */}
                    {(related.length > 0) && (
                        <div id="connections" className="pb-16 scroll-mt-32">
                            <h3 className="text-xl font-serif font-bold mb-8 flex items-center gap-2">
                                <GitGraph className="w-5 h-5 text-primary" /> Connected Topics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {related.map((rel: any) => {
                                    const relatedTopic = rel.target || rel.source;
                                    if (!relatedTopic) return null;

                                    return (
                                        <Link
                                            key={rel.id}
                                            href={`/wiki/${relatedTopic.slug}`}
                                            className="group flex flex-col p-5 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                                                    {rel.type}
                                                </span>
                                            </div>
                                            <span className="font-serif font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                                                {relatedTopic.title}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* FAQs */}
                <div id="faq" className="mb-20 scroll-mt-32">
                    <WikiFAQ topicId={topic.id} initialFaqs={faqs} />
                </div>

                {/* Comments */}
                <div id="discussion" className="scroll-mt-32">
                    <WikiComments topicId={topic.id} />
                </div>

            </main>
        </div>
    );
}
