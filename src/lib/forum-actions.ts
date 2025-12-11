"use server";

import { db } from '@/db';
import { threads, posts } from '@/db/schema';
import { desc, eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- ACTIONS ---

export async function createThread(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = (formData.get('category') as string) || 'General';

    if (!title || !content) return;

    // Transaction: Create Thread -> Create First Post
    let newThreadId: string | undefined;

    await db.transaction(async (tx) => {
        const [thread] = await tx.insert(threads).values({
            title,
            category,
        }).returning({ id: threads.id });

        newThreadId = thread.id;

        await tx.insert(posts).values({
            threadId: thread.id,
            topicId: null, // Explicitly null for TS satisfaction
            content,
            authorName: 'Anonymous', // Placeholder for now
            authorId: 'anonymous',
        });
    });

    if (newThreadId) {
        revalidatePath('/forum');
        redirect(`/forum/${newThreadId}`);
    }
}

export async function createPost(formData: FormData) {
    const threadId = formData.get('threadId') as string;
    const content = formData.get('content') as string;

    if (!threadId || !content) return;

    await db.insert(posts).values({
        threadId,
        topicId: null,
        content,
        authorName: 'Anonymous', // Placeholder
        authorId: 'anonymous',
    });

    // Update thread "updatedAt" to bump it to top
    await db.update(threads)
        .set({ updatedAt: new Date() })
        .where(eq(threads.id, threadId));

    revalidatePath(`/forum/${threadId}`);
}


// --- QUERIES ---

export async function getThreads() {
    return await db.query.threads.findMany({
        orderBy: [desc(threads.updatedAt)],
        with: {
            posts: {
                limit: 1, // Just to get a snippet or count if needed
            }
        }
    });
}

export async function getThread(id: string) {
    return await db.query.threads.findFirst({
        where: eq(threads.id, id),
        with: {
            posts: {
                orderBy: [asc(posts.createdAt)],
            }
        }
    });
}
