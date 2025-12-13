'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/nextjs';
import {
    Clock,
    BookOpen,
    Trophy,
    Download,
    Upload,
    Trash2,
    Server,
    Key,
    Webhook,
    Activity,
    Database,
    Cpu,
    Layers,
    Github,
    FileJson,
    Zap,
    MoreHorizontal,
    ArrowUpRight,
    Terminal,
    Shield,
    Bot,
    Flame,
    Grid,
    Layout,
    X,
    Settings,
    Briefcase,
    Search,
    CheckCircle,
    MessageCircle,
    ThumbsUp,
    Hash,
    HelpCircle,
    Loader2,
    Lock,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// --- Widget System Types & Components ---

type WidgetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface WidgetProps {
    title?: string;
    icon?: any;
    action?: React.ReactNode;
    children: React.ReactNode;
    size?: WidgetSize;
    className?: string;
    noPadding?: boolean;
    variant?: 'default' | 'primary' | 'danger' | 'terminal' | 'locked' | 'auth-locked';
}

const sizeClasses: Record<WidgetSize, string> = {
    'sm': 'md:col-span-1 md:row-span-1', // 1x1
    'md': 'md:col-span-2 md:row-span-1', // 2x1
    'lg': 'md:col-span-2 md:row-span-2', // 2x2
    'xl': 'md:col-span-3 md:row-span-1', // 3x1 (Wide strip)
    'full': 'md:col-span-4 md:row-span-1', // 4x1 (Full row)
};

const variantClasses: Record<string, string> = {
    'default': 'bg-card/60 border-border/50 hover:border-primary/20',
    'primary': 'bg-gradient-to-br from-primary/10 to-transparent border-primary/20',
    'danger': 'bg-red-500/5 border-red-500/20',
    'terminal': 'bg-zinc-950 border-zinc-900 shadow-inner shadow-black/50',
    'locked': 'bg-muted/10 border-border/30 relative overflow-hidden',
    'auth-locked': 'bg-muted/10 border-border/30 relative overflow-hidden',
};

const Widget = ({
    size = 'sm',
    title,
    icon: Icon,
    action,
    children,
    className,
    noPadding = false,
    variant = 'default'
}: WidgetProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
            "group relative backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col",
            sizeClasses[size],
            variantClasses[variant],
            className
        )}
    >
        {/* Hover Gradient Overlay (skip for terminal/locked) */}
        {(variant !== 'terminal' && variant !== 'locked' && variant !== 'auth-locked') && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}

        {/* Locked Overlay (Pro) */}
        {variant === 'locked' && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm transition-all duration-300 group-hover:bg-background/40">
                <div className="w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center shadow-lg mb-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Pro Feature</span>
                <button className="mt-3 px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    Upgrade
                </button>
            </div>
        )}

        {/* Auth Locked Overlay (Login Required) */}
        {variant === 'auth-locked' && (
            <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm transition-all duration-300 group-hover:bg-background/40">
                <SignInButton mode="modal">
                    <button className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center shadow-lg mb-2 group-hover:scale-110 transition-transform">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground mb-3">Login Required</span>
                        <div className="px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            Sign In
                        </div>
                    </button>
                </SignInButton>
            </div>
        )}

        <div className={cn("h-full flex flex-col relative z-10 min-h-0", !noPadding && "p-5")}>
            {(title || Icon) && (
                <div className="flex items-center justify-between mb-3 shrink-0">
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                        {Icon && <Icon className="w-4 h-4" />}
                        {title && <span className="text-xs font-medium uppercase tracking-wider">{title}</span>}
                    </div>
                    {action && <div className="text-xs">{action}</div>}
                </div>
            )}
            <div className="flex-1 min-h-0 flex flex-col">
                {children}
            </div>
        </div>
    </motion.div>
);


// --- Sub-Components ---

import { getDailyActivity } from '@/app/actions/get-daily-activity';

