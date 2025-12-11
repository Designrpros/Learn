'use client';

import { createThread } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export function CreateThreadDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { isSignedIn } = useUser();

    if (!isSignedIn) return null; // Or show a sign-in prompt inside?
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    ✕
                </button>

                <h2 className="text-xl font-serif font-medium mb-4">Start a Discussion</h2>

                <form action={async (formData) => {
                    await createThread(formData);
                    onClose();
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            name="title"
                            type="text"
                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="What's on your mind?"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            name="category"
                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                        >
                            <option value="General">General</option>
                            <option value="Q&A">Q&A</option>
                            <option value="Showcase">Showcase</option>
                            <option value="Feedback">Feedback</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Content</label>
                        <textarea
                            name="content"
                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            placeholder="Elaborate on your topic..."
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit">Post Discussion</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
