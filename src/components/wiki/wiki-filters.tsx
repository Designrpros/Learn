"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FilterTopic {
    id: string;
    title: string;
    slug: string;
    icon?: string | null;
    children?: FilterTopic[];
}

export function WikiFilters({ filters }: { filters: FilterTopic[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Check active filters (by ID for precision, though slug is URL friendly, ID is safer for logic if slugs duplicate?)
    // Let's use ID for the query param `parentId`.
    const activeParentId = searchParams.get("parentId");

    // Find the active root to show its children (Level 2)
    const activeRoot = filters.find(f => f.id === activeParentId) ||
        filters.find(f => f.children?.some(c => c.id === activeParentId));

    // If exact match on a child, the active root is its parent.
    // Logic:
    // 1. If clicking a Root -> Set parentId = Root.ID. Show Root's children as secondary.
    // 2. If clicking a Child -> Set parentId = Child.ID. Keep Root active in UI?

    const toggleFilter = (id: string) => {
        const params = new URLSearchParams(searchParams);

        if (activeParentId === id) {
            params.delete("parentId");
        } else {
            params.set("parentId", id);
        }

        // Reset page on filter change
        params.delete("page");

        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-4 mb-8">
            {/* Level 1: Roots */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete("parentId");
                        params.delete("page");
                        router.replace(`${pathname}?${params.toString()}`);
                    }}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                        !activeParentId
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    )}
                >
                    All
                </button>
                {filters.map((filter) => {
                    const isActive = activeParentId === filter.id || filter.children?.some(c => c.id === activeParentId);
                    return (
                        <button
                            key={filter.id}
                            onClick={() => toggleFilter(filter.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-2",
                                isActive
                                    ? "bg-primary/10 text-primary border-primary"
                                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                            )}
                        >
                            {/* {filter.icon && <span>{filter.icon}</span>} */}
                            {filter.title}
                        </button>
                    );
                })}
            </div>

            {/* Level 2: Children of Active Root */}
            {activeRoot && activeRoot.children && activeRoot.children.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40 animate-in slide-in-from-top-2 fade-in duration-200">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1.5 mr-2">
                        {activeRoot.title}:
                    </span>
                    {activeRoot.children.map((child) => {
                        const isChildActive = activeParentId === child.id;
                        return (
                            <button
                                key={child.id}
                                onClick={() => toggleFilter(child.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                                    isChildActive
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                                )}
                            >
                                {child.title}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
