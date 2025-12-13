
import { db } from "@/db";
import { users, adEvents } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// ISO Numeric to Alpha-2 Map (Common countries)
const COUNTRY_ISO_MAP: Record<string, string> = {
    "840": "US", "826": "GB", "124": "CA", "036": "AU", "276": "DE", "250": "FR", "392": "JP", "528": "NL", "076": "BR", "356": "IN", "380": "IT", "724": "ES", "752": "SE", "578": "NO", "208": "DK", "156": "CN", "410": "KR", "032": "AR", "554": "NZ", "710": "ZA", "566": "NG", "818": "EG", "484": "MX"
};

export async function POST(req: Request) {
    try {
        const { budget, duration, countryIds } = await req.json();

        // 0. Handle Empty Selection (User Requirement: Empty Map = No Estimates)
        if (!countryIds || countryIds.length === 0) {
            return NextResponse.json({
                users: 0,
                ctr: 0,
                impressions: { min: 0, max: 0 },
                clicks: { min: 0, max: 0 }
            });
        }

        // 1. Get Total Active Users
        const userCountRes = await db.select({ count: sql<number>`count(*)` }).from(users);
        const totalUsers = Number(userCountRes[0]?.count) || 0;

        // 2. Calculate Reach Ratio based on Country Traffic
        // Fetch distribution of traffic from ad_events (proxies for active user location)
        // If no events exist, we fallback to a simple count-based ratio.
        const eventStats = await db.select({
            country: adEvents.country,
            count: sql<number>`count(*)`
        }).from(adEvents)
            .groupBy(adEvents.country);

        const totalEvents = eventStats.reduce((sum, item) => sum + Number(item.count), 0);

        let reachRatio = 0;

        if (totalEvents > 0) {
            // We have real data. Calculate share of voice for selected countries.
            // Convert selected IDs (Numeric) to Alpha-2 to match DB (ad_events.country usually stores 'US', 'GB' etc)
            const selectedCodes = new Set(countryIds.map((id: string) => COUNTRY_ISO_MAP[id]).filter(Boolean));

            const selectedEvents = eventStats
                .filter(stat => stat.country && selectedCodes.has(stat.country))
                .reduce((sum, item) => sum + Number(item.count), 0);

            reachRatio = selectedEvents / totalEvents;

            // Edge case: If users select a country with 0 events but we have events elsewhere, ratio is 0.
            // But we shouldn't punish new markets completely. Allow a minimum baseline if list is non-empty?
            // User asked for "based on activity", so strictly 0 is "correct" for "no activity".
            // However, let's add a tiny smoothing factor if selectedIds > 0 so it's not broken for new countries.
            if (reachRatio === 0 && countryIds.length > 0) reachRatio = 0.01;

        } else {
            // NO DATA Fallback:
            // Assume "Whole World" (all ~200 countries) = 100%.
            // Simplistic: Each country is equal weight? No, bad.
            // Better: If > 100 countries selected -> 1.0. Else count * 0.05?
            reachRatio = countryIds.length > 150 ? 1.0 : Math.min(countryIds.length * 0.02, 1.0);
        }

        const addressableAudience = Math.max(Math.floor(totalUsers * reachRatio), 1);

        // 3. Historical Global CTR
        const metricsRes = await db.select({
            impressions: sql<number>`count(*) filter (where ${adEvents.type} = 'impression')`,
            clicks: sql<number>`count(*) filter (where ${adEvents.type} = 'click')`
        }).from(adEvents);

        const totalImpressions = Number(metricsRes[0]?.impressions) || 0;
        const totalClicks = Number(metricsRes[0]?.clicks) || 0;

        let globalCTR = 0.015; // 1.5% default
        if (totalImpressions > 100) {
            globalCTR = totalClicks / totalImpressions;
        }

        // 4. Budget & Capacity Logic
        // Cost assumption: $20 CPM ($0.02 per imp) -> $1 = 50 imps
        const budgetCapacity = budget * 50;

        // Frequency cap of 3 per day per user
        const maxDailyImpressions = addressableAudience * 3;
        const totalCampaignCapacity = maxDailyImpressions * duration;

        // Result
        const estImpressions = Math.min(budgetCapacity, totalCampaignCapacity);

        const minImp = Math.floor(estImpressions * 0.8);
        const maxImp = Math.ceil(estImpressions * 1.2);

        const minClicks = Math.floor(minImp * globalCTR);
        const maxClicks = Math.ceil(maxImp * globalCTR * 1.2);

        return NextResponse.json({
            users: addressableAudience, // Return the *reach* users, not total DB users
            ctr: globalCTR,
            impressions: { min: minImp, max: maxImp },
            clicks: { min: minClicks, max: maxClicks }
        });

    } catch (error) {
        console.error("Estimates Error:", error);
        return new NextResponse("Internal Application Error", { status: 500 });
    }
}
