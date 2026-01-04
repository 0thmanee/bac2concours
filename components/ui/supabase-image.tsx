/**
 * Supabase Image Component
 * Wrapper around Next.js Image that bypasses optimization for Supabase URLs
 * to avoid private IP resolution errors in development
 */

import Image, { ImageProps } from "next/image";

interface SupabaseImageProps extends Omit<ImageProps, "src"> {
  src: string;
}

export function SupabaseImage({ src, ...props }: SupabaseImageProps) {
  // Check if it's a Supabase URL
  const isSupabaseUrl = src.includes("supabase.co");

  if (isSupabaseUrl) {
    // Use unoptimized for Supabase images to bypass private IP check
    return <Image src={src} unoptimized {...props} />;
  }

  // Use normal Next.js Image optimization for other sources
  return <Image src={src} {...props} />;
}
