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
  if (percentage >= 80) return "text-green-600 dark:text-green-400";
  if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (percentage >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

// Get difficulty badge color
function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
    case "facile":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "medium":
    case "moyen":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "hard":
    case "difficile":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
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
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Quiz non trouvé
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Résultats du Quiz
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {attempt.school} - {attempt.matiere}
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="ops-card overflow-hidden">
        <div className={cn(
          "h-2",
          attempt.percentage >= 80 ? "bg-green-500" :
          attempt.percentage >= 60 ? "bg-yellow-500" :
          attempt.percentage >= 40 ? "bg-orange-500" : "bg-red-500"
        )} />
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className={cn(
                "text-4xl font-bold mb-1",
                getScoreColor(attempt.percentage)
              )}>
                {Math.round(attempt.percentage)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                {attempt.percentage >= 80 ? (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                ) : attempt.percentage >= 60 ? (
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
                Score
              </div>
            </div>

            {/* Correct */}
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                {correctAnswers}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Correctes
              </div>
            </div>

            {/* Incorrect */}
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-1">
                {incorrectAnswers}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                Incorrectes
              </div>
            </div>

            {/* Time */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {formatTimeSpent(attempt.timeSpent)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                Temps
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                      answer.isCorrect
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {index + 1}
                    </span>
                    <div>
                      <CardTitle className="text-base">
                        <span className="flex items-center gap-2">
                          {answer.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                          )}
                          {answer.isCorrect ? "Réponse correcte" : "Réponse incorrecte"}
                        </span>
                      </CardTitle>
                      {answer.question.chapter && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-[rgb(var(--brand-600))] shrink-0 mt-0.5" />
                    <p className="text-gray-900 dark:text-white font-medium">
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
                            ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700"
                            : isCorrect
                            ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                            : isSelected && !isCorrect
                            ? "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700"
                            : "bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"
                        )}
                      >
                        {/* Selection indicator */}
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          isCorrect && isSelected
                            ? "border-green-500 bg-green-500"
                            : isCorrect
                            ? "border-green-500"
                            : isSelected
                            ? "border-red-500 bg-red-500"
                            : "border-gray-300 dark:border-gray-600"
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
                            ? "text-green-700 dark:text-green-300 font-medium"
                            : isSelected
                            ? "text-red-700 dark:text-red-300"
                            : "text-gray-700 dark:text-gray-300"
                        )}>
                          {option.contentType === "IMAGE" && option.imageUrl ? (
                            <Image
                              src={option.imageUrl}
                              alt="Option"
                              width={160}
                              height={100}
                              className="rounded-md border border-ops object-contain max-h-24"
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
                              className="text-xs border-green-500 text-green-600"
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
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                          Explication
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
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
