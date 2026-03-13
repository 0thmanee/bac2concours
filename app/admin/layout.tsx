import AdminSidebar from "@/components/layouts/admin-sidebar";
import { AdminHeader } from "@/components/layouts/admin-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { requireAdmin } from "@/lib/auth-security";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate user is admin with active status
  // This checks DB state, not just JWT, preventing stale session attacks
  const user = await requireAdmin();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <AdminHeader 
            userName={user.name || ""}
            userEmail={user.email || ""}
          />
          <main 
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 dashboard-background min-w-0"
          >
            <div className="mx-auto min-w-0 w-full max-w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
