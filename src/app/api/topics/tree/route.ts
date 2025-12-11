import { db } from "@/db";
import { topics } from "@/db/schema";
import { NextResponse } from "next/server";
import { isNull } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'global';

    // TODO: Get actual user ID from Auth (Clerk/NextAuth)
    // For now, we simulate a "current user" which we will also use for new generations.
    const currentUserId = "user_2qD5DQ5D5Q5D5Q5D5D5D5D5D5";

    try {
        let allTopics;

        if (mode === 'personal') {
            // Personal Mode: 
            // 1. Fetch topics created by user
            // 2. OR system topics that are parents of user topics (to maintain tree structure?)
            // Actually, user asked: "all personal searches and new relationships... added to personal db... personal establishments also added to global"
            // "Global should always be updated by all users"

            // Interpretation: 
            // Personal View = Shows ONLY items created by user? OR shows Global items + Personal items?
            // "databases should have a toggle... personal mode... otherwise the db should not be affected"
            // This suggests Personal View is a subset.

            // Simple approach: Filter by creatorId. 
            // Issue: If I create a leaf node "My Note" under Global node "Physics", and I only see "My Note", it's an orphan.
            // Solution: We must fetch ALL nodes, but only show:
            // - User Created Nodes
            // - Ancestors of User Created Nodes (so they are reachable)

            // For now, let's just fetch everything and flag them, or let client filter?
            // Client filtering is easier for tree consistency.
            // Let's pass `creatorId` to client and let Sidebar filter. 
            // ACTUALLY, if the DB grows huge, we can't fetch all. 
            // But for now, returning all with `creatorId` is safest to keep hierarchy intact.

            allTopics = await db.select().from(topics);
        } else {
            // Global Mode: Show everything
            allTopics = await db.select().from(topics);
        }

        // Wait, if we want to filter on server:
        // const whereClause = mode === 'personal' ? eq(topics.creatorId, currentUserId) : undefined;
        // const allTopics = await db.select().from(topics).where(whereClause);
        // This breaks hierarchy if parents are missing.

        // BETTER STRATEGY: Return all topics, but mark `isUserCreated`. 
        // Then client decides what to show.
        // OR better yet: Return tree, but prune branches that don't contain user content?
        // That's complex for this step.

        // Let's stick to returning ALL topics for now, but ensure `creatorId` is exposed so Sidebar can verify ownership.
        // The `allTopics` query already returns all columns including `creatorId`.

        // BUT, filtering on server is requested "toggle".
        // Let's add a specialized filter query for 'personal' later if performance demands.
        // For now, let's just ensure we return data.
        // Wait, I should respect the mode param to at least filter if I can.

        // Let's change the strategy: Update GENERATION to set creatorId.
        // Update Sidebar to filter.
        // This API just returns data.

        // However, I should probably return the `currentUserId` in a meta field or rely on client auth?
        // Since auth is mock, I'll hardcode the ID in the `generation` step. 
        // Here, I will just return the data. The Schema update ensures `creatorId` is sent.

        // Just return all topics.
        allTopics = await db.select().from(topics);

        // Build Tree
        const topicMap = new Map();
        const roots: any[] = [];

        // 1. Initialize map
        allTopics.forEach(t => {
            topicMap.set(t.id, { ...t, children: [] });
        });

        // 2. Link children to parents
        allTopics.forEach(t => {
            if (t.parentId && topicMap.has(t.parentId)) {
                topicMap.get(t.parentId).children.push(topicMap.get(t.id));
            } else {
                roots.push(topicMap.get(t.id));
            }
        });

        // 3. Cycle Prevention & Cleanup
        // We traverse the roots and ensure no cycles exist before serializing.
        const cleanTree = (nodes: any[], visitedIds = new Set<string>()): any[] => {
            return nodes.map(node => {
                // If we've seen this node in the current ancestry chain, it's a cycle.
                // However, since we are building by reference, the same node instance might appear in multiple places 
                // ONLY if the graph is a DAG (but topics are strict tree ideally).
                // Actually, if we have A -> B -> A, we have a problem.

                if (visitedIds.has(node.id)) {
                    console.warn(`[TreeAPI] Cycle detected for topic "${node.title}" (${node.id}). Pruning.`);
                    return { ...node, children: [] }; // Prune children
                }

                const newVisited = new Set(visitedIds);
                newVisited.add(node.id);

                return {
                    ...node,
                    children: node.children ? cleanTree(node.children, newVisited) : []
                };
            });
        };

        const safeRoots = cleanTree(roots);

        return NextResponse.json(safeRoots);
    } catch (error) {
        console.error("Error fetching topic tree:", error);
        return NextResponse.json({ error: "Failed to fetch hierarchy" }, { status: 500 });
    }
}
