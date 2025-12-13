'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { events } from '@/db/schema';
import { and, eq, gte, lte, desc } from 'drizzle-orm';

export async function getDailyActivity(dateStr: string) {
    const { userId } = await auth();
    if (!userId) return [];

    // Parse date (YYYY-MM-DD)
    // Create Start and End of day timestamps
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        const dailyEvents = await db.query.events.findMany({
            where: and(
                eq(events.userId, userId),
                gte(events.createdAt, startOfDay),
                lte(events.createdAt, endOfDay)
            ),
            orderBy: [desc(events.createdAt)],
        });

        // Map to simpler format if needed, but returning raw is usually fine for UI to parse
        return dailyEvents.map(e => ({
            id: e.id,
            action: e.action,
            type: e.type,
            time: e.createdAt,
            metadata: e.metadata
        }));

    } catch (e) {
        console.error("Failed to fetch daily activity", e);
        return [];
    }
}
