import { getTopicChildren } from "@/lib/db-queries";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');

    try {
        // Fetch children of the given parent (or roots if parentId is null/undefined)
        // If parentId is explicitly "null" string, treat as null
        const pid = parentId === "null" ? null : parentId;

        const nodes = await getTopicChildren(pid || null);

        // Sort: Folders first, then by title (respecting order first if it differs)
        // Note: DB already sorts by [order, title]. We just need to bubble folders up.
        // Actually, we should resort completely to be safe.
        // Sort: Folders ALWAYS first, then by Order, then Title.
        const sortedNodes = nodes.sort((a, b) => {
            // 1. Folders First (Has Children)
            const aIsFolder = a.children && a.children.length > 0;
            const bIsFolder = b.children && b.children.length > 0;

            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;

            // 2. Order (Explicit override) - Sorts within the groups (Folders or Files)
            if ((a.order || 0) !== (b.order || 0)) {
                return (a.order || 0) - (b.order || 0);
            }

            // 3. Alphabetical
            return a.title.localeCompare(b.title);
        });

        return NextResponse.json(sortedNodes);
    } catch (error) {
        console.error("Error fetching topic nodes:", error);
        return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 });
    }
}
