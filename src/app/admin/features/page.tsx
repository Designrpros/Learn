
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FlaskConical, Globe, Lock, Zap } from "lucide-react";

export default function FeaturesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">Feature Flags</h2>
                <p className="text-neutral-400">Manage feature rollouts and system access.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Global Settings */}
                <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-400" />
                            Global System
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                            Core application availability.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium text-white">Maintenance Mode</label>
                                <p className="text-sm text-neutral-500">Disable access for all non-admin users.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium text-white">Public Signups</label>
                                <p className="text-sm text-neutral-500">Allow new users to register accounts.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium text-white">Read-Only Mode</label>
                                <p className="text-sm text-neutral-500">Disable all database writes.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* Experiments */}
                <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-emerald-400" />
                            Experiments
                        </CardTitle>
                        <CardDescription className="text-neutral-400">
                            Beta features and A/B tests.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <label className="text-base font-medium text-white">New Wiki UI</label>
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">BETA</Badge>
                                </div>
                                <p className="text-sm text-neutral-500">Enable the v2 layout for wiki chapters.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium text-white">AI Search</label>
                                <p className="text-sm text-neutral-500">Use Vector Search instead of simple text match.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium text-white">Forum Reactions</label>
                                <p className="text-sm text-neutral-500">Enable emoji reactions on threads.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
