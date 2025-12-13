"use server";

import { db } from "@/db";
import { campaigns, adEvents } from "@/db/schema";
import { eq, sql, and, isNotNull, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteCampaign(id: string) {
    try {
        await db.delete(campaigns).where(eq(campaigns.id, id));
        revalidatePath("/ads");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete campaign", error);
        return { success: false, error: "Failed to delete campaign" };
    }
}

export async function getAdToDisplay() {
    try {
        const result = await db.select().from(campaigns)
            .where(and(
                eq(campaigns.status, 'active'),
                isNotNull(campaigns.headline),
                ne(campaigns.headline, '')
            ))
            .orderBy(sql`RANDOM()`)
            .limit(1);

        return result[0] || null;
    } catch (error) {
        console.error("Failed to fetch ad", error);
        return null;
    }
}

export async function trackAdImpression(campaignId: string) {
    try {
        await db.insert(adEvents).values({
            campaignId,
            type: 'impression',
        });
    } catch (error) {
        console.error("Failed to track impression", error);
    }
}

export async function trackAdClick(campaignId: string) {
    try {
        await db.insert(adEvents).values({
            campaignId,
            type: 'click',
        });
    } catch (error) {
        console.error("Failed to track click", error);
    }
}
