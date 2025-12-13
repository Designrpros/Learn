import { getThreads, getTrendingTopics, getForumStats } from "@/lib/db-queries";
import { SearchInput } from '@/components/ui/search-input';
import { ForumList } from '@/components/forum/forum-list';
import { ForumFilters } from '@/components/forum/forum-filters';
import { PlusCircle, Info, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { CreateThreadButton } from '@/components/forum/create-thread-button';


export const revalidate = 0;

export default async function ForumPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string; sort?: string }>
}) {
    const { q, sort } = await searchParams;
    const searchQuery = q;
    const sortOption = (sort === 'popular' || sort === 'unanswered') ? sort : 'new';
    const initialThreads = await getThreads(undefined, searchQuery, sortOption);

    const trendingTopics = await getTrendingTopics();
    const stats = await getForumStats();

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
            {/* Header */}
            {/* Header */}
            <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Community Forum</h1>
                    <p className="text-muted-foreground">Discuss topics, ask questions, and share knowledge.</p>
                </div>
                {/* Mobile Create Button */}
                <div className="lg:hidden">
                    <CreateThreadButton variant="icon" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content (Feed) */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Mobile Trending Strip */}
                    <div className="lg:hidden mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                        <div className="flex items-center gap-2 w-max">
                            <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Trending:
                            </span>
                            {trendingTopics.map(topic => (
                                <Link key={topic.slug} href={`/wiki/${topic.slug}/forum`}>
                                    <span className="px-3 py-1 bg-muted/60 border border-border/50 rounded-full text-xs font-medium text-foreground whitespace-nowrap hover:bg-muted transition-colors">
                                        w/{topic.title}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <ForumFilters />
                        <div className="w-full sm:w-64">
                            <SearchInput placeholder="Search discussions..." />
                        </div>
                    </div>

                    <ForumList initialThreads={initialThreads} />
                </div>

                {/* Right Sidebar (Desktop) */}
                <div className="hidden lg:col-span-4 lg:block space-y-6">
                    {/* Create Post Widget */}
                    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 font-semibold text-foreground">
                            <PlusCircle className="w-5 h-5 text-primary" />
                            <span>Contribute</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Start a new discussion or ask a question to the community.
                        </p>
                        <CreateThreadButton />
                    </div>

                    {/* Community Info Widget */}
                    <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3 font-semibold text-foreground/80">
                            <Info className="w-4 h-4" />
                            <span>About</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p>
                                Welcome to the Wikits Community. A place for learners and experts to connect.
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                                <div>
                                    <div className="font-bold text-foreground">{stats.members}</div>
                                    <div className="text-xs">Members</div>
                                </div>
                                <div>
                                    <div className="font-bold text-foreground text-green-500 flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        {stats.online}
                                    </div>
                                    <div className="text-xs">Online</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trending (Desktop Vertical) */}
                    <div className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3 font-semibold text-foreground/80">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <span>Trending Topics</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics.map(topic => (
                                <Link key={topic.slug} href={`/wiki/${topic.slug}/forum`}>
                                    <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors block">
                                        w/{topic.title}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
