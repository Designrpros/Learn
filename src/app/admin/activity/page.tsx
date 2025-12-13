
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Activity, User, Shield, AlertCircle, FileText } from "lucide-react";

const ACTIVITY_LOGS = [
    { id: 1, user: "Vegar Berentsen", action: "Deleted thread 'Next.js 15 Issues'", type: "Moderation", time: "2 min ago", icon: Shield, intent: "destructive" },
    { id: 2, user: "Alice Johnson", action: "Upgraded to Pro Plan", type: "Billing", time: "15 min ago", icon: FileText, intent: "positive" },
    { id: 3, user: "System", action: "Database backup completed", type: "System", time: "1 hour ago", icon: Activity, intent: "neutral" },
    { id: 4, user: "Bob Smith", action: "Failed login attempt (IP: 192.168.1.1)", type: "Security", time: "2 hours ago", icon: AlertCircle, intent: "warning" },
    { id: 5, user: "Carol White", action: "Published new wiki topic 'React Hooks'", type: "Content", time: "3 hours ago", icon: FileText, intent: "neutral" },
    { id: 6, user: "Vegar Berentsen", action: "Changed 'Theme' setting to 'Dark'", type: "Settings", time: "5 hours ago", icon: User, intent: "neutral" },
];

export default function ActivityPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">Activity Logs</h2>
                <p className="text-neutral-400">Audit trail of all administrative and user actions.</p>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-neutral-900 border border-neutral-800">
                        <TabsTrigger value="all">All Events</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                        <Input placeholder="Search logs..." className="pl-8 bg-neutral-900 border-neutral-800 focus:border-neutral-700" />
                    </div>
                </div>

                <TabsContent value="all" className="space-y-4">
                    <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-white">Recent Activity</CardTitle>
                            <CardDescription className="text-neutral-400">
                                Real-time chronological log.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {ACTIVITY_LOGS.map((log) => (
                                    <div key={log.id} className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-full bg-neutral-800/50 border border-neutral-700 ${log.intent === "destructive" ? "text-red-400 border-red-900/50" :
                                                log.intent === "warning" ? "text-amber-400 border-amber-900/50" :
                                                    log.intent === "positive" ? "text-emerald-400 border-emerald-900/50" :
                                                        "text-neutral-400"
                                            }`}>
                                            <log.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-white">{log.action}</p>
                                                <span className="text-xs text-neutral-500">{log.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Badge variant="outline" className="border-neutral-800 text-neutral-400">{log.type}</Badge>
                                                <span className="text-neutral-500">by {log.user}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <div className="p-12 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                        Only security events shown here.
                    </div>
                </TabsContent>
                <TabsContent value="system">
                    <div className="p-12 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                        Only system events shown here.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
