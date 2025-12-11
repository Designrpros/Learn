import { searchTopics } from '@/lib/db-queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) return NextResponse.json([]);

    const results = await searchTopics(q);
    return NextResponse.json(results);
}
