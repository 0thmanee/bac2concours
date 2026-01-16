import { z } from "zod";
import { USER_ROLE, USER_STATUS } from "@/lib/constants";

// User role enum schema
export const userRoleSchema = z.enum([USER_ROLE.ADMIN, USER_ROLE.STUDENT]);

// User status enum schema
export const userStatusSchema = z.enum([
  USER_STATUS.ACTIVE,
  USER_STATUS.INACTIVE,
]);

// User query params schema (with pagination)
export const userQueryParamsSchema = z.object({
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(1000).default(10),
});

// UI Filter state schema (for frontend state)
export const userUIFiltersSchema = z.object({
  search: z.string().default(""),
  role: z.string().default(""),
  status: z.string().default(""),
});

// Create user schema
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: userRoleSchema,
  status: userStatusSchema.optional(),
});

// Update user schema
export const updateUserSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    role: userRoleSchema.optional(),
    status: userStatusSchema.optional(),
  })
  .refine(
    (data) => {
      // If password is provided and not empty, it must be at least 8 characters
      if (data.password !== undefined && data.password !== "") {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    }
  )
  .transform((data) => {
    // Transform empty string to undefined so it's not sent to the API
    if (data.password === "") {
      return { ...data, password: undefined };
    }
    return data;
  });

export const userMetricsSchema = z.object({
  totalCount: z.number(),
  adminCount: z.number(),
  studentCount: z.number(),
  activeCount: z.number(),
  verifiedCount: z.number(),
});

// Profile update schema (for current user - no role/status changes)
export const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is provided and not empty, it must be at least 8 characters
      if (data.password !== undefined && data.password !== "") {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    }
  )
  .transform((data) => {
    // Transform empty string to undefined so it's not sent to the API
    if (data.password === "") {
      return { ...data, password: undefined };
    }
    return data;
  });

// Type exports
export const userWithCountSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: userRoleSchema,
  status: userStatusSchema,
  emailVerified: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserRoleInput = z.infer<typeof userRoleSchema>;
export type UserStatusInput = z.infer<typeof userStatusSchema>;
export type UserQueryParams = z.infer<typeof userQueryParamsSchema>;
export type UserUIFilters = z.infer<typeof userUIFiltersSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserMetrics = z.infer<typeof userMetricsSchema>;
export type UserWithCount = z.infer<typeof userWithCountSchema>;
