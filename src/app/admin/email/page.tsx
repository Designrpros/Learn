
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/admin/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Send, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function EmailPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Email Center</h2>
                    <p className="text-neutral-400">Manage templates, logs, and delivery settings.</p>
                </div>
                <Button className="bg-white text-black hover:bg-neutral-200">
                    <Send className="w-4 h-4 mr-2" />
                    Send Broadcast
                </Button>
            </div>

            {/* Email Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard
                    title="Emails Sent"
                    value="8,540"
                    change="+15%"
                    trend="up"
                    explanation="Total emails sent via detailed SMTP/API logs."
                />
                <KPICard
                    title="Delivery Rate"
                    value="99.2%"
                    change="+0.1%"
                    trend="up"
                    explanation="Percentage of emails successfully delivered to inboxes."
                />
                <KPICard
                    title="Open Rate"
                    value="42.5%"
                    change="-1.4%"
                    trend="down"
                    explanation="Percentage of recipients who opened the email."
                />
                <KPICard
                    title="Spam Reports"
                    value="0.01%"
                    change="0.0%"
                    trend="down"
                    good
                    explanation="Number of users marking emails as spam."
                />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Templates */}
                <Card className="md:col-span-2 bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">System Templates</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Transactional email templates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {[
                            { name: "Welcome Email", subject: "Welcome to Wikits!", status: "Active" },
                            { name: "Password Reset", subject: "Reset your password", status: "Active" },
                            { name: "New Login", subject: "New login detected", status: "Active" },
                            { name: "Subscription Confirmed", subject: "You are now Pro!", status: "Active" },
                        ].map((template, i) => (
                            <div key={i} className="p-4 rounded-lg border border-neutral-800 bg-black/20 hover:border-neutral-700 transition-colors cursor-pointer group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-neutral-200">
                                        <Mail className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                                        <span className="font-medium">{template.name}</span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs bg-neutral-800">{template.status}</Badge>
                                </div>
                                <p className="text-sm text-neutral-500 truncate">Subject: {template.subject}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Logs */}
                <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">Live Logs</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Real-time rendering events.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { event: "Sent 'Welcome'", to: "newuser@gmail.com", status: "Delivered" },
                            { event: "Sent 'Reset'", to: "forgot@yahoo.com", status: "Delivered" },
                            { event: "Failed 'Invoice'", to: "churned@test.com", status: "Bounced" },
                            { event: "Sent 'Digest'", to: "fan@wikits.com", status: "Delivered" },
                            { event: "Sent 'Digest'", to: "fan2@wikits.com", status: "Delivered" },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                {log.status === "Delivered" ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                )}
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-neutral-300 truncate">{log.event}</span>
                                    <span className="text-xs text-neutral-500 truncate">{log.to}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
