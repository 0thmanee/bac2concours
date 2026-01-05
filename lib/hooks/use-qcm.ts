import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionFilters,
  QuestionStats,
  QuestionFilterOptions,
  StartQuizInput,
  SubmitQuizInput,
  QuizHistoryFilters,
  QuizResult,
} from "@/lib/validations/qcm.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";
import { buildSearchParams } from "@/lib/utils/filter.utils";
import type {
  Question,
  QuizAttempt,
  QuizAnswer,
  User,
  File,
} from "@prisma/client";

// ============================================================
// TYPES
// ============================================================

export type QuestionWithRelations = Question & {
  uploadedBy?: Pick<User, "id" | "name" | "email">;
  imageFile?: File | null;
};

export type QuizAttemptWithAnswers = QuizAttempt & {
  answers: (QuizAnswer & {
    question: Pick<
      Question,
      | "id"
      | "text"
      | "options"
      | "correctIds"
      | "explanation"
      | "school"
      | "matiere"
      | "chapter"
      | "difficulty"
      | "points"
    >;
  })[];
};

// Random question type (without correctIds for quiz taking)
export interface QuizQuestion {
  id: string;
  text: string;
  options: Array<{ id: string; text: string; imageUrl?: string | null }>;
  school: string;
  matiere: string;
  chapter: string | null;
  difficulty: string;
  points: number;
  timeLimit: number | null;
  imageFileId: string | null;
}

// ============================================================
// QUERY KEYS
// ============================================================

export const questionKeys = {
  all: QUERY_KEYS.QUESTIONS.ALL,
  lists: QUERY_KEYS.QUESTIONS.LISTS,
  list: QUERY_KEYS.QUESTIONS.LIST,
  details: QUERY_KEYS.QUESTIONS.DETAILS,
  detail: QUERY_KEYS.QUESTIONS.DETAIL,
  stats: QUERY_KEYS.QUESTIONS.STATS,
  filters: QUERY_KEYS.QUESTIONS.FILTERS,
};

export const quizKeys = {
  all: QUERY_KEYS.QUIZ.ALL,
  random: QUERY_KEYS.QUIZ.RANDOM,
  history: QUERY_KEYS.QUIZ.HISTORY,
  historyList: QUERY_KEYS.QUIZ.HISTORY_LIST,
  attempt: QUERY_KEYS.QUIZ.ATTEMPT,
  filters: QUERY_KEYS.QUIZ.FILTERS,
  matieres: QUERY_KEYS.QUIZ.MATIERES,
  count: QUERY_KEYS.QUIZ.COUNT,
};

// ============================================================
// QUESTION HOOKS
// ============================================================

