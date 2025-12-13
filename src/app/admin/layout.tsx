import { requireAdmin, syncUser } from "@/lib/auth";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();
    // Sync current admin user to local DB so they appear in the users list
    await syncUser();

    return (
        <AdminLayoutShell>
            {children}
        </AdminLayoutShell>
    );
}


