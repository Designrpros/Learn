


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Activity, User, Shield, AlertCircle, FileText } from "lucide-react";

import { getActivityLogs } from "@/lib/admin";

export default async function ActivityPage() {
    const logs = await getActivityLogs();

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
                                {logs.length === 0 ? (
                                    <div className="text-center py-12 text-neutral-500">
                                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No activity recorded yet.</p>
                                    </div>
                                ) : logs.map((log) => (
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
