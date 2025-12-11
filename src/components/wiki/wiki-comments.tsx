"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea"; 
// Assuming basic UI elements or standard HTML for now if shadcn unavailable or missing, but user has 'button.tsx'.
// I'll use standard Tailwind for speed and robustness unless I see imports work.
import { Send, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { getRelativeTime } from '@/lib/utils'; // If exists

export function WikiComments({ topicId }: { topicId: string }) {
    const { user } = useUser();
    const [comments, setComments] = useState<any[]>([]); // Initialize empty, fetch in useEffect later
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch comments effect... (omitted for brevity, assume we have an API endpoint /api/comments?topicId=...)
    // const { data } = useSWR(...) or useEffect

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setLoading(true);
        // Optimistic UI update could happen here

        try {
            // Placeholder API call
            await new Promise(r => setTimeout(r, 500));

            // Mock addition
            setComments(prev => [...prev, {
                id: Date.now().toString(),
                authorName: user.fullName || user.username,
                content: newComment,
                createdAt: new Date().toISOString()
            }]);

            setNewComment("");
        } catch (err) {
            console.error("Failed to post comment", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-border/40">
            <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                Discussion <span className="text-sm font-sans font-normal text-muted-foreground">({comments.length})</span>
            </h3>

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="mb-10 relative">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add to the discussion..."
                            className="w-full bg-muted/30 border border-border rounded-xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y text-sm transition-all"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={loading || !newComment.trim()}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {loading ? "Posting..." : <>Post Comment <Send className="w-3.5 h-3.5" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground/50 italic text-sm">
                        Be the first to share your thoughts on this topic.
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <UserIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{comment.authorName}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
