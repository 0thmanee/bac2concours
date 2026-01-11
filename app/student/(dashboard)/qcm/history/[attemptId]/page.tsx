"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Calendar,
  Trophy,
  TrendingUp,
  Lightbulb,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuizAttempt } from "@/lib/hooks/use-qcm";
import { LoadingState } from "@/components/shared/loading-state";
import { STUDENT_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { MathContent } from "@/components/shared/math-content";
import type { QuizAttemptWithAnswers } from "@/lib/hooks/use-qcm";

// Format date for display
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Format time spent
function formatTimeSpent(seconds: number | null): string {
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

// Get score color based on percentage
function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-[rgb(var(--success-dark))] dark:text-[rgb(var(--success))]";
  if (percentage >= 60) return "text-[rgb(var(--warning-dark))] dark:text-[rgb(var(--warning))]";
  if (percentage >= 40) return "text-[rgb(var(--warning-dark))] dark:text-[rgb(var(--warning))]";
  return "text-[rgb(var(--error-dark))] dark:text-[rgb(var(--error))]";
}

// Get difficulty badge color
function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
    case "facile":
      return "bg-[rgb(var(--success-light))] text-[rgb(var(--success-dark))] dark:bg-[rgb(var(--success-dark))]/30 dark:text-[rgb(var(--success))]";
    case "medium":
    case "moyen":
      return "bg-[rgb(var(--warning-light))] text-[rgb(var(--warning-dark))] dark:bg-[rgb(var(--warning-dark))]/30 dark:text-[rgb(var(--warning))]";
    case "hard":
    case "difficile":
      return "bg-[rgb(var(--error-light))] text-[rgb(var(--error-dark))] dark:bg-[rgb(var(--error-dark))]/30 dark:text-[rgb(var(--error))]";
    default:
      return "bg-muted text-muted-foreground";
  }
}

// Option type from Prisma JSON
interface QuestionOption {
  id: string;
  text: string;
  contentType?: "TEXT" | "IMAGE" | "MATH";
  imageUrl?: string | null;
}

interface AttemptDetailPageProps {
  params: Promise<{ attemptId: string }>;
}

