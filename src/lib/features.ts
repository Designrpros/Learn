
"use server";

import { db } from "@/db";
import { featureFlags } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getFeatureFlags() {
    return await db.select().from(featureFlags).orderBy(desc(featureFlags.createdAt));
}

export async function toggleFeatureFlag(id: string, currentState: boolean) {
    try {
        await db.update(featureFlags)
            .set({
                isEnabled: !currentState,
                updatedAt: new Date()
            })
            .where(eq(featureFlags.id, id));

        revalidatePath("/admin/features");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle flag", error);
        return { success: false, error: "Failed to update flag" };
    }
}

export async function createFeatureFlag(key: string, description: string, shouldRevalidate: boolean = true) {
    try {
        await db.insert(featureFlags).values({
            key,
            description,
            isEnabled: false, // Default to disabled
        });

        if (shouldRevalidate) {
            revalidatePath("/admin/features");
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to create flag", error);
        return { success: false, error: "Failed to create flag" };
    }
}

export async function deleteFeatureFlag(id: string) {
    try {
        await db.delete(featureFlags).where(eq(featureFlags.id, id));
        revalidatePath("/admin/features");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete flag", error);
        return { success: false, error: "Failed to delete flag" };
    }
}
