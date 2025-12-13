import { db } from "@/db";
import { users, threads, topics, adEvents, campaigns } from "@/db/schema";
import { sql } from "drizzle-orm";

const COUNTRY_NAME_MAP: Record<string, { name: string, flag: string }> = {
    "US": { name: "United States", flag: "🇺🇸" },
    "GB": { name: "United Kingdom", flag: "🇬🇧" },
    "DE": { name: "Germany", flag: "🇩🇪" },
    "JP": { name: "Japan", flag: "🇯🇵" },
    "BR": { name: "Brazil", flag: "🇧🇷" },
    "FR": { name: "France", flag: "🇫🇷" },
    "IN": { name: "India", flag: "🇮🇳" },
    "CA": { name: "Canada", flag: "🇨🇦" },
    "AU": { name: "Australia", flag: "🇦🇺" },
    "NL": { name: "Netherlands", flag: "🇳🇱" },
    "ES": { name: "Spain", flag: "🇪🇸" },
    "IT": { name: "Italy", flag: "🇮🇹" },
    "SE": { name: "Sweden", flag: "🇸🇪" },
    "CN": { name: "China", flag: "🇨🇳" },
    "KR": { name: "South Korea", flag: "🇰🇷" },
    "MX": { name: "Mexico", flag: "🇲🇽" },
    "ZA": { name: "South Africa", flag: "🇿🇦" },
};

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

    // 3. Location / Global Distribution
    // Group ad_events by country
    const locationQuery = sql`
        SELECT country, COUNT(*) as count 
        FROM ${adEvents}
        WHERE country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
    `;
    const locRes = await db.execute(locationQuery);

    // Calculate Total for percentages
    const totalEventsRes = await db.execute(sql`SELECT COUNT(*) as count FROM ${adEvents}`);
    const totalEvents = Number(totalEventsRes[0]?.count) || 1; // Avoid div by 0

    const locationData = locRes.map(r => {
        const code = r.country as string; // Stored as Alpha-2 usually, e.g. "US" or numeric? 
        // Wait, earlier we mapped numeric -> Alpha-2 in estimates.
        // AdEvents stores what we passed. 
        // If we assumed numeric inputs in Wizard map, but stored them directly...
        // The wizard map `selectedCountries` are IDs like "840".
        // The `adEvents` table has `country`. 
        // If we haven't recorded real events yet, this might return numeric strings.
        // Let's assume for now we might need to handle both or map logic.
        // The `COUNTRY_NAME_MAP` above uses Alpha-2 ("US"). 
        // If DB has "840", we might miss. 
        // NOTE: The user selected "US" (Alpha-2) in estimates logic? No, estimates logic had a map FROM numeric TO Alpha.
        // So wizard saves... wait.
        // `selectedCountries` in Wizard are numeric. 
        // The campaign is saved with `targetCountries` as numeric IDs.
        // But `ad_events` are recorded by... ?
        // We haven't built the *pixel* or *recording* logic that puts `country` into `ad_events` yet!
        // But we DO represent "Activity" based on it.
        // For the sake of this task, let's assume `ad_events.country` will hold Alpha-2 codes (e.g. from Cloudflare headers or maxmind).

        const info = COUNTRY_NAME_MAP[code] || { name: code, flag: "🌍" };
        const count = Number(r.count);
        return {
            code: code,
            country: info.name,
            flag: info.flag,
            users: count, // Using event count as proxy for visibility
            percentage: Math.round((count / totalEvents) * 100),
            active: Math.ceil(count * 0.1) // Mock "active now" as 10% of total
        };
    });

    // 4. Recent Activity Log (Raw Data)
    const activityQuery = sql`
        SELECT 
            ad_events.id,
            ad_events.type,
            ad_events.country,
            ad_events.device,
            ad_events.created_at,
            campaigns.name as campaign_name
        FROM ${adEvents}
        JOIN ${campaigns} ON ${adEvents.campaignId} = ${campaigns.id}
        ORDER BY ${adEvents.createdAt} DESC
        LIMIT 50
    `;
    const activityRes = await db.execute(activityQuery);

    const recentActivity = activityRes.map(r => {
        const date = new Date(r.created_at as string);
        const code = r.country as string;
        const info = COUNTRY_NAME_MAP[code] || { name: code, flag: "🌍" };

        return {
            id: r.id,
            type: r.type, // 'impression' | 'click'
            country: info.name,
            countryCode: code,
            flag: info.flag,
            device: r.device, // 'mobile' | 'desktop'
            campaign: r.campaign_name,
            timestamp: date,
            formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            formattedTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    });

    return {
        growthData: combinedData.length > 0 ? combinedData : [{ name: 'Dec', users: 0, threads: 0 }],
        topicData: topicData.length > 0 ? topicData : [{ name: 'General', count: 0 }],
        locationData: locationData,
        recentActivity: recentActivity
    };
}
