import { z } from "zod";

// Create category schema
export const createCategorySchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    isActive: z.boolean().optional().default(true),
  })
  .refine((data) => data.isActive !== undefined, {
    message: "isActive is required",
  });

// Update category schema
export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

// Category query params schema
export const categoryQueryParamsSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export const categoryMetricsSchema = z.object({
  totalCount: z.number(),
  activeCount: z.number(),
  inactiveCount: z.number(),
  totalExpensesCount: z.number(),
});

// Type exports
export const categoryWithCountSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z
    .object({
      expenses: z.number(),
    })
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryParams = z.infer<typeof categoryQueryParamsSchema>;
export type CategoryMetrics = z.infer<typeof categoryMetricsSchema>;
export type CategoryWithCount = z.infer<typeof categoryWithCountSchema>;
