
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, MousePointer2, Eye, Laptop, Smartphone } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/ads/analytics/events')
            .then(res => res.json())
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-neutral-200 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between pb-6 border-b border-neutral-800">
                    <div className="flex items-center gap-4">
                        <Link href="/ads" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
                            <div className="p-2 rounded-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Analytics Hub</h1>
                            <p className="text-sm text-neutral-400">Raw activity stream and performance data.</p>
                        </div>
                    </div>
                </header>

                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white">Activity Log</CardTitle>
                        <CardDescription className="text-neutral-400">Real-time feed of impressions and clicks across your campaigns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-neutral-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p>Loading stream...</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="py-12 text-center text-neutral-500">
                                No activity recorded yet. Launch a campaign to see data here.
                            </div>
                        ) : (
                            <div className="rounded-md border border-neutral-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-neutral-900">
                                        <TableRow className="border-neutral-800 hover:bg-neutral-900">
                                            <TableHead className="text-neutral-400">Type</TableHead>
                                            <TableHead className="text-neutral-400">Campaign</TableHead>
                                            <TableHead className="text-neutral-400">Location</TableHead>
                                            <TableHead className="text-neutral-400">Device</TableHead>
                                            <TableHead className="text-right text-neutral-400">Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {events.map((event) => (
                                            <TableRow key={event.id} className="border-neutral-800 hover:bg-neutral-800/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {event.type === 'click' ? (
                                                            <Badge variant="default" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20">
                                                                <MousePointer2 className="w-3 h-3 mr-1" />
                                                                Click
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-neutral-800 text-neutral-400 hover:bg-neutral-700">
                                                                <Eye className="w-3 h-3 mr-1" />
                                                                Impression
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-white">
                                                    {event.campaign.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                                                            {event.country || 'Global'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-neutral-300">
                                                        {event.device === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                                                        <span className="capitalize text-sm">{event.device || 'Desktop'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-neutral-400 font-mono text-xs">
                                                    {new Date(event.createdAt).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
