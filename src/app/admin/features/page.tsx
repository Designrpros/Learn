
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Globe, Plus } from "lucide-react";
import { getFeatureFlags, createFeatureFlag } from "@/lib/features";
import { FeatureToggle } from "@/components/admin/feature-toggle";
import { Button } from "@/components/ui/button";

export default async function FeaturesPage() {
    let flags = await getFeatureFlags();

    // Auto-seed if empty (for demo purposes)
    if (flags.length === 0) {
        await createFeatureFlag("maintenance_mode", "Disable access for all non-admin users.", false);
        await createFeatureFlag("public_signups", "Allow new users to register accounts.", false);
        await createFeatureFlag("new_wiki_ui", "Enable the v2 layout for wiki chapters.", false);
        await createFeatureFlag("ai_search", "Use Vector Search instead of simple text match.", false);
        flags = await getFeatureFlags();
    }

    const systemFlags = flags.filter(f => !f.key.startsWith("new_") && !f.key.startsWith("ai_"));
    const experimentFlags = flags.filter(f => f.key.startsWith("new_") || f.key.startsWith("ai_"));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Feature Flags</h2>
                        <p className="text-neutral-400">Manage feature rollouts and system access.</p>
                    </div>
                </div>
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
                        {systemFlags.map(flag => (
                            <div key={flag.id} className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium text-white capitalize">
                                        {flag.key.replace(/_/g, " ")}
                                    </label>
                                    <p className="text-sm text-neutral-500">{flag.description}</p>
                                </div>
                                <FeatureToggle
                                    id={flag.id}
                                    isEnabled={flag.isEnabled}
                                    label={flag.key}
                                />
                            </div>
                        ))}
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
                        {experimentFlags.map(flag => (
                            <div key={flag.id} className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <label className="text-base font-medium text-white capitalize">
                                            {flag.key.replace(/_/g, " ")}
                                        </label>
                                        <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">BETA</Badge>
                                    </div>
                                    <p className="text-sm text-neutral-500">{flag.description}</p>
                                </div>
                                <FeatureToggle
                                    id={flag.id}
                                    isEnabled={flag.isEnabled}
                                    label={flag.key}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
