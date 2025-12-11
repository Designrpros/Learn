
"use client";

import * as React from "react";
import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WikiContextDrawer({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Lock body scroll when open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* Toggle Button - Fixed at bottom right or just integrated in header? 
                User wanted "optional possible to open". 
                Let's put a Floating Action Button or a persistent tab?
                Actually, putting it in the Forum Header (passed to this component?) might be cleaner.
                For now, a fixed FAB is safe.
            */}
            <div className="fixed bottom-6 right-6 z-40">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="shadow-xl rounded-full px-6 h-12 gap-2"
                >
                    <BookOpen className="w-4 h-4" /> View Wiki Content
                </Button>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-50 w-full lg:w-[80vw] xl:w-[70vw] bg-background border-l shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-serif font-bold text-lg">Wiki Context</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto bg-background/50 p-6">
                    {children}
                </div>
            </div>
        </>
    );
}