export default function AttemptDetailPage({ params }: AttemptDetailPageProps) {
  const { attemptId } = use(params);
  
  const { data: attemptData, isLoading, error } = useQuizAttempt(attemptId);

  if (isLoading) {
    return <LoadingState message="Chargement des détails..." />;
  }

  if (error || !attemptData?.data) {
    return (
      <div className="space-y-6">
        <Link href={STUDENT_ROUTES.QUIZ_HISTORY}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;historique
          </Button>
        </Link>
        <Card className="ops-card">
          <CardContent className="py-16 text-center">
            <XCircle className="h-16 w-16 text-[rgb(var(--error))] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Quiz non trouvé
            </h2>
            <p className="text-muted-foreground">
              Ce quiz n&apos;existe pas ou a été supprimé.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attempt = attemptData.data as QuizAttemptWithAnswers;
  const correctAnswers = attempt.answers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = attempt.answers.filter((a) => !a.isCorrect).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={STUDENT_ROUTES.QUIZ_HISTORY}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Résultats du Quiz
          </h1>
          <p className="text-sm text-muted-foreground">
            {attempt.school} - {attempt.matiere}
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="ops-card overflow-hidden">
        <div className={cn(
          "h-2",
          attempt.percentage >= 80 ? "bg-[rgb(var(--success))]" :
          attempt.percentage >= 60 ? "bg-[rgb(var(--warning))]" :
          attempt.percentage >= 40 ? "bg-[rgb(var(--warning))]" : "bg-[rgb(var(--error))]"
        )} />
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Score */}
            <div className="text-center">
              <div className={cn(
                "text-4xl font-bold mb-1",
                getScoreColor(attempt.percentage)
              )}>
                {Math.round(attempt.percentage)}%
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                {attempt.percentage >= 80 ? (
                  <Trophy className="h-4 w-4 text-[rgb(var(--warning))]" />
                ) : attempt.percentage >= 60 ? (
                  <TrendingUp className="h-4 w-4 text-[rgb(var(--info))]" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
                Score
              </div>
            </div>

            {/* Correct */}
            <div className="text-center">
              <div className="text-4xl font-bold text-[rgb(var(--success-dark))] dark:text-[rgb(var(--success))] mb-1">
                {correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-[rgb(var(--success))]" />
                Correctes
              </div>
            </div>

            {/* Incorrect */}
            <div className="text-center">
              <div className="text-4xl font-bold text-[rgb(var(--error-dark))] dark:text-[rgb(var(--error))] mb-1">
                {incorrectAnswers}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4 text-[rgb(var(--error))]" />
                Incorrectes
              </div>
            </div>

            {/* Time */}
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-1">
                {formatTimeSpent(attempt.timeSpent)}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                Temps
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(attempt.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {attempt.totalPoints}/{attempt.maxPoints} points
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Révision des Questions ({attempt.answers.length})
        </h2>

        {attempt.answers.map((answer, index) => {
          const options = answer.question.options as unknown as QuestionOption[];
          const correctIds = answer.question.correctIds;

          return (
            <Card
              key={answer.id}
              className={cn(
                "ops-card overflow-hidden",
                answer.isCorrect
                  ? "border-l-4 border-l-green-500"
                  : "border-l-4 border-l-red-500"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0",
                      answer.isCorrect
                        ? "bg-[rgb(var(--success-light))] text-[rgb(var(--success-dark))] dark:bg-[rgb(var(--success-dark))]/30 dark:text-[rgb(var(--success))]"
                        : "bg-[rgb(var(--error-light))] text-[rgb(var(--error-dark))] dark:bg-[rgb(var(--error-dark))]/30 dark:text-[rgb(var(--error))]"
                    )}>
                      {index + 1}
                    </span>
                    <div>
                      <CardTitle className="text-base">
                        <span className="flex items-center gap-2">
                          {answer.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-[rgb(var(--success))] shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-[rgb(var(--error))] shrink-0" />
                          )}
                          {answer.isCorrect ? "Réponse correcte" : "Réponse incorrecte"}
                        </span>
                      </CardTitle>
                      {answer.question.chapter && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Chapitre: {answer.question.chapter}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={getDifficultyColor(answer.question.difficulty)}>
                      {answer.question.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {answer.pointsEarned}/{answer.question.points} pts
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question Text */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-[rgb(var(--brand-600))] shrink-0 mt-0.5" />
                    <p className="text-foreground font-medium">
                      {answer.question.text}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {options.map((option) => {
                    const isSelected = answer.selectedIds.includes(option.id);
                    const isCorrect = correctIds.includes(option.id);

                    return (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                          isCorrect && isSelected
                            ? "bg-[rgb(var(--success-light))] border-[rgb(var(--success))] dark:bg-[rgb(var(--success-dark))]/20 dark:border-[rgb(var(--success))]"
                            : isCorrect
                            ? "bg-[rgb(var(--success-light))]/50 border-[rgb(var(--success))]/30 dark:bg-[rgb(var(--success-dark))]/10 dark:border-[rgb(var(--success-dark))]/50"
                            : isSelected && !isCorrect
                            ? "bg-[rgb(var(--error-light))] border-[rgb(var(--error))] dark:bg-[rgb(var(--error-dark))]/20 dark:border-[rgb(var(--error))]"
                            : "bg-muted border-border dark:bg-muted dark:border-border"
                        )}
                      >
                        {/* Selection indicator */}
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          isCorrect && isSelected
                            ? "border-[rgb(var(--success))] bg-[rgb(var(--success))]"
                            : isCorrect
                            ? "border-[rgb(var(--success))]"
                            : isSelected
                            ? "border-[rgb(var(--error))] bg-[rgb(var(--error))]"
                            : "border-border dark:border-border"
                        )}>
                          {(isSelected || isCorrect) && (
                            isCorrect ? (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            ) : (
                              <XCircle className="h-3 w-3 text-white" />
                            )
                          )}
                        </div>

                        {/* Option text/image */}
                        <div className={cn(
                          "flex-1",
                          isCorrect
                            ? "text-[rgb(var(--success-dark))] dark:text-[rgb(var(--success))] font-medium"
                            : isSelected
                            ? "text-[rgb(var(--error-dark))] dark:text-[rgb(var(--error))]"
                            : "text-foreground"
                        )}>
                          {option.contentType === "IMAGE" && option.imageUrl ? (
                            <Image
                              src={option.imageUrl}
                              alt="Option"
                              width={160}
                              height={100}
                              className="rounded-md border border-border object-contain max-h-24"
                              unoptimized
                            />
                          ) : (
                            <MathContent
                              content={option.text}
                              contentType={option.contentType || "TEXT"}
                            />
                          )}
                        </div>

                        {/* Status badges */}
                        <div className="flex gap-1 shrink-0">
                          {isSelected && (
                            <Badge
                              variant={isCorrect ? "default" : "destructive"}
                              className="text-xs"
                            >
                              Votre réponse
                            </Badge>
                          )}
                          {isCorrect && !isSelected && (
                            <Badge
                              variant="outline"
                              className="text-xs border-[rgb(var(--success))] text-[rgb(var(--success-dark))]"
                            >
                              Bonne réponse
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {answer.question.explanation && (
                  <div className="bg-[rgb(var(--info-light))] dark:bg-[rgb(var(--info-dark))]/20 rounded-lg p-4 border border-[rgb(var(--info))]/30 dark:border-[rgb(var(--info-dark))]/50">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-[rgb(var(--info))] dark:text-[rgb(var(--info))] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--info-dark))] dark:text-[rgb(var(--info))] mb-1">
                          Explication
                        </p>
                        <p className="text-sm text-[rgb(var(--info))] dark:text-[rgb(var(--info))]">
                          {answer.question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href={STUDENT_ROUTES.QUIZ_HISTORY}>
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;historique
          </Button>
        </Link>
        <Link href={STUDENT_ROUTES.QUIZ}>
          <Button className="w-full sm:w-auto ops-btn-primary gap-2">
            <Target className="h-4 w-4" />
            Nouveau Quiz
          </Button>
        </Link>
      </div>
    </div>
  );
}
