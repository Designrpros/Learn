'use client';

import { createPost } from "@/app/actions";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useRef } from "react";

export function CreatePostForm({ threadId }: { threadId: string }) {
    const { isSignedIn } = useUser();
    const formRef = useRef<HTMLFormElement>(null);

    if (!isSignedIn) {
        return (
            <div className="mt-8 bg-muted/20 p-6 rounded-xl border border-dashed border-border text-center">
                <p className="text-muted-foreground">Log in to leave a comment.</p>
            </div>
        );
    }

    return (
        <form
            action={async (formData) => {
                await createPost(formData);
                formRef.current?.reset();
            }}
            ref={formRef}
            className="mt-8 bg-card border border-border rounded-xl p-4 shadow-sm"
        >
            <input type="hidden" name="threadId" value={threadId} />
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    You
                </div>
                <div className="flex-1">
                    <textarea
                        name="content"
                        placeholder="What are your thoughts?"
                        className="w-full bg-transparent border-none resize-none focus:outline-none min-h-[100px] text-sm"
                        required
                    />
                    <div className="flex justify-end mt-2">
                        <Button type="submit" size="sm" className="gap-2">
                            Reply <Send className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
