"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  HelpCircle,
  Play,
  History,
  BookOpen,
  Target,
} from "lucide-react";
import {
  useQuizFilterOptions,
  useQuizMatieres,
  useQuizQuestionCount,
} from "@/lib/hooks/use-qcm";
import { toast } from "sonner";
import Link from "next/link";
import { STUDENT_ROUTES } from "@/lib/constants";

export default function StudentQCMPage() {
  const router = useRouter();
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedMatiere, setSelectedMatiere] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(20);

  const { data: filterOptions, isLoading: isLoadingFilters } =
    useQuizFilterOptions();
  const { data: matieresData, isLoading: isLoadingMatieres } =
    useQuizMatieres(selectedSchool || null);
  const { data: countData } = useQuizQuestionCount(
    selectedSchool || null,
    selectedMatiere || null
  );

  const schools = filterOptions?.data?.schools || [];
  const matieres = matieresData?.data || [];
  const availableQuestions = countData?.data?.count || 0;

  const handleSchoolChange = (value: string) => {
    setSelectedSchool(value);
    setSelectedMatiere(""); // Reset matiere when school changes
  };

  const handleStartQuiz = () => {
    if (!selectedSchool || !selectedMatiere) {
      toast.error("Veuillez sélectionner une filière et une matière");
      return;
    }

    // Navigate to quiz page with URL params - questions will be loaded there
    const params = new URLSearchParams({
      school: selectedSchool,
      matiere: selectedMatiere,
      count: Math.min(questionCount, availableQuestions).toString(),
    });
    router.push(`${STUDENT_ROUTES.QUIZ}/quiz?${params.toString()}`);
  };

  const canStartQuiz =
    selectedSchool && selectedMatiere && availableQuestions > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ops-primary">Quiz QCM</h1>
          <p className="text-ops-secondary mt-1">
            Testez vos connaissances avec des questions à choix multiples
          </p>
        </div>
        <Link href={`${STUDENT_ROUTES.QUIZ}/history`}>
          <Button variant="outline" className="gap-2 border border-border">
            <History className="h-4 w-4" />
            Historique
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quiz Setup */}
        <div className="md:col-span-2">
          <Card className="ops-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configurer votre Quiz
              </CardTitle>
              <CardDescription>
                Sélectionnez votre filière et matière pour commencer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* School Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Filière / École <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedSchool}
                  onValueChange={handleSchoolChange}
                  disabled={isLoadingFilters}
                >
                  <SelectTrigger className="ops-input">
                    <SelectValue placeholder="Sélectionnez une filière" />
                  </SelectTrigger>
                  <SelectContent className="ops-card">
                    {schools.map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Matiere Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Matière <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedMatiere}
                  onValueChange={setSelectedMatiere}
                  disabled={!selectedSchool || isLoadingMatieres}
                >
                  <SelectTrigger className="ops-input">
                    <SelectValue
                      placeholder={
                        selectedSchool
                          ? "Sélectionnez une matière"
                          : "Sélectionnez d'abord une filière"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="ops-card">
                    {matieres.map((matiere) => (
                      <SelectItem key={matiere} value={matiere}>
                        {matiere}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Count Slider */}
              {selectedSchool && selectedMatiere && availableQuestions > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Nombre de questions
                    </Label>
                    <span className="text-lg font-bold text-primary">
                      {Math.min(questionCount, availableQuestions)}
                    </span>
                  </div>
                  <Slider
                    value={[Math.min(questionCount, availableQuestions)]}
                    onValueChange={(values: number[]) => setQuestionCount(values[0])}
                    max={Math.min(50, availableQuestions)}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-ops-tertiary">
                    {availableQuestions} questions disponibles pour cette
                    sélection
                  </p>
                </div>
              )}

              {/* No Questions Available */}
              {selectedSchool &&
                selectedMatiere &&
                availableQuestions === 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-700">
                      Aucune question disponible pour cette combinaison
                      filière/matière. Veuillez essayer une autre sélection.
                    </p>
                  </div>
                )}

              {/* Start Button */}
              <Button
                onClick={handleStartQuiz}
                disabled={!canStartQuiz}
                className="w-full ops-btn-primary h-12 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Commencer le Quiz
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          {/* How It Works */}
          <Card className="ops-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5" />
                Comment ça marche ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-ops-secondary">
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <p>Sélectionnez votre filière et matière</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <p>Choisissez le nombre de questions</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <p>Répondez aux questions une par une</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <p>Consultez votre score et les corrections</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="ops-card bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-300">
                <BookOpen className="h-5 w-5" />
                Conseils
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
              <p>• Lisez chaque question attentivement</p>
              <p>• Certaines questions peuvent avoir plusieurs réponses</p>
              <p>• Vous pouvez revoir vos erreurs après le quiz</p>
              <p>• Pratiquez régulièrement pour vous améliorer</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
