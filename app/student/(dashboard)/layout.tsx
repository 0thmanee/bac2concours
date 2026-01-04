import { redirect } from "next/navigation";
import StudentSidebar from "@/components/layouts/student-sidebar";
import { StudentHeader } from "@/components/layouts/student-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PAYMENT_STATUS } from "@/lib/constants";
import { STUDENT_ROUTES } from "@/lib/routes";
import { paymentService } from "@/lib/services/payment.service";
import { requireStudent } from "@/lib/auth-security";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate user is student - checks database state
  const user = await requireStudent();

  // Check payment status - redirect to appropriate payment page if not approved
  const paymentStatus = await paymentService.getPaymentStatus(user.id);
  
  if (paymentStatus.paymentStatus === PAYMENT_STATUS.NOT_SUBMITTED ||
      paymentStatus.paymentStatus === PAYMENT_STATUS.PENDING) {
    redirect(STUDENT_ROUTES.PAYMENT);
  }
  
  if (paymentStatus.paymentStatus === PAYMENT_STATUS.REJECTED) {
    redirect(STUDENT_ROUTES.PAYMENT_REJECTED);
  }

  // At this point, payment is approved - user can access dashboard

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <StudentSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <StudentHeader 
            userName={user.name || ""}
            userEmail={user.email || ""}
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
