import { getAllTopics } from '@/lib/db-queries';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';

export default async function WikiIndex() {
    const topics = await getAllTopics();

    return (
        <div className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Living Archive</h1>
                <p className="text-lg text-muted-foreground font-light max-w-2xl">
                    A persistent collection of generated knowledge. Explore the topics you have mastered.
                </p>
            </div>

            {topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-2xl bg-muted/20">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium text-foreground">No Topics Yet</h3>
                    <p className="text-muted-foreground mt-2">Generate a syllabus on the home page to start your library.</p>
                    <Link href="/" className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity">
                        Create New Topic
                    </Link>
                </div>
            ) : (
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
                                <span>{new Date(topic.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
