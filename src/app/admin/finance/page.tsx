
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/admin/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreditCard, DollarSign, TrendingUp, TrendingDown, Server, Megaphone, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

export default function FinancePage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch('/api/admin/finance/transactions')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const transactions = data?.transactions || [];
    const stats = data?.stats || { adRevenue: 0 };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">Finance & Monetization</h2>
                <p className="text-neutral-400">Revenue, expenses, and ad network management.</p>
            </div>

            {/* Profit & Loss KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard
                    title="Total Revenue"
                    value={`$${(15240 + (stats.adRevenue / 100)).toLocaleString()}`}
                    change="+12%"
                    trend="up"
                    explanation="Gross income from Subscriptions + Ads."
                />
                <KPICard
                    title="Operating Costs"
                    value="$2,450"
                    change="+5%"
                    trend="down"
                    explanation="Server, AI, and Email infrastructure costs."
                />
                <KPICard
                    title="Net Profit"
                    value={`$${(12790 + (stats.adRevenue / 100)).toLocaleString()}`}
                    change="+14%"
                    trend="up"
                    good
                    explanation="Revenue minus Operating Costs."
                />
                <KPICard
                    title="Ad Revenue"
                    value={`$${(stats.adRevenue / 100).toLocaleString()}`}
                    change="+100%"
                    trend="up"
                    explanation="Income from AdMob and Native campaigns."
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Cost Breakdown */}
                <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Server className="w-5 h-5 text-red-400" />
                            Operating Expenses
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                            Monthly infrastructure costs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: "OpenRouter LLM", cost: "$1,200/mo", status: "Variable", trend: "+10%" },
                            { name: "Vercel Hosting", cost: "$40/mo", status: "Fixed", trend: "0%" },
                            { name: "Neon Database", cost: "$0/mo", status: "Free Tier", trend: "0%" },
                            { name: "Clerk Auth", cost: "$210/mo", status: "Variable", trend: "+5%" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-neutral-900/50">
                                <div>
                                    <p className="text-sm font-medium text-white">{item.name}</p>
                                    <Badge variant="outline" className="text-[10px] text-neutral-500 border-neutral-800">{item.status}</Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-white">{item.cost}</p>
                                    <p className="text-xs text-red-400">{item.trend}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            Recent Transactions
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                            Latest payments from Stripe & Crypto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="text-neutral-500 text-sm">Loading transactions...</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-neutral-500 text-sm">No transactions yet.</div>
                        ) : (
                            transactions.map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-neutral-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white capitalize">{tx.method} Payment</p>
                                            <p className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-white">+${(tx.amount / 100).toFixed(2)}</p>
                                        <Badge variant="outline" className={`text-[10px] ${tx.status === 'succeeded' ? 'text-emerald-500 border-emerald-500/20' : 'text-yellow-500 border-yellow-500/20'}`}>
                                            {tx.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