const ActivityHeatmap = ({ data, onDayClick }: { data?: { date: string, count: number }[], onDayClick: (date: string) => void }) => {
    // Generate grid for last ~4 months (18 weeks)
    const weeksToShow = 18;
    const now = new Date();

    // We want the LAST column to be the current week (ending today or Saturday?)
    // GitHub style: Rows are Days (Sun-Sat), Cols are Weeks.

    // Let's generate a proper calendar grid.
    // 1. Determine End Date (Today)
    // 2. Determine Start Date (18 weeks ago)

    const grid = [];

    // Helper to format YYYY-MM-DD
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    // Align to week start (Sunday) of 18 weeks ago?
    // Or just ensure we fill 18 columns.
    // Let's build strictly by columns.

    /* 
       We build an array of 18 columns.
       Each column has 7 days.
       The last cell of the last column should be Today (or end of this week).
    */

    // Start date: Today - (18 weeks * 7 days) + correction to align?
    // Simpler: Loop weeks backwards from 0 (current) to 17.
    // Inner loop days 0 (Sun) to 6 (Sat).

    // But we render L->R. So loop weeks 17 ago to 0 ago.

    // Find the Sunday of the current week.
    const dayOfWeek = now.getDay(); // 0-6
    const currentWeekSunday = new Date(now);
    currentWeekSunday.setDate(now.getDate() - dayOfWeek);

    // Start of grid = CurrentWeekSunday - (17 * 7 days)
    const startDate = new Date(currentWeekSunday);
    startDate.setDate(startDate.getDate() - (weeksToShow - 1) * 7);

    // Create lookup map
    const activityMap = new Map();
    if (data) {
        data.forEach(d => activityMap.set(d.date, d.count));
    }

    const weeks = [];
    const months = [];
    let lastMonth = -1;

    for (let w = 0; w < weeksToShow; w++) {
        const weekDays = [];
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (w * 7));

        // Track month changes for labels
        if (weekStart.getMonth() !== lastMonth) {
            months.push(weekStart.toLocaleString('default', { month: 'short' }));
            lastMonth = weekStart.getMonth();
        } else {
            months.push(""); // Spacer
        }

        for (let d = 0; d < 7; d++) {
            const currentDay = new Date(weekStart);
            currentDay.setDate(currentDay.getDate() + d);

            const dateStr = fmt(currentDay);
            const count = activityMap.get(dateStr) || 0;
            const isFuture = currentDay > now;

            weekDays.push({
                date: dateStr,
                count,
                isFuture
            });
        }
        weeks.push(weekDays);
    }

    // Clean up months: We only want to show label if it's the first time appearing approx?
    // The loop above adds a label for every column that starts a new month? 
    // Simplified label logic: just show 3-4 labels spread out or strict

    return (
        <div className="flex flex-col h-full justify-between py-1 select-none">
            <div className="flex flex-1 gap-[3px]">
                {weeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col gap-[3px] flex-1">
                        {week.map((day, dIndex) => (
                            <div
                                key={day.date}
                                onClick={() => !day.isFuture && onDayClick(day.date)}
                                title={`${day.date}: ${day.count} contributions`}
                                className={cn(
                                    "w-full aspect-square rounded-[2px] transition-all duration-300",
                                    day.isFuture ? "opacity-0" : "cursor-pointer hover:border-primary/50 border border-transparent",
                                    // Color logic
                                    day.count === 0 && !day.isFuture ? "bg-muted/20 hover:bg-muted/30" :
                                        day.count > 0 ? "hover:scale-125 hover:z-10 hover:shadow-sm" : "",

                                    day.count >= 5 ? "bg-primary" :
                                        day.count >= 3 ? "bg-primary/80" :
                                            day.count >= 1 ? "bg-primary/40" : ""
                                )}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mt-3 text-[9px] text-muted-foreground font-mono uppercase tracking-wider opacity-60 px-1">
                {/* Naive month distribution */}
                <span>{weeks[0][0].date.split('-')[1]}</span> {/* Start Month */}
                <span>{weeks[6][0].date.split('-')[1]}</span>
                <span>{weeks[12][0].date.split('-')[1]}</span>
                <span>Now</span>
            </div>
        </div>
    );
};

const LogBook = ({ date, onClose }: { date: string, onClose: () => void }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getDailyActivity(date).then(data => {
            setEvents(data);
            setLoading(false);
        });
    }, [date]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'GENERATION': return <Sparkles className="w-3.5 h-3.5" />;
            case 'NAVIGATION': return <BookOpen className="w-3.5 h-3.5" />;
            case 'SEARCH': return <Search className="w-3.5 h-3.5" />;
            default: return <Activity className="w-3.5 h-3.5" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'GENERATION': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
            case 'NAVIGATION': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'SEARCH': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-muted-foreground bg-muted border-border';
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg bg-card border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[600px] ring-1 ring-border/50"
            >
                {/* Header */}
                <div className="p-5 border-b flex items-center justify-between bg-muted/40 backdrop-blur-md">
                    <div>
                        <h3 className="font-serif font-medium text-xl tracking-tight">Log Book</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-background/80 p-2 rounded-full transition-colors border border-transparent hover:border-border">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0 scrollbar-hide bg-gradient-to-b from-background to-muted/10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs font-medium uppercase tracking-wider opacity-70">Rewinding Time...</span>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-2">
                            <Clock className="w-8 h-8 opacity-20" />
                            <span className="text-sm">The pages were blank this day.</span>
                        </div>
                    ) : (
                        <div className="relative p-6">
                            {/* Timeline Line */}
                            <div className="absolute left-8 top-6 bottom-6 w-px bg-border/60" />

                            <div className="space-y-6">
                                {events.map((e, index) => {
                                    const metadata = e.metadata as any;
                                    const slug = metadata?.slug || (metadata?.query ? encodeURIComponent(metadata.query) : null);

                                    return (
                                        <div key={e.id} className="relative pl-10 group">
                                            {/* Timeline Node */}
                                            <div className={cn(
                                                "absolute left-[7px] top-1.5 w-[9px] h-[9px] rounded-full border-2 border-background ring-1 z-10 transition-all duration-300",
                                                e.type === 'GENERATION' ? "bg-purple-500 ring-purple-500/30 group-hover:scale-125" :
                                                    e.type === 'NAVIGATION' ? "bg-blue-500 ring-blue-500/30 group-hover:scale-125" :
                                                        "bg-amber-500 ring-amber-500/30 group-hover:scale-125"
                                            )} />

                                            {/* Card */}
                                            <a
                                                href={slug ? `/wiki/${slug}` : '#'}
                                                onClick={(ev) => !slug && ev.preventDefault()}
                                                className={cn(
                                                    "block -mt-1 p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:shadow-md hover:border-border/80 transition-all duration-200",
                                                    !slug && "cursor-default hover:bg-transparent hover:shadow-none"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                        getColor(e.type)
                                                    )}>
                                                        {getIcon(e.type)}
                                                        {e.type}
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-mono opacity-70">
                                                        {new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className="text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">
                                                    {e.action}
                                                </div>

                                                {/* Smart Metadata Display */}
                                                {e.type === 'GENERATION' && metadata?.topicId && (
                                                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5 opacity-80">
                                                        <Sparkles className="w-3 h-3" /> Generated content for this topic
                                                    </div>
                                                )}

                                                {slug && (
                                                    <div className="mt-2 text-xs text-primary/70 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-5px] group-hover:translate-x-0 duration-300">
                                                        Visit Page <ArrowUpRight className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export function DashboardView({ onClose, stats }: { onClose?: () => void, stats?: any }) {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<'overview' | 'dev' | 'data' | 'pro' | 'info'>('overview');
    const [selectedLogDate, setSelectedLogDate] = useState<string | null>(null);


    // --- FEATURE GATING ---
    // Change this to true to unlock all tabs
    const isPro = false;

    if (!isLoaded) return null;

    return (
        <>
            {selectedLogDate && <LogBook date={selectedLogDate} onClose={() => setSelectedLogDate(null)} />}

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full overflow-y-auto px-4 py-8 scrollbar-hide relative"
            >          <div className="max-w-5xl mx-auto space-y-6 pb-24">

                    {/* Header Widget Layout */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 border border-border p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                                {user?.imageUrl ? (
                                    <img src={user.imageUrl} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-sm font-serif font-bold text-primary">
                                        {user?.firstName?.[0] || 'S'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-medium font-serif leading-none">{user?.firstName || 'Scholar'}'s <span className="text-muted-foreground">Hub</span></h2>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">System Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Pills & Close */}
                        <div className="flex items-center gap-3">
                            <div className="p-1 bg-muted/40 rounded-full flex items-center border border-border/40 backdrop-blur-md">
                                {[
                                    { id: 'overview', label: 'Overview', icon: Layout },
                                    { id: 'dev', label: 'Developer', icon: Terminal },
                                    { id: 'data', label: 'Data', icon: Database },
                                    { id: 'pro', label: 'Pro', icon: Briefcase },
                                    { id: 'info', label: 'Info', icon: BookOpen },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all",
                                            activeTab === tab.id
                                                ? "bg-background text-foreground shadow-sm ring-1 ring-border/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full bg-muted/40 hover:bg-muted border border-border/40 hover:border-border transition-colors group"
                                >
                                    <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- OVERVIEW TAB --- */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 grid-auto-flow-dense">

                            {/* 1. Main Focus [Medium - 2x1] */}
                            <Widget size="md" title="Current Focus" icon={Zap} variant="primary">
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <h3 className="text-2xl font-serif font-medium truncate">{stats?.focus?.title || "Explore Wikits"}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/50 border border-primary/10 text-primary">{stats?.focus?.topic || "General"}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/50 border border-primary/10 text-primary">Learning</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-[90%] line-clamp-2">
                                            {stats?.focus?.description || "Start searching to build your knowledge graph."}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2 text-xs font-medium text-primary">
                                            <div className="w-24 h-1.5 bg-background/50 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${stats?.focus?.progress || 0}%` }} />
                                            </div>
                                            {stats?.focus?.progress || 0}%
                                        </div>
                                        <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Widget>

                            {/* 2. Streak [Small - 1x1] */}
                            <Widget size="sm" icon={Flame} className="bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30">
                                <div className="flex flex-col items-center justify-center h-full gap-1 text-center">
                                    <span className="text-4xl font-serif font-bold text-amber-500">{stats?.streak || 0}</span>
                                    <span className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest">Day Streak</span>
                                </div>
                                <div className="absolute bottom-0 w-full flex justify-center pb-2 opacity-50">
                                    <div className="flex gap-0.5">
                                        {[1, 1, 1, 0, 0].map((v, i) => ( // Keep mock dots for aesthetic for now
                                            <div key={i} className={cn("w-1.5 h-1.5 rounded-full", v ? "bg-amber-500" : "bg-amber-500/20")} />
                                        ))}
                                    </div>
                                </div>
                            </Widget>

                            {/* 3. Rank [Small - 1x1] */}
                            {/* 3. Rank [Small - 1x1] */}
                            <Widget size="sm" icon={Trophy}>
                                <a href="/leaderboard" className="flex flex-col items-center justify-center h-full gap-1 text-center hover:opacity-80 transition-opacity">
                                    <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center mb-1 ring-1 ring-yellow-500/20">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <span className="text-xl font-serif font-bold">Top 100</span>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                                        Global Rank <ArrowUpRight className="w-2 h-2" />
                                    </div>
                                </a>
                            </Widget>

                            {/* 4. Activity Graph [XL - 3x1] */}
                            <Widget size="xl" title="Contributions" icon={Activity} action={<button className="hover:text-primary transition-colors"><MoreHorizontal className="w-4 h-4" /></button>}>
                                <ActivityHeatmap
                                    data={stats?.contributions}
                                    onDayClick={(date) => setSelectedLogDate(date)}
                                />
                            </Widget>

                            {/* 5. Recent Timeline [Small-Tall - 1x2] */}
                            <Widget size="sm" title="Recent" icon={Clock} className="row-span-2 h-full">
                                <div className="relative space-y-3 pl-3 pt-2 h-full overflow-y-auto scrollbar-hide">
                                    <div className="absolute left-[3px] top-3 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />
                                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                                        stats.recentActivity.map((item: any, i: number) => {
                                            // Attempt to extract meaningful title
                                            const cleanTitle = (item.meta?.slug || item.meta?.title || item.title).replace('Visited ', '').replace('Generated Chapter: ', '');
                                            const timeAgo = "Just now"; // Keep simple or use date-fns if imported

                                            return (
                                                <div key={i} className="relative pl-3 group cursor-pointer py-0.5">
                                                    <div className={cn(
                                                        "absolute -left-[3.5px] top-1.5 w-[7px] h-[7px] rounded-full ring-4 ring-background transition-colors z-10",
                                                        i === 0 ? "bg-green-500" : "bg-muted-foreground/30 group-hover:bg-primary"
                                                    )} />
                                                    <div className="text-xs font-medium group-hover:text-primary transition-colors truncate">{cleanTitle}</div>
                                                    <div className="text-[9px] text-muted-foreground">{new Date(item.time).toLocaleDateString()}</div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-xs text-muted-foreground pl-3">No recent activity</div>
                                    )}
                                </div>
                            </Widget>


                        </div>
                    )}

                    {/* --- DEVELOPER TAB --- */}
                    {activeTab === 'dev' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                            {/* API Key [Full Width - Enhanced] */}
                            <Widget size="full" title="API Management" icon={Key} variant={isPro ? undefined : 'locked'}>
                                <div className="flex flex-col md:flex-row gap-6 h-full p-2">
                                    {/* Key Section */}
                                    <div className="flex-1 space-y-4">
                                        <div className="p-3 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-2">
                                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Secret Key</label>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 font-mono text-xs bg-background p-2 rounded border border-border flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors">
                                                    <span className="opacity-60">sk_live_...92x83m</span>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Copy</span>
                                                    </div>
                                                </div>
                                                <button className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 shadow-sm shadow-primary/20">
                                                    Roll Key
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-medium text-emerald-600">Operational</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">Last used: <span className="text-foreground font-medium">2 mins ago</span></div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="hidden md:block w-px bg-border/50" />

                                    {/* Usage Stats */}
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                        {[
                                            { l: 'Requests', v: '14.2k', s: '+12%' },
                                            { l: 'Error Rate', v: '0.01%', s: '-5%' },
                                            { l: 'Cost', v: '$4.20', s: 'v2.5' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-muted/10 rounded-lg p-3 flex flex-col justify-center items-center border border-border/20">
                                                <span className="text-[10px] uppercase text-muted-foreground">{stat.l}</span>
                                                <span className="text-lg font-mono font-medium">{stat.v}</span>
                                                <span className={cn("text-[9px]", stat.s.startsWith('+') ? "text-emerald-500" : "text-muted-foreground")}>{stat.s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Widget>

                            {/* Terminal [XL] */}
                            <Widget size="xl" title="MCP Server Console" icon={Terminal} variant={isPro ? 'terminal' : 'locked'}>
                                <div className="font-mono text-[10px] text-green-400/90 space-y-1 h-32 overflow-hidden relative leading-relaxed p-1">
                                    <div className="opacity-50">$ mcp-server status</div>
                                    <div>{'>'} Server running on port 3000</div>
                                    <div>{'>'} Connected to Vector DB instance (v2.4.1)</div>
                                    <div className="text-zinc-500">{'>'} Watching for filesystem changes...</div>
                                    <div className="opacity-50 mt-2">$ _</div>
                                    <div className="absolute top-0 right-0 p-2 flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-red-500/20 md:bg-red-500" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/20 md:bg-yellow-500" />
                                        <div className="w-2 h-2 rounded-full bg-green-500/20 md:bg-green-500" />
                                    </div>
                                </div>
                            </Widget>

                            {/* Webhooks Status [SM - replacing old full list to fit grid] */}
                            <Widget size="sm" title="Webhooks" icon={Webhook} variant={isPro ? undefined : 'locked'}>
                                <div className="h-full flex flex-col items-center justify-center gap-2">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
                                        <Activity className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold font-mono">3</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Active endpoints</div>
                                    </div>
                                </div>
                            </Widget>

                        </div>
                    )}

                    {/* --- DATA TAB --- */}
                    {activeTab === 'data' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Export Data [XL - 2 columns] */}
                            <Widget size="lg" title="Data Export" icon={Download} className="md:col-span-2" variant={isPro ? undefined : 'locked'}>
                                <div className="flex flex-col h-full justify-between gap-4 p-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Download a complete snapshot of the Wikits knowledge base, including all topics, chapters, and public forum threads.
                                        </p>
                                        <div className="flex gap-4 mt-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded border border-border/40">
                                                <FileJson className="w-4 h-4 text-orange-400" />
                                                <span className="text-xs font-mono">wikits-backup.json</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded border border-border/40">
                                                <Database className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs font-mono">PostgreSQL Compatible</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-[10px] text-muted-foreground">
                                            Last backup: <span className="text-foreground">Never</span>
                                        </div>
                                        <a href="/api/export" target="_blank" download>
                                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 shadow-sm shadow-primary/20 transition-all active:scale-95">
                                                <Download className="w-3.5 h-3.5" />
                                                Download Full Backup
                                            </button>
                                        </a>
                                    </div>
                                </div>
                            </Widget>

                            {/* Danger Zone [SM -> MD] */}
                            <Widget size="md" title="Local Replica" icon={Server} variant={isPro ? 'default' : 'locked'} className="md:col-span-1 md:row-span-2">
                                <div className="h-full flex flex-col gap-4">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Want to run Wikits locally? You can Import this JSON dump into a local PostgreSQL instance.
                                    </p>
                                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[10px] text-zinc-400 overflow-x-auto whitespace-pre">
                                        <span className="text-purple-400">pg_restore</span> -d wikits backup.json
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-border/40">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-2">Danger Zone</h4>
                                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-medium rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Reset User Progress
                                        </button>
                                    </div>
                                </div>
                            </Widget>

                            {/* Activity History [Pro Feature] */}
                            <Widget size="md" title="Activity History" icon={Activity} variant={isPro ? undefined : 'locked'} className="md:col-span-2 md:row-span-1">
                                <div className="flex flex-col h-full justify-between gap-4 p-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Download a complete log of your search history and topic explorations in a raw JSON dictionary format.
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-[10px] text-muted-foreground">
                                            Index: <span className="text-foreground">Full History</span>
                                        </div>
                                        <a href="/api/export-activity" target="_blank" download="my-activity.json">
                                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-medium rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                                                <Download className="w-3.5 h-3.5" />
                                                Export JSON
                                            </button>
                                        </a>
                                    </div>
                                </div>
                            </Widget>

                            {/* Storage Usage [MD] */}
                            <Widget size="md" title="Storage Usage" icon={Database} className="md:col-span-1 md:row-span-1" variant={isPro ? undefined : 'locked'}>
                                <div className="h-full flex flex-col items-center justify-center gap-3">
                                    <div className="text-center">
                                        <div className="text-2xl font-light">12.4 <span className="text-sm text-muted-foreground">MB</span></div>
                                        <div className="text-[10px] uppercase text-muted-foreground">Total Size</div>
                                    </div>
                                    <div className="w-full h-px bg-border/50" />
                                    <div className="flex justify-around w-full">
                                        <div className="text-center">
                                            <div className="text-lg font-light">842</div>
                                            <div className="text-[9px] uppercase text-muted-foreground">Nodes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-light text-green-500">Healthy</div>
                                            <div className="text-[9px] uppercase text-muted-foreground">Integrity</div>
                                        </div>
                                    </div>
                                </div>
                            </Widget>

                        </div>
                    )}

                    {/* --- PRO TAB --- */}
                    {activeTab === 'pro' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Local Intelligence [XL - 2 Cols] */}
                            <Widget size="lg" title="Local Intelligence" icon={Cpu} className="md:col-span-2" variant={isPro ? undefined : 'locked'}>
                                <div className="flex flex-col h-full gap-4 p-2">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Configure Wikits to use your own local LLM (Ollama, Llama.cpp) or a custom API endpoint.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Endpoint URL</label>
                                            <input
                                                type="text"
                                                placeholder="http://localhost:11434"
                                                className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Model Name</label>
                                            <input
                                                type="text"
                                                placeholder="llama3:latest"
                                                className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">OpenAI / Anthropic API Key (Optional)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                placeholder="sk-..."
                                                className="flex-1 bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                            <button className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition-opacity">
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Widget>

                            {/* Personal Projects [MD] */}
                            <Widget size="md" title="Personal Projects" icon={Briefcase} variant={isPro ? undefined : 'locked'}>
                                <div className="h-full flex flex-col justify-center gap-4">
                                    <p className="text-xs text-muted-foreground">
                                        Export specific projects or topics you have created.
                                    </p>
                                    <div className="relative">
                                        <select className="w-full appearance-none bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:outline-none cursor-pointer">
                                            <option>Select a Project...</option>
                                            <option value="quantum">Quantum Mechanics</option>
                                            <option value="renaissance">Renaissance Art</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Database className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border/50 text-foreground rounded-lg text-xs font-medium transition-colors">
                                        <Download className="w-3.5 h-3.5 opacity-70" />
                                        Export Project
                                    </button>
                                </div>
                            </Widget>

                            {/* Repository Sync [Locked Feature Example] */}
                            <Widget size="lg" title="Auto-Sync to Git" icon={Github} variant="locked" className="md:col-span-2 md:row-span-1">
                                <div className="p-4 opacity-50 filter blur-[1px]">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center">
                                            <Github className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">GitHub Sync</h4>
                                            <p className="text-xs text-muted-foreground">Automatically push your wiki changes to a private repository.</p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-muted/50 rounded-full w-full mb-2" />
                                    <div className="h-2 bg-muted/50 rounded-full w-2/3" />
                                </div>
                            </Widget>

                            {/* Advanced Analytics [Locked Feature Example] */}
                            <Widget size="md" title="Deep Analytics" icon={Activity} variant="locked">
                                <div className="p-2 opacity-50 filter blur-[1px] flex flex-col gap-2">
                                    <div className="h-20 bg-muted/30 rounded-lg border border-border/30" />
                                    <div className="flex gap-2">
                                        <div className="h-8 flex-1 bg-muted/30 rounded" />
                                        <div className="h-8 flex-1 bg-muted/30 rounded" />
                                    </div>
                                </div>
                            </Widget>

                        </div>
                    )}

                    {/* --- INFO TAB --- */}
                    {activeTab === 'info' && (
                        <div className="flex flex-col gap-12 max-w-3xl mx-auto pb-12">

                            {/* SECTION 1: APP WALKTHROUGH */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif font-medium text-foreground">How to use Wikits</h3>
                                        <p className="text-sm text-muted-foreground">The journey to mastery in 3 steps.</p>
                                    </div>
                                </div>

                                <Widget size="full" className="p-0 overflow-hidden bg-background/40 border-border/50" variant={user ? undefined : 'auth-locked'}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
                                        <div className="p-6 flex flex-col gap-4 hover:bg-muted/10 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <Search className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground mb-1">1. Search & Generate</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Enter any topic. The AI acts as a professor, designing a custom syllabus just for you.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col gap-4 hover:bg-muted/10 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground mb-1">2. Read & Learn</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Stream chapters instantly. Content is formatted with rich Markdown and LaTeX math support.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col gap-4 hover:bg-muted/10 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground mb-1">3. Track Progress</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Mark chapters as complete to track your velocity and build your personalized knowledge graph.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Widget>
                            </div>

                            {/* SECTION 2: COMMUNITY & FORUM */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-pink-500/10 rounded-lg">
                                        <MessageCircle className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif font-medium text-foreground">Community & Forum</h3>
                                        <p className="text-sm text-muted-foreground">Context-aware discussions and collaboration.</p>
                                    </div>
                                </div>

                                <Widget size="full" className="p-8 bg-background/40 border-border/50 space-y-8" variant={user ? undefined : 'auth-locked'}>
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className="flex-1 space-y-4">
                                            <h4 className="text-lg font-medium text-foreground">Context-Aware Threads</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                Don't just ask random questions. In Wikits, forum threads are linked to specific topics. The AI "reads" your current chapter context to give better answers and connect you with peers studying the same thing.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-1 bg-pink-500/10 text-pink-500 text-[10px] font-bold uppercase tracking-wider rounded">
                                                    <Hash className="w-3 h-3 inline mr-1" />
                                                    Topic Tagging
                                                </span>
                                                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider rounded">
                                                    <Bot className="w-3 h-3 inline mr-1" />
                                                    AI Moderation
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full bg-zinc-950/50 rounded-xl border border-border/40 p-4 space-y-3">
                                            {/* Mock Thread */}
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">JD</div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="text-xs text-foreground font-medium">Why is the Schrödinger equation linear?</div>
                                                    <div className="text-[10px] text-muted-foreground">In quantum mechanics, linearity ensures that...</div>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                                                    <ThumbsUp className="w-3 h-3 hover:text-foreground cursor-pointer" />
                                                    <span className="text-[9px]">12</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-px bg-border/40" />
                                            <div className="flex gap-3 opacity-60">
                                                <div className="w-8 h-8 rounded-full bg-blue-900/40 flex items-center justify-center text-xs text-blue-400 font-bold">
                                                    <Bot className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="text-xs text-foreground font-medium">AI Answer</div>
                                                    <div className="text-[10px] text-muted-foreground">Linearity implies the principle of superposition...</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Widget>
                            </div>

                            {/* SECTION 3: ADVANCED CONCEPTS (DEEP DIVE) */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-orange-500/10 rounded-lg">
                                        <Cpu className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-serif font-medium text-foreground">Under the Hood</h3>
                                        <p className="text-sm text-muted-foreground">The architecture powering the platform.</p>
                                    </div>
                                </div>

                                {/* Learning Engine */}
                                <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                                    <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-primary" />
                                        The Learning Engine
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                        We use <strong>Recursive Prompting</strong> to turn a simple seed into a complex syllabus. The AI mimics a curriculum designer, first outlining objectives, then generating JSON structures, and finally streaming content in parallel.
                                    </p>
                                </div>

                                {/* RAG */}
                                <div className="pl-4 border-l-2 border-orange-500/20 space-y-2 mt-8">
                                    <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                                        <Database className="w-4 h-4 text-orange-500" />
                                        RAG & Vector Search
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-4">
                                        Your knowledge is indexed as 1536-dimensional vectors. When you ask a question, we don't just keyword match; we search for <strong>semantic similarity</strong> in the vector space.
                                    </p>
                                    <div className="bg-zinc-950 rounded-lg p-3 font-mono text-[10px] text-zinc-400 border border-zinc-800">
                                        <span className="text-purple-400">const</span> <span className="text-blue-400">context</span> = <span className="text-yellow-400">await</span> vectorStore.similaritySearch(query, <span className="text-orange-400">3</span>);
                                    </div>
                                </div>

                                {/* Local Intelligence */}
                                <div className="pl-4 border-l-2 border-green-500/20 space-y-2 mt-8">
                                    <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                                        <Terminal className="w-4 h-4 text-green-500" />
                                        Local Intelligence
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                        Run completely offline. Use the <strong>Pro Tab</strong> to point Wikits at your local Ollama instance.
                                    </p>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border/30 max-w-md">
                                            <code className="text-xs">ollama pull llama3</code>
                                            <Download className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border/30 max-w-md">
                                            <code className="text-xs">OLLAMA_ORIGINS="*" ollama serve</code>
                                            <Server className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Note */}
                            <div className="flex justify-center pt-12 pb-4 opacity-40">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-default">Wikits v1.0 • Built for the Curious</span>
                            </div>

                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}
