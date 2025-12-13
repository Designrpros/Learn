"use client";

import { useUIStore } from "@/lib/ui-store";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Activity, Settings, Download, User, LogIn, Bell, MessageCircle, Heart, ExternalLink, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { getRecentActivity } from "@/app/actions/get-activity";
import { getNotifications, type NotificationItem } from "@/app/actions/get-notifications";
import { getSystemStatus, type SystemStatus } from "@/app/actions/get-system-status";
import { getUsageStats, type UsageStats } from "@/app/actions/get-usage-stats";

export function Inspector() {
    const { isInspectorOpen, setInspectorOpen, setDashboardOpen } = useUIStore();
    const { isSignedIn, user } = useUser();

    // Tab State: 0=Activity, 1=Inbox, 2=Settings
    const [activeTab, setActiveTab] = useState(0);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    // Live Telemetry State
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [usageStats, setUsageStats] = useState<UsageStats>({ used: 0, limit: 50 });

    useEffect(() => {
        if (isInspectorOpen) {
            // Always fetch system status
            getSystemStatus().then(setSystemStatus);

            if (isSignedIn) {
                // Fetch User Data
                getRecentActivity().then(data => setActivityData(data));
                getNotifications().then(data => setNotifications(data));
                getUsageStats().then(setUsageStats);
            } else {
                setActivityData([]);
                setNotifications([]);
                setUsageStats({ used: 0, limit: 10 });
            }
        }
    }, [isInspectorOpen, isSignedIn]);

    return (
        <AnimatePresence>
            {isInspectorOpen && (
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-background/80 backdrop-blur-xl border-l border-border z-50 shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50">
                        <h2 className="font-serif font-medium text-lg">Inspector</h2>
                        <button
                            onClick={() => setInspectorOpen(false)}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg mx-4 mt-4 text-xs font-medium">
                        <button
                            onClick={() => setActiveTab(0)}
                            className={cn(
                                "flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-2",
                                activeTab === 0 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Activity</span>
                        </button>
                        <button
                            onClick={() => setActiveTab(1)}
                            className={cn(
                                "flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-2 relative",
                                activeTab === 1 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Bell className="w-3.5 h-3.5" />
                            <span>Inbox</span>
                            {notifications.length > 0 && (
                                <span className="absolute top-1 right-3 w-1.5 h-1.5 bg-red-500 rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab(2)}
                            className={cn(
                                "flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-2",
                                activeTab === 2 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Settings</span>
                        </button>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 min-h-0 overflow-hidden relative">
                        {/* TAB 0: ACTIVITY */}
                        {activeTab === 0 && (
                            <div className="h-full overflow-y-auto p-4 space-y-6">
                                {/* Recent Activity Group */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Now</h3>
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded animate-pulse">Live</span>
                                    </div>
                                    <div className="relative pl-4 space-y-6 border-l border-border/50 ml-1">
                                        {activityData.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative group cursor-pointer"
                                                onClick={() => {
                                                    // Handle Navigation based on Metadata OR Fallback parsing
                                                    let targetSlug = item.metadata?.slug;

                                                    // Fallback for legacy logs: Extract topic from "Generated Syllabus: X"
                                                    if (!targetSlug && item.type === 'GENERATION' && item.action.startsWith('Generated Syllabus: ')) {
                                                        const topicName = item.action.replace('Generated Syllabus: ', '');
                                                        targetSlug = topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                                    }

                                                    if (targetSlug) {
                                                        window.location.href = `/wiki/${targetSlug}`;
                                                    } else if (item.metadata?.query) {
                                                        window.location.href = `/wiki/${encodeURIComponent(item.metadata.query)}`;
                                                    }
                                                }}
                                            >
                                                <div className={cn(
                                                    "absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full border-2 border-background ring-1 transition-colors",
                                                    item.type === 'GENERATION' ? "bg-blue-500 ring-blue-500/20" :
                                                        item.type === 'NAVIGATION' ? "bg-amber-500 ring-amber-500/20" :
                                                            "bg-purple-500 ring-purple-500/20"
                                                )} />
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">{item.type}</span>
                                                        <span className="text-[10px] text-muted-foreground tabular-nums">
                                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                                                        {item.action}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {activityData.length === 0 && (
                                            <div className="text-sm text-muted-foreground italic py-4">No recent activity</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 1: NOTIFICATIONS (INBOX) */}
                        {activeTab === 1 && (
                            <div className="h-full overflow-y-auto p-4 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Earlier</h3>
                                    <button className="text-[10px] text-primary hover:underline">Mark all read</button>
                                </div>

                                {notifications.length > 0 ? (
                                    <div className="space-y-2">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className="p-3 bg-muted/20 hover:bg-muted/40 border border-border/40 rounded-lg transition-colors flex gap-3 group cursor-pointer">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border/50",
                                                    notif.type === 'reply' ? "bg-blue-500/10 text-blue-500" : "bg-pink-500/10 text-pink-500"
                                                )}>
                                                    {notif.type === 'reply' ? <MessageCircle className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-xs font-medium">
                                                            <span className="text-foreground">{notif.actorName}</span>
                                                            <span className="text-muted-foreground font-normal"> {notif.type === 'reply' ? 'replied to' : 'liked'} </span>
                                                            <span className="text-foreground">{notif.threadTitle}</span>
                                                        </p>
                                                        {notif.content && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2 bg-background/50 p-1.5 rounded border border-border/20 group-hover:border-border/40 transition-colors">
                                                                "{notif.content}"
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2">
                                                        {new Date(notif.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {!notif.read && (
                                                    <div className="self-center w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2 text-center opacity-60">
                                        <Bell className="w-8 h-8 opacity-20" />
                                        <p className="text-xs">No new notifications</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: SETTINGS */}
                        {activeTab === 2 && (
                            <div className="flex flex-col h-full">
                                {/* Auth Section - COMPACT & DASHBOARD LINK */}
                                <div className="p-4 border-b border-border/50 bg-muted/20">
                                    {isSignedIn ? (
                                        <div className="space-y-3">
                                            {/* Profile Row */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setInspectorOpen(false);
                                                        setDashboardOpen(true);
                                                    }}
                                                    className="flex-1 flex items-center gap-3 p-2 -ml-2 hover:bg-muted rounded-lg transition-colors text-left group"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-muted border border-border p-0.5 overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
                                                        <img src={user.imageUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-serif font-medium text-sm truncate group-hover:text-primary transition-colors">
                                                                {user.fullName || user.firstName}
                                                            </h3>
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-muted border border-border rounded text-muted-foreground uppercase tracking-wider">Free</span>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            {user.primaryEmailAddress?.emailAddress}
                                                        </p>
                                                    </div>
                                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Activity className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                </button>

                                                <SignOutButton>
                                                    <button className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Sign Out">
                                                        <LogIn className="w-4 h-4 rotate-180" />
                                                    </button>
                                                </SignOutButton>
                                            </div>

                                            {/* Usage Stats (Live) */}
                                            <div className="bg-background rounded-lg border border-border/50 p-3 space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Daily Generations</span>
                                                    <span className="text-[10px] font-medium font-mono">{usageStats.used} / {usageStats.limit}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-1000"
                                                        style={{ width: `${Math.min((usageStats.used / usageStats.limit) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>Resets in 14 hours</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3 opacity-60">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="text-sm">Guest User</div>
                                            </div>
                                            <SignInButton mode="modal">
                                                <button className="w-full py-2 bg-primary text-primary-foreground font-medium text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                                    <LogIn className="w-3.5 h-3.5" /> Sign In / Sign Up
                                                </button>
                                            </SignInButton>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 space-y-6 overflow-y-auto">

                                    {/* APP SETTINGS */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Application</label>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md">
                                                        <Activity className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm">Theme</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">Dark</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PRO SETTINGS (Locked) */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pro Features</label>
                                            {isSignedIn && (
                                                <button
                                                    onClick={() => {
                                                        setInspectorOpen(false);
                                                        setDashboardOpen(true);
                                                    }}
                                                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                                                >
                                                    Upgrade
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-0.5 relative group">
                                            <div className="flex items-center justify-between p-2 rounded-lg opacity-60">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-md">
                                                        <Activity className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">AI Model</span>
                                                        <span className="text-[10px] text-muted-foreground">GPT-4o, Claude 3.5</span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Auto</div>
                                            </div>

                                            <div className="flex items-center justify-between p-2 rounded-lg opacity-60">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-green-500/10 text-green-500 rounded-md">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm">GitHub Sync</span>
                                                </div>
                                                <div className="w-8 h-4 bg-muted border border-border rounded-full relative">
                                                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-muted-foreground/30 rounded-full" />
                                                </div>
                                            </div>

                                            {/* Locked Overlay for Section */}
                                            <div className="absolute inset-0 z-10 hover:bg-background/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 cursor-not-allowed">
                                                <div className="bg-background/80 backdrop-blur border border-border px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-xs font-medium">
                                                    <Settings className="w-3 h-3" /> Locked
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DATA MANAGEMENT */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Data</label>
                                        <div className="space-y-0.5">
                                            <a
                                                href="/api/export-activity"
                                                target="_blank"
                                                download="my-activity.json"
                                                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md">
                                                        <Activity className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm">Download My Activity</span>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 text-muted-foreground">→</div>
                                            </a>

                                            {/* Peak Browser Integration */}
                                            <a
                                                href="https://peak-browser.vercel.app/"
                                                target="_blank"
                                                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-md">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">Synced with Peak</span>
                                                        <span className="text-[10px] text-muted-foreground">Partner Application</span>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-50 group-hover:opacity-100" />
                                            </a>

                                            <button
                                                onClick={() => {
                                                    setInspectorOpen(false);
                                                    setDashboardOpen(true);
                                                }}
                                                className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors group text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                                        <Settings className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm">Advanced Settings</span>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Dashboard</div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* SYSTEM STATUS (Telemetery) */}
                                    <div className="pt-6 border-t border-border/30 space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <Cpu className="w-3 h-3" /> System Status
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] text-emerald-500 font-medium">Live</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-muted/30 p-2 rounded border border-border/30 flex flex-col items-center">
                                                <span className="text-[10px] text-muted-foreground uppercase">Lat.</span>
                                                <span className="text-xs font-mono font-medium">{systemStatus?.dbLatency || '...'}</span>
                                            </div>
                                            <div className="bg-muted/30 p-2 rounded border border-border/30 flex flex-col items-center">
                                                <span className="text-[10px] text-muted-foreground uppercase">Vec.</span>
                                                <span className="text-xs font-mono font-medium">{systemStatus?.vectorIndex || '...'}</span>
                                            </div>
                                            <div className="bg-muted/30 p-2 rounded border border-border/30 flex flex-col items-center">
                                                <span className="text-[10px] text-muted-foreground uppercase">Cache</span>
                                                <span className="text-xs font-mono font-medium">{systemStatus?.cacheHit || '...'}</span>
                                            </div>
                                        </div>

                                        <div className="text-center text-[10px] text-muted-foreground/60 pt-2">
                                            <span>Wikits v1.0.0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
