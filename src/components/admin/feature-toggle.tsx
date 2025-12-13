
"use client";

import { Switch } from "@/components/ui/switch";
import { toggleFeatureFlag } from "@/lib/features";
import { toast } from "sonner";
import { useState } from "react";

interface FeatureToggleProps {
    id: string;
    isEnabled: boolean;
    label: string;
}

export function FeatureToggle({ id, isEnabled, label }: FeatureToggleProps) {
    const [enabled, setEnabled] = useState(isEnabled);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (checked: boolean) => {
        // Optimistic update
        setEnabled(checked);
        setLoading(true);

        try {
            const result = await toggleFeatureFlag(id, !checked); // Pass current state logic or just new state? 
            // My server action takes (id, currentState) and flips it. 
            // Better if I just pass the ID and let server flip, or pass new state.
            // Let's check `src/lib/features.ts`...
            // It was defined as: toggleFeatureFlag(id, currentState) -> isEnabled: !currentState.
            // So if I pass `!checked` (which is the OLD state), it flips to `checked`. Correct.

            if (result.success) {
                toast.success(`${label} ${checked ? "enabled" : "disabled"}`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error("Failed to update feature flag");
            setEnabled(!checked); // Revert
        } finally {
            setLoading(false);
        }
    };

    return (
        <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading}
        />
    );
}
