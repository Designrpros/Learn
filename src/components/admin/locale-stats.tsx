
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Mock Data matching the "Hot Zones" on the map
const LOCALE_DATA = [
    { country: "United States", code: "US", flag: "🇺🇸", users: 12450, percentage: 45, active: 124 },
    { country: "Germany", code: "DE", flag: "🇩🇪", users: 5320, percentage: 22, active: 85 },
    { country: "Japan", code: "JP", flag: "🇯🇵", users: 3100, percentage: 15, active: 42 },
    { country: "United Kingdom", code: "GB", flag: "🇬🇧", users: 2100, percentage: 9, active: 31 },
    { country: "Brazil", code: "BR", flag: "🇧🇷", users: 1800, percentage: 7, active: 28 },
    { country: "Others", code: "Global", flag: "🌍", users: 950, percentage: 4, active: 15 },
];

export function LocaleStats() {
    return (
        <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
            <CardHeader>
                <CardTitle className="text-white">Top Regions</CardTitle>
                <CardDescription className="text-neutral-400">
                    User distribution by country.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {LOCALE_DATA.map((locale) => (
                        <div key={locale.code} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{locale.flag}</span>
                                    <span className="text-neutral-200 font-medium">{locale.country}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-neutral-400 text-xs text-right">
                                        <div className="text-emerald-500 font-medium">{locale.active} active</div>
                                    </div>
                                    <div className="text-neutral-200 font-medium w-16 text-right">
                                        {locale.users.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-neutral-600 rounded-full"
                                    style={{ width: `${locale.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
