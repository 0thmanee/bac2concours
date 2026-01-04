"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { useUploadPaymentProof, usePaymentStatus } from "@/lib/hooks/use-payment";
import { toast } from "sonner";
import { VALIDATION, API_ROUTES } from "@/lib/constants";
import Link from "next/link";
import { SupabaseImage } from "@/components/ui/supabase-image";

export default function PaymentPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { data: statusData, isLoading: statusLoading } = usePaymentStatus();
  const uploadMutation = useUploadPaymentProof();

  const paymentStatus = statusData?.data;

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = VALIDATION.PAYMENT.ALLOWED_FILE_TYPES as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier non valide. Utilisez JPG, PNG, WebP ou PDF");
      return;
    }

    // Validate file size
    if (file.size > VALIDATION.PAYMENT.MAX_FILE_SIZE) {
      toast.error("Le fichier est trop volumineux (max 5 Mo)");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync(selectedFile);
      toast.success("Preuve de paiement envoyée avec succès");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'envoi");
    }
  };

  // If payment is already pending, show waiting message
  if (paymentStatus?.paymentStatus === "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ops-background p-4">
        <Card className="ops-card max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--metric-orange-light))]">
              <Loader2 className="h-8 w-8 text-[rgb(var(--metric-orange-main))] animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-ops-primary">
              Paiement en cours de vérification
            </CardTitle>
            <CardDescription className="mt-2">
              Votre preuve de paiement a été soumise et est en attente de validation par un administrateur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentStatus.paymentProofUrl && (
              <div className="rounded-lg border border-ops p-4">
                <p className="text-sm text-ops-secondary mb-2">Document soumis :</p>
                {paymentStatus.paymentProofUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <SupabaseImage
                      src={paymentStatus.paymentProofUrl}
                      alt="Preuve de paiement"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-ops-primary">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Document PDF</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="ops-btn-secondary flex-1"
                onClick={() => router.refresh()}
              >
                Actualiser
              </Button>
              <Button
                variant="ghost"
                className="ops-btn-secondary flex-1"
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

  // If payment is approved, redirect (should not happen, but handle it)
  if (paymentStatus?.paymentStatus === "APPROVED") {
    router.push("/founder");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ops-background p-4">
      <Card className="ops-card max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--brand-50))]">
            <Upload className="h-8 w-8 text-[rgb(var(--brand-500))]" />
          </div>
          <CardTitle className="text-2xl font-bold text-ops-primary">
            Preuve de paiement
          </CardTitle>
          <CardDescription className="mt-2">
            Pour activer votre compte, veuillez télécharger une preuve de paiement (reçu bancaire, capture d&apos;écran du virement, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-[rgb(var(--brand-500))] bg-[rgb(var(--brand-50))]"
                : "border-ops hover:border-[rgb(var(--brand-300))]"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleInputChange}
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                {preview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden mx-auto">
                    <SupabaseImage
                      src={preview}
                      alt="Aperçu"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-ops-primary">
                    <FileText className="h-12 w-12 text-[rgb(var(--brand-500))]" />
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-ops-primary">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFile();
                    }}
                    className="p-1 hover:bg-[rgb(var(--neutral-100))] rounded"
                  >
                    <X className="h-4 w-4 text-ops-secondary" />
                  </button>
                </div>
                <p className="text-xs text-ops-tertiary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-ops-secondary" />
                <div>
                  <p className="text-sm font-medium text-ops-primary">
                    Glissez et déposez votre fichier ici
                  </p>
                  <p className="text-xs text-ops-secondary mt-1">
                    ou cliquez pour sélectionner
                  </p>
                </div>
                <p className="text-xs text-ops-tertiary">
                  JPG, PNG, WebP ou PDF • Max 5 Mo
                </p>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="rounded-lg bg-[rgb(var(--neutral-50))] p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[rgb(var(--brand-500))] shrink-0 mt-0.5" />
              <div className="text-sm text-ops-secondary">
                <p className="font-medium text-ops-primary mb-1">Documents acceptés :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Reçu de virement bancaire</li>
                  <li>Capture d&apos;écran de la transaction</li>
                  <li>Attestation de paiement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="ops-btn-primary flex-1"
              onClick={handleSubmit}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer la preuve"
              )}
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
