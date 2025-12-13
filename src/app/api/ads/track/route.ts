
import { db } from '@/db';
import { adEvents, campaigns } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Allow public tracking? Or require some auth? 
        // Typically ad tracking is public but signed. For this demo, public.
        const { campaignId, type, country, device } = body;

        if (!campaignId || !type) {
            return new NextResponse("Missing campaignId or type", { status: 400 });
        }

        // 1. Insert Event
        await db.insert(adEvents).values({
            campaignId,
            type,
            country,
            device
        });

        // 2. Increment Aggregate Metrics in Campaign Table (for fast ID read)
        // We assume metrics is { impressions: 0, clicks: 0, spend: 0 }
        // We need to use sql to update the jsonb field safely or just overwrite it?
        // JSON update in postgres is tricky with safe concurrent increments.
        // For this demo, let's just insert the event. The dashboard will aggregate or we can do a simple update unique to this user session.

        // Let's try to update the metrics JSONB.
        if (type === 'impression') {
            await db.execute(sql`
                UPDATE campaigns 
                SET metrics = jsonb_set(
                    COALESCE(metrics, '{"impressions": 0, "clicks": 0, "spend": 0}'), 
                    '{impressions}', 
                    (COALESCE(metrics->>'impressions','0')::int + 1)::text::jsonb
                )
                WHERE id = ${campaignId}
            `);
        } else if (type === 'click') {
            await db.execute(sql`
                UPDATE campaigns 
                SET metrics = jsonb_set(
                    COALESCE(metrics, '{"impressions": 0, "clicks": 0, "spend": 0}'), 
                    '{clicks}', 
                    (COALESCE(metrics->>'clicks','0')::int + 1)::text::jsonb
                )
                WHERE id = ${campaignId}
            `);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Track Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
