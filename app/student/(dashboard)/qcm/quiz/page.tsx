"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  AlertCircle,
} from "lucide-react";
import { useStartQuiz, useSubmitQuiz, type QuizQuestion } from "@/lib/hooks/use-qcm";
import { LoadingState } from "@/components/shared/loading-state";
import { toast } from "sonner";
import { STUDENT_ROUTES } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { MathContent } from "@/components/shared/math-content";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuizAnswer {
  questionId: string;
  selectedIds: string[];
  timeSpent?: number;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startQuizMutation = useStartQuiz();
  const submitQuizMutation = useSubmitQuiz();

  const school = searchParams.get("school") || "";
  const matiere = searchParams.get("matiere") || "";
  const count = parseInt(searchParams.get("count") || "20");

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      if (!school || !matiere) {
        setError("Paramètres manquants");
        setIsLoading(false);
        return;
      }

      try {
        const result = await startQuizMutation.mutateAsync({
          school,
          matiere,
          questionCount: count,
        });

        if (result.data && result.data.length > 0) {
          setQuestions(result.data);
          setStartTime(Date.now());
          setQuestionStartTime(Date.now());
        } else {
          setError("Aucune question disponible");
        }
      } catch (err) {
        setError("Erreur lors du chargement des questions");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school, matiere, count]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const toggleOption = (optionId: string) => {
    const currentAnswers = answers.get(currentQuestion.id) || [];
    let newAnswers: string[];

    if (currentAnswers.includes(optionId)) {
      newAnswers = currentAnswers.filter((id) => id !== optionId);
    } else {
      newAnswers = [...currentAnswers, optionId];
    }

    setAnswers(new Map(answers.set(currentQuestion.id, newAnswers)));
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);

    const quizAnswers: QuizAnswer[] = questions.map((q) => ({
      questionId: q.id,
      selectedIds: answers.get(q.id) || [],
    }));

    try {
      const result = await submitQuizMutation.mutateAsync({
        school,
        matiere,
        answers: quizAnswers,
        totalTimeSpent,
      });

      if (result.data) {
        // Navigate to attempt detail page to see results
        router.push(STUDENT_ROUTES.QUIZ_ATTEMPT(result.data.attemptId));
      }
    } catch (err) {
      toast.error("Erreur lors de la soumission du quiz");
      console.error(err);
    }
  };

  const answeredCount = answers.size;
  const unansweredCount = questions.length - answeredCount;

  if (isLoading) {
    return <LoadingState message="Chargement des questions..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-ops-secondary">{error}</p>
        <Button onClick={() => router.push(STUDENT_ROUTES.QUIZ)}>
          Retour au quiz
        </Button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <p className="text-lg text-ops-secondary">Aucune question disponible</p>
        <Button onClick={() => router.push(STUDENT_ROUTES.QUIZ)}>
          Retour au quiz
        </Button>
      </div>
    );
  }

  const selectedAnswers = answers.get(currentQuestion.id) || [];
  const options = currentQuestion.options as Array<{
    id: string;
    text: string;
    contentType?: "TEXT" | "IMAGE" | "MATH";
    imageUrl?: string | null;
  }>;

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ops-primary">Quiz en cours</h1>
          <p className="text-sm text-ops-tertiary">
            {school} • {matiere}
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 w-full sm:w-auto"
          onClick={() => setShowConfirmSubmit(true)}
        >
          <Flag className="h-4 w-4" />
          Terminer
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ops-secondary">
            Question {currentIndex + 1} sur {questions.length}
          </span>
          <span className="text-ops-tertiary">
            {answeredCount} répondues • {unansweredCount} restantes
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="ops-card">
        <CardContent className="pt-6 space-y-6">
          {/* Question Text */}
          <div className="space-y-4">
            <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
              <div
                className="text-base sm:text-lg font-medium text-ops-primary flex-1"
                dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
              />
              <span
                className={`text-xs px-2 py-1 rounded-full shrink-0 self-start ${
                  currentQuestion.difficulty === "EASY"
                    ? "bg-green-100 text-green-700"
                    : currentQuestion.difficulty === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {currentQuestion.difficulty === "EASY"
                  ? "Facile"
                  : currentQuestion.difficulty === "MEDIUM"
                    ? "Moyen"
                    : "Difficile"}
              </span>
            </div>

            {currentQuestion.chapter && (
              <p className="text-sm text-ops-tertiary">
                Chapitre: {currentQuestion.chapter}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswers.includes(option.id);
              const letter = String.fromCharCode(65 + index); // A, B, C, D...
              const contentType = option.contentType || "TEXT";

              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-ops-bg-secondary dark:hover:bg-ops-bg-secondary"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-ops-bg-secondary text-ops-secondary"
                      }`}
                    >
                      {letter}
                    </div>
                    <div className="flex-1 pt-1">
                      {contentType === "IMAGE" && option.imageUrl ? (
                        <Image
                          src={option.imageUrl}
                          alt={`Option ${letter}`}
                          width={200}
                          height={120}
                          className="rounded-md border border-border object-contain max-h-32"
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
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-ops-tertiary text-center">
            💡 Cliquez sur une option pour la sélectionner. Plusieurs réponses
            peuvent être correctes.
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>

        {/* Question indicators */}
        <div className="flex gap-1 overflow-x-auto max-w-[45vw] sm:max-w-md">
          {questions.map((q, index) => {
            const isAnswered = answers.has(q.id);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setQuestionStartTime(Date.now());
                }}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  isCurrent
                    ? "bg-primary text-white"
                    : isAnswered
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {currentIndex === questions.length - 1 ? (
          <Button
            onClick={() => setShowConfirmSubmit(true)}
            className="ops-btn-primary gap-2"
          >
            Terminer le Quiz
            <Flag className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={goToNext} className="gap-2">
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Confirm Submit Dialog */}
      <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <AlertDialogContent className="ops-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Terminer le quiz?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Êtes-vous sûr de vouloir terminer ce quiz?</p>
              {unansweredCount > 0 && (
                <p className="text-amber-600 font-medium">
                  ⚠️ Vous avez {unansweredCount} question(s) sans réponse.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer le quiz</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitQuizMutation.isPending}
            >
              {submitQuizMutation.isPending ? "Envoi..." : "Terminer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<LoadingState message="Chargement..." />}>
      <QuizContent />
    </Suspense>
  );
}
