"use server";

import { db } from "@/db";
import { threads } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export type NotificationItem = {
    id: string;
    type: 'reply' | 'upvote';
    actorName: string; // Who did it
    threadTitle: string;
    content?: string; // For replies
    timestamp: Date;
    read: boolean; // Mocked for now
    threadId: string;
};

export async function getNotifications(): Promise<NotificationItem[]> {
    const { userId } = await auth();

    if (!userId) return [];

    // Fetch all threads authored by the user
    // We get posts and votes to aggregate "notifications"
    const myThreads = await db.query.threads.findMany({
        where: eq(threads.authorId, userId),
        with: {
            posts: {
                columns: {
                    id: true,
                    content: true,
                    authorId: true,
                    authorName: true,
                    createdAt: true
                }
            },
            votes: {
                columns: {
                    id: true,
                    userId: true,
                    // authorName not in votes, unfortunately. We might just say "Someone" or fetch user.
                    // For now, "Someone" or "A user"
                    createdAt: true
                }
            }
        }
    });

    const notifications: NotificationItem[] = [];

    for (const thread of myThreads) {
        // 1. Process Replies
        for (const post of thread.posts) {
            // Exclude own replies
            if (post.authorId !== userId) {
                notifications.push({
                    id: post.id,
                    type: 'reply',
                    actorName: post.authorName || 'Anonymous',
                    threadTitle: thread.title,
                    content: post.content,
                    timestamp: post.createdAt,
                    read: false, // Default unread in this transient view
                    threadId: thread.id
                });
            }
        }

        // 2. Process Votes (Upvotes only ideally, but we track all for now)
        for (const vote of thread.votes) {
            // Exclude own votes
            if (vote.userId !== userId) {
                notifications.push({
                    id: vote.id,
                    type: 'upvote',
                    actorName: "Someone", // We don't store voter names in current simplified schema
                    threadTitle: thread.title,
                    timestamp: vote.createdAt,
                    read: false,
                    threadId: thread.id
                });
            }
        }
    }

    // Sort by newest first
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return notifications;
}
