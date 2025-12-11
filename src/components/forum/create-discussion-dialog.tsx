
"use client";

import { createThread } from "@/app/actions";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateDiscussionDialog({ topicId, topicTitle }: { topicId: string, topicTitle: string }) {
    const { isSignedIn } = useUser();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> New Discussion
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Discussion</DialogTitle>
                    <DialogDescription>
                        Start a conversation about <span className="font-semibold text-foreground">{topicTitle}</span>.
                    </DialogDescription>
                </DialogHeader>

                {!isSignedIn ? (
                    <div className="py-6 text-center text-muted-foreground">
                        Please sign in to start a discussion.
                    </div>
                ) : (
                    <form
                        ref={formRef}
                        action={async (formData) => {
                            setIsSubmitting(true);
                            try {
                                await createThread(formData);
                                setOpen(false);
                                formRef.current?.reset();
                            } catch (e) {
                                console.error("Failed to create thread", e);
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        className="space-y-4 mt-4"
                    >
                        <input type="hidden" name="topicId" value={topicId} />

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                name="title"
                                placeholder="What's on your mind?"
                                required
                                className="bg-muted/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Content</label>
                            <Textarea
                                name="content"
                                placeholder="Project details, questions, or ideas..."
                                required
                                className="min-h-[120px] bg-muted/30 resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                                    </>
                                ) : (
                                    "Post Discussion"
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
