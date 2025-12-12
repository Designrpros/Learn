import { getThreads } from "@/lib/db-queries";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const sort = (searchParams.get('sort') || 'new') as 'new' | 'popular' | 'unanswered';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    try {
        const threads = await getThreads(undefined, q, sort, limit, offset);
        return NextResponse.json(threads);
    } catch (error) {
        console.error("Failed to fetch threads", error);
        return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
    }
}
