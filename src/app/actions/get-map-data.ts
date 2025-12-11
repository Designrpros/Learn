"use server";

import { db } from "@/db";

export async function getMapData() {
    try {
        const topics = await db.query.topics.findMany({
            columns: {
                id: true,
                title: true,
                slug: true,
            }
        });

        const edges = await db.query.relationships.findMany({
            columns: {
                id: true,
                sourceTopicId: true,
                targetTopicId: true,
                type: true,
            }
        });

        return { topics, edges };
    } catch (error) {
        console.error("Failed to fetch map data:", error);
        return { topics: [], edges: [] };
    }
}
