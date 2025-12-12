import { db } from "@/db";
import { threads } from "@/db/schema";
import { desc, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    try {
        const results = await db.query.threads.findMany({
            where: (threads, { ilike, or, and, eq }) => {
                const conditions = [];
                if (q) {
                    conditions.push(or(ilike(threads.title, `%${q}%`)));
                }
                return and(...conditions);
            },
            orderBy: [desc(threads.createdAt)],
            limit: limit,
            offset: offset,
            with: {
                tags: {
                    with: {
                        tag: true
                    }
                },
                posts: {
                    columns: {
                        id: true
                    }
                }
            }
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error fetching threads:", error);
        return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
    }
}
