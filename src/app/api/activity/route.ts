
import { getRecentActivity } from "@/lib/db-queries";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const activity = await getRecentActivity(null, 50);
        return NextResponse.json(activity);
    } catch (error) {
        console.error("Error fetching activity:", error);
        return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
    }
}
