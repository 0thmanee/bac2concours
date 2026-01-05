/**
 * Error utilities
 * Functions for error handling and formatting
 */

import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";

/**
 * Format ZodError into a user-friendly message
 * Returns the first error message for display in toast
 *
 * This function extracts the first issue's message from a ZodError.
 * Since our validation schemas already define user-friendly messages in French,
 * we simply return those messages directly.
 */
export function formatZodError(error: ZodError): string {
  const issues = error.issues;

  if (!issues || issues.length === 0) {
    return "Données invalides";
  }

  // Get the first issue's message
  const firstIssue = issues[0];
  const message = firstIssue.message;

  // If the message looks technical (from Zod defaults), create a user-friendly one
  if (
    message.includes("Expected") ||
    message.includes("Received") ||
    message === "Required"
  ) {
    const path = firstIssue.path.join(" > ");
    if (path) {
      return `Le champ "${path}" est invalide`;
    }
    return "Données invalides";
  }

  // Otherwise, return the message from our validation schema (already user-friendly)
  return message;
}

/**
 * Format ZodError into an array of user-friendly messages
 * Useful for displaying all errors
 */
export function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const message = issue.message;

    if (
      message.includes("Expected") ||
      message.includes("Received") ||
      message === "Required"
    ) {
      const path = issue.path.join(" > ");
      if (path) {
        return `Le champ "${path}" est invalide`;
      }
      return "Données invalides";
    }

    return message;
  });
}

/**
 * Safe error message extractor
 * Ensures no technical details leak to users
 */
export function getErrorMessage(error: unknown): string {
  // Handle ZodError specifically
  if (error instanceof ZodError) {
    return formatZodError(error);
  }

  // Handle Error instances
  if (error instanceof Error) {
    const message = error.message;

    // List of patterns that indicate technical/dev errors
    const technicalPatterns = [
      /prisma/i,
      /database/i,
      /sql/i,
      /connection/i,
      /timeout/i,
      /ECONNREFUSED/i,
      /ENOTFOUND/i,
      /undefined is not/i,
      /cannot read propert/i,
      /is not a function/i,
      /unexpected token/i,
      /syntax error/i,
      /stack trace/i,
      /at .+:\d+:\d+/,
      /\.ts:\d+/,
      /\.js:\d+/,
    ];

    const isTechnical = technicalPatterns.some((pattern) =>
      pattern.test(message)
    );

    if (isTechnical) {
      return MESSAGES.ERROR.GENERIC;
    }

    return message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle API response errors
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    if (typeof obj.error === "string") {
      return obj.error;
    }
    if (typeof obj.message === "string") {
      return obj.message;
    }
  }

  return MESSAGES.ERROR.GENERIC;
}

/**
 * Not Found Error class
 */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} non trouvé(e)`);
    this.name = "NotFoundError";
  }
}

/**
 * Validation Error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
