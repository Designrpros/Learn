import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return new NextResponse("Missing slug", { status: 400 });
    }

    try {
        const topic = await db.query.topics.findFirst({
            where: eq(topics.slug, slug),
            columns: {
                title: true,
                overview: true,
                slug: true,
            }
        });

        if (!topic) {
            return new NextResponse("Topic not found", { status: 404 });
        }

        // Truncate overview for preview
        const MAX_preview_LENGTH = 150;
        let previewText = topic.overview || "No overview available.";
        if (previewText.length > MAX_preview_LENGTH) {
            previewText = previewText.substring(0, MAX_preview_LENGTH).trim() + "...";
        }

        return NextResponse.json({
            title: topic.title,
            overview: previewText,
            slug: topic.slug,
        });

    } catch (error) {
        console.error("Preview Fetch Error", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
