"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Flame, Clock, MessageSquareOff } from "lucide-react";

export function ForumFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "new";

    const filters = [
        { id: "new", label: "New", icon: Clock },
        { id: "popular", label: "Popular", icon: Flame },
        { id: "unanswered", label: "Unanswered", icon: MessageSquareOff },
    ];

    const setSort = (sort: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("sort", sort);
        params.delete("page"); // Reset pagination
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg w-fit mb-6 border border-border/50">
            {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = currentSort === filter.id;
                return (
                    <button
                        key={filter.id}
                        onClick={() => setSort(filter.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                            isActive
                                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                        {filter.label}
                    </button>
                );
            })}
        </div>
    );
}
