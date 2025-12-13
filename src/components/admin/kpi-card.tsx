
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'flat';
    good?: boolean;
    explanation?: string;
    icon?: LucideIcon;
}

export function KPICard({ title, value, change, trend, good, explanation, icon: Icon }: KPICardProps) {
    const isPositive = good ? trend === 'down' : trend === 'up';
    let colorClass = "text-neutral-500";
    if (trend !== 'flat') {
        colorClass = isPositive ? "text-emerald-500" : "text-rose-500";
    }

    return (
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm hover:bg-neutral-900/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-200">
                    {title}
                </CardTitle>
                {Icon ? (
                    <Icon className="h-4 w-4 text-neutral-500" />
                ) : explanation ? (
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Info className="h-4 w-4 text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 bg-neutral-950 border-neutral-800 text-neutral-300 text-sm">
                            {explanation}
                        </HoverCardContent>
                    </HoverCard>
                ) : null}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
                <p className={`text-xs ${colorClass} flex items-center mt-1 font-medium`}>
                    {change}
                </p>
            </CardContent>
        </Card>
    );
}
