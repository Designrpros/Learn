"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { updateSystemSetting } from "@/app/actions/update-settings";
import { Loader2 } from "lucide-react";

export function SettingsForm({ initialSettings }: { initialSettings: any[] }) {
    const [settings, setSettings] = useState(initialSettings);
    const [saving, setSaving] = useState<string | null>(null);

    const handleSave = async (key: string, value: string) => {
        setSaving(key);
        try {
            await updateSystemSetting(key, value);
            toast.success("Setting updated");
        } catch (error) {
            toast.error("Failed to update setting");
            console.error(error);
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="space-y-6">
            {settings.map((setting) => (
                <div key={setting.key} className="grid gap-2 p-4 rounded-lg border border-neutral-800 bg-black/20">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-medium text-neutral-200">
                                {setting.description || setting.key}
                            </Label>
                            <p className="text-sm text-neutral-500 font-mono">{setting.key}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Input
                            defaultValue={setting.value}
                            className="bg-neutral-950 border-neutral-800 text-white font-mono"
                            onChange={(e) => {
                                const newSettings = settings.map(s =>
                                    s.key === setting.key ? { ...s, value: e.target.value } : s
                                );
                                setSettings(newSettings);
                            }}
                        />
                        <Button
                            onClick={() => {
                                const currentVal = settings.find(s => s.key === setting.key)?.value;
                                handleSave(setting.key, currentVal);
                            }}
                            disabled={saving === setting.key}
                        >
                            {saving === setting.key ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
