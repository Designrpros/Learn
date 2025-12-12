"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";

export function SearchInput({
    placeholder = "Search...",
    className
}: {
    placeholder?: string,
    className?: string
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const initialQuery = searchParams.get("q")?.toString() || "";
    const [text, setText] = useState(initialQuery);
    const [query] = useDebounce(text, 300);

    useEffect(() => {
        if (query === initialQuery) return;

        const params = new URLSearchParams(searchParams);
        if (query) {
            params.set("q", query);
        } else {
            params.delete("q");
        }

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    }, [query, pathname, router, searchParams, initialQuery]);

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="pl-9 pr-8"
            />
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
}
