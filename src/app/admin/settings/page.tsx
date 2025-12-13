import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { getAllSystemSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const revalidate = 0;

export default async function AdminSettingsPage() {
    const settings = await getAllSystemSettings();

    // Merge with defaults to ensure all keys are present even if not in DB yet
    const settingsMap = new Map(settings.map(s => [s.key, s]));

    const allSettings = Object.keys(DEFAULT_SETTINGS).map(key => {
        return settingsMap.get(key) || {
            key,
            value: DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS],
            description: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        };
    });

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white space-x-2">System Configuration</h1>
                    <p className="text-neutral-400">Manage global system settings and limits.</p>
                </div>
            </div>

            <Card className="bg-neutral-900/50 backdrop-blur border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">General Settings</CardTitle>
                    <CardDescription className="text-neutral-400">
                        These settings affect all users immediately.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsForm initialSettings={allSettings} />
                </CardContent>
            </Card>
        </div>
    );
}
