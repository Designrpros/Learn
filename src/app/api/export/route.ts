
import { NextResponse } from 'next/server';
import { db } from '@/db'; // Adjust path if needed
import { auth } from '@clerk/nextjs/server'; // Adjust based on Clerk version
import { topics, chapters, relationships, threads, posts } from '@/db/schema';

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // Fetch all data
        // In a real production app, we might stream this or paginate.
        // For now, fetching all is acceptable for this scale.

        const allTopics = await db.select().from(topics);
        const allChapters = await db.select().from(chapters);
        const allRelationships = await db.select().from(relationships);
        const allThreads = await db.select().from(threads);
        const allPosts = await db.select().from(posts);

        const exportData = {
            metadata: {
                version: "1.0",
                exportedAt: new Date().toISOString(),
                exportedBy: userId,
                system: "Wikits"
            },
            data: {
                topics: allTopics,
                chapters: allChapters,
                relationships: allRelationships,
                threads: allThreads,
                posts: allPosts
            }
        };

        const json = JSON.stringify(exportData, null, 2);

        return new NextResponse(json, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="wikits-backup-${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (error) {
        console.error("Export failed:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
