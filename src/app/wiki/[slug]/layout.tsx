
import { getOrCreateTopicStub } from '@/lib/db-queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { ArrowLeft, Book, Calendar } from 'lucide-react';
import { WikiHeaderActions } from '@/components/wiki/wiki-header-actions';

export default async function WikiTopicLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const topic = await getOrCreateTopicStub(slug);

    if (!topic) {
        notFound();
    }

    // Determine stub status (reused logic)
    // const isStub = !topic.syllabus || (Array.isArray(topic.syllabus) && topic.syllabus.length === 0);

    // Build Breadcrumbs
    const breadcrumbs = [];
    let currentParent: any = topic.parent;
    while (currentParent) {
        breadcrumbs.unshift({ title: currentParent.title, slug: currentParent.slug });
        currentParent = currentParent.parent;
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-32">
            {/* Header / Hero - Moved from page.tsx */}
            <div className="relative pt-32 pb-12 px-6 md:px-12 max-w-5xl mx-auto border-b border-border/40">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
                </div>

                <div className="flex items-center justify-between mb-8">
                    <Link href="/wiki" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
                    </Link>

                    {/* Navigation Tabs (Wiki vs Forum) */}
                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
                        <Link
                            href={`/wiki/${slug}`}
                            className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-background/50 hover:text-foreground transition-all"
                        >
                            Wiki
                        </Link>
                        <Link
                            href={`/wiki/${slug}/forum`}
                            className="px-4 py-1.5 text-sm font-medium rounded-md hover:bg-background/50 hover:text-foreground transition-all text-muted-foreground"
                        >
                            Forum
                        </Link>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    <Link href="/wiki" className="hover:text-primary transition-colors">Database</Link>

                    {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={`${crumb.slug}-${i}`}>
                            <span className="opacity-40">/</span>
                            <Link href={`/wiki/${crumb.slug}`} className="hover:text-primary transition-colors">
                                {crumb.title}
                            </Link>
                        </React.Fragment>
                    ))}

                    <span className="opacity-40">/</span>
                    <span className="text-primary">{topic.title}</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6 text-foreground">
                    {topic.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(topic.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    </div>
                    {topic.chapters && topic.chapters.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Book className="w-4 h-4" />
                            <span>{topic.chapters.length} Sections</span>
                        </div>
                    )}
                    <WikiHeaderActions topicId={topic.id} slug={topic.slug} />
                </div>
            </div>

            {/* Content Area */}
            {children}
        </div>
    );
}
