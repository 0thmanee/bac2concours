import { redirect } from "next/navigation";
import { PAYMENT_STATUS } from "@/lib/constants";
import { FOUNDER_ROUTES } from "@/lib/routes";
import { paymentService } from "@/lib/services/payment.service";
import { requireFounder } from "@/lib/auth-security";

export default async function PaymentRejectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate user is founder with verified email (checks DB, not just JWT)
  const user = await requireFounder();

  // Check payment status
  const paymentStatus = await paymentService.getPaymentStatus(user.id);

  // If payment is approved, redirect to dashboard
  if (paymentStatus.paymentStatus === PAYMENT_STATUS.APPROVED) {
    redirect(FOUNDER_ROUTES.DASHBOARD);
  }

  // If not rejected, redirect to payment page
  if (paymentStatus.paymentStatus !== PAYMENT_STATUS.REJECTED) {
    redirect(FOUNDER_ROUTES.PAYMENT);
  }

  return <>{children}</>;
}
