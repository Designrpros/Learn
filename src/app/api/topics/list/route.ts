import { db } from "@/db";
import { topics } from "@/db/schema";
import { asc, ilike, or, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const parentId = searchParams.get('parentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    try {
        const results = await db.query.topics.findMany({
            where: (topics, { ilike, or, and, eq }) => {
                const conditions = [];
                if (q) conditions.push(or(ilike(topics.title, `%${q}%`), ilike(topics.overview, `%${q}%`)));
                if (parentId) conditions.push(eq(topics.parentId, parentId));

                return and(...conditions);
            },
            orderBy: [asc(topics.title)],
            limit: limit,
            offset: offset,
            columns: {
                id: true,
                title: true,
                slug: true,
                overview: true,
                createdAt: true,
            },
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error fetching topics:", error);
        return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
    }
}