interface QuestionsResponse {
  questions: QuestionWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all questions with optional filtering and pagination
 */
export function useQuestions(filters?: Partial<QuestionFilters>) {
  return useQuery<ApiSuccessResponse<QuestionsResponse>>({
    queryKey: questionKeys.list(filters),
    queryFn: () => {
      const params = buildSearchParams(
        {
          search: filters?.search,
          school: filters?.school,
          matiere: filters?.matiere,
          chapter: filters?.chapter,
          difficulty: filters?.difficulty,
          status: filters?.status,
          isPublic: filters?.isPublic,
          tags: filters?.tags,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
        { page: filters?.page || 1, limit: filters?.limit || 10 }
      );
      return apiClient.get<ApiSuccessResponse<QuestionsResponse>>(
        `${API_ROUTES.QUESTIONS}?${params.toString()}`
      );
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get a single question by ID
 */
export function useQuestion(id: string | null) {
  return useQuery<ApiSuccessResponse<QuestionWithRelations>>({
    queryKey: questionKeys.detail(id!),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<QuestionWithRelations>>(
        API_ROUTES.QUESTION(id!)
      ),
    enabled: !!id,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get question statistics (Admin only)
 */
export function useQuestionStats() {
  return useQuery<ApiSuccessResponse<QuestionStats>>({
    queryKey: questionKeys.stats(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<QuestionStats>>(
        API_ROUTES.QUESTIONS_STATS
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get question filter options
 */
export function useQuestionFilterOptions() {
  return useQuery<ApiSuccessResponse<QuestionFilterOptions>>({
    queryKey: questionKeys.filters(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<QuestionFilterOptions>>(
        API_ROUTES.QUESTIONS_FILTERS
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Create a new question (Admin only)
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionInput) =>
      apiClient.post<ApiSuccessResponse<QuestionWithRelations>>(
        API_ROUTES.QUESTIONS,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.stats() });
      queryClient.invalidateQueries({ queryKey: questionKeys.filters() });
      queryClient.invalidateQueries({ queryKey: quizKeys.filters() });
    },
  });
}

/**
 * Update a question (Admin only)
 */
export function useUpdateQuestion(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateQuestionInput) =>
      apiClient.patch<ApiSuccessResponse<QuestionWithRelations>>(
        API_ROUTES.QUESTION(id),
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: questionKeys.stats() });
      queryClient.invalidateQueries({ queryKey: questionKeys.filters() });
    },
  });
}

/**
 * Delete a question (Admin only)
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<ApiSuccessResponse<void>>(API_ROUTES.QUESTION(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.stats() });
      queryClient.invalidateQueries({ queryKey: questionKeys.filters() });
      queryClient.invalidateQueries({ queryKey: quizKeys.filters() });
    },
  });
}

// ============================================================
// QUIZ HOOKS
// ============================================================

interface QuizFilterOptions {
  schools: string[];
  matieres: string[];
}

interface QuizHistoryResponse {
  attempts: QuizAttempt[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get quiz filter options (schools and matieres with questions)
 */
export function useQuizFilterOptions() {
  return useQuery<ApiSuccessResponse<QuizFilterOptions>>({
    queryKey: quizKeys.filters(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<QuizFilterOptions>>(
        API_ROUTES.QUIZ_FILTERS
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Get available matieres for a specific school
 */
export function useQuizMatieres(school: string | null) {
  return useQuery<ApiSuccessResponse<string[]>>({
    queryKey: quizKeys.matieres(school!),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<string[]>>(
        API_ROUTES.QUIZ_MATIERES(school!)
      ),
    enabled: !!school,
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Get question count for school/matiere combination
 */
export function useQuizQuestionCount(
  school: string | null,
  matiere: string | null
) {
  return useQuery<ApiSuccessResponse<{ count: number }>>({
    queryKey: quizKeys.count(school!, matiere!),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<{ count: number }>>(
        API_ROUTES.QUIZ_COUNT(school!, matiere!)
      ),
    enabled: !!school && !!matiere,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.CACHE_TIME.SHORT,
  });
}

/**
 * Start a quiz (get random questions)
 */
export function useStartQuiz() {
  return useMutation({
    mutationFn: (data: StartQuizInput) =>
      apiClient.post<ApiSuccessResponse<QuizQuestion[]>>(
        API_ROUTES.QUIZ_START,
        data
      ),
  });
}

/**
 * Submit quiz answers
 */
export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitQuizInput) =>
      apiClient.post<ApiSuccessResponse<QuizResult>>(
        API_ROUTES.QUIZ_SUBMIT,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.history() });
    },
  });
}

/**
 * Get quiz history for current user
 */
export function useQuizHistory(filters?: Partial<QuizHistoryFilters>) {
  return useQuery<ApiSuccessResponse<QuizHistoryResponse>>({
    queryKey: quizKeys.historyList(filters),
    queryFn: () => {
      const params = buildSearchParams(
        {
          school: filters?.school,
          matiere: filters?.matiere,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
        { page: filters?.page || 1, limit: filters?.limit || 10 }
      );
      return apiClient.get<ApiSuccessResponse<QuizHistoryResponse>>(
        `${API_ROUTES.QUIZ_HISTORY}?${params.toString()}`
      );
    },
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.CACHE_TIME.SHORT,
  });
}

/**
 * Get a specific quiz attempt with answers
 */
export function useQuizAttempt(attemptId: string | null) {
  return useQuery<ApiSuccessResponse<QuizAttemptWithAnswers>>({
    queryKey: quizKeys.attempt(attemptId!),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<QuizAttemptWithAnswers>>(
        API_ROUTES.QUIZ_ATTEMPT(attemptId!)
      ),
    enabled: !!attemptId,
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}
