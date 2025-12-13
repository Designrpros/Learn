import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import CampaignWizard from "@/components/ads/campaign-wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, MousePointer2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const campaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, id)
    });

    if (!campaign) {
        notFound();
    }

    // If Draft => Edit Mode
    if (campaign.status === 'draft') {
        return <CampaignWizard initialData={campaign} isEditMode={true} />;
    }

    const metrics = (campaign.metrics as { spend?: number; impressions?: number; clicks?: number }) || {};
    const targetCountries = (campaign.targetCountries as string[]) || [];

    // If Active/Paused => Details View (Read-Only / Stats)
    // For now, simple stats view placeholder
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#050505', overflowY: 'auto' }}>
            <div className="max-w-7xl mx-auto p-6 lg:p-12 text-white font-sans">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/ads" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-2 text-sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{campaign.name}</h1>
                        <Badge variant="outline" className={`
                            ${campaign.status === 'active' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : ''}
                            ${campaign.status === 'paused' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10' : ''}
                        `}>
                            {campaign.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4 mb-12">
                    <KpiCard title="Total Spend" value={`$${(metrics.spend || 0).toLocaleString()}`} icon={DollarSign} trend="-" />
                    <KpiCard title="Impressions" value={(metrics.impressions || 0).toLocaleString()} icon={BarChart3} trend="-" />
                    <KpiCard title="Clicks" value={(metrics.clicks || 0).toLocaleString()} icon={MousePointer2} trend="-" />
                    <KpiCard title="Avg. CTR" value="0.0%" icon={TrendingUp} trend="-" />
                </div>

                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">Creative & Targeting</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-neutral-400">
                        <div>
                            <span className="font-semibold text-neutral-300">Headline:</span> {campaign.headline}
                        </div>
                        <div>
                            <span className="font-semibold text-neutral-300">Destination:</span> {campaign.destinationUrl}
                        </div>
                        <div>
                            <span className="font-semibold text-neutral-300">Targeting:</span> {targetCountries.length ? `${targetCountries.length} countries` : "All Countries"}
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
