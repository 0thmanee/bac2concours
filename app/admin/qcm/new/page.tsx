"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X, ImageIcon, Type, FunctionSquare } from "lucide-react";
import { useCreateQuestion } from "@/lib/hooks/use-qcm";
import { useDropdownOptions } from "@/lib/hooks/use-settings-resources";
import { useSchoolsForDropdown } from "@/lib/hooks/use-schools";
import { useUploadFile } from "@/lib/hooks/use-files";
import {
  createQuestionSchema,
  type CreateQuestionInput,
  type QuestionOption,
  type OptionContentType,
} from "@/lib/validations/qcm.validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MathContent } from "@/components/shared/math-content";
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

export default function NewQuestionPage() {
  const router = useRouter();
  const createMutation = useCreateQuestion();
  const uploadFileMutation = useUploadFile();
  const { data: dropdownData, isLoading: isLoadingDropdowns } = useDropdownOptions();
  const { data: schoolsData, isLoading: isLoadingSchools } = useSchoolsForDropdown();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: nanoid(), text: "", contentType: "TEXT" },
    { id: nanoid(), text: "", contentType: "TEXT" },
  ]);
  const [optionImages, setOptionImages] = useState<Record<string, { file: File; preview: string }>>({});
  const [correctIds, setCorrectIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      text: "",
      options: [],
      correctIds: [],
      explanation: "",
      school: "",
      matiere: "",
      chapter: "",
      difficulty: QuestionDifficulty.MEDIUM,
      points: 1,
      timeLimit: undefined,
      status: QuestionStatus.ACTIVE,
      isPublic: true,
      tags: [],
    },
  });

  const watchedTags = (watch("tags") as string[]) || [];
  const watchedStatus = watch("status") || QuestionStatus.ACTIVE;
  const watchedIsPublic = watch("isPublic") ?? true;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
    setValue("imageFileId", undefined);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: nanoid(), text: "", contentType: "TEXT" }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
      setCorrectIds(correctIds.filter((cid) => cid !== id));
      // Clean up option image if exists
      if (optionImages[id]) {
        const newImages = { ...optionImages };
        delete newImages[id];
        setOptionImages(newImages);
      }
    }
  };

  const updateOptionText = (id: string, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const updateOptionContentType = (id: string, contentType: OptionContentType) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, contentType } : opt)));
  };

  const handleOptionImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOptionImages((prev) => ({
          ...prev,
          [id]: { file, preview: reader.result as string },
        }));
        // Update option text to file name as placeholder
        updateOptionText(id, file.name);
        updateOptionContentType(id, "IMAGE");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeOptionImage = (id: string) => {
    const newImages = { ...optionImages };
    delete newImages[id];
    setOptionImages(newImages);
    updateOptionContentType(id, "TEXT");
    updateOptionText(id, "");
  };

  const toggleCorrect = (id: string) => {
    if (correctIds.includes(id)) {
      setCorrectIds(correctIds.filter((cid) => cid !== id));
    } else {
      setCorrectIds([...correctIds, id]);
    }
  };

  const onSubmit = async (data: CreateQuestionInput) => {
    // Validate options - check for text or image
    const validOptions = options.filter((opt) => 
      opt.text.trim() !== "" || (opt.contentType === "IMAGE" && optionImages[opt.id])
    );
    if (validOptions.length < 2) {
      toast.error("Au moins 2 options sont requises");
      return;
    }

    if (correctIds.length === 0) {
      toast.error("Au moins une réponse correcte est requise");
      return;
    }

    // Validate that all correctIds are valid option IDs
    const validCorrectIds = correctIds.filter((id) =>
      validOptions.some((opt) => opt.id === id)
    );
    if (validCorrectIds.length === 0) {
      toast.error("Au moins une réponse correcte valide est requise");
      return;
    }

    try {
      // Upload question image if provided
      if (imageFile) {
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: imageFile,
          type: FileType.IMAGE,
          folder: "question-images",
        });
        data.imageFileId = uploadResult.data.id;
      }

      // Upload option images and update options with URLs
      const processedOptions = await Promise.all(
        validOptions.map(async (opt) => {
          if (opt.contentType === "IMAGE" && optionImages[opt.id]) {
            const uploadResult = await uploadFileMutation.mutateAsync({
              file: optionImages[opt.id].file,
              type: FileType.IMAGE,
              folder: "option-images",
            });
            return {
              ...opt,
              imageUrl: uploadResult.data.publicUrl,
              imageFileId: uploadResult.data.id,
            };
          }
          return opt;
        })
      );

      // Add options and correctIds to data
      data.options = processedOptions;
      data.correctIds = validCorrectIds;

      await createMutation.mutateAsync(data);
      toast.success("Question créée avec succès");
      router.push(ADMIN_ROUTES.QCM);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const matieres = dropdownData?.data?.matieres || [];
  const schools = schoolsData?.data?.schools?.map(s => s.name) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminFormHeader
        backLabel="Retour aux Questions"
        backHref={ADMIN_ROUTES.QCM}
        title="Nouvelle Question QCM"
        description="Créez une nouvelle question à choix multiples"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Text */}
            <AdminFormCard
              title="Question"
              description="Le texte de la question (supporte HTML pour les formules mathématiques)"
            >
              <div className="space-y-2">
                <Label htmlFor="text" className="text-sm font-medium">
                  Texte de la Question <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="text"
                  {...register("text")}
                  placeholder="Entrez votre question ici... (vous pouvez utiliser du HTML pour les formules)"
                  rows={4}
                  className="ops-input resize-none font-mono"
                />
                <p className="text-xs text-ops-tertiary">
                  Astuce: Utilisez &lt;math&gt; ou &lt;sup&gt;, &lt;sub&gt; pour les formules
                </p>
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
              description="Ajoutez les options (texte, formule mathématique ou image)"
            >
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-ops bg-ops-bg-secondary"
                  >
                    {/* Correct answer toggle */}
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

                    {/* Option content */}
                    <div className="flex-1 space-y-2">
                      {/* Content type selector */}
                      <div className="flex items-center gap-1 mb-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant={option.contentType === "TEXT" ? "default" : "outline"}
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => updateOptionContentType(option.id, "TEXT")}
                              >
                                <Type className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Texte simple</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant={option.contentType === "MATH" ? "default" : "outline"}
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => updateOptionContentType(option.id, "MATH")}
                              >
                                <FunctionSquare className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Formule mathématique (LaTeX)</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant={option.contentType === "IMAGE" ? "default" : "outline"}
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => updateOptionContentType(option.id, "IMAGE")}
                              >
                                <ImageIcon className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Image</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Content input based on type */}
                      {option.contentType === "IMAGE" ? (
                        optionImages[option.id] ? (
                          <div className="relative inline-block">
                            <Image
                              src={optionImages[option.id].preview}
                              alt={`Option ${index + 1}`}
                              width={160}
                              height={100}
                              className="rounded-md border border-ops object-contain max-h-24"
                              unoptimized
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-5 w-5"
                              onClick={() => removeOptionImage(option.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-ops rounded-lg cursor-pointer hover:border-[rgb(var(--brand-500))] transition-colors">
                            <div className="flex items-center gap-2 text-ops-tertiary">
                              <ImageIcon className="w-5 h-5" />
                              <span className="text-sm">Ajouter une image</span>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleOptionImageChange(option.id, e)}
                            />
                          </label>
                        )
                      ) : (
                        <div>
                          <Textarea
                            value={option.text}
                            onChange={(e) => updateOptionText(option.id, e.target.value)}
                            placeholder={
                              option.contentType === "MATH"
                                ? "Ex: \\frac{1}{2} + \\sqrt{x}"
                                : `Option ${index + 1}...`
                            }
                            rows={2}
                            className="ops-input resize-none font-mono text-sm"
                          />
                          {option.contentType === "MATH" && option.text && (
                            <div className="mt-2 p-2 bg-white rounded border border-ops">
                              <span className="text-xs text-ops-tertiary block mb-1">Aperçu:</span>
                              <MathContent
                                content={option.text}
                                contentType="MATH"
                                className="text-ops-primary"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
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

                <p className="text-xs text-ops-tertiary">
                  Cliquez sur le cercle pour marquer une option comme correcte.
                  Plusieurs réponses correctes sont possibles.
                </p>
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
                    École/Filière <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("school", value)} disabled={isLoadingSchools}>
                    <SelectTrigger id="school" className="ops-input h-9">
                      <SelectValue placeholder={isLoadingSchools ? "Chargement..." : "Sélectionner une filière"} />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {schools.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.school && (
                    <p className="text-xs text-destructive">
                      {errors.school.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matiere" className="text-sm font-medium">
                    Matière <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("matiere", value)} disabled={isLoadingDropdowns}>
                    <SelectTrigger id="matiere" className="ops-input h-9">
                      <SelectValue placeholder={isLoadingDropdowns ? "Chargement..." : "Sélectionner une matière"} />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {matieres.map((matiere) => (
                        <SelectItem key={matiere.value} value={matiere.value}>
                          {matiere.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.matiere && (
                    <p className="text-xs text-destructive">
                      {errors.matiere.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chapter" className="text-sm font-medium">
                    Chapitre{" "}
                    <span className="text-xs text-ops-tertiary">(Optionnel)</span>
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
                    defaultValue={QuestionDifficulty.MEDIUM}
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
                    Temps Limite (sec){" "}
                    <span className="text-xs text-ops-tertiary">(Optionnel)</span>
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

            {/* Actions */}
            <AdminFormActions
              cancelHref={ADMIN_ROUTES.QCM}
              isSubmitting={isSubmitting}
              submitLabel="Créer la Question"
              loadingLabel="Création..."
            />
          </div>
        </div>
      </form>
    </div>
  );
}
