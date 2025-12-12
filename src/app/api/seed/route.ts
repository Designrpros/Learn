import { db } from "@/db";
import { topics, chapters, events, posts, threadTags, threads, tags, relationships, faqs } from "@/db/schema";
import { WIKIPEDIA_OUTLINE, OutlineItem } from "@/lib/wikipedia-outline";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

async function insertTopicRecursive(item: OutlineItem, parentId: string | null = null, order: number = 0) {
    // 1. Insert current topic
    const [newTopic] = await db.insert(topics).values({
        title: item.title,
        slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        parentId: parentId || null,
        icon: item.icon || null,
        order: order,
        // syllabus: null // Explicitly null to indicate it's a seed stub
    })
        .onConflictDoUpdate({
            target: topics.slug,
            set: { title: item.title, parentId: parentId || null, icon: item.icon || null, order: order } // Update title/parent if exists
        })
        .returning({ id: topics.id });

    if (!newTopic) return;

    // 2. Insert dummy thread (Wikits/Sub feature verification)
    if (Math.random() > 0.3) { // 70% chance to have a thread
        await db.insert(threads).values({
            topicId: newTopic.id,
            title: `Discussion: ${item.title}`,
            category: "General",
            authorName: "System",
            createdAt: new Date(),
        });
    }

    // 3. Recursively insert children
    if (item.children && item.children.length > 0) {
        for (const [index, child] of item.children.entries()) {
            await insertTopicRecursive(child, newTopic.id, index);
        }
    }
}

export async function GET() {
    try {
        // 1. Flush existing data (Optional: user requested flush)
        // To be safe we delete content related tables. 
        // We are careful not to delete user accounts if they existed (but we use Clerk so its fine)
        await db.delete(posts);
        await db.delete(chapters);
        await db.delete(events);
        await db.delete(threadTags);
        await db.delete(threads); // Deletes forum content
        await db.delete(faqs); // Deletes FAQs
        await db.delete(relationships); // New deletion
        // relationships usually link topics, so delete them before topics
        // I need to import relationships first
        // await db.delete(relationships); // This was missing

        // Deleting all topics will fail if relationships exist.
        // Drizzle doesn't support 'relationships' directly here unless I import it.
        // Let's rely on 'sql' for a cleaner truncate if possible or import it.

        // Since I cannot modify imports in this specific Replace block easily without context,
        // I will use raw SQL to truncate everything or delete via table object if I can seeing the file.

        await db.delete(topics);  // Deletes wiki content

        // 2. Seed Recursive
        for (const [index, item] of WIKIPEDIA_OUTLINE.entries()) {
            await insertTopicRecursive(item, null, index);
        }

        return NextResponse.json({ success: true, message: "Database flushed and seeded with hierarchy." });
    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
