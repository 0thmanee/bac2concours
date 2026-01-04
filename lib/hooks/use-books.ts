import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateBookInput,
  UpdateBookInput,
  BookFilters,
  BookStats,
  BookFilterOptions,
} from "@/lib/validations/book.validation";
import type { BookWithRelations, ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";
import { buildSearchParams } from "@/lib/utils/filter.utils";

// Re-export query keys for convenience
export const bookKeys = {
  all: QUERY_KEYS.BOOKS.ALL,
  lists: QUERY_KEYS.BOOKS.LISTS,
  list: QUERY_KEYS.BOOKS.LIST,
  details: QUERY_KEYS.BOOKS.DETAILS,
  detail: QUERY_KEYS.BOOKS.DETAIL,
  stats: QUERY_KEYS.BOOKS.STATS,
  filters: QUERY_KEYS.BOOKS.FILTERS,
};

// Paginated books response type
export interface BooksResponse {
  books: BookWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all books with optional filtering and pagination
 */
export function useBooks(filters?: Partial<BookFilters>) {
  return useQuery<ApiSuccessResponse<BooksResponse>>({
    queryKey: bookKeys.list(filters),
    queryFn: () => {
      const params = buildSearchParams(
        {
          search: filters?.search,
          category: filters?.category,
          school: filters?.school,
          level: filters?.level,
          subject: filters?.subject,
          status: filters?.status,
          isPublic: filters?.isPublic,
          tags: filters?.tags,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
        { page: filters?.page || 1, limit: filters?.limit || 10 }
      );
      return apiClient.get<ApiSuccessResponse<BooksResponse>>(
        `${API_ROUTES.BOOKS}?${params.toString()}`
      );
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get a single book by ID
 */
export function useBook(id: string | null) {
  return useQuery<ApiSuccessResponse<BookWithRelations>>({
    queryKey: bookKeys.detail(id!),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<BookWithRelations>>(
        API_ROUTES.BOOK(id!)
      ),
    enabled: !!id,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get related books (same category or level)
 */
export function useRelatedBooks(id: string | null) {
  return useQuery<ApiSuccessResponse<BookWithRelations[]>>({
    queryKey: [...bookKeys.detail(id!), "related"],
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<BookWithRelations[]>>(
        `${API_ROUTES.BOOK(id!)}/related`
      ),
    enabled: !!id,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get book statistics (Admin only)
 */
export function useBookStats() {
  return useQuery<ApiSuccessResponse<BookStats>>({
    queryKey: bookKeys.stats(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<BookStats>>(API_ROUTES.BOOKS_STATS),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get filter options
 */
export function useBookFilters() {
  return useQuery<ApiSuccessResponse<BookFilterOptions>>({
    queryKey: bookKeys.filters(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<BookFilterOptions>>(
        API_ROUTES.BOOKS_FILTERS
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Create a new book (Admin only)
 */
export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookInput) =>
      apiClient.post<ApiSuccessResponse<BookWithRelations>>(
        API_ROUTES.BOOKS,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookKeys.stats() });
      queryClient.invalidateQueries({ queryKey: bookKeys.filters() });
    },
  });
}

/**
 * Update a book (Admin only)
 */
export function useUpdateBook(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBookInput) =>
      apiClient.patch<ApiSuccessResponse<BookWithRelations>>(
        API_ROUTES.BOOK(id),
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookKeys.stats() });
      queryClient.invalidateQueries({ queryKey: bookKeys.filters() });
    },
  });
}

/**
 * Delete a book (Admin only)
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<ApiSuccessResponse<void>>(API_ROUTES.BOOK(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookKeys.stats() });
    },
  });
}

/**
 * Increment book counter (download or view)
 */
export function useIncrementBookCounter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type: "download" | "view") =>
      apiClient.post<ApiSuccessResponse<BookWithRelations>>(
        API_ROUTES.BOOK_COUNTER(id),
        { type }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookKeys.stats() });
    },
  });
}
