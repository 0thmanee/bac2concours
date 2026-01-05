"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X, ImageIcon } from "lucide-react";
import {
  useQuestion,
  useUpdateQuestion,
  useQuestionFilterOptions,
} from "@/lib/hooks/use-qcm";
import { useUploadFile } from "@/lib/hooks/use-files";
import {
  updateQuestionSchema,
  type UpdateQuestionInput,
  type QuestionOption,
} from "@/lib/validations/qcm.validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ADMIN_ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils/error.utils"; 
import { QuestionStatus, QuestionDifficulty, FileType } from "@prisma/client";
import Image from "next/image";
import {
  AdminFormHeader,
  AdminFormCard,
  AdminFormActions,
  AdminStatusVisibility,
  AdminTagsInput,
} from "@/components/admin";
import { LoadingState } from "@/components/shared/loading-state";
import { nanoid } from "nanoid";

const STATUS_OPTIONS = [
  { value: QuestionStatus.ACTIVE, label: "Actif" },
  { value: QuestionStatus.INACTIVE, label: "Inactif" },
  { value: QuestionStatus.DRAFT, label: "Brouillon" },
];

const DIFFICULTY_OPTIONS = [
  { value: QuestionDifficulty.EASY, label: "Facile" },
  { value: QuestionDifficulty.MEDIUM, label: "Moyen" },
  { value: QuestionDifficulty.HARD, label: "Difficile" },
];

const DEFAULT_SCHOOLS = [
  "Sciences Mathématiques",
  "Sciences Physiques",
  "Sciences de la Vie et de la Terre",
  "Sciences Économiques",
];

const DEFAULT_MATIERES = [
  "Mathématiques",
  "Physique",
  "Chimie",
  "Sciences de la Vie",
  "Sciences de la Terre",
  "Économie",
];

interface PageProps {
  params: Promise<{ questionId: string }>;
}

