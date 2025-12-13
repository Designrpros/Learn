
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { adEvents, campaigns } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    try {
        // Fetch raw analytics data
        // For a dashboard, we usually want recent events.
        const events = await db.query.adEvents.findMany({
            orderBy: [desc(adEvents.createdAt)],
            limit: 100, // Limit to last 100 for now for performance
            with: {
                campaign: true,
            }
        });

        // Filter for user's campaigns only
        const userEvents = events.filter(e => e.campaign.userId === userId);

        return NextResponse.json(userEvents);
    } catch (error) {
        console.error("Analytics Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
