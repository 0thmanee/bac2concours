import { z } from "zod";

// Password validation schema (reusable)
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Register schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: passwordSchema,
});

// Login schema - login validation can be less strict since we just need to match DB
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Reset password schema for form (includes confirmPassword)
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Reset password API schema (includes token, excludes confirmPassword)
export const resetPasswordApiSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordSchema,
});

// Resend verification schema
export const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Response schemas for API responses
export const registerResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    status: z.string(),
    createdAt: z.string(),
  }),
  requiresVerification: z.boolean(),
});

export const verifyEmailResponseSchema = z.object({
  message: z.string(),
  email: z.string(),
});

export const messageResponseSchema = z.object({
  message: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.unknown()).optional(),
});

// Verify email request schema
export const verifyEmailRequestSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordApiInput = z.infer<typeof resetPasswordApiSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
