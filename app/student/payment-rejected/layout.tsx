import { redirect } from "next/navigation";
import { PAYMENT_STATUS } from "@/lib/constants";
import { STUDENT_ROUTES } from "@/lib/routes";
import { paymentService } from "@/lib/services/payment.service";
import { requireStudent } from "@/lib/auth-security";

export default async function PaymentRejectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate user is student with verified email (checks DB, not just JWT)
  const user = await requireStudent();

  // Check payment status
  const paymentStatus = await paymentService.getPaymentStatus(user.id);

  // If payment is approved, redirect to dashboard
  if (paymentStatus.paymentStatus === PAYMENT_STATUS.APPROVED) {
    redirect(STUDENT_ROUTES.DASHBOARD);
  }

  // If not rejected, redirect to payment page
  if (paymentStatus.paymentStatus !== PAYMENT_STATUS.REJECTED) {
    redirect(STUDENT_ROUTES.PAYMENT);
  }

  return <>{children}</>;
}
