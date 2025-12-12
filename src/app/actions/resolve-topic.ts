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

import { WIKIPEDIA_OUTLINE } from '@/lib/wikipedia-outline';

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
        // Flatten Outline for Context (Level 1 & 2)
        const outlineContext = WIKIPEDIA_OUTLINE.map(root => {
            const children = root.children?.map(c => c.title).join(", ");
            return `- ${root.title}: [${children || ""}]`;
        }).join("\n");

        // 3. AI Resolution with Strict Hierarchy
        const result = await generateObject({
            model: defaultModel,
            schema: z.object({
                topic: z.string().describe("The canonical topic title"),
                path: z.array(z.string()).describe("The hierarchical path starting from a Root Category down to the direct parent. MUST use existing categories from the provided list if possible.")
            }),
            prompt: `Analyze this search query and identify the specific topic and its hierarchical path within the Knowledge Tree.
            
            EXISTING KNOWLEDGE TREE (Roots and Major Categories):
            ${outlineContext}

            RULES:
            1. The 'path' array MUST start with one of the Root Categories from the list above (e.g. "Technology", "Human Activities", "Arts").
            2. You can add intermediate sub-categories to the path if they don't exist, but try to use existing keys.
            3. The last item in the 'path' will be the direct parent of the new topic.

            Query: "${cleanQuery}"
            
            Example:
            Query: "Plumbing"
            Topic: "Plumbing"
            Path: ["Technology", "Engineering", "Civil Engineering"]
            (Result: Technology -> Engineering -> Civil Engineering -> Plumbing)
            `
        });

        const refinedTopic = result.object.topic;
        const refinedSlug = slugify(refinedTopic);
        const path = result.object.path;

        console.log(`[Smart Resolve] "${query}" -> Topic: "${refinedTopic}" Path: [${path.join(" > ")}]`);

        // Check availability
        const existingRefined = await db.query.topics.findFirst({
            where: eq(topics.slug, refinedSlug)
        });
        if (existingRefined) return existingRefined.slug;

        // --- Recursive Path Resolution ---
        let currentParentId: string | null = null;

        // Iterate through path to resolve/create parents
        for (const segment of path) {
            const segmentSlug = slugify(segment);

            // 1. Check if this segment exists (under the current parent? OR Global unique slug?)
            // We use global slug uniqueness for simplicity in this MVP.
            // Ideally we check parentId too, but let's assume slug collision implies same topic.
            let segmentTopic: typeof topics.$inferSelect | undefined = await db.query.topics.findFirst({
                where: eq(topics.slug, segmentSlug)
            });

            if (!segmentTopic) {
                // Create Intermediate Stub
                try {
                    console.log(`[Smart Resolve] Creating Intermediate Node: "${segment}" (Parent: ${currentParentId})`);
                    const results: (typeof topics.$inferSelect)[] = await db.insert(topics).values({
                        title: segment,
                        slug: segmentSlug,
                        overview: "Category",
                        parentId: currentParentId, // Link to previous node in path
                        isPublic: true,
                        creatorId: null // System/Intermediate (Strict Parenting treats null as System)
                    }).returning();

                    if (results && results.length > 0) {
                        segmentTopic = results[0];
                    }
                } catch (e) {
                    // Race condition handle
                    segmentTopic = await db.query.topics.findFirst({ where: eq(topics.slug, segmentSlug) });
                }
            }

            if (segmentTopic) {
                currentParentId = segmentTopic.id;
            }
        }

        // 2. Create The Final Topic Stub
        try {
            await db.insert(topics).values({
                title: refinedTopic,
                slug: refinedSlug,
                overview: "",
                parentId: currentParentId, // Link to last resolved node
                isPublic: true,
                creatorId: "user_smart_search"
            });
            console.log(`[Smart Resolve] Created Topic Stub: "${refinedTopic}" under ParentID: ${currentParentId}`);
        } catch (e) {
            console.error("[Smart Resolve] Error creating final topic:", e);
        }

        return refinedSlug;

    } catch (e) {
        console.error("Smart Resolve Failed", e);
        return simpleSlug;
    }
}
