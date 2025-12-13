"use server";

import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
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
