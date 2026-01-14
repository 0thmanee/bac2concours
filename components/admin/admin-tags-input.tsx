"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { AdminFormCard } from "./admin-form-card";

interface AdminTagsInputProps {
  /** Current tags array */
  tags: string[];
  /** Handler for tags change */
  onChange: (tags: string[]) => void;
  /** Label for the add input (default: "Ajouter une Étiquette") */
  inputLabel?: string;
  /** Placeholder for the add input */
  placeholder?: string;
  /** Help text shown below the tags */
  helpText?: string;
  /** Whether to show in a card wrapper (default: true) */
  withCard?: boolean;
  /** Card title when using withCard */
  cardTitle?: string;
  /** Card description when using withCard */
  cardDescription?: string;
}

/**
 * Reusable tags input component for admin forms.
 * Supports adding/removing tags with consistent styling.
 */
export function AdminTagsInput({
  tags,
  onChange,
  inputLabel = "Ajouter une Étiquette",
  placeholder = "ex: cours, exercices, bac",
  helpText,
  withCard = true,
  cardTitle = "Étiquettes",
  cardDescription = "Ajoutez des mots-clés pour faciliter la recherche",
}: AdminTagsInputProps) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const content = (
    <>
      <div className="space-y-2">
        <Label htmlFor="add-tag" className="text-sm font-medium">
          {inputLabel}
        </Label>
        <div className="flex gap-2">
          <Input
            id="add-tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="ops-input h-9"
          />
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Étiquettes Ajoutées</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-brand-700 border border-brand-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-error transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {helpText && (
        <p className="text-xs text-ops-tertiary">{helpText}</p>
      )}
    </>
  );

  if (withCard) {
    return (
      <AdminFormCard title={cardTitle} description={cardDescription}>
        {content}
      </AdminFormCard>
    );
  }

  return <div className="space-y-4">{content}</div>;
}
