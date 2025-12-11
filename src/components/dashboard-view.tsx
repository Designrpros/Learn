'use client';

import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Clock, BookOpen, Star, Trophy } from 'lucide-react';
import Link from 'next/link';

export function DashboardView() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return <div className="animate-pulse h-64 bg-muted/20 rounded-xl" />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto space-y-8"
        >
            <div className="flex items-center gap-4 bg-card/50 border border-border p-6 rounded-2xl shadow-sm">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <img src={user?.imageUrl} alt={user?.fullName || "User"} className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                    <h2 className="text-2xl font-serif font-medium">Welcome back, {user?.firstName || 'Scholar'}</h2>
                    <p className="text-muted-foreground">You are on a 3-day learning streak.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-medium flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-primary" /> Continue Learning
                    </h3>
                    <div className="space-y-3">
                        {/* Mock Data - In real app, fetch from UserActivity */}
                        <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                            <div className="text-xs text-muted-foreground mb-1">Topic</div>
                            <div className="font-medium group-hover:text-primary transition-colors">Quantum Mechanics</div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                            <div className="text-xs text-muted-foreground mb-1">Topic</div>
                            <div className="font-medium group-hover:text-primary transition-colors">Renaissance Art</div>
                        </div>
                    </div>
                </div>

                {/* Stats / Contributions */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-medium flex items-center gap-2 mb-4">
                        <Trophy className="w-4 h-4 text-primary" /> Your Progress
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold font-serif">12</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Topics Explored</div>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold font-serif">5</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Forum Posts</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <Link href="/forum" className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-4">
                    Visit Community Forum <BookOpen className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
}
