'use client';

import { createThread } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export function CreateThreadDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { isSignedIn } = useUser();

    if (!isSignedIn) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-serif font-medium">Start a Discussion</DialogTitle>
                </DialogHeader>

                <form action={async (formData) => {
                    await createThread(formData);
                    onClose();
                }} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            name="title"
                            placeholder="What's on your mind?"
                            required
                            className="bg-muted/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                            name="category"
                            className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                            <option value="General">General</option>
                            <option value="Q&A">Q&A</option>
                            <option value="Showcase">Showcase</option>
                            <option value="Feedback">Feedback</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                            name="content"
                            placeholder="Elaborate on your topic..."
                            required
                            className="min-h-[150px] bg-muted/50 resize-none"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit">Post Discussion</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
