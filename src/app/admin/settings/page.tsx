
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Eye, Power, RefreshCw, Server, Shield, Key } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">System Settings</h2>
                <p className="text-neutral-400">Manage global configurations and external integrations.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* General Settings (Placeholder) */}
                <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Server className="w-5 h-5 text-neutral-400" />
                            General Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Site Name</label>
                            <Input defaultValue="Wikits" className="bg-neutral-950 border-neutral-800" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Support Email</label>
                            <Input defaultValue="admin@wikits.com" className="bg-neutral-950 border-neutral-800" />
                        </div>
                        <Button className="w-full bg-white text-black hover:bg-neutral-200">Save Changes</Button>
                    </CardContent>
                </Card>

                {/* API & Integrations */}
                <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Key className="w-5 h-5 text-indigo-400" />
                            API Integrations
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                            Status and costs of external services.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Clerk */}
                        <div className="flex items-start justify-between border-b border-neutral-800 pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-white">Clerk Authentication</h4>
                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/10 text-[10px]">Active</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded">
                                    pk_live_...a8j2 <Copy className="w-3 h-3 cursor-pointer hover:text-white" />
                                </div>
                                <div className="text-xs text-neutral-400">Est. Cost: <span className="text-white">$0.00 / mo</span></div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <RefreshCw className="w-4 h-4 text-neutral-400" />
                            </Button>
                        </div>

                        {/* OpenRouter */}
                        <div className="flex items-start justify-between border-b border-neutral-800 pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-white">OpenRouter AI</h4>
                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/10 text-[10px]">Active</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded">
                                    sk_or_...92ms <Copy className="w-3 h-3 cursor-pointer hover:text-white" />
                                </div>
                                <div className="text-xs text-neutral-400">Est. Cost: <span className="text-white">$14.20 / mo</span></div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <RefreshCw className="w-4 h-4 text-neutral-400" />
                            </Button>
                        </div>

                        {/* Vercel Postgres */}
                        <div className="flex items-start justify-between border-b border-neutral-800 pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-white">Neon / Postgres</h4>
                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/10 text-[10px]">Active</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded">
                                    postgres://... <Copy className="w-3 h-3 cursor-pointer hover:text-white" />
                                </div>
                                <div className="text-xs text-neutral-400">Est. Cost: <span className="text-white">$0.00 (Hobby)</span></div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <RefreshCw className="w-4 h-4 text-neutral-400" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
