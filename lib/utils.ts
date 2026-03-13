import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format city or cities for display: comma-separated string, safe for responsiveness.
 * Handles string (single city or "City1, City2"), array of cities, or null/undefined.
 */
export function formatCities(city: string | string[] | null | undefined): string {
  if (city == null) return "";
  if (Array.isArray(city)) {
    return city.filter(Boolean).map((c) => String(c).trim()).join(", ");
  }
  const s = String(city).trim();
  if (!s) return "";
  // Normalize existing comma-separated values (trim each part)
  return s.split(",").map((part) => part.trim()).filter(Boolean).join(", ");
}

/**
 * Return cities as an array (one item per city) for rendering tags.
 */
export function getCitiesArray(city: string | string[] | null | undefined): string[] {
  if (city == null) return [];
  if (Array.isArray(city)) {
    return city.filter(Boolean).map((c) => String(c).trim());
  }
  const s = String(city).trim();
  if (!s) return [];
  return s.split(",").map((part) => part.trim()).filter(Boolean);
}
