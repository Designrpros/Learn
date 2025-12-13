
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/admin/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreditCard, DollarSign, TrendingUp, TrendingDown, Server, Megaphone, Smartphone } from "lucide-react";

export default function FinancePage() {
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
                    value="$15,240" 
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
                    value="$12,790" 
                    change="+14%" 
                    trend="up" 
                    good
                    explanation="Revenue minus Operating Costs."
                />
                 <KPICard 
                    title="Ad Revenue" 
                    value="$4,100" 
                    change="+32%" 
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

                 {/* Ad Network Settings */}
                 <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-indigo-400" />
                            Ad Networks
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                             Manage active display networks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* AdMob */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral-800 rounded-md">
                                    <Smartphone className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white">Google AdMob</h4>
                                    <p className="text-xs text-neutral-500">Mobile banner & interstitial ads.</p>
                                </div>
                            </div>
                            <Switch />
                        </div>

                         {/* Native Ads */}
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral-800 rounded-md">
                                    <Megaphone className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white">Wikits Native Ads</h4>
                                    <p className="text-xs text-neutral-500">Custom user-created campaigns (Reddit-style).</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        
                        <div className="p-4 rounded-lg bg-neutral-950 border border-dashed border-neutral-800">
                            <p className="text-xs text-neutral-400 mb-2">Native Ad Preview</p>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-neutral-800 rounded-md shrink-0" />
                                <div>
                                    <div className="h-3 w-32 bg-neutral-800 rounded mb-1" />
                                    <div className="h-2 w-48 bg-neutral-800 rounded" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
