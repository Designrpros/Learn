
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/admin/kpi-card";
import { Activity, ShieldAlert, Zap, DollarSign, Users, Mail, Flag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAdminDashboardStats, getRecentActivity } from "@/lib/db-queries";
import { getSystemStatus } from "@/app/actions/get-system-status";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 0; // Ensure fresh data on every request

export default async function AdminOverviewPage() {
    const stats = await getAdminDashboardStats();
    const recentActivity = await getRecentActivity(null, 5);
    const systemStatus = await getSystemStatus();

    // Format Currency
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

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
                    value={formatter.format(stats.revenue)}
                    change="+0.0%" // Placeholder until historical data logic is added
                    trend="flat"
                    icon={DollarSign}
                />
                <KPICard
                    title="Active Users"
                    value={stats.users.toLocaleString()}
                    change="+0" // Placeholder
                    trend="up"
                    icon={Users}
                />
                <KPICard
                    title="Email Delivery"
                    value="99.9%"
                    change="+0.0%"
                    trend="up"
                    icon={Mail}
                />
            </div>

            {/* System Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { l: "DB Latency", v: systemStatus.dbLatency, s: "ok" },
                    { l: "Vector Idx", v: systemStatus.vectorIndex, s: "ok" },
                    { l: "Cache Hit", v: systemStatus.cacheHit, s: "ok" },
                    { l: "API Status", v: systemStatus.apiStatus, s: "ok" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800 p-4 flex flex-col items-center justify-center hover:bg-neutral-800/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full mb-2 ${stat.s === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="font-mono text-lg font-bold text-white">{stat.v}</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-widest mt-1">{stat.l}</span>
                    </Card>
                ))}
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
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        <span className="text-sm text-neutral-300">{(item.metadata as any)?.user || 'System'}</span>
                                        <span className="text-sm text-neutral-500">-</span>
                                        <span className="text-sm text-neutral-300">{item.action}</span>
                                    </div>
                                    <span className="text-xs text-neutral-500">{formatDistanceToNow(item.createdAt, { addSuffix: true })}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-neutral-500 py-4 text-center">No recent activity</div>
                        )}
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
                                <Badge variant="outline" className={`border-neutral-800 ${stats.flags.maintenanceMode ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-neutral-500'}`}>
                                    {stats.flags.maintenanceMode ? 'On' : 'Off'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-400">Public Signups</span>
                                <Badge variant="outline" className={`border-neutral-800 ${stats.flags.publicSignups ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-neutral-500'}`}>
                                    {stats.flags.publicSignups ? 'Active' : 'Disabled'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-400">Beta UI</span>
                                <Badge variant="outline" className={`border-neutral-800 ${stats.flags.betaUI ? 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' : 'text-neutral-500'}`}>
                                    {stats.flags.betaUI ? 'Live' : 'Off'}
                                </Badge>
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

                    {/* System Settings Link */}
                    <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <Settings className="w-4 h-4 text-neutral-400" />
                                System Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-neutral-400">Global Settings</span>
                                <span className="text-xs text-neutral-500">Limits, Flags</span>
                            </div>
                            <Button variant="outline" className="w-full border-neutral-800 text-neutral-300 hover:text-white" asChild>
                                <Link href="/admin/settings">Manage Settings</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
