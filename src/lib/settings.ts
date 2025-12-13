import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_SETTINGS = {
    daily_generation_limit: "50",
};

export type SystemSettingKey = keyof typeof DEFAULT_SETTINGS;

export async function getSystemSetting(key: SystemSettingKey): Promise<string> {
    const result = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, key),
    });

    return result?.value || DEFAULT_SETTINGS[key];
}

export async function setSystemSetting(key: SystemSettingKey, value: string, description?: string) {
    await db.insert(systemSettings)
        .values({
            key,
            value,
            description: description || key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            updatedAt: new Date()
        })
        .onConflictDoUpdate({
            target: systemSettings.key,
            set: { value, updatedAt: new Date() },
        });
}

export async function getAllSystemSettings() {
    return await db.query.systemSettings.findMany();
}
