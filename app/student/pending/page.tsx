import { redirect } from "next/navigation";
import { paymentService } from "@/lib/services/payment.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RefreshButton } from "./refresh-button";
import { STUDENT_ROUTES, AUTH_ROUTES } from "@/lib/routes";
import { USER_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import { requireStudent } from "@/lib/auth-security";

export default async function PendingPage() {
  // Validate user is student - checks database state
  const user = await requireStudent();

  // Check payment status first
  const paymentStatus = await paymentService.getPaymentStatus(user.id);
  
  if (paymentStatus.paymentStatus === PAYMENT_STATUS.NOT_SUBMITTED ||
      paymentStatus.paymentStatus === PAYMENT_STATUS.PENDING) {
    redirect(STUDENT_ROUTES.PAYMENT);
  }
  
  if (paymentStatus.paymentStatus === PAYMENT_STATUS.REJECTED) {
    redirect(STUDENT_ROUTES.PAYMENT_REJECTED);
  }

  // If user is active and payment approved, redirect to dashboard
  if (user.status === USER_STATUS.ACTIVE) {
    redirect(STUDENT_ROUTES.DASHBOARD);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ops-background p-4">
      <Card className="ops-card max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-metric-orange-light">
            <Clock className="h-8 w-8 text-metric-orange" />
          </div>
          <CardTitle className="text-2xl font-bold text-ops-primary">
            Compte en attente d&apos;activation
          </CardTitle>
          <CardDescription className="mt-2">
            Votre compte est en attente d&apos;activation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <UserCheck className="h-4 w-4 text-ops-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-ops-primary">
                  En attente d&apos;activation
                </p>
                <p className="mt-1 text-sm text-ops-secondary">
                  Votre compte doit être activé par un administrateur.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <Mail className="h-4 w-4 text-ops-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-ops-primary">
                  Vous serez notifié
                </p>
                <p className="mt-1 text-sm text-ops-secondary">
                  Une fois activé, vous pourrez accéder à votre tableau de bord et commencer votre préparation.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="text-sm text-ops-secondary text-center">
                <span className="font-medium text-ops-primary">
                  {user.name}
                </span>
                <br />
                <span className="text-xs text-ops-tertiary mt-1 block">
                  {user.email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <RefreshButton />
            <Button
              variant="ghost"
              className="ops-btn-secondary flex-1"
              asChild
            >
              <Link href={AUTH_ROUTES.LOGIN}>
                Déconnexion
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
