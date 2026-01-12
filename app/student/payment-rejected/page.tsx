"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { usePaymentStatus } from "@/lib/hooks/use-payment";
import { API_ROUTES, STUDENT_ROUTES } from "@/lib/constants";
import Link from "next/link";

export default function PaymentRejectedPage() {
  const router = useRouter();
  const { data: statusData, isLoading } = usePaymentStatus();

  const paymentStatus = statusData?.data;

  // If not rejected, redirect appropriately
  if (!isLoading && paymentStatus?.paymentStatus !== "REJECTED") {
    if (paymentStatus?.paymentStatus === "NOT_SUBMITTED") {
      router.push(STUDENT_ROUTES.PAYMENT);
    } else if (paymentStatus?.paymentStatus === "PENDING") {
      router.push(STUDENT_ROUTES.PAYMENT);
    } else if (paymentStatus?.paymentStatus === "APPROVED") {
      router.push(STUDENT_ROUTES.DASHBOARD);
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ops-background p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ops-background p-4">
      <Card className="ops-card max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-light">
            <XCircle className="h-8 w-8 text-error" />
          </div>
          <CardTitle className="text-2xl font-bold text-ops-primary">
            Paiement non validé
          </CardTitle>
          <CardDescription className="mt-2">
            Votre preuve de paiement n&apos;a pas été acceptée. Veuillez soumettre un nouveau document.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rejection reason */}
          {paymentStatus?.paymentRejectionReason && (
            <div className="rounded-lg bg-error-light border border-error/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-error-dark mb-1">
                    Raison du rejet :
                  </p>
                  <p className="text-sm text-error-dark">
                    {paymentStatus.paymentRejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="rounded-lg bg-neutral-50 p-4">
            <p className="text-sm text-ops-secondary">
              Assurez-vous que votre document est lisible et contient les informations suivantes :
            </p>
            <ul className="mt-2 text-sm text-ops-secondary list-disc list-inside space-y-1">
              <li>Montant du paiement</li>
              <li>Date de la transaction</li>
              <li>Référence ou numéro de transaction</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="ops-btn-primary flex-1"
              asChild
            >
              <Link href={STUDENT_ROUTES.PAYMENT}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Soumettre à nouveau
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              className="text-ops-secondary hover:text-ops-primary"
              asChild
            >
              <Link href={API_ROUTES.AUTH_SIGNOUT}>
                Déconnexion
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
