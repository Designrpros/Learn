
import { db } from "@/db";
import { users, threads, topics } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function getAnalyticsData() {
    // 1. Growth Data (Last 6 Months)
    // Note: This matches "Month" roughly. For production, use day granularity or proper date_trunc.
    // Since we are using Neon (Postgres), we can use date_trunc.

    const growthQuery = sql`
        SELECT
            TO_CHAR(date_trunc('month', created_at), 'Mon') as name,
            COUNT(*) as value
        FROM ${users}
        WHERE created_at > NOW() - INTERVAL '6 months'
        GROUP BY 1, date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
    `;

    const threadGrowthQuery = sql`
        SELECT
             TO_CHAR(date_trunc('month', created_at), 'Mon') as name,
             COUNT(*) as value
        FROM ${threads}
        WHERE created_at > NOW() - INTERVAL '6 months'
        GROUP BY 1, date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
    `;

    // Execute queries
    const userGrowth = await db.execute(growthQuery);
    const threadGrowth = await db.execute(threadGrowthQuery);

    // Merge Data
    // We create a map of Month -> Data to ensure we have entries even if counts are 0? 
    // For simplicity, we'll map distinct months from both results.
    const combinedData = [];
    const months = new Set([...userGrowth.map(r => r.name), ...threadGrowth.map(r => r.name)]);

    // If no data (new app), Mock at least "Dec"
    if (months.size === 0) {
        months.add("Dec");
    }

    for (const month of Array.from(months)) {
        const u = userGrowth.find(r => r.name === month)?.value || 0;
        const t = threadGrowth.find(r => r.name === month)?.value || 0;
        combinedData.push({
            name: month as string,
            users: Number(u),
            threads: Number(t)
        });
    }

    // 2. Topic Distribution
    // We don't have a "Category" on topics yet, but we can group by "Parent Topic" or assume some categories.
    // For now, let's just count total topics as a single bar or mock heavily if no categories exist.
    // Actually, threads HAVE categories. Let's use Thread Categories.
    const topicDistQuery = sql`
        SELECT category as name, COUNT(*) as count
        FROM ${threads}
        GROUP BY category
    `;
    const topicDist = await db.execute(topicDistQuery);

    const topicData = topicDist.map(r => ({ name: r.name as string, count: Number(r.count) }));

    return {
        growthData: combinedData.length > 0 ? combinedData : [{ name: 'Dec', users: 0, threads: 0 }],
        topicData: topicData.length > 0 ? topicData : [{ name: 'General', count: 0 }],
    };
}
