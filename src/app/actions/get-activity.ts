'use server';

import { getRecentActivity as getRecentActivityQuery } from "@/lib/db-queries";

export async function getRecentActivity() {
    return await getRecentActivityQuery();
}