export default function EditQuestionPage({ params }: PageProps) {
  const { questionId } = use(params);
  const router = useRouter();
  const { data: questionData, isLoading } = useQuestion(questionId);
  const updateMutation = useUpdateQuestion(questionId);
  const uploadFileMutation = useUploadFile();
  const { data: filtersData } = useQuestionFilterOptions();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageId, setExistingImageId] = useState<string | null>(null);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [correctIds, setCorrectIds] = useState<string[]>([]);

  const question = questionData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(updateQuestionSchema),
  });

  // Initialize form when question data loads
  useEffect(() => {
    if (question) {
      reset({
        text: question.text,
        explanation: question.explanation || "",
        school: question.school,
        matiere: question.matiere,
        chapter: question.chapter || "",
        difficulty: question.difficulty,
        points: question.points,
        timeLimit: question.timeLimit || undefined,
        status: question.status,
        isPublic: question.isPublic,
        tags: question.tags || [],
      });

      // Set options
      const questionOptions = question.options as QuestionOption[];
      setOptions(questionOptions);
      setCorrectIds(question.correctIds);

      // Set existing image
      if (question.imageFileId) {
        setExistingImageId(question.imageFileId);
      }
    }
  }, [question, reset]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedTags = (watch("tags") as string[]) || [];
  const watchedStatus = watch("status") || QuestionStatus.ACTIVE;
  const watchedIsPublic = watch("isPublic") ?? true;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setExistingImageId(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageId(null);
    setValue("imageFileId", null);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: nanoid(), text: "" }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
      setCorrectIds(correctIds.filter((cid) => cid !== id));
    }
  };

  const updateOptionText = (id: string, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const toggleCorrect = (id: string) => {
    if (correctIds.includes(id)) {
      setCorrectIds(correctIds.filter((cid) => cid !== id));
    } else {
      setCorrectIds([...correctIds, id]);
    }
  };

  const onSubmit = async (data: UpdateQuestionInput) => {
    // Validate options
    const validOptions = options.filter((opt) => opt.text.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Au moins 2 options sont requises");
      return;
    }

    if (correctIds.length === 0) {
      toast.error("Au moins une réponse correcte est requise");
      return;
    }

    const validCorrectIds = correctIds.filter((id) =>
      validOptions.some((opt) => opt.id === id)
    );
    if (validCorrectIds.length === 0) {
      toast.error("Au moins une réponse correcte valide est requise");
      return;
    }

    try {
      // Upload new image if provided
      if (imageFile) {
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: imageFile,
          type: FileType.IMAGE,
          folder: "question-images",
        });
        data.imageFileId = uploadResult.data.id;
      } else if (!existingImageId) {
        data.imageFileId = null;
      }

      // Add options and correctIds
      data.options = validOptions;
      data.correctIds = validCorrectIds;

      await updateMutation.mutateAsync(data);
      toast.success("Question mise à jour avec succès");
      router.push(ADMIN_ROUTES.QCM);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const schools = filtersData?.data?.schools || DEFAULT_SCHOOLS;
  const matieres = filtersData?.data?.matieres || DEFAULT_MATIERES;

  if (isLoading) {
    return <LoadingState message="Chargement de la question..." />;
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ops-tertiary">Question non trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminFormHeader
        backLabel="Retour aux Questions"
        backHref={ADMIN_ROUTES.QCM}
        title="Modifier la Question"
        description="Modifiez les détails de cette question"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Text */}
            <AdminFormCard
              title="Question"
              description="Le texte de la question"
            >
              <div className="space-y-2">
                <Label htmlFor="text" className="text-sm font-medium">
                  Texte de la Question <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="text"
                  {...register("text")}
                  placeholder="Entrez votre question ici..."
                  rows={4}
                  className="ops-input resize-none font-mono"
                />
                {errors.text && (
                  <p className="text-xs text-destructive">{errors.text.message}</p>
                )}
              </div>

              {/* Question Image */}
              <div className="space-y-2 pt-4">
                <Label className="text-sm font-medium">
                  Image de la Question{" "}
                  <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <Image
                      src={imagePreview}
                      alt="Question preview"
                      width={320}
                      height={200}
                      className="max-w-xs rounded-lg border border-ops object-contain"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : existingImageId && question?.imageFile?.publicUrl ? (
                  <div className="relative inline-block">
                    <Image
                      src={question.imageFile.publicUrl}
                      alt="Question image"
                      width={320}
                      height={200}
                      className="max-w-xs rounded-lg border border-ops object-contain"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-ops rounded-lg cursor-pointer hover:border-[rgb(var(--brand-500))] hover:bg-ops-bg-secondary transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-ops-tertiary mb-2" />
                      <p className="text-sm text-ops-tertiary">
                        Cliquez pour ajouter une image
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </AdminFormCard>

            {/* Options */}
            <AdminFormCard
              title="Options de Réponse"
              description="Modifiez les options et les bonnes réponses"
            >
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-ops bg-ops-bg-secondary"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCorrect(option.id)}
                      className={`mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        correctIds.includes(option.id)
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {correctIds.includes(option.id) && (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <Textarea
                        value={option.text}
                        onChange={(e) => updateOptionText(option.id, e.target.value)}
                        placeholder={`Option ${index + 1}...`}
                        rows={2}
                        className="ops-input resize-none font-mono text-sm"
                      />
                    </div>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-1 h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeOption(option.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {options.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full ops-btn-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une Option
                  </Button>
                )}
              </div>
            </AdminFormCard>

            {/* Explanation */}
            <AdminFormCard
              title="Explication"
              description="Explication affichée après la réponse"
            >
              <div className="space-y-2">
                <Label htmlFor="explanation" className="text-sm font-medium">
                  Explication{" "}
                  <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <Textarea
                  id="explanation"
                  {...register("explanation")}
                  placeholder="Expliquez pourquoi cette réponse est correcte..."
                  rows={3}
                  className="ops-input resize-none"
                />
              </div>
            </AdminFormCard>

            {/* Classification */}
            <AdminFormCard
              title="Classification"
              description="Catégorisation de la question"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school" className="text-sm font-medium">
                    École/Filière
                  </Label>
                  <Select
                    value={watch("school")}
                    onValueChange={(value) => setValue("school", value)}
                  >
                    <SelectTrigger id="school" className="ops-input h-9">
                      <SelectValue placeholder="Sélectionner une filière" />
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

                <div className="space-y-2">
                  <Label htmlFor="matiere" className="text-sm font-medium">
                    Matière
                  </Label>
                  <Select
                    value={watch("matiere")}
                    onValueChange={(value) => setValue("matiere", value)}
                  >
                    <SelectTrigger id="matiere" className="ops-input h-9">
                      <SelectValue placeholder="Sélectionner une matière" />
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

                <div className="space-y-2">
                  <Label htmlFor="chapter" className="text-sm font-medium">
                    Chapitre
                  </Label>
                  <Input
                    id="chapter"
                    {...register("chapter")}
                    placeholder="ex: Dérivées et Primitives"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium">
                    Difficulté
                  </Label>
                  <Select
                    value={watch("difficulty")}
                    onValueChange={(value) =>
                      setValue("difficulty", value as QuestionDifficulty)
                    }
                  >
                    <SelectTrigger id="difficulty" className="ops-input h-9">
                      <SelectValue placeholder="Sélectionner la difficulté" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {DIFFICULTY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points" className="text-sm font-medium">
                    Points
                  </Label>
                  <Input
                    id="points"
                    type="number"
                    min={1}
                    max={100}
                    {...register("points", { valueAsNumber: true })}
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit" className="text-sm font-medium">
                    Temps Limite (sec)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min={10}
                    max={600}
                    {...register("timeLimit", { valueAsNumber: true })}
                    placeholder="60"
                    className="ops-input h-9"
                  />
                </div>
              </div>
            </AdminFormCard>

            {/* Tags */}
            <AdminFormCard title="Tags" description="Mots-clés pour la recherche">
              <AdminTagsInput
                tags={watchedTags}
                onChange={(tags: string[]) => setValue("tags", tags)}
                placeholder="Ajouter un tag..."
                withCard={false}
              />
            </AdminFormCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Visibility */}
            <AdminStatusVisibility
              status={watchedStatus}
              isPublic={watchedIsPublic}
              onStatusChange={(value) => setValue("status", value as QuestionStatus)}
              onIsPublicChange={(value: boolean) => setValue("isPublic", value)}
              statusOptions={STATUS_OPTIONS}
            />

            {/* Stats Card */}
            <AdminFormCard title="Statistiques" description="Performance de la question">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ops-tertiary">Réponses totales</span>
                  <span className="font-medium">{question.timesAnswered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ops-tertiary">Réponses correctes</span>
                  <span className="font-medium text-green-600">
                    {question.timesCorrect}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ops-tertiary">Taux de réussite</span>
                  <span className="font-medium">
                    {question.timesAnswered > 0
                      ? Math.round(
                          (question.timesCorrect / question.timesAnswered) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </AdminFormCard>

            {/* Actions */}
            <AdminFormActions
              cancelHref={ADMIN_ROUTES.QCM}
              isSubmitting={isSubmitting}
              submitLabel="Enregistrer les Modifications"
              loadingLabel="Enregistrement..."
            />
          </div>
        </div>
      </form>
    </div>
  );
}
