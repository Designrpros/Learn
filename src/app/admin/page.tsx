
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/admin/kpi-card";
import { Activity, ShieldAlert, Zap, DollarSign, Users, Mail, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AdminOverviewPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>
                <p className="text-neutral-400">System status and key performance indicators.</p>
            </div>

            {/* High-Level KPIs (Snapshot of Analytics & Monetization) */}
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard
                    title="Total Revenue"
                    value="$12,450"
                    change="+8.2%"
                    trend="up"
                    icon={DollarSign}
                />
                <KPICard
                    title="Active Users"
                    value="1,234"
                    change="+12%"
                    trend="up"
                    icon={Users}
                />
                <KPICard
                    title="Email Delivery"
                    value="99.2%"
                    change="+0.1%"
                    trend="up"
                    icon={Mail}
                />
                <KPICard
                    title="System Health"
                    value="100%"
                    change="Stable"
                    trend="flat"
                    good
                    icon={Zap}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Activity Snapshot */}
                <Card className="lg:col-span-2 bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-neutral-400" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription className="text-neutral-400">
                                Latest system events across the platform.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/activity">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { user: "Vegar Berentsen", action: "Deleted thread 'Next.js 15'", time: "2m ago" },
                            { user: "Alice Johnson", action: "Upgraded to Pro", time: "15m ago" },
                            { user: "System", action: "Backup completed", time: "1h ago" },
                            { user: "Bob Smith", action: "Login attached from IP 192.168...", time: "2h ago" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-neutral-700" />
                                    <span className="text-sm text-neutral-300">{item.action}</span>
                                </div>
                                <span className="text-xs text-neutral-500">{item.time}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Actions / Feature Status */}
                <div className="space-y-6">
                    {/* Feature Flags Snapshot */}
                    <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <Flag className="w-4 h-4 text-indigo-400" />
                                Feature Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-400">Maintenance Mode</span>
                                <Badge variant="outline" className="text-neutral-500 border-neutral-800">Off</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-400">Public Signups</span>
                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-400">Beta UI</span>
                                <Badge variant="outline" className="text-indigo-500 border-indigo-500/20 bg-indigo-500/10">Live</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                <Link href="/admin/features">Manage Flags</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Moderation Queue Snapshot */}
                    <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-red-400" />
                                Attention Needed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-neutral-400">Pending Reports</span>
                                <span className="text-lg font-bold text-white">0</span>
                            </div>
                            <Button className="w-full bg-white text-black hover:bg-neutral-200" asChild>
                                <Link href="/admin/moderation">Moderation Queue</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
