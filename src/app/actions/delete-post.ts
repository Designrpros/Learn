"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deletePost(postId: string, threadId?: string) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const metadata = sessionClaims?.metadata as { role?: string };
    const isAdmin = metadata?.role === "admin";

    let deleted;

    if (isAdmin) {
        deleted = await db.delete(posts)
            .where(eq(posts.id, postId))
            .returning();
    } else {
        // Attempt to delete post where id matches AND authorId matches current user
        deleted = await db.delete(posts)
            .where(
                and(
                    eq(posts.id, postId),
                    eq(posts.authorId, userId)
                )
            )
            .returning();
    }

    if (deleted.length === 0) {
        throw new Error("Failed to delete post. You may not be the author.");
    }

    revalidatePath("/forum");
    revalidatePath("/wiki/[slug]/forum", "page");
    return { success: true };
}
