import { SearchInput } from '@/components/ui/search-input';
import { WikiList } from '@/components/wiki/wiki-list';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { getWikiFilters } from '@/lib/db-queries';
import { WikiFilters } from '@/components/wiki/wiki-filters';

export const revalidate = 0;

// Re-implement the initial fetch here to match API logic, or better yet, reuse the query logic helper?
// Let's use `getAllTopics` but modify it to accept limit?
// Or just inline the query here since we are moving towards a specific paginated pattern.
// Better: update getAllTopics to be paginated, but legacy uses might break.
// Let's just run the query here for the initial prop.

async function getInitialTopics(q?: string, parentId?: string) {
    return await db.query.topics.findMany({
        where: (topics, { ilike, or, and, eq }) => {
            const conditions = [];
            if (q) conditions.push(or(ilike(topics.title, `%${q}%`), ilike(topics.overview, `%${q}%`)));
            if (parentId) conditions.push(eq(topics.parentId, parentId));
            return and(...conditions);
        },
        orderBy: [asc(topics.title)],
        limit: 12,
        columns: {
            id: true,
            title: true,
            slug: true,
            overview: true,
            createdAt: true,
        },
    });
}

export default async function WikiIndex({
    searchParams
}: {
    searchParams: Promise<{ q?: string; parentId?: string }>
}) {
    const { q, parentId } = await searchParams;
    const [initialTopics, filters] = await Promise.all([
        getInitialTopics(q, parentId),
        getWikiFilters()
    ]);

    return (
        <div className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Living Archive</h1>
                <p className="text-lg text-muted-foreground font-light max-w-2xl mb-8">
                    A persistent collection of generated knowledge. Explore the topics you have mastered.
                </p>

                <div className="max-w-md mb-8">
                    <SearchInput placeholder="Search topics..." />
                </div>

                <WikiFilters filters={filters} />
            </div>

            <WikiList initialTopics={initialTopics} />
        </div>
    );
}
