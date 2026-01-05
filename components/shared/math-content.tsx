"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { OptionContentType } from "@/lib/validations/qcm.validation";

interface MathContentProps {
  content: string;
  contentType?: OptionContentType;
  imageUrl?: string | null;
  className?: string;
  displayMode?: boolean; // true for block display, false for inline
}

/**
 * Renders content that can be text, math (LaTeX), or an image
 * - TEXT: Renders as plain text
 * - MATH: Renders LaTeX using KaTeX
 * - IMAGE: Renders an image with the text as alt text
 */
export function MathContent({
  content,
  contentType = "TEXT",
  imageUrl,
  className,
  displayMode = false,
}: MathContentProps) {
  const renderedContent = useMemo(() => {
    if (contentType === "IMAGE" && imageUrl) {
      return null; // Will render image below
    }

    if (contentType === "MATH") {
      try {
        const html = katex.renderToString(content, {
          displayMode,
          throwOnError: false,
          errorColor: "#ef4444",
          trust: true,
          strict: false,
        });
        return html;
      } catch {
        // Fallback to plain text if KaTeX fails
        return null;
      }
    }

    return null; // TEXT type, will render directly
  }, [content, contentType, imageUrl, displayMode]);

  if (contentType === "IMAGE" && imageUrl) {
    return (
      <div className={cn("relative", className)}>
        <Image
          src={imageUrl}
          alt={content || "Option image"}
          width={200}
          height={120}
          className="rounded-md object-contain max-h-32"
          unoptimized
        />
      </div>
    );
  }

  if (contentType === "MATH" && renderedContent) {
    return (
      <span
        className={cn("katex-content", className)}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    );
  }

  // Default: TEXT
  return <span className={className}>{content}</span>;
}

/**
 * Hook to parse mixed content with inline math
 * Supports $...$ for inline math and $$...$$ for display math
 */
export function useParseMixedContent(text: string): string {
  return useMemo(() => {
    if (!text) return "";
    
    // Replace $$...$$ with display math
    let result = text.replace(/\$\$(.*?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return `$$${math}$$`;
      }
    });

    // Replace $...$ with inline math
    result = result.replace(/\$(.*?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `$${math}$`;
      }
    });

    return result;
  }, [text]);
}

/**
 * Component that renders text with mixed content (text + inline math)
 * Use $...$ for inline math and $$...$$ for display math
 */
export function MixedMathContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const renderedHtml = useParseMixedContent(content);

  return (
    <span
      className={cn("mixed-math-content", className)}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
