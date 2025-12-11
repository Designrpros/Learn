'use server';

import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from '@/lib/ai-config';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq, ilike } from 'drizzle-orm';

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function resolveTopic(query: string): Promise<string> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return "";

    // 1. Fast Path: Check for exact slug match
    const simpleSlug = slugify(cleanQuery);
    const existing = await db.query.topics.findFirst({
        where: eq(topics.slug, simpleSlug)
    });
    if (existing) {
        return existing.slug;
    }

    try {
        // 3. AI Resolution
        // We use a cheap call to distill the topic AND find a category.
        const result = await generateObject({
            model: defaultModel,
            schema: z.object({
                topic: z.string().describe("The canonical, encyclopedic topic title (e.g. 'Cricket', 'Quantum Physics')."),
                category: z.string().describe("The broad parent category this belongs to (e.g. 'Sports', 'Science', 'History')."),
                confidence: z.number().describe("Confidence score 0-1")
            }),
            prompt: `Analyze this search query and identify the specific topic and its broad category.
            Query: "${cleanQuery}"
            
            Examples:
            "how to play cricket" -> Topic: "Cricket", Category: "Sports"
            "tell me about napoleon" -> Topic: "Napoleon Bonaparte", Category: "History"
            "react hooks" -> Topic: "React (JavaScript Library)", Category: "Computer Science"
            `
        });

        const refinedTopic = result.object.topic;
        const parentCategory = result.object.category;
        const refinedSlug = slugify(refinedTopic);

        console.log(`[Smart Resolve] "${query}" -> Topic: "${refinedTopic}" (slug: ${refinedSlug}), Category: "${parentCategory}"`);

        // Check if topic exists (by new refined slug)
        const existingRefined = await db.query.topics.findFirst({
            where: eq(topics.slug, refinedSlug)
        });
        if (existingRefined) return existingRefined.slug;

        // --- Create Logic ---
        // 1. Resolve Parent Category
        let parentId: string | null = null;
        if (parentCategory) {
            const catSlug = slugify(parentCategory);
            const existingCat = await db.query.topics.findFirst({ where: eq(topics.slug, catSlug) });

            if (existingCat) {
                parentId = existingCat.id;
            } else {
                // Create Category Stub
                try {
                    const [newCat] = await db.insert(topics).values({
                        title: parentCategory,
                        slug: catSlug,
                        overview: "Category",
                        isPublic: true,
                        creatorId: "system-resolver"
                    }).returning();
                    parentId = newCat.id;
                    console.log(`[Smart Resolve] Created new Category: "${parentCategory}"`);
                } catch (e) {
                    // Race condition ignoring
                    const retryCat = await db.query.topics.findFirst({ where: eq(topics.slug, catSlug) });
                    if (retryCat) parentId = retryCat.id;
                }
            }
        }

        // 2. Create The Topic Stub (so the page has something to load)
        try {
            await db.insert(topics).values({
                title: refinedTopic,
                slug: refinedSlug,
                overview: "",
                parentId: parentId, // Link to Category!
                isPublic: true,
                creatorId: "user_smart_search"
            });
            console.log(`[Smart Resolve] Created Topic Stub: "${refinedTopic}" under "${parentCategory}"`);
        } catch (e: any) {
            if (e.code === '23505' || e.message?.includes('duplicate key')) {
                // Already exists, just flow through
            } else {
                console.error("[Smart Resolve] Error creating topic stub:", e);
            }
        }

        return refinedSlug;

    } catch (e) {
        console.error("Smart Resolve Failed", e);
        // Fallback to original query slug if AI fails
        return simpleSlug;
    }
}
