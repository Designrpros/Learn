"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { and, eq, sql, gte, lt } from "drizzle-orm";

export interface UsageStats {
    used: number;
    limit: number;
}

export async function getUsageStats(): Promise<UsageStats> {
    const { userId } = await auth();
    if (!userId) return { used: 0, limit: 10 }; // Default for guests

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

    // Define limits (could be dynamic based on plan later)
    const limit = 50;

    return {
        used: Number(result?.count || 0),
        limit,
    };
}
