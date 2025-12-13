
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        // Fetch campaigns with their metrics
        const userCampaigns = await db.select().from(campaigns)
            .where(eq(campaigns.userId, userId))
            .orderBy(desc(campaigns.createdAt));

        // Aggregate Total KPI
        let totalSpend = 0;
        let totalImpressions = 0;
        let totalClicks = 0;

        userCampaigns.forEach(c => {
            const m = c.metrics as any || { impressions: 0, clicks: 0, spend: 0 };
            totalImpressions += Number(m.impressions || 0);
            totalClicks += Number(m.clicks || 0);
            totalSpend += Number(m.spend || 0);
        });

        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        return NextResponse.json({
            campaigns: userCampaigns,
            kpis: {
                spend: totalSpend,
                impressions: totalImpressions,
                clicks: totalClicks,
                ctr: ctr.toFixed(2),
            }
        });

    } catch (error) {
        console.error("Stats Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
