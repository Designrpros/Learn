"use server";

import { auth } from "@clerk/nextjs/server";
import { setSystemSetting, type SystemSettingKey } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export async function updateSystemSetting(key: string, value: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // In a real app, verify admin role here

    await setSystemSetting(key as SystemSettingKey, value);
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return { success: true };
}
