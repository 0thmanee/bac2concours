"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  HelpCircle,
  CheckCircle,
  BarChart3,
  Clock,
  Tag,
  School,
  BookOpen,
  Calendar,
  User,
  Eye,
  Type,
  ImageIcon,
  FunctionSquare,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { useQuestion, useDeleteQuestion } from "@/lib/hooks/use-qcm";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { format } from "date-fns";
import { AdminDetailHeader } from "@/components/admin";
import { MathContent } from "@/components/shared/math-content";
import Image from "next/image";
import type { QuestionOption } from "@/lib/validations/qcm.validation";

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = use(params);
  const router = useRouter();
  const { data: questionData, isLoading, error, isError } = useQuestion(questionId);
  const deleteMutation = useDeleteQuestion();

  if (isLoading) {
    return <LoadingState message="Chargement de la question..." />;
  }

  if (isError || error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Question non trouvée"}
        backHref={ADMIN_ROUTES.QCM}
        backLabel="Retour aux Questions"
      />
    );
  }

  const question = questionData?.data;

  if (!question) {
    return (
      <ErrorState
        message="Question non trouvée"
        backHref={ADMIN_ROUTES.QCM}
        backLabel="Retour aux Questions"
      />
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(questionId);
      toast.success("Question supprimée avec succès");
      router.push(ADMIN_ROUTES.QCM);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC
      );
    }
  };

  const options = question.options as QuestionOption[];
  const successRate =
    question.timesAnswered > 0
      ? Math.round((question.timesCorrect / question.timesAnswered) * 100)
      : 0;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE:
        "bg-linear-to-r from-[rgb(var(--success-light))] to-[rgb(var(--success-light))] text-[rgb(var(--success-dark))] border-[rgb(var(--success))]",
      INACTIVE:
        "bg-linear-to-r from-[rgb(var(--neutral-50))] to-[rgb(var(--neutral-100))] text-[rgb(var(--neutral-600))] border-[rgb(var(--neutral-200))]",
      DRAFT:
        "bg-linear-to-r from-[rgb(var(--warning-light))] to-[rgb(var(--warning-light))] text-[rgb(var(--warning-dark))] border-[rgb(var(--warning))]",
    };
    const labels: Record<string, string> = {
      ACTIVE: "Actif",
      INACTIVE: "Inactif",
      DRAFT: "Brouillon",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border ${styles[status] || styles.ACTIVE}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const styles: Record<string, string> = {
      EASY: "bg-[rgb(var(--success-light))] text-[rgb(var(--success-dark))] border-[rgb(var(--success))]",
      MEDIUM: "bg-[rgb(var(--warning-light))] text-[rgb(var(--warning-dark))] border-[rgb(var(--warning))]",
      HARD: "bg-[rgb(var(--error-light))] text-[rgb(var(--error-dark))] border-[rgb(var(--error))]",
    };
    const labels: Record<string, string> = {
      EASY: "Facile",
      MEDIUM: "Moyen",
      HARD: "Difficile",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border ${styles[difficulty] || styles.MEDIUM}`}
      >
        {labels[difficulty] || difficulty}
      </span>
    );
  };

  const getContentTypeIcon = (contentType?: string) => {
    switch (contentType) {
      case "MATH":
        return <FunctionSquare className="h-4 w-4 text-[rgb(var(--brand-600))]" />;
      case "IMAGE":
        return <ImageIcon className="h-4 w-4 text-[rgb(var(--info))]" />;
      default:
        return <Type className="h-4 w-4 text-[rgb(var(--neutral-500))]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminDetailHeader
        backLabel="Retour aux Questions"
        backHref={ADMIN_ROUTES.QCM}
        title="Détails de la Question"
        subtitle={`ID: ${question.id.slice(0, 8)}...`}
        badges={getStatusBadge(question.status)}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={ADMIN_ROUTES.QCM_EDIT(question.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="ops-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cette question?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La question sera
                    définitivement supprimée ainsi que toutes ses statistiques.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Réponses Totales"
          value={question.timesAnswered}
          icon={BarChart3}
          color="blue"
          subtitle="Nombre de fois répondu"
        />
        <MetricCard
          title="Réponses Correctes"
          value={question.timesCorrect}
          icon={CheckCircle}
          color="mint"
          subtitle="Bonnes réponses"
        />
        <MetricCard
          title="Taux de Réussite"
          value={`${successRate}%`}
          icon={Eye}
          color="purple"
          subtitle={successRate >= 70 ? "Bonne difficulté" : "Question difficile"}
        />
        <MetricCard
          title="Points"
          value={question.points}
          icon={Tag}
          color="orange"
          subtitle={question.timeLimit ? `${question.timeLimit}s limite` : "Sans limite"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Question Text */}
          <Card className="ops-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose dark:prose-invert max-w-none text-ops-primary"
                dangerouslySetInnerHTML={{ __html: question.text }}
              />
              {question.imageFile && (
                <div className="mt-4">
                  <Image
                    src={question.imageFile.publicUrl || ""}
                    alt="Question image"
                    width={400}
                    height={300}
                    className="rounded-lg border border-ops object-contain"
                    unoptimized
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Options */}
          <Card className="ops-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Options de Réponse
                <span className="text-sm font-normal text-ops-tertiary ml-2">
                  ({options.length} options)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {options.map((option, index) => {
                  const isCorrect = question.correctIds.includes(option.id);
                  const letter = String.fromCharCode(65 + index);
                  const contentType = option.contentType || "TEXT";

                  return (
                    <div
                      key={option.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                        isCorrect
                          ? "border-[rgb(var(--success))] bg-[rgb(var(--success-light))] dark:bg-[rgb(var(--success-dark))]"
                          : "border-ops bg-ops-bg-secondary"
                      }`}
                    >
                      {/* Letter badge */}
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isCorrect
                            ? "bg-[rgb(var(--success))] text-white"
                            : "bg-[rgb(var(--neutral-200))] text-[rgb(var(--neutral-600))] dark:bg-[rgb(var(--neutral-700))] dark:text-[rgb(var(--neutral-300))]"
                        }`}
                      >
                        {letter}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getContentTypeIcon(contentType)}
                          <span className="text-xs text-ops-tertiary uppercase">
                            {contentType}
                          </span>
                          {isCorrect && (
                            <span className="text-xs text-[rgb(var(--success))] font-medium flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Correct
                            </span>
                          )}
                        </div>
                        {contentType === "IMAGE" && option.imageUrl ? (
                          <Image
                            src={option.imageUrl}
                            alt={`Option ${letter}`}
                            width={200}
                            height={120}
                            className="rounded-md border border-ops object-contain max-h-32"
                            unoptimized
                          />
                        ) : (
                          <MathContent
                            content={option.text}
                            contentType={contentType}
                            className="text-ops-primary"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Explanation */}
          {question.explanation && (
            <Card className="ops-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Explication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ops-secondary">{question.explanation}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Classification */}
          <Card className="ops-card">
            <CardHeader>
              <CardTitle className="text-lg">Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <School className="h-5 w-5 text-ops-tertiary" />
                <div>
                  <p className="text-xs text-ops-tertiary">Filière</p>
                  <p className="font-medium">{question.school}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-ops-tertiary" />
                <div>
                  <p className="text-xs text-ops-tertiary">Matière</p>
                  <p className="font-medium">{question.matiere}</p>
                </div>
              </div>
              {question.chapter && (
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-ops-tertiary" />
                  <div>
                    <p className="text-xs text-ops-tertiary">Chapitre</p>
                    <p className="font-medium">{question.chapter}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-ops-tertiary" />
                <div>
                  <p className="text-xs text-ops-tertiary">Difficulté</p>
                  {getDifficultyBadge(question.difficulty)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="ops-card">
            <CardHeader>
              <CardTitle className="text-lg">Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-ops-tertiary" />
                <div>
                  <p className="text-xs text-ops-tertiary">Temps limite</p>
                  <p className="font-medium">
                    {question.timeLimit
                      ? `${question.timeLimit} secondes`
                      : "Aucune limite"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-ops-tertiary" />
                <div>
                  <p className="text-xs text-ops-tertiary">Visibilité</p>
                  <p className="font-medium">
                    {question.isPublic ? "Public" : "Privé"}
                  </p>
                </div>
              </div>
              {question.uploadedBy && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-ops-tertiary" />
                  <div>
                    <p className="text-xs text-ops-tertiary">Créé par</p>
                    <p className="font-medium">
                      {question.uploadedBy.name || question.uploadedBy.email}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-ops-tertiary" />
                <div>
                  <p className="text-xs text-ops-tertiary">Créé le</p>
                  <p className="font-medium">
                    {format(new Date(question.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <Card className="ops-card">
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
