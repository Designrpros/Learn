"use server";

import { db } from "@/db";

export async function getMapData() {
    try {
        const topics = await db.query.topics.findMany({
            columns: {
                id: true,
                title: true,
                slug: true,
                parentId: true,
            }
        });

        const dbEdges = await db.query.relationships.findMany({
            columns: {
                id: true,
                sourceTopicId: true,
                targetTopicId: true,
                type: true,
            }
        });

        // Infer Hierarchy Edges
        const hierarchyEdges = topics
            .filter(t => t.parentId)
            .map(t => ({
                id: `hierarchy-${t.id}`,
                sourceTopicId: t.parentId!,
                targetTopicId: t.id,
                type: 'hierarchy'
            }));

        const edges = [...dbEdges, ...hierarchyEdges];

        return { topics, edges };
    } catch (error) {
        console.error("Failed to fetch map data:", error);
        return { topics: [], edges: [] };
    }
}
