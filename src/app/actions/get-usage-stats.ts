"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { and, eq, sql, gte, lt } from "drizzle-orm";

import { getSystemSetting } from "@/lib/settings";

export interface UsageStats {
    used: number;
    limit: number;
}

export async function getUsageStats(): Promise<UsageStats> {
    const { userId } = await auth();
    if (!userId) {
        // Guest limit could also be dynamic if needed, but keeping simple for now
        return { used: 0, limit: 10 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count GENERATION events for today
    const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(events)
        .where(
            and(
                eq(events.userId, userId),
                eq(events.type, "GENERATION"),
                gte(events.createdAt, today),
                lt(events.createdAt, tomorrow)
            )
        );

    // Fetch dynamic limit
    const limitStr = await getSystemSetting("daily_generation_limit");
    const limit = parseInt(limitStr, 10) || 50;

    return {
        used: Number(result?.count || 0),
        limit,
    };
}
