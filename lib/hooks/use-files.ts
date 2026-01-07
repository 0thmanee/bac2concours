/**
 * React Query Hooks for File Operations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FileType } from "@/lib/enums";

interface UploadFileParams {
  file: File;
  type: FileType;
  folder?: string;
  metadata?: Record<string, any>;
}

interface UploadFileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    filename: string;
    publicUrl: string;
    mimeType: string;
    size: number;
    type: FileType;
  };
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, type, folder, metadata }: UploadFileParams) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      if (folder) formData.append("folder", folder);
      if (metadata) formData.append("metadata", JSON.stringify(metadata));

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json() as Promise<UploadFileResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Delete failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}
