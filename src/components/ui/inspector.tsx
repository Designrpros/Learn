"use client";

import { useUIStore } from "@/lib/ui-store";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Download, Search, Activity, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export function Inspector() {
  const { isInspectorOpen, setInspectorOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState<'activity' | 'settings'>('activity');
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const { user, isSignedIn } = useUser();

  // Fetch recent activity
  useEffect(() => {
    if (isInspectorOpen && activeTab === 'activity') {
        fetch('/api/activity')
            .then(res => res.json())
            .then(data => setActivityLog(data))
            .catch(err => console.error(err));
    }
  }, [isInspectorOpen, activeTab]);

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

          {/* Tabs */}
          <div className="flex p-1 mx-4 mt-4 bg-muted/50 rounded-lg">
              <button
                onClick={() => setActiveTab('activity')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                    activeTab === 'activity' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                  <Activity className="w-3.5 h-3.5" /> Activity
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                 className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                    activeTab === 'settings' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                  <Settings className="w-3.5 h-3.5" /> Settings
              </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-0"> {/* No padding for full height feeling */}
             {activeTab === 'activity' ? (
                 <div className="p-4 space-y-4">
                     {activityLog.length === 0 ? (
                         <div className="text-center py-10 text-muted-foreground opacity-50 text-sm">
                             No recent activity.
                         </div>
                     ) : (
                         <div className="space-y-3">
                             {activityLog.map((log) => (
                                 <div key={log.id} className="flex gap-3 items-start p-3 bg-muted/20 rounded-lg text-sm border border-border/50">
                                     <div className="mt-0.5 p-1.5 bg-primary/10 rounded-full text-primary">
                                         <Search className="w-3 h-3" />
                                     </div>
                                     <div>
                                         <div className="font-medium text-foreground">{log.action}</div>
                                         <div className="text-muted-foreground text-xs mt-0.5">{new Date(log.createdAt).toLocaleString()}</div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="flex flex-col h-full">
                     {/* Auth Section */}
                     <div className="p-6 border-b border-border/50 bg-gradient-to-b from-primary/5 to-transparent">
                         <div className="flex flex-col items-center text-center space-y-4">
                             {isSignedIn ? (
                                 <>
                                     <div className="w-20 h-20 rounded-full bg-muted border-2 border-primary/20 p-1">
                                         <img src={user.imageUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
                                     </div>
                                     <div>
                                         <h3 className="font-serif font-medium text-lg">{user.fullName || user.firstName}</h3>
                                         <p className="text-xs text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                                     </div>
                                     <div className="flex gap-2 w-full pt-2">
                                         <SignOutButton>
                                             <button className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg transition-colors">
                                                 Sign Out
                                             </button>
                                         </SignOutButton>
                                     </div>
                                 </>
                             ) : (
                                 <>
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                                        <User className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-medium">Sign in to Peak Learn</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                                            Track your progress, join the community forum, and save your learning journey across devices.
                                        </p>
                                    </div>
                                    <SignInButton mode="modal">
                                        <button className="w-full py-2.5 bg-foreground text-background font-bold text-sm rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                            <LogIn className="w-4 h-4" /> Sign In
                                        </button>
                                    </SignInButton>
                                 </>
                             )}
                         </div>
                     </div>

                     <div className="p-6 space-y-6">
                         <div className="space-y-2">
                             <label className="text-xs font-mono uppercase text-muted-foreground">Application</label>
                             <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                                 <div className="flex justify-between items-center text-sm">
                                     <span>Theme</span>
                                     <select className="bg-background border border-border rounded px-2 py-1 text-xs">
                                         <option>System</option>
                                         <option>Dark</option>
                                         <option>Light</option>
                                     </select>
                                 </div>
                                 <div className="flex justify-between items-center text-sm">
                                    <span>Notifications</span>
                                    <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full" />
                                    </div>
                                 </div>
                             </div>
                         </div>

                         <div className="space-y-2">
                             <label className="text-xs font-mono uppercase text-muted-foreground">Data</label>
                             <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                                <a 
                                    href="https://peak-browser.vercel.app/" 
                                    target="_blank" 
                                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download Local Data
                                </a>
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
