
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/admin/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";

export default function MonetizationPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Monetization</h2>
                <p className="text-neutral-400">Manage subscriptions, revenue, and pricing plans.</p>
            </div>

            {/* Revenue KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard
                    title="Total Revenue"
                    value="$12,450"
                    change="+8.2%"
                    trend="up"
                    explanation="Total revenue collected this month."
                />
                <KPICard
                    title="MRR"
                    value="$4,200"
                    change="+12.5%"
                    trend="up"
                    explanation="Monthly Recurring Revenue from active subscriptions."
                />
                <KPICard
                    title="Active Subs"
                    value="342"
                    change="+24"
                    trend="up"
                    explanation="Total number of active Pro/Team subscriptions."
                />
                <KPICard
                    title="Churn Rate"
                    value="2.4%"
                    change="-0.5%"
                    trend="down"
                    good
                    explanation="Percentage of customers who cancelled this month."
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Active Plans */}
                <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">Subscription Plans</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Current active pricing tiers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: "Free Tier", price: "$0", users: "12,450", status: "Active" },
                            { name: "Pro Plan", price: "$19/mo", users: "310", status: "Active" },
                            { name: "Team Plan", price: "$49/mo", users: "32", status: "Active" },
                        ].map((plan, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-neutral-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-neutral-800 text-neutral-400">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{plan.name}</p>
                                        <p className="text-xs text-neutral-400">{plan.price}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-neutral-300">{plan.users} users</span>
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">{plan.status}</Badge>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed border-neutral-700 hover:border-neutral-600 text-neutral-400">
                            + Create New Plan
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Transactions</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Latest payments and invoices.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { user: "alice@example.com", amount: "+$19.00", status: "Succeeded", time: "2 min ago" },
                            { user: "bob@company.com", amount: "+$49.00", status: "Succeeded", time: "15 min ago" },
                            { user: "carol@test.net", amount: "+$19.00", status: "Failed", time: "1 hour ago" },
                            { user: "dave@provider.io", amount: "+$190.00", status: "Succeeded", time: "2 hours ago" },
                        ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                                <div className="flex flex-col">
                                    <span className="text-sm text-neutral-200">{tx.user}</span>
                                    <span className="text-xs text-neutral-500">{tx.time}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-white">{tx.amount}</span>
                                    <Badge variant="outline" className={
                                        tx.status === "Succeeded"
                                            ? "border-emerald-500/30 text-emerald-500"
                                            : "border-red-500/30 text-red-500"
                                    }>
                                        {tx.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
