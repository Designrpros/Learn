'use server';

import { db } from '@/db';
import { threads, posts, threadTags, tags, threadVotes } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function createThread(formData: FormData) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string || 'General';
    const topicId = formData.get('topicId') as string | null;
    // const tagNames = (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean);

    if (!title || !content) {
        throw new Error("Missing fields");
    }

    // 1. Create Thread
    const [newThread] = await db.insert(threads).values({
        title,
        category,
        topicId: topicId || null, // Link to topic if provided
        authorId: userId,
        authorName: user.fullName || user.username || 'Anonymous',
    }).returning();

    // 2. Create Initial Post (OP content)
    await db.insert(posts).values({
        threadId: newThread.id,
        content,
        authorId: userId,
        authorName: user.fullName || user.username || 'Anonymous',
    });

    // 3. Handle Tags (TODO: Implement tag creation/linking logic)

    revalidatePath('/forum');
    if (topicId) {
        // If created within a topic, go back to that topic's forum/thread view?
        // Or just redirect to the thread detail page (which is generic right now /forum/[threadId])
        // Let's stick to the generic thread detail for now, or consider /wiki/[slug]/forum/thread/[id]?
        // The current routes are /forum/[threadId]. Let's keep it simple.
    }
    redirect(`/forum/thread/${newThread.id}`);
}

export async function createPost(formData: FormData) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const threadId = formData.get('threadId') as string;
    const content = formData.get('content') as string;

    if (!threadId || !content) {
        return;
    }

    await db.insert(posts).values({
        threadId,
        content,
        authorId: userId,
        authorName: user.fullName || user.username || 'Anonymous',
    });

    revalidatePath(`/forum/thread/${threadId}`);
}

export async function toggleVote(threadId: string, value: 1 | -1) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check existing vote
    const existingVote = await db.query.threadVotes.findFirst({
        where: (votes, { and, eq }) => and(
            eq(votes.threadId, threadId),
            eq(votes.userId, userId)
        )
    });

    if (existingVote) {
        if (existingVote.value === value) {
            // Toggle off (remove vote)
            await db.delete(threadVotes).where(eq(threadVotes.id, existingVote.id));
        } else {
            // Change vote
            await db.update(threadVotes)
                .set({ value })
                .where(eq(threadVotes.id, existingVote.id));
        }
    } else {
        // Create new vote
        await db.insert(threadVotes).values({
            threadId,
            userId,
            value
        });
    }

    revalidatePath('/forum');
    revalidatePath(`/forum/thread/${threadId}`);
}
