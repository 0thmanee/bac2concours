"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminEmptyState,
  type AdminStatItem,
} from "@/components/admin";
import { LoadingState } from "@/components/shared/loading-state";
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { usePendingPayments, type PendingPaymentUser } from "@/lib/hooks/use-payment";
import { toast } from "sonner";
import { MESSAGES, VALIDATION } from "@/lib/constants";
import { SupabaseImage } from "@/components/ui/supabase-image";

export default function PaymentsPage() {
  const { data, isLoading, refetch } = usePendingPayments();
  const [viewingUser, setViewingUser] = useState<PendingPaymentUser | null>(null);
  const [rejectingUser, setRejectingUser] = useState<PendingPaymentUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const payments = data?.data?.payments || [];
  const metrics = data?.data?.metrics || {
    notSubmitted: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  };

  // Helper function to make API call
  const reviewPayment = async (userId: string, reviewData: { action: "approve" | "reject"; rejectionReason?: string }) => {
    const response = await fetch(`/api/payments/${userId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors du traitement");
    }

    return response.json();
  };

  const handleApprove = async (user: PendingPaymentUser) => {
    setIsProcessing(true);
    try {
      await reviewPayment(user.id, { action: "approve" });
      toast.success(MESSAGES.SUCCESS.PAYMENT_APPROVED);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingUser) return;
    
    if (rejectionReason.length < VALIDATION.PAYMENT.REJECTION_REASON_MIN_LENGTH) {
      toast.error(MESSAGES.ERROR.PAYMENT_REJECTION_REASON_REQUIRED);
      return;
    }

    setIsProcessing(true);
    try {
      await reviewPayment(rejectingUser.id, { action: "reject", rejectionReason });
      toast.success(MESSAGES.SUCCESS.PAYMENT_REJECTED);
      setRejectingUser(null);
      setRejectionReason("");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <LoadingState message="Chargement des paiements..." />;
  }

  // Stats configuration
  const statsConfig: AdminStatItem[] = [
    {
      title: "En attente",
      value: metrics.pending,
      icon: Clock,
      color: "orange",
      subtitle: "À vérifier",
    },
    {
      title: "Approuvés",
      value: metrics.approved,
      icon: CheckCircle,
      color: "mint",
      subtitle: "Validés",
    },
    {
      title: "Rejetés",
      value: metrics.rejected,
      icon: XCircle,
      color: "rose",
      subtitle: "Non validés",
    },
    {
      title: "Non soumis",
      value: metrics.notSubmitted,
      icon: CreditCard,
      color: "blue",
      subtitle: "En attente d'upload",
    },
  ];

  const columns: Column<PendingPaymentUser>[] = [
    {
      header: "Utilisateur",
      cell: (user) => (
        <div>
          <p className="font-medium text-sm text-foreground">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      ),
    },
    {
      header: "Date d'inscription",
      cell: (user) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      header: "Date de soumission",
      cell: (user) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(user.paymentSubmittedAt)}
        </span>
      ),
    },
    {
      header: "Document",
      cell: (user) => (
        user.paymentProofUrl ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-brand-500"
            onClick={() => setViewingUser(user)}
          >
            <Eye className="h-4 w-4" />
            Voir
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (user) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-success-dark hover:text-success hover:bg-success-light"
            onClick={() => handleApprove(user)}
            disabled={isProcessing}
          >
            <Check className="h-4 w-4" />
            Approuver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-error-dark hover:text-error hover:bg-error-light"
            onClick={() => setRejectingUser(user)}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
            Rejeter
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Paiements en attente"
        description="Gérez les preuves de paiement des utilisateurs"
      />

      {/* Metrics */}
      <AdminStatsGrid stats={statsConfig} columns={4} />

      {/* Pending Payments Table */}
      <DataTable
        data={payments}
        columns={columns}
        keyExtractor={(user) => user.id}
        isLoading={isLoading}
        emptyState={
          <AdminEmptyState
            icon={CreditCard}
            title="Aucun paiement en attente"
            description="Tous les paiements ont été traités"
          />
        }
      />

      {/* View Payment Proof Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="ops-card max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preuve de paiement</DialogTitle>
            <DialogDescription>
              {viewingUser?.name} - {viewingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {viewingUser?.paymentProofUrl && (
              <>
                {viewingUser.paymentProofUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <div className="relative w-full h-96 rounded-lg overflow-hidden border border-border">
                    <SupabaseImage
                      src={viewingUser.paymentProofUrl}
                      alt="Preuve de paiement"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <FileText className="h-16 w-16 text-brand-500" />
                    <p className="text-sm text-muted-foreground">Document PDF</p>
                    <Button
                      variant="outline"
                      className=""
                      onClick={() => window.open(viewingUser.paymentProofUrl!, "_blank")}
                    >
                      Ouvrir le PDF
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setViewingUser(null)}
              className=""
            >
              Fermer
            </Button>
            <Button
              className="bg-success hover:bg-success-dark text-white"
              onClick={() => {
                if (viewingUser) {
                  handleApprove(viewingUser);
                  setViewingUser(null);
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Approuver
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (viewingUser) {
                  setRejectingUser(viewingUser);
                  setViewingUser(null);
                }
              }}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Payment Dialog */}
      <Dialog open={!!rejectingUser} onOpenChange={() => {
        setRejectingUser(null);
        setRejectionReason("");
      }}>
        <DialogContent className="ops-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-error-dark">
              <AlertTriangle className="h-5 w-5" />
              Rejeter le paiement
            </DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejeter la preuve de paiement de {rejectingUser?.name}.
              Veuillez fournir une raison claire pour l&apos;utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Raison du rejet</Label>
            <Textarea
              id="rejection-reason"
              className="ops-input mt-2"
              placeholder="Ex: Le document est illisible, veuillez soumettre une photo plus claire..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-ops-tertiary mt-2">
              Minimum {VALIDATION.PAYMENT.REJECTION_REASON_MIN_LENGTH} caractères ({rejectionReason.length} / {VALIDATION.PAYMENT.REJECTION_REASON_MIN_LENGTH})
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectingUser(null);
                setRejectionReason("");
              }}
              className=""
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || rejectionReason.length < VALIDATION.PAYMENT.REJECTION_REASON_MIN_LENGTH}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
