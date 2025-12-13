
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, TrendingUp, DollarSign, MousePointer2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdsDashboardPage() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#050505', overflowY: 'auto' }}>
            <div className="max-w-7xl mx-auto p-6 lg:p-12 text-white font-sans">

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-2 text-sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to App
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Ads Manager</h1>
                        <p className="text-neutral-400">Manage your campaigns and track performance.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" asChild>
                            <Link href="/ads/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Campaign
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid gap-6 md:grid-cols-4 mb-12">
                    <KpiCard title="Total Spend" value="$1,240.50" icon={DollarSign} trend="+12%" />
                    <KpiCard title="Impressions" value="452,000" icon={BarChart3} trend="+5.4%" />
                    <KpiCard title="Clicks" value="12,450" icon={MousePointer2} trend="+2.1%" />
                    <KpiCard title="Avg. CTR" value="2.8%" icon={TrendingUp} trend="-0.4%" />
                </div>

                {/* Campaign Table */}
                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Active Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-neutral-500 border-b border-neutral-800">
                                    <tr>
                                        <th className="pb-4 font-medium pl-4">Status</th>
                                        <th className="pb-4 font-medium w-1/3">Campaign Name</th>
                                        <th className="pb-4 font-medium">Budget</th>
                                        <th className="pb-4 font-medium">Spend</th>
                                        <th className="pb-4 font-medium">Impressions</th>
                                        <th className="pb-4 font-medium">Results</th>
                                        <th className="pb-4 font-medium pr-4">Ends</th>
                                    </tr>
                                </thead>
                                <tbody className="text-neutral-300">
                                    <CampaignRow
                                        status="Active"
                                        name="Summer Sale Promotion"
                                        budget="$50/day"
                                        spend="$245.00"
                                        impressions="85k"
                                        results="2.1k Clicks"
                                        end="Dec 31"
                                    />
                                    <CampaignRow
                                        status="Paused"
                                        name="Brand Awareness - Video"
                                        budget="$100/day"
                                        spend="$1,050.00"
                                        impressions="310k"
                                        results="5.4k Clicks"
                                        end="Jan 15"
                                    />
                                    <CampaignRow
                                        status="Draft"
                                        name="Retargeting Campaign"
                                        budget="-"
                                        spend="$0.00"
                                        impressions="-"
                                        results="-"
                                        end="-"
                                    />
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, trend }: any) {
    const isPositive = trend.startsWith('+');
    return (
        <Card className="bg-neutral-900/50 border-neutral-800">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-neutral-400">{title}</span>
                    <Icon className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    <span className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function CampaignRow({ status, name, budget, spend, impressions, results, end }: any) {
    return (
        <tr className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
            <td className="py-4 pl-4">
                <Badge variant="outline" className={`
                    ${status === 'Active' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : ''}
                    ${status === 'Paused' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10' : ''}
                    ${status === 'Draft' ? 'text-neutral-500 border-neutral-700 bg-neutral-800' : ''}
                `}>
                    {status}
                </Badge>
            </td>
            <td className="py-4 font-medium text-white">{name}</td>
            <td className="py-4 text-neutral-400">{budget}</td>
            <td className="py-4 text-white">{spend}</td>
            <td className="py-4 text-neutral-400">{impressions}</td>
            <td className="py-4 text-neutral-400">{results}</td>
            <td className="py-4 text-neutral-500 pr-4">{end}</td>
        </tr>
    );
}
