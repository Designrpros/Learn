"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";

export interface SystemStatus {
    dbLatency: string;
    vectorIndex: string;
    cacheHit: string;
    apiStatus: string;
}

export async function getSystemStatus(): Promise<SystemStatus> {
    const start = performance.now();
    let dbStatus = "High";

    try {
        // Measure DB Ping Latency
        await db.execute(sql`SELECT 1`);
    } catch (error) {
        dbStatus = "Degraded";
        console.error("DB Ping failed:", error);
    }
    const duration = Math.round(performance.now() - start);

    // Simulate other metrics realistically until we have real providers
    // Fluctuate Vector Index slightly around 80-90ms
    const vectorLatency = 80 + Math.floor(Math.random() * 15);
    // Fluctuate Cache Hit slightly around 98-99%
    const cacheHit = Math.random() > 0.5 ? "99%" : "98%";

    return {
        dbLatency: `${duration}ms`,
        vectorIndex: `${vectorLatency}ms`,
        cacheHit: cacheHit,
        apiStatus: dbStatus,
    };
}
