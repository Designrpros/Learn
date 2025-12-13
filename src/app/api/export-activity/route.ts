
import { db } from "@/db";
import { events } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all SEARCH events
        // Since we stored userId in metadata jsonb, we need to fetch all and filter, 
        // or use sql operator if we were sure of syntax. Fetching all SEARCH events is fine for now.
        const searchEvents = await db.query.events.findMany({
            where: eq(events.type, 'SEARCH'),
            orderBy: [desc(events.createdAt)],
        });

        // Filter for current user and extract unique topics
        // Using a Set to deduplicate
        const uniqueTopics = new Set<string>();
        const history: Record<string, any> = {};

        searchEvents.forEach(event => {
            const meta = event.metadata as any;
            if (meta && meta.userId === userId && meta.query) {
                if (!uniqueTopics.has(meta.query)) {
                    uniqueTopics.add(meta.query);
                    // Create dictionary entry
                    history[meta.query] = {
                        timestamp: event.createdAt,
                        action: event.action
                    };
                }
            }
        });

        // Format as requested: "dictionary of topics"
        // Wrapper object 'topics' contains the list/dictionary
        const exportData = {
            metadata: {
                userId,
                exportedAt: new Date().toISOString(),
                count: uniqueTopics.size
            },
            topics: Array.from(uniqueTopics), // Simple list as per "dictionary of topics but with only the topics" (could mean list)
            // If they strictly meant a Dictionary Object:
            activity_log: history
        };

        return NextResponse.json(exportData);
    } catch (error) {
        console.error("Export failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
