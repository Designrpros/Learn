"use server";

import { logActivity } from "@/lib/db-queries";
import { auth } from "@clerk/nextjs/server";

export async function logSearch(term: string) {
    const { userId } = await auth();

    // Log regardless of auth status, but include ID if present
    // Type: SEARCH ensures we can filter easily later
    await logActivity(
        `Searched for "${term}"`,
        "SEARCH",
        {
            query: term,
            userId: userId || "guest"
        }
    );
}
