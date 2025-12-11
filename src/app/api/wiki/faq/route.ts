import { defaultModel } from '@/lib/ai-config';
import { db } from '@/db';
import { topics, chapters, faqs } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { generateText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { topicId, question } = await req.json();

        if (!topicId || !question) {
            return new Response("Missing topicId or question", { status: 400 });
        }

        // 1. Fetch Context
        const topic = await db.query.topics.findFirst({
            where: eq(topics.id, topicId),
            with: {
                chapters: {
                    orderBy: [asc(chapters.order)]
                }
            }
        });

        if (!topic) {
            return new Response("Topic not found", { status: 404 });
        }

        const context = `
Topic: ${topic.title}
Overview: ${topic.overview}

Chapters:
${topic.chapters.map(c => `
Title: ${c.title}
Content: ${c.content || "(No content)"}
`).join('\n')}
        `.trim();

        // 2. Generate Answer
        const { text } = await generateText({
            model: defaultModel,
            system: `You are a helpful expert tutor. Answer the student's question specifically based on the provided context.
            - If the answer is in the context, be concise and helpful.
            - If the answer is partially in the context, answer what you can and mention what is missing.
            - If the answer is NOT in the context, provide a general answer but mention it's outside the current syllabus scope.
            - Keep answers conversational but educational.
            - Use Markdown for formatting.
            `,
            prompt: `Context:\n${context}\n\nQuestion: ${question}`,
        });

        // 3. Save to DB
        const [newFaq] = await db.insert(faqs).values({
            topicId,
            question,
            answer: text,
        }).returning();

        return Response.json(newFaq);

    } catch (error) {
        console.error("[FAQ API] Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
