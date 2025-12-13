"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    Settings,
    BarChart3,
    CreditCard,
    Mail,
    Activity,
    Flag,
    Menu,
    ChevronLeft,
    ChevronRight,
    X
} from "lucide-react";

interface AdminLayoutShellProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/finance", icon: CreditCard, label: "Finance" },
    { href: "/admin/email", icon: Mail, label: "Email" },
    { href: "/admin/moderation", icon: ShieldAlert, label: "Moderation" },
    { href: "/admin/activity", icon: Activity, label: "Activity Logs" },
    { href: "/admin/features", icon: Flag, label: "Feature Flags" },
];

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    return (
        <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans overflow-hidden">

            {/* === MOBILE: FLOATING TOGGLE BUTTON === */}
            {/* Visible only on screens smaller than 'md' (768px) and positioned Top-Right */}
            <Button
                variant="ghost"
                className="fixed top-4 right-4 z-50 md:hidden h-10 w-10 rounded-full bg-neutral-900/90 backdrop-blur-md border border-neutral-800 shadow-xl hover:bg-neutral-800 p-0 flex items-center justify-center transition-opacity"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open Menu"
            >
                <Menu className="w-5 h-5 text-neutral-200" />
            </Button>

            {/* === MOBILE: DRAWER OVERLAY === */}
            {/* Only renders when open, on screens smaller than 'md' */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex justify-start isolate">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Drawer Content - Slides in from LEFT */}
                    <div className="relative w-full bg-neutral-950 h-full border-r border-neutral-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 z-[101]">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="font-bold text-xl tracking-tight text-white">Menu</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-neutral-400 hover:text-white"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Mobile Nav Content */}
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <NavItem
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                    isActive={pathname === item.href}
                                    isCollapsed={false}
                                />
                            ))}
                            <div className="pt-4 mt-4 border-t border-neutral-800">
                                <NavItem
                                    href="/admin/settings"
                                    icon={Settings}
                                    label="System Settings"
                                    isActive={pathname === "/admin/settings"}
                                    isCollapsed={false}
                                />
                            </div>
                        </nav>

                        <div className="p-4 border-t border-neutral-800">
                            <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors block p-2">
                                ← Back to App
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* === DESKTOP: SIDEBAR === */}
            {/* Hidden on mobile, Flex on 'md' screens and up. Permanent Left Side. */}
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r border-neutral-800 bg-black transition-all duration-300 ease-in-out relative z-20",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Header */}
                <div className={cn("h-16 flex items-center border-b border-neutral-800", isCollapsed ? "justify-center px-0" : "justify-between px-6")}>
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">Wikits</h1>
                            <p className="text-xs text-neutral-500">Admin Panel</p>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="font-bold text-xl">W</div>
                    )}
                </div>

                {/* Desktop Nav Items */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            isActive={pathname === item.href}
                            isCollapsed={isCollapsed}
                        />
                    ))}

                    <div className="pt-4 mt-4 border-t border-neutral-800">
                        <NavItem
                            href="/admin/settings"
                            icon={Settings}
                            label="System Settings"
                            isActive={pathname === "/admin/settings"}
                            isCollapsed={isCollapsed}
                        />
                    </div>
                </nav>

                {/* Footer / Toggle */}
                <div className="p-4 border-t border-neutral-800 flex items-center justify-between">
                    {!isCollapsed && (
                        <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors">
                            ← Back to App
                        </Link>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 ml-auto text-neutral-400 hover:text-white"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>
                </div>
            </aside>

            {/* === MAIN CONTENT === */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
                <div className="flex-1 overflow-y-auto">
                    {/* Padding adapted for Mobile (Top-Right Button exists) vs Desktop */}
                    <div className="p-4 pt-4 md:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({
    href,
    icon: Icon,
    label,
    isActive,
    isCollapsed
}: {
    href: string;
    icon: any;
    label: string;
    isActive: boolean;
    isCollapsed: boolean;
}) {
    return (
        <Link
            href={href}
            title={isCollapsed ? label : undefined}
            className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white",
                isCollapsed && "justify-center px-2"
            )}
        >
            <Icon className={cn("w-4 h-4", isActive && "text-indigo-400")} />
            {!isCollapsed && <span>{label}</span>}
        </Link>
    );
}
