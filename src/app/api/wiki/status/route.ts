import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    try {
        const topic = await db.query.topics.findFirst({
            where: eq(topics.slug, slug),
            with: {
                chapters: true,
                children: true
            }
        });

        if (!topic) {
            return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
        }

        // Return a lightweight "fingerprint" of the topic state
        return NextResponse.json({
            chapterCount: topic.chapters?.length || 0,
            childrenCount: topic.children?.length || 0,
            hasSyllabus: Array.isArray(topic.syllabus) && topic.syllabus.length > 0
        });
    } catch (error: any) {
        console.error(`[WikiStatus] Error fetching status for slug "${slug}":`, error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
