import { redirect } from "next/navigation";
import FounderSidebar from "@/components/layouts/founder-sidebar";
import { FounderHeader } from "@/components/layouts/founder-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PAYMENT_STATUS } from "@/lib/constants";
import { FOUNDER_ROUTES } from "@/lib/routes";
import { startupService } from "@/lib/services/startup.service";
import { paymentService } from "@/lib/services/payment.service";
import type { StartupWithRelations } from "@/lib/types/prisma";
import { requireFounder } from "@/lib/auth-security";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate user is founder - checks database state
  const user = await requireFounder();

  // Check payment status - redirect to appropriate payment page if not approved
  const paymentStatus = await paymentService.getPaymentStatus(user.id);
  
  if (paymentStatus.paymentStatus === PAYMENT_STATUS.NOT_SUBMITTED ||
      paymentStatus.paymentStatus === PAYMENT_STATUS.PENDING) {
    redirect(FOUNDER_ROUTES.PAYMENT);
  }
  
  if (paymentStatus.paymentStatus === PAYMENT_STATUS.REJECTED) {
    redirect(FOUNDER_ROUTES.PAYMENT_REJECTED);
  }

  // At this point, payment is approved - user can access dashboard
  // Get user's startups if they have any
  const startups = await startupService.findByFounderId(user.id);
  const startup = startups.length > 0 ? (startups[0] as StartupWithRelations) : null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <FounderSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <FounderHeader 
            userName={user.name || ""}
            userEmail={user.email || ""}
            startupName={startup?.name || "Mon Espace"}
          />
          <main 
            className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-ops-background"
          >
            <div className="mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
