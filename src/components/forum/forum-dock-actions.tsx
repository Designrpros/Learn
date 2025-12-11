"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/lib/ui-store";
import { CreateThreadDialog } from "./create-thread-dialog";
import { Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function ForumDockActions() {
    const { setCenterActions } = useUIStore();
    const [isOpen, setIsOpen] = useState(false);
    const { isSignedIn } = useUser();

    useEffect(() => {
        if (isSignedIn) {
            setCenterActions(
                <button
                    onClick={() => setIsOpen(true)}
                    className="ml-2 bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90 transition-opacity shadow-lg"
                    title="Create New Discussion"
                >
                    <Plus className="w-5 h-5" />
                </button>
            );
        } else {
            setCenterActions(null);
        }

        return () => setCenterActions(null);
    }, [setCenterActions, isSignedIn]);

    return (
        <CreateThreadDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    );
}
