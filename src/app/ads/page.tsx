"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, TrendingUp, DollarSign, MousePointer2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdsDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch('/api/ads/stats')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#050505] text-white">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const { kpis, campaigns } = data || { kpis: {}, campaigns: [] };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#050505', overflowY: 'auto' }}>
            <div className="max-w-7xl mx-auto p-4 lg:p-12 text-white font-sans">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6 md:gap-0">
                    <div>
                        <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-2 text-sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to App
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Ads Manager</h1>
                        <p className="text-neutral-400 text-sm md:text-base">Manage your campaigns and track performance.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:text-white hover:bg-neutral-800" asChild>
                            <Link href="/ads/analytics">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                View Analytics
                            </Link>
                        </Button>
                        <Button className="flex-1 md:flex-none bg-white text-black hover:bg-neutral-200" asChild>
                            <Link href="/ads/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Campaign
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                    <KpiCard title="Total Spend" value={`$${kpis.spend?.toLocaleString()}`} icon={DollarSign} trend="-" />
                    <KpiCard title="Impressions" value={kpis.impressions?.toLocaleString()} icon={BarChart3} trend="-" />
                    <KpiCard title="Clicks" value={kpis.clicks?.toLocaleString()} icon={MousePointer2} trend="-" />
                    <KpiCard title="Avg. CTR" value={`${kpis.ctr}%`} icon={TrendingUp} trend="-" />
                </div>

                {/* Campaign Table */}
                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Active Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[800px] sm:min-w-0">
                                <thead className="text-neutral-500 border-b border-neutral-800">
                                    <tr>
                                        <th className="pb-4 font-medium pl-4 sm:pl-0">Status</th>
                                        <th className="pb-4 font-medium w-1/3">Campaign Name</th>
                                        <th className="pb-4 font-medium hidden md:table-cell">Budget</th>
                                        <th className="pb-4 font-medium">Spend</th>
                                        <th className="pb-4 font-medium hidden md:table-cell">Impressions</th>
                                        <th className="pb-4 font-medium">Results</th>
                                        <th className="pb-4 font-medium pr-4 sm:pr-0 text-right sm:text-left">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="text-neutral-300">
                                    {campaigns.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-neutral-500">
                                                No campaigns found. Create your first one!
                                            </td>
                                        </tr>
                                    ) : (
                                        campaigns.map((c: any) => {
                                            const hasMetrics = c.metrics && c.metrics.impressions > 0;
                                            // Simple estimation logic: $1 = 50 impressions, 1% CTR
                                            const estImpressions = (c.dailyBudget * 50).toLocaleString();
                                            const estClicks = Math.round(c.dailyBudget * 50 * 0.01).toLocaleString();

                                            return (
                                                <CampaignRow
                                                    key={c.id}
                                                    id={c.id}
                                                    status={c.status === 'active' ? 'Active' : c.status === 'paused' ? 'Paused' : 'Draft'}
                                                    name={c.name}
                                                    budget={`$${c.dailyBudget}/day`}
                                                    spend={`$${c.metrics?.spend || 0}`}
                                                    impressions={hasMetrics ? c.metrics.impressions : <span className="text-neutral-500 italic">{estImpressions}</span>}
                                                    results={hasMetrics ? `${c.metrics.clicks} Clicks` : <span className="text-neutral-500 italic">{estClicks} Clicks</span>}
                                                    end={`${c.durationDays} days`}
                                                />
                                            );
                                        })
                                    )}
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
                    {trend !== '-' && (
                        <span className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trend}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


import { Trash2 } from "lucide-react";
import { deleteCampaign } from "@/lib/actions/ads";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function CampaignRow({ id, status, name, budget, spend, impressions, results, end }: any) {
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        if (!confirm("Are you sure you want to delete this campaign?")) return;

        const res = await deleteCampaign(id);
        if (res.success) {
            toast.success("Campaign deleted");
            // Refresh logic handled by revalidatePath in server action, but client might need a nudge if using state
            window.location.reload(); // Simple refresh for now
        } else {
            toast.error("Failed to delete");
        }
    };

    return (
        <tr
            className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors cursor-pointer group"
            onClick={() => router.push(`/ads/${id}`)}
        >
            <td className="py-4 pl-4 sm:pl-0">
                <Badge variant="outline" className={`
                    ${status === 'Active' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : ''}
                    ${status === 'Paused' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10' : ''}
                    ${status === 'Draft' ? 'text-neutral-500 border-neutral-700 bg-neutral-800' : ''}
                `}>
                    {status}
                </Badge>
            </td>
            <td className="py-4 font-medium text-white">{name}</td>
            <td className="py-4 text-neutral-400 hidden md:table-cell">{budget}</td>
            <td className="py-4 text-white">{spend}</td>
            <td className="py-4 text-neutral-400 hidden md:table-cell">{impressions}</td>
            <td className="py-4 text-neutral-400">{results}</td>
            <td className="py-4 text-neutral-500 pr-4 sm:pr-0 text-right sm:text-left flex items-center justify-end sm:justify-between">
                <span>{end}</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-600 hover:text-red-400 hover:bg-red-900/10 opacity-0 group-hover:opacity-100 transition-all ml-2"
                    onClick={handleDelete}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </td>
        </tr>
    );
}

