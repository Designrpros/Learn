
import { db } from "@/db";
import { threads, posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, MessageSquare, FileText } from "lucide-react";
import { deleteThread } from "@/app/actions/delete-thread";
import { deletePost } from "@/app/actions/delete-post";

export default async function AdminModerationPage() {
    const recentThreads = await db.query.threads.findMany({
        orderBy: [desc(threads.createdAt)],
        limit: 20,
    });

    const recentPosts = await db.query.posts.findMany({
        orderBy: [desc(posts.createdAt)],
        limit: 20,
        with: {
            thread: true
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Content Moderation</h2>
                <p className="text-neutral-400">Review and moderate community content.</p>
            </div>

            <Tabs defaultValue="threads" className="space-y-4">
                <TabsList className="bg-neutral-900 border border-neutral-800">
                    <TabsTrigger value="threads" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
                        Threads
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
                        Posts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="threads" className="space-y-4">
                    {recentThreads.map((thread) => (
                        <Card key={thread.id} className="bg-neutral-900 border-neutral-800">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-neutral-700 text-neutral-400">
                                            {thread.category}
                                        </Badge>
                                        <span className="text-xs text-neutral-500">
                                            by {thread.authorName || 'Anonymous'} • {format(thread.createdAt, 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-medium text-white">
                                        {thread.title}
                                    </CardTitle>
                                </div>
                                <form action={async () => {
                                    "use server"
                                    await deleteThread(thread.id)
                                }}>
                                    <Button variant="ghost" size="icon" type="submit" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </CardHeader>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="posts" className="space-y-4">
                    {recentPosts.map((post) => (
                        <Card key={post.id} className="bg-neutral-900 border-neutral-800">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-neutral-500">
                                            by {post.authorName || 'Anonymous'} • {format(post.createdAt, 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <CardDescription className="text-neutral-300 line-clamp-2">
                                        {post.content}
                                    </CardDescription>
                                    <p className="text-xs text-neutral-500 mt-2">
                                        on thread: <span className="text-neutral-400">{post.thread?.title}</span>
                                    </p>
                                </div>
                                <form action={async () => {
                                    "use server"
                                    await deletePost(post.id, post.threadId!)
                                }}>
                                    <Button variant="ghost" size="icon" type="submit" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </CardHeader>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
