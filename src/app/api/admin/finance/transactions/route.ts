import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (user?.role !== "admin") {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const txs = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(50);

        // Calculate total ad revenue
        const revenue = await db.select({
            total: sql<number>`sum(${transactions.amount})`
        }).from(transactions).where(eq(transactions.status, 'succeeded'));

        return NextResponse.json({
            transactions: txs,
            stats: {
                adRevenue: revenue[0]?.total || 0,
            }
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
