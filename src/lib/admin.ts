
import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
    Activity,
    Shield,
    FileText,
    AlertCircle,
    User,
    Zap,
    Settings,
    Database
} from "lucide-react";

export interface ActivityLog {
    id: string;
    user: string;
    action: string;
    type: string;
    time: string;
    icon: any;
    intent: "destructive" | "warning" | "positive" | "neutral";
}

function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
    try {
        const logs = await db.select().from(events).orderBy(desc(events.createdAt)).limit(50);

        return logs.map((log) => {
            const meta = log.metadata as any || {};
            const actionLower = log.action.toLowerCase();
            const typeLower = log.type.toLowerCase();

            // Determine Intent
            let intent: ActivityLog['intent'] = "neutral";
            if (actionLower.includes("delete") || actionLower.includes("remove") || actionLower.includes("ban")) {
                intent = "destructive";
            } else if (actionLower.includes("fail") || actionLower.includes("error") || typeLower === "security") {
                intent = "warning";
            } else if (actionLower.includes("success") || actionLower.includes("create") || actionLower.includes("upgrade")) {
                intent = "positive";
            }

            // Determine Icon
            let Icon = Activity;
            if (typeLower === "security") Icon = Shield;
            else if (typeLower === "content") Icon = FileText;
            else if (typeLower === "system") Icon = Database;
            else if (typeLower === "settings") Icon = Settings;
            else if (typeLower === "billing") Icon = User; // Or credit card

            return {
                id: log.id,
                user: meta.username || meta.userId || "System",
                action: log.action,
                type: log.type, // e.g. "System", "Content", "Security"
                time: timeAgo(log.createdAt),
                icon: Icon,
                intent: intent
            };
        });
    } catch (error) {
        console.error("Failed to fetch activity logs", error);
        return [];
    }
}
