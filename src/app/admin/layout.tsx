
import { requireAdmin, syncUser } from "@/lib/auth";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    Settings,
    BarChart3,
    CreditCard,
    Mail,
    Activity,
    Flag
} from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();
    // Sync current admin user to local DB so they appear in the users list
    await syncUser();

    return (
        <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-neutral-800 bg-neutral-950/50 flex flex-col">
                <div className="p-6 border-b border-neutral-800">
                    <h1 className="text-xl font-bold tracking-tight text-white">Wikits Admin</h1>
                    <p className="text-xs text-neutral-500 mt-1">Control Center</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem href="/admin" icon={LayoutDashboard} label="Overview" />
                    <NavItem href="/admin/analytics" icon={BarChart3} label="Analytics" />
                    <NavItem href="/admin/users" icon={Users} label="Users" />
                    <NavItem href="/admin/finance" icon={CreditCard} label="Finance" />
                    <NavItem href="/admin/email" icon={Mail} label="Email" />
                    <NavItem href="/admin/moderation" icon={ShieldAlert} label="Moderation" />
                    <NavItem href="/admin/activity" icon={Activity} label="Activity Logs" />
                    <NavItem href="/admin/features" icon={Flag} label="Feature Flags" />
                    <div className="pt-4 mt-4 border-t border-neutral-800">
                        <NavItem href="/admin/settings" icon={Settings} label="System Settings" />
                    </div>
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors">
                        ← Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-400 rounded-md hover:bg-neutral-800 hover:text-white transition-colors"
        >
            <Icon className="w-4 h-4" />
            {label}
        </Link>
    );
}
