
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    MousePointer2,
    Eye,
    Smartphone,
    Monitor,
    Globe,
    Calendar,
    Clock
} from "lucide-react";

interface ActivityEvent {
    id: string;
    type: string;
    country: string;
    countryCode: string;
    flag: string;
    device: string;
    campaign: string;
    formattedDate: string;
    formattedTime: string;
}

export default function RecentActivityTable({ data }: { data: ActivityEvent[] }) {
    if (!data || data.length === 0) {
        return (
            <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-neutral-400">Raw activity stream (Last 50 events).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                        <Globe className="w-12 h-12 mb-4 opacity-20" />
                        <p>No recent activity recorded.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
            <CardHeader>
                <CardTitle className="text-white">Live Activity Feed</CardTitle>
                <CardDescription className="text-neutral-400">
                    Real-time log of user interactions and ad performance.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-neutral-800">
                    <Table>
                        <TableHeader className="bg-neutral-900/50">
                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                <TableHead className="text-neutral-400">Event</TableHead>
                                <TableHead className="text-neutral-400">Date & Time</TableHead>
                                <TableHead className="text-neutral-400">Location</TableHead>
                                <TableHead className="text-neutral-400">Device</TableHead>
                                <TableHead className="text-neutral-400">Campaign</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((event) => (
                                <TableRow key={event.id} className="border-neutral-800 hover:bg-neutral-800/50 text-neutral-300">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {event.type === 'click' ? (
                                                <Badge variant="default" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 shadow-none">
                                                    <MousePointer2 className="w-3 h-3 mr-1" />
                                                    Click
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-neutral-800 text-neutral-400 hover:bg-neutral-700 shadow-none border-neutral-700">
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    View
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            <div className="flex items-center gap-1.5 text-neutral-200 font-medium">
                                                <Calendar className="w-3 h-3 text-neutral-500" />
                                                {event.formattedDate}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-neutral-500 mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                {event.formattedTime}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg leading-none select-none" title={event.country}>{event.flag}</span>
                                            <span className="text-sm text-neutral-300">{event.country}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-neutral-400">
                                            {event.device === 'mobile' ? (
                                                <Smartphone className="w-4 h-4" />
                                            ) : (
                                                <Monitor className="w-4 h-4" />
                                            )}
                                            <span className="capitalize text-sm">{event.device}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs text-neutral-500">
                                            {event.campaign}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
