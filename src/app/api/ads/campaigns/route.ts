import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const campaignSchema = z.object({
    name: z.string().min(1).default('Untitled Campaign'),
    status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
    headline: z.string().optional(),
    body: z.string().optional(),
    destinationUrl: z.string().optional(),
    callToAction: z.string().optional(),
    images: z.array(z.string()).optional(),
    targetCountries: z.array(z.string()).optional(),
    dailyBudget: z.number().optional(),
    durationDays: z.number().optional(),
});

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await req.json();

        // Validate input
        const result = campaignSchema.safeParse(body);
        if (!result.success) {
            return new Response(JSON.stringify(result.error), { status: 400 });
        }

        const data = result.data;

        // Insert into DB
        const [newCampaign] = await db.insert(campaigns).values({
            userId,
            name: data.name,
            status: data.status,
            headline: data.headline,
            body: data.body,
            destinationUrl: data.destinationUrl,
            callToAction: data.callToAction,
            images: data.images,
            targetCountries: data.targetCountries,
            dailyBudget: data.dailyBudget,
            durationDays: data.durationDays,
            metrics: { impressions: 0, clicks: 0, spend: 0 },
        }).returning();

        return new Response(JSON.stringify(newCampaign), { status: 201 });

    } catch (error) {
        console.error("[API] Create Campaign Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const userCampaigns = await db.select()
            .from(campaigns)
            .where(eq(campaigns.userId, userId))
            .orderBy(desc(campaigns.createdAt));

        return new Response(JSON.stringify(userCampaigns), { status: 200 });
    } catch (error) {
        console.error("[API] Get Campaigns Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
