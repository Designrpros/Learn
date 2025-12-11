"use client";

import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function WikiRefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        // Reset animation after a short delay
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <button
            onClick={handleRefresh}
            className="flex items-center gap-2 hover:text-primary transition-colors group"
            title="Refresh article content"
        >
            <RefreshCcw className={cn("w-4 h-4 transition-transform", isRefreshing && "animate-spin")} />
            <span>Refresh</span>
        </button>
    );
}
