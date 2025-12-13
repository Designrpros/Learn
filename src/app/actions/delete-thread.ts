"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { threads } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteThread(threadId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Attempt to delete thread where id matches AND authorId matches current user
    const deleted = await db.delete(threads)
        .where(
            and(
                eq(threads.id, threadId),
                eq(threads.authorId, userId)
            )
        )
        .returning();

    if (deleted.length === 0) {
        throw new Error("Failed to delete thread. You may not be the author.");
    }

    revalidatePath("/forum");
    revalidatePath("/wiki/[slug]/forum", "page");
    return { success: true };
}
