'use server';

import { getRecentActivity as getRecentActivityQuery } from "@/lib/db-queries";

import { auth } from "@clerk/nextjs/server";

export async function getRecentActivity() {
    const { userId } = await auth();
    if (!userId) return [];

    return await getRecentActivityQuery(userId);
}
