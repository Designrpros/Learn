import { streamObject } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { WIKIPEDIA_OUTLINE } from "@/lib/wikipedia-outline";
import { defaultModel } from '@/lib/ai-config';
import { db } from '@/db';
import { topics, chapters, relationships } from '@/db/schema';
import { logActivity } from '@/lib/db-queries';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

import { WIKI_OUTLINE_CONSTRAINT } from '@/lib/ai-constraints';
import { syllabusSchema } from '@/lib/schemas';

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const input = await req.json();
    let { topic, force } = input;
    const { topicId } = input;

    // Validate Input
    if (!topic && !topicId) {
        return new NextResponse("Missing 'topic' or 'topicId'", { status: 400 });
    }

    // Resolve Topic Name if missing
    if (!topic && topicId) {
        const dbTopic = await db.query.topics.findFirst({
            where: eq(topics.id, topicId),
        });
        if (dbTopic) {
            topic = dbTopic.title;
        } else {
            return new NextResponse("Topic not found", { status: 404 });
        }
    }

    if (typeof topic !== 'string') {
        return new NextResponse("Invalid topic format", { status: 400 });
    }

    const slug = slugify(topic);



    // 1. Check Cache (Skip if force=true)
    if (!force) {
        try {
            const existingTopic = await db.query.topics.findFirst({
                where: eq(topics.slug, slug),
            });

            if (existingTopic && existingTopic.syllabus) {
                console.log(`[API] Cache Hit for "${topic}". Returning saved syllabus.`);
                return NextResponse.json(existingTopic.syllabus);
            }
        } catch (err) {
            console.error("[API] DB Read Error:", err);
        }
    } else {
        console.log(`[API] Forced Regeneration requested for "${topic}"`);
    }

    // 2. Generate and Save
    console.log(`[API] Cache Miss. Generating new syllabus...`);

    // Helper to flatten outline for context
    const outlineContext = WIKIPEDIA_OUTLINE.map(root => {
        const children = root.children?.map(c => c.title).join(", ");
        return `- ${root.title}: [${children || ""}]`;
    }).join("\n");

    const result = await streamObject({
        model: defaultModel,
        schema: syllabusSchema,
        // Constraint: Title must be concise.
        system: `You are a high-quality academic knowledge generator. 
    Design a bespoke curriculum for the user's requested topic.
    The tone should be intellectual, warm, and structured.
    
    IMPORTANT: The 'title' field must be EXACTLY the topic name requested, or a very short variation. 
    DO NOT add subtitles, colons, or flowery descriptions.

    STRICT HIERARCHY RULE:
    You must classify this topic within the existing knowledge tree provided below.
    The topic must be placed under the most specific existing parent.
    
    EXISTING KNOWLEDGE TREE (Roots and Major Categories):
    ${outlineContext}

    In your 'tags', you MUST include the path from the broadest category down to the specific field.
    Example: for "Linear Algebra", tags should be ["Mathematics", "Algebra", "Linear Algebra"].
    
    ${WIKI_OUTLINE_CONSTRAINT}
    
    Start with a "Course Overview" that serves as an objective encyclopedia entry.
    Start immediately with the topic definition. 
    DO NOT introduce yourself. 
    Then create a logical flow of chapters.
    Finally, suggest related topics.`,
        prompt: `Topic: ${topic}`,
        onFinish: async ({ object }) => {
            if (!object) return;
            console.log(`[API] Syllabus Generation Completed. Saving to DB...`);

            // Sanitize Title
            let finalTitle = object.title || topic;
            if (finalTitle.includes(':')) {
                finalTitle = finalTitle.split(':')[0].trim();
            }
            if (finalTitle.length > topic.length + 10) {
                finalTitle = topic;
            }

            // 1. Resolve Parent Hierarchy
            let resolvedParentId = null;

            if (object.tags && object.tags.length > 0) {
                // Strategy A: Database Lookup (Existing Topics)
                for (let i = object.tags.length - 1; i >= 0; i--) {
                    const tag = object.tags[i];
                    const tagSlug = slugify(tag);
                    if (tagSlug === slug) continue;

                    const existingParent = await db.query.topics.findFirst({
                        where: (t, { and, eq, isNull }) => and(
                            eq(t.slug, tagSlug),
                            isNull(t.creatorId) // STRICT: Only attach to System Topics (Seed)
                        )
                    });

                    if (existingParent) {
                        resolvedParentId = existingParent.id;
                        console.log(`[API] Parenting Strategy A: Found DB match "${existingParent.title}" for tag "${tag}"`);
                        break;
                    }
                }
            }

            // Strategy B: Strict Outline Fallback (If no DB match found)
            if (!resolvedParentId) {
                console.log(`[API] Parenting Strategy A failed. Trying Strategy B (Outline Fuzzy Match)...`);
                // Try to match tags against the WIKIPEDIA_OUTLINE titles directly
                // This ensures that if the DB is missing a node but it IS in the outline (and thus should be in DB as a seed),
                // we might be able to find it if we search by title instead of exact slug match?
                // Or rather, if the AI says tag is "Maths" but DB has "Mathematics".

                // Let's implement a simple "Best Text Match" against root topics.
                for (const root of WIKIPEDIA_OUTLINE) {
                    // Check if any tag matches this root title
                    if (object.tags?.some(t => t.toLowerCase().includes(root.title.toLowerCase()) || root.title.toLowerCase().includes(t.toLowerCase()))) {
                        // Verify it exists in DB
                        const rootInDb = await db.query.topics.findFirst({ where: eq(topics.slug, slugify(root.title)) });
                        if (rootInDb) {
                            resolvedParentId = rootInDb.id;
                            console.log(`[API] Parenting Strategy B: Matched Root "${root.title}"`);
                            break;
                        }
                    }
                    // Check level 2
                    if (root.children) {
                        for (const child of root.children) {
                            if (object.tags?.some(t => t.toLowerCase() === child.title.toLowerCase())) {
                                const childInDb = await db.query.topics.findFirst({ where: eq(topics.slug, slugify(child.title)) });
                                if (childInDb) {
                                    resolvedParentId = childInDb.id;
                                    console.log(`[API] Parenting Strategy B: Matched Child "${child.title}"`);
                                    break;
                                }
                            }
                        }
                    }
                    if (resolvedParentId) break;
                }
            }

            if (!resolvedParentId) console.log(`[DEBUG] No matching parent found. Topic will be at root (or manual clean up required).`);

            let newTopic: any = null;

            try {
                // Simulated User ID (TODO: Replace with Auth)
                const currentUserId = "user_2qD5DQ5D5Q5D5Q5D5D5D5D5D5";

                const updateData: any = {
                    title: finalTitle,
                    overview: object.courseOverview,
                    syllabus: object,
                    // If we are updating an existing topic, DO NOT overwrite creatorId if it exists?
                    // actually, IF it's a stub (system created), maybe we claim it?
                    // For now, let's set creatorId ONLY if it's new or we are the creator.
                    // But `onConflictDoUpdate` handles conflicts.
                    // Let's assume shared ownership or "last generated by".
                    // Better: Only set creatorId on insert.
                };

                // Only update parentID if we found a valid new parent AND it's not self-referential
                // ALSO: If we are updating, we shouldn't accidentally orphan it if we didn't find a new parent?
                // But if we did find one, update it.
                if (resolvedParentId) {
                    // Double check we are not setting parent to self (should be caught by slug check above, but ID check is safer if topic renamed)
                    // But we don't have newTopic.id yet if inserting.
                    // Slug check is sufficient for insert.
                    updateData.parentId = resolvedParentId;
                }

                // Force claim ownership if we are generating content for it
                // This ensures it shows up in "Personal" view even if it was a system stub.
                updateData.creatorId = currentUserId;
                updateData.isPublic = true;

                // Save Topic
                const [insertedTopic] = await db.insert(topics).values({
                    title: finalTitle,
                    slug: slug,
                    overview: (object.courseOverview || "") as string,
                    parentId: resolvedParentId,
                    syllabus: object,
                    creatorId: currentUserId, // Mark as User Created
                    isPublic: true,           // Default to Public/Global visibility
                })
                    .onConflictDoUpdate({
                        target: topics.slug,
                        set: updateData
                    })
                    .returning();

                newTopic = insertedTopic;

                // Save Chapters
                await db.delete(chapters).where(eq(chapters.topicId, newTopic.id));

                if (object.chapters && object.chapters.length > 0) {
                    await db.insert(chapters).values(
                        object.chapters.map((ch, index) => ({
                            topicId: newTopic.id,
                            title: ch.title || "Untitled Chapter",
                            slug: ch.id || slugify(ch.title || `ch-${index}`),
                            content: null, // Content generated later
                            description: ch.description, // Save summary
                            order: index + 1,
                        }))
                    );
                }

                // REMOVED: Loop that inserted tags as children. 
                // Tags are now used for PARENT resolution.

                // Save Relationships
                if (object.relatedTopics && object.relatedTopics.length > 0) {
                    for (const rel of object.relatedTopics) {
                        const targetSlug = slugify(rel.topic);

                        // Upsert Target Topic (Stub)
                        let targetId: string;
                        const existingTarget = await db.query.topics.findFirst({ where: eq(topics.slug, targetSlug) });

                        if (existingTarget) {
                            targetId = existingTarget.id;
                        } else {
                            // Resolve Parent for this Related Topic
                            let relParentId: string | null = null;
                            if (rel.suggestedParent) {
                                const parentSlug = slugify(rel.suggestedParent);
                                // 1. Try DB Match
                                const dbParent = await db.query.topics.findFirst({ where: eq(topics.slug, parentSlug) });
                                if (dbParent) {
                                    relParentId = dbParent.id;
                                } else {
                                    // 2. Try Outline Match (Deep Search)
                                    // Check Roots
                                    let outlineMatch: any = WIKIPEDIA_OUTLINE.find(r => r.title.toLowerCase() === rel.suggestedParent?.toLowerCase());
                                    let isRoot = true;
                                    let parentRoot: any = null;

                                    if (!outlineMatch) {
                                        // Check Children
                                        for (const r of WIKIPEDIA_OUTLINE) {
                                            if (r.children) {
                                                const child = r.children.find(c => c.title.toLowerCase() === rel.suggestedParent?.toLowerCase());
                                                if (child) {
                                                    outlineMatch = child;
                                                    isRoot = false;
                                                    parentRoot = r; // Capture the Grandparent
                                                    break;
                                                }
                                            }
                                        }
                                    }

                                    if (outlineMatch) {
                                        try {
                                            let parentIdForCategory: string | null = null;

                                            // If it's a Sub-Category (e.g. Medicine), ensure its Parent (Health) exists first
                                            if (!isRoot && parentRoot) {
                                                const rootSlug = slugify(parentRoot.title);
                                                const dbRoot = await db.query.topics.findFirst({ where: eq(topics.slug, rootSlug) });

                                                if (dbRoot) {
                                                    parentIdForCategory = dbRoot.id;
                                                } else {
                                                    // Create the Root Category
                                                    const [newRoot] = await db.insert(topics).values({
                                                        title: parentRoot.title,
                                                        slug: rootSlug,
                                                        overview: "Category",
                                                        isPublic: true,
                                                        creatorId: null
                                                    }).returning();
                                                    parentIdForCategory = newRoot.id;
                                                }
                                            }

                                            // Now Create/Find the Matched Category (e.g. Medicine or Health)
                                            // If match was Root, parentIdForCategory is null (correct).
                                            // If match was Child, parentIdForCategory is the Root ID (correct).

                                            // Check existence again just in case (race condition or simple existence)
                                            const matchSlug = slugify(outlineMatch.title);
                                            const existingMatch = await db.query.topics.findFirst({ where: eq(topics.slug, matchSlug) });

                                            if (existingMatch) {
                                                relParentId = existingMatch.id;
                                                // TODO: Update its parentId if it's null? (Retroactive Fix)
                                                // If we found it but it was an orphan, we should fix it now that we know its parent.
                                                if (parentIdForCategory && !existingMatch.parentId) {
                                                    await db.update(topics).set({ parentId: parentIdForCategory }).where(eq(topics.id, existingMatch.id));
                                                }
                                            } else {
                                                const [newCat] = await db.insert(topics).values({
                                                    title: outlineMatch.title,
                                                    slug: matchSlug,
                                                    overview: "Category",
                                                    isPublic: true,
                                                    creatorId: null,
                                                    parentId: parentIdForCategory
                                                }).returning();
                                                relParentId = newCat.id;
                                            }

                                        } catch (e) {
                                            const retry = await db.query.topics.findFirst({ where: eq(topics.slug, slugify(outlineMatch.title)) });
                                            if (retry) relParentId = retry.id;
                                        }
                                    }
                                }
                            }

                            try {
                                const val: any = {
                                    title: rel.topic,
                                    slug: targetSlug,
                                    overview: "Autogenerated stub.",
                                    syllabus: null,
                                    parentId: relParentId, // Correctly placed!
                                };
                                const [stub] = await db.insert(topics).values(val).returning();
                                targetId = stub.id;
                            } catch (e) {
                                // Race condition
                                const retryTarget = await db.query.topics.findFirst({ where: eq(topics.slug, targetSlug) });
                                if (retryTarget) targetId = retryTarget.id;
                                else continue;
                            }
                        }

                        // Create Edge
                        try {
                            const existingRel = await db.query.relationships.findFirst({
                                where: (r, { and, eq: eqOp }) => and(
                                    eqOp(r.sourceTopicId, newTopic.id),
                                    eqOp(r.targetTopicId, targetId),
                                    eqOp(r.type, rel.type)
                                )
                            });

                            if (!existingRel) {
                                await db.insert(relationships).values({
                                    sourceTopicId: newTopic.id,
                                    targetTopicId: targetId,
                                    type: rel.type
                                });
                            }
                        } catch (e) {
                            console.error("Rel Insert Error", e);
                        }
                    }
                }

                console.log(`[API] Saved "${finalTitle}" to DB with ${object.chapters?.length} chapters.`);
            } catch (err: any) {
                console.error("[API] DB Write Error:", err);
            }

            // Log Activity
            await logActivity(
                userId,
                `Generated Syllabus: ${object?.title || topic}`,
                "GENERATION",
                {
                    slug: slug,
                    topicId: newTopic?.id
                }
            );

            // 4. Retroactive Parenting: Adopt existing topics that belong to this new one
            // If "Western Philosophy" is created, find topics that have "Western Philosophy" in their tags
            // and move them to be children of this new topic.
            if (newTopic) {
                try {
                    // Determine potential tag variations to match (e.g. "Western Philosophy", "western philosophy")
                    // JSON search is case-sensitive usually, but we can do a text search on the JSON column
                    const searchTerm = `%${topic}%`;

                    // Find potential children: Topics where syllabus contains the name of the NEW topic
                    // AND who do not already have a stricter parent (optional: or just steal them?)
                    // Let's steal them for now to enforce the new structure.

                    // Note: This matches any topic whose syllabus string contains the topic name. 
                    // Could be in description, but likely as a tag.
                    // Ideally we query syllabus->'tags' but simple LIKE is safer for now.
                    const potentialChildren = await db.query.topics.findMany({
                        where: (t, { sql }) => sql`${t.syllabus}::text ILIKE ${searchTerm} AND ${t.id} != ${newTopic.id}`
                    });

                    for (const child of potentialChildren) {
                        // 1. Check Tags
                        const childTags: string[] = (child.syllabus as any)?.tags || [];
                        const hasTag = childTags.some(t => t.toLowerCase() === topic.toLowerCase());

                        // 2. Check Title (e.g. "Music Theory" contains "Music")
                        // Be careful with short words (e.g. "Art" in "Earth"), so use regex word boundary or strict inclusion if length sufficient
                        let titleMatch = false;
                        if (topic.length > 3) {
                            const regex = new RegExp(`\\b${topic}\\b`, 'i');
                            titleMatch = regex.test(child.title);
                        }

                        if (hasTag || titleMatch) {
                            // Check if we should adopt it. 
                            // If it's currently at Root, definitely adopt.
                            // If it's under "Religion" and we are "Western Philosophy" (which is under Religion), 
                            // then we are MORE SPECIFIC, so we should adopt.
                            // We assume the new topic is "closer" because it matches a tag directly.

                            console.log(`[API] Retroactive Parenting: Adopting child "${child.title}" into "${newTopic.title}" (Match: ${hasTag ? 'Tag' : 'Title'})`);
                            await db.update(topics)
                                .set({ parentId: newTopic.id })
                                .where(eq(topics.id, child.id));
                        }
                    }

                } catch (err) {
                    console.error("[API] Retroactive Parenting Error:", err);
                }
            } // Close if(newTopic)

        }, // Close onFinish
    });

    return result.toTextStreamResponse();
}
