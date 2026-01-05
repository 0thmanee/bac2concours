import { z } from "zod";
import { QuestionDifficulty, QuestionStatus } from "@prisma/client";

/**
 * QCM validation schemas - Source of truth for all question/quiz types
 */

// Enums
export const questionDifficultySchema = z.nativeEnum(QuestionDifficulty);
export const questionStatusSchema = z.nativeEnum(QuestionStatus);

// Option content type enum
export const optionContentTypeSchema = z
  .enum(["TEXT", "IMAGE", "MATH"])
  .default("TEXT");
export type OptionContentType = z.infer<typeof optionContentTypeSchema>;

// Option schema (for question options)
export const questionOptionSchema = z.object({
  id: z.string().min(1, "Option ID is required"),
  text: z.string().min(1, "Option text is required"), // Plain text or LaTeX for math
  contentType: optionContentTypeSchema, // TEXT, IMAGE, or MATH
  imageUrl: z.string().url().optional().nullable(),
  imageFileId: z.string().optional().nullable(), // For uploaded images
});

// ============================================================
// QUESTION SCHEMAS
// ============================================================

// Create question schema
export const createQuestionSchema = z.object({
  text: z
    .string()
    .min(1, "Le texte de la question est requis")
    .max(5000, "Le texte est trop long"),
  options: z
    .array(questionOptionSchema)
    .min(2, "Au moins 2 options sont requises")
    .max(10, "Maximum 10 options"),
  correctIds: z
    .array(z.string())
    .min(1, "Au moins une réponse correcte est requise"),
  explanation: z.string().max(2000).optional().nullable(),
  school: z.string().min(1, "L'école/filière est requise"),
  matiere: z.string().min(1, "La matière est requise"),
  chapter: z.string().max(200).optional().nullable(),
  difficulty: questionDifficultySchema.default(QuestionDifficulty.MEDIUM),
  imageFileId: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).default([]),
  points: z.number().int().min(1).max(100).default(1),
  timeLimit: z.number().int().min(10).max(600).optional().nullable(),
  status: questionStatusSchema.default(QuestionStatus.ACTIVE),
  isPublic: z.boolean().default(true),
});

// Update question schema
export const updateQuestionSchema = z.object({
  text: z.string().min(1).max(5000).optional(),
  options: z.array(questionOptionSchema).min(2).max(10).optional(),
  correctIds: z.array(z.string()).min(1).optional(),
  explanation: z.string().max(2000).optional().nullable(),
  school: z.string().min(1).optional(),
  matiere: z.string().min(1).optional(),
  chapter: z.string().max(200).optional().nullable(),
  difficulty: questionDifficultySchema.optional(),
  imageFileId: z.string().optional().nullable(),
  tags: z.array(z.string().max(50)).optional(),
  points: z.number().int().min(1).max(100).optional(),
  timeLimit: z.number().int().min(10).max(600).optional().nullable(),
  status: questionStatusSchema.optional(),
  isPublic: z.boolean().optional(),
});

// Question filters schema
export const questionFiltersSchema = z.object({
  search: z.string().optional(),
  school: z.string().optional(),
  matiere: z.string().optional(),
  chapter: z.string().optional(),
  difficulty: questionDifficultySchema.optional(),
  status: questionStatusSchema.optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["createdAt", "text", "difficulty", "timesAnswered"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================
// QUIZ SCHEMAS
// ============================================================

// Start quiz schema (get random questions)
export const startQuizSchema = z.object({
  school: z.string().min(1, "L'école/filière est requise"),
  matiere: z.string().min(1, "La matière est requise"),
  questionCount: z.number().int().min(1).max(50).default(20),
});

// Quiz answer schema (single question answer)
export const quizAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedIds: z.array(z.string()),
  timeSpent: z.number().int().min(0).optional(),
});

// Submit quiz schema
export const submitQuizSchema = z.object({
  school: z.string().min(1),
  matiere: z.string().min(1),
  answers: z.array(quizAnswerSchema).min(1, "Au moins une réponse est requise"),
  totalTimeSpent: z.number().int().min(0).optional(),
});

// Quiz history filters
export const quizHistoryFiltersSchema = z.object({
  school: z.string().optional(),
  matiere: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
  sortBy: z.enum(["createdAt", "score", "percentage"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type QuestionFilters = z.infer<typeof questionFiltersSchema>;
export type QuestionOption = z.infer<typeof questionOptionSchema>;

export type StartQuizInput = z.infer<typeof startQuizSchema>;
export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
export type QuizHistoryFilters = z.infer<typeof quizHistoryFiltersSchema>;

export type QuestionDifficultyType = z.infer<typeof questionDifficultySchema>;
export type QuestionStatusType = z.infer<typeof questionStatusSchema>;

// Filter options type
export interface QuestionFilterOptions {
  schools: string[];
  matieres: string[];
  chapters: string[];
  difficulties: QuestionDifficulty[];
}

// Quiz stats type
export interface QuestionStats {
  totalQuestions: number;
  activeQuestions: number;
  questionsBySchool: Record<string, number>;
  questionsByMatiere: Record<string, number>;
  questionsByDifficulty: Record<string, number>;
  averageSuccessRate: number;
}

// Quiz result type
export interface QuizResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  timeSpent: number | null;
  school: string;
  matiere: string;
}
