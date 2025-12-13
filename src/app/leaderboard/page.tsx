import { getLeaderboardStats } from '@/lib/db-queries';
import { Trophy, Medal, Crown, Activity, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default async function LeaderboardPage() {
    const leaderboard = await getLeaderboardStats();

    return (
        <div className="min-h-screen relative bg-background/50 overflow-hidden">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto p-6 sm:p-12 pb-24 mt-12 sm:mt-0">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
                        <Trophy className="w-3.5 h-3.5" />
                        Hall of Fame
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
                        Global Leaderboard
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Recognizing the most curious and active minds building the Wikits knowledge graph.
                    </p>
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end mb-16 px-4">
                    {/* Rank 2 (Silver) */}
                    <div className="order-2 sm:order-1 flex flex-col items-center">
                        {leaderboard[1] && (
                            <div className="relative group w-full max-w-[240px]">
                                <div className="absolute inset-0 bg-gray-200/50 rounded-t-2xl sm:rounded-2xl transform translate-y-2 blur-sm" />
                                <div className="relative bg-card border border-border/60 p-6 rounded-2xl shadow-sm text-center transform transition-transform hover:-translate-y-1">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-100 rounded-full border-4 border-card flex items-center justify-center text-xl font-bold text-gray-400">
                                        #2
                                    </div>
                                    <div className="mt-6 mb-2">
                                        <div className="text-lg font-bold truncate">{leaderboard[1].username}</div>
                                        <div className="text-sm text-muted-foreground font-mono">{leaderboard[1].score} pts</div>
                                    </div>
                                    <div className="h-1 w-12 mx-auto bg-gray-300 rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rank 1 (Gold) */}
                    <div className="order-1 sm:order-2 flex flex-col items-center z-10 w-full">
                        {leaderboard[0] && (
                            <div className="relative group w-full max-w-[280px]">
                                <div className="absolute inset-x-0 bottom-0 top-10 bg-gradient-to-t from-yellow-500/20 to-transparent blur-2xl" />
                                <div className="relative bg-gradient-to-b from-yellow-500/5 to-card border border-yellow-500/30 p-8 rounded-2xl shadow-xl text-center transform transition-transform hover:-translate-y-2">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                        <Crown className="w-16 h-16 text-yellow-500 fill-yellow-500/20 drop-shadow-lg" />
                                    </div>
                                    <div className="mt-8 mb-4">
                                        <div className="text-2xl font-serif font-bold truncate text-foreground">{leaderboard[0].username}</div>
                                        <div className="text-base font-bold text-yellow-600 font-mono bg-yellow-500/10 px-3 py-1 rounded-full inline-block">
                                            {leaderboard[0].score} points
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <Sparkles className="w-3 h-3 text-yellow-500" />
                                        <span>Top Contributor</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rank 3 (Bronze) */}
                    <div className="order-3 flex flex-col items-center">
                        {leaderboard[2] && (
                            <div className="relative group w-full max-w-[240px]">
                                <div className="absolute inset-0 bg-amber-700/5 rounded-t-2xl sm:rounded-2xl transform translate-y-2 blur-sm" />
                                <div className="relative bg-card border border-border/60 p-6 rounded-2xl shadow-sm text-center transform transition-transform hover:-translate-y-1">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-50 rounded-full border-4 border-card flex items-center justify-center text-xl font-bold text-amber-700/60">
                                        #3
                                    </div>
                                    <div className="mt-6 mb-2">
                                        <div className="text-lg font-bold truncate">{leaderboard[2].username}</div>
                                        <div className="text-sm text-muted-foreground font-mono">{leaderboard[2].score} pts</div>
                                    </div>
                                    <div className="h-1 w-12 mx-auto bg-amber-700/30 rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* The List Layout */}
                <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/20">
                                <th className="p-4 w-20 text-center">Rank</th>
                                <th className="p-4">Contributor</th>
                                <th className="p-4 text-right">Score</th>
                                <th className="p-4 text-right hidden sm:table-cell">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {leaderboard.slice(3).map((user) => (
                                <tr key={user.userId} className="hover:bg-muted/40 transition-colors group">
                                    <td className="p-4 text-center font-mono text-muted-foreground font-medium group-hover:text-foreground">
                                        #{user.rank}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-muted to-muted/50 border border-border flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:border-primary/30 group-hover:from-primary/10 group-hover:text-primary transition-all">
                                                {user.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="font-medium group-hover:text-primary transition-colors">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-foreground/80">
                                        {user.score}
                                    </td>
                                    <td className="p-4 text-right text-xs text-muted-foreground hidden sm:table-cell">
                                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {leaderboard.length <= 3 && (
                        <div className="p-12 text-center text-muted-foreground text-sm italic">
                            Join the community to see your name here!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
