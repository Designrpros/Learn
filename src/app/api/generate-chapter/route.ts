import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { defaultModel } from '@/lib/ai-config';
import { db } from '@/db';
import { topics, chapters } from '@/db/schema';
import { logActivity } from '@/lib/db-queries';
import { eq, and } from 'drizzle-orm';

export const maxDuration = 30;

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }
    const input = await req.json();
    let { topic, chapterTitle } = input;
    const { topicId, chapterId, context, chapterSlug } = input;

    // Resolve Topic if missing
    if (!topic && topicId) {
        const dbTopic = await db.query.topics.findFirst({
            where: eq(topics.id, topicId),
        });
        if (dbTopic) {
            topic = dbTopic.title;
        } else {
            return new Response("Topic not found", { status: 404 });
        }
    }

    if (!topic) return new Response("Topic is required", { status: 400 });

    const topicSlug = slugify(topic);

    // Resolve Chapter Title if missing (using chapterId)
    // This handles cases where we want to generate by ID.
    if (!chapterTitle && chapterId) {
        const dbChapter = await db.query.chapters.findFirst({
            where: eq(chapters.id, chapterId),
        });
        if (dbChapter) {
            chapterTitle = dbChapter.title;
        }
    }

    if (!chapterTitle) return new Response("Chapter Title is required", { status: 400 });

    console.log(`[API] Chapter Generation Started: "${chapterTitle}" (Topic: ${topic})`);

    let chapterUUID: string | null = null;

    // 1. Check DB for Cache
    try {
        // Find Topic
        const existingTopic = await db.query.topics.findFirst({
            where: eq(topics.slug, topicSlug),
        });

        if (existingTopic) {
            // Find Chapter
            // Note: chapterSlug passed from UI is the 'slug' column in chapters table
            const existingChapter = await db.query.chapters.findFirst({
                where: and(
                    eq(chapters.topicId, existingTopic.id),
                    chapterSlug ? eq(chapters.slug, chapterSlug) : eq(chapters.title, chapterTitle)
                )
            });

            if (existingChapter) {
                chapterUUID = existingChapter.id; // Store for updating later

                if (existingChapter.content) {
                    console.log(`[API] Cache Hit for Chapter "${chapterTitle}". Streaming saved content.`);
                    // Create a stream from the saved string
                    const stream = new ReadableStream({
                        start(controller) {
                            controller.enqueue(existingChapter.content);
                            controller.close();
                        }
                    });

                    return new Response(stream, {
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                    });
                }
            }
        }
    } catch (err) {
        console.error("[API] DB Read Error:", err);
    }

    // 2. Generate and Update
    const systemInstruction = `You are an expert academic writer.
    Your task is to write a comprehensive chapter on "${chapterTitle}" for the topic "${topic}".
    
    GUIDELINES:
    - Tone: Intellectual, warm, academic but accessible.
    - Format: Use simple, clean Markdown.
    - STRUCTURE: YOU MUST use double newlines (\\n\\n) between paragraphs.
    - HEADERS: Use H2 (##) for main sections, H3 (###) for subsections. Ensure a blank line before every header.
    - Aesthetics: Use *italics* for emphasis.
    - Content: Be substantive. Explain concepts clearly with examples.
    - START IMMEDIATELY with the content. Do NOT introduce yourself or mention "Wikits".`;

    const userPrompt = `Teach the chapter "${chapterTitle}". Context from syllabus: ${context || ''}`;

    const result = await streamText({
        model: defaultModel,
        system: systemInstruction,
        prompt: userPrompt,
        onFinish: async ({ text }) => {
            console.log(`[API] Chapter Generation Completed.saving to DB...`);
            if (chapterUUID && text) {
                try {
                    await db.update(chapters)
                        .set({ content: text })
                        .where(eq(chapters.id, chapterUUID));
                    console.log(`[API] Chapter content saved to DB.`);

                    // Log Activity
                    await logActivity(userId, `Generated Chapter: ${chapterTitle} `, "GENERATION");

                    // ---------------------------------------------------------
                    // 3. Post-Processing: Extract & Create Sub-Concepts
                    // ---------------------------------------------------------
                    try {
                        const { generateObject } = await import('ai');
                        const { z } = await import('zod');

                        console.log(`[API] Extracting Sub - Concepts for "${chapterTitle}"...`);

                        const extraction = await generateObject({
                            model: defaultModel,
                            schema: z.object({
                                concepts: z.array(z.object({
                                    name: z.string().describe("The name of the sub-concept (e.g. 'Mesopotamia', 'Cuneiform')"),
                                    type: z.enum(['Concept', 'Location', 'Person', 'Event']).optional(),
                                    description: z.string().describe("A very brief 1-sentence definition.")
                                })).describe("Extract 3-5 distinct sub-topics mentioned in the text that deserve their own page.")
                            }),
                            prompt: `Extract key sub - concepts from this academic text about "${topic}": \n\n${text} `
                        });

                        const extracted = extraction.object.concepts;
                        console.log(`[API] Extracted ${extracted.length} concepts: `, extracted.map(c => c.name));

                        // Insert Sub-Concepts as Children of current Topic
                        if (extracted.length > 0) {
                            // We need the parent Topic ID. We found it earlier as existingTopic.id
                            // Let's re-fetch or assume topicId from input (which we validated)

                            // Let's resolve the parent ID again.
                            let parentId = topicId;
                            if (!parentId) {
                                const p = await db.query.topics.findFirst({ where: eq(topics.slug, topicSlug) });
                                parentId = p?.id;
                            }

                            if (parentId) {
                                for (const concept of extracted) {
                                    const subSlug = slugify(concept.name);

                                    // Upsert logic:
                                    // If topic doesn't exist, create it as child of parentId.
                                    // If it DOES exist:
                                    //    - If at ROOT, adopt it? (Yes, per previous logic)
                                    //    - If already somewhere else, leave it alone (it can be related, but not forced child).

                                    const existingSub = await db.query.topics.findFirst({
                                        where: eq(topics.slug, subSlug),
                                        with: { parent: true }
                                    });

                                    if (!existingSub) {
                                        await db.insert(topics).values({
                                            title: concept.name,
                                            slug: subSlug,
                                            overview: concept.description,
                                            parentId: parentId, // MAKE CHILD
                                            syllabus: null, // Stub
                                            isPublic: true,
                                            creatorId: "system-extraction"
                                        });
                                        console.log(`[API] Created new sub - topic: "${concept.name}" under "${topic}"`);
                                    } else {
                                        // Auto-Adopt if Orphan OR if currently parented by a generic Category
                                        // We identify Categories by "Category" overview (set by resolveTopic)
                                        const isOrphan = !existingSub.parentId;
                                        const isGenericParent = existingSub.parent && existingSub.parent.overview === 'Category';

                                        if (isOrphan || isGenericParent) {
                                            await db.update(topics)
                                                .set({ parentId: parentId })
                                                .where(eq(topics.id, existingSub.id));
                                            console.log(`[API] Adopted sub-topic "${concept.name}" under "${topic}" (Was: ${existingSub.parent?.title || 'Orphan'})`);
                                        }
                                    }
                                }
                            }
                        }

                    } catch (extErr) {
                        console.error("[API] Concept Extraction Failed:", extErr);
                    }


                } catch (err) {
                    console.error("[API] DB Write Error (Update):", err);
                }
            } else if (!chapterUUID) {
                console.warn("[API] Could not save chapter: No matching chapter row found.");
            }
        },
    });

    return new Response(result.textStream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
