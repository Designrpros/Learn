
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export type UserRole = "admin" | "user";

const ADMIN_EMAILS = ["vegarberentsen@gmail.com"];

export async function checkAdmin() {
    const user = await currentUser();

    // Check Whitelist
    const email = user?.emailAddresses[0]?.emailAddress;
    if (email && ADMIN_EMAILS.includes(email)) {
        return true;
    }

    // Fallback to Metadata
    const role = user?.publicMetadata?.role as string | undefined;
    return role === "admin";
}

export async function requireAdmin() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        redirect("/");
    }
}

export async function syncUser() {
    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress;
    const username = user.username || user.firstName || "Anonymous";
    const role = (user.publicMetadata.role as string) || "user";
    const plan = (user.publicMetadata.plan as string) || "free";

    // Upsert user
    const [syncedUser] = await db
        .insert(users)
        .values({
            id: user.id,
            email,
            username,
            role,
            plan,
            lastActiveAt: new Date(),
        })
        .onConflictDoUpdate({
            target: users.id,
            set: {
                email,
                username,
                role,
                plan,
                lastActiveAt: new Date(),
            },
        })
        .returning();

    return syncedUser;
}
