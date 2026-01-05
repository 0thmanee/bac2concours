import { User, Book, File } from "@prisma/client";

// Book with relations (as returned by bookService.findById)
export type BookWithRelations = Book & {
  uploadedBy?: Pick<User, "id" | "name" | "email">;
  coverFile?: File | null;
};

// User with minimal fields (as used in selects)
export type UserSelect = Pick<User, "id" | "name" | "email">;

// Re-export Prisma enums for convenience
export { UserRole } from "@prisma/client";

// API Response types (matching api-utils.ts successResponse format)
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
