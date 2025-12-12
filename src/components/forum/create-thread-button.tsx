"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateThreadDialog } from "./create-thread-dialog";

export function CreateThreadButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
            >
                Create Post
            </button>
            <CreateThreadDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
