
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from "recharts";
import DetailedDotMap from "./detailed-dot-map";
import { KPICard } from "./kpi-card";
import { LocaleStats } from "./locale-stats";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900/90 backdrop-blur border border-neutral-800 p-3 rounded-md shadow-xl z-50">
                <p className="text-neutral-200 text-sm font-medium mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs font-mono" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsDashboard({
    growthData,
    topicData
}: {
    growthData: any[];
    topicData: any[];
}) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Views"
                    value="2.4M"
                    change="+12.5%"
                    trend="up"
                    explanation="Total page views across all wiki chapters and forum threads in the last 30 days."
                />
                <KPICard
                    title="Engagement Time"
                    value="4m 12s"
                    change="+2.1%"
                    trend="up"
                    explanation="Average time spent by active users per session."
                />
                <KPICard
                    title="New Users"
                    value={String(growthData.reduce((acc, cur) => acc + cur.users, 0))}
                    change="All Time"
                    trend="up"
                    explanation="Total registered users confirmed via Clerk authentication."
                />
                <KPICard
                    title="Bounce Rate"
                    value="42%"
                    change="-1.2%"
                    trend="down"
                    good
                    explanation="Percentage of visitors who navigate away after viewing only one page."
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Growth Chart */}
                <Card className="col-span-4 bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">Platform Growth</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Real-time Users vs Threads (Last 6 Months).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorThreads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                    <Area type="monotone" dataKey="users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="threads" stroke="#10b981" fillOpacity={1} fill="url(#colorThreads)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Topic Distribution */}
                <Card className="col-span-3 bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">Topic Categories</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Distribution of discussion categories.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#262626' }} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* World Map & Locale Stats Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800 h-full">
                        <CardHeader>
                            <CardTitle className="text-white">Global User Distribution</CardTitle>
                            <CardDescription className="text-neutral-400">
                                Active sessions by region. (High-Resolution Canvas Render).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DetailedDotMap />
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1">
                    <LocaleStats />
                </div>
            </div>
        </div>
    );
}