
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { campaigns, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        const campaign = await db.query.campaigns.findFirst({
            where: eq(campaigns.id, id),
        });

        if (!campaign) {
            return new NextResponse("Campaign not found", { status: 404 });
        }

        if (campaign.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Activate Campaign
        await db.update(campaigns)
            .set({ status: "active" })
            .where(eq(campaigns.id, id));

        // Record Transaction
        // Assumes budget * duration is the amount, as in the checkout logic
        const amount = (campaign.dailyBudget || 0) * (campaign.durationDays || 0);

        await db.insert(transactions).values({
            userId,
            campaignId: id,
            amount: Math.round(amount * 100), // cents
            currency: 'usd',
            status: 'succeeded',
            method: 'x402',
        });

        return NextResponse.json({ success: true, status: 'active' });
    } catch (error) {
        console.error("Activation Error:", error);
        return new NextResponse("Internal Application Error", { status: 500 });
    }
}
