"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateThreadDialog } from "./create-thread-dialog";
import { useUser, SignInButton } from "@clerk/nextjs";

import { Plus } from "lucide-react";

export function CreateThreadButton({ variant = 'default' }: { variant?: 'default' | 'icon' }) {
    const { isSignedIn } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    if (!isSignedIn) {
        return (
            <SignInButton mode="modal">
                {variant === 'default' ? (
                    <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors opacity-80">
                        Sign in to Post
                    </button>
                ) : (
                    <button className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm opacity-80" title="Sign in to Post">
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </SignInButton>
        );
    }

    return (
        <>
            {variant === 'default' ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
                >
                    Create Post
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                    title="Create Post"
                >
                    <Plus className="w-5 h-5" />
                </button>
            )}
            <CreateThreadDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
