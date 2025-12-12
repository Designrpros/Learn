import { db } from "@/db";
import { threads } from "@/db/schema";
import { desc, ilike, or } from "drizzle-orm";
import { ForumDockActions } from "@/components/forum/forum-dock-actions";
import { SearchInput } from "@/components/ui/search-input";
import { ForumList } from "@/components/forum/forum-list";

export const revalidate = 0;

async function getInitialThreads(q?: string) {
    return await db.query.threads.findMany({
        where: (threads, { ilike, or, and }) => {
            const conditions = [];
            if (q) {
                conditions.push(or(ilike(threads.title, `%${q}%`)));
            }
            return and(...conditions);
        },
        orderBy: [desc(threads.createdAt)],
        limit: 10,
        with: {
            tags: {
                with: {
                    tag: true
                }
            },
            posts: {
                columns: {
                    id: true
                }
            }
        }
    });
}

export default async function ForumPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams;
    const searchQuery = q;
    const initialThreads = await getInitialThreads(searchQuery);

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 pb-32">
            <header className="mb-12 text-center relative">
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-foreground mb-4">Community Forum</h1>
                <p className="text-muted-foreground text-lg mb-6">Discuss topics, ask questions, and share knowledge.</p>
                <div className="max-w-md mx-auto mb-6">
                    <SearchInput placeholder="Search discussions..." className="shadow-sm" />
                </div>
                <ForumDockActions />
            </header>

            <ForumList initialThreads={initialThreads} />
        </div>
    );
}
