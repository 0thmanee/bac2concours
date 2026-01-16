import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, API_ROUTES } from "@/lib/constants";
import type { ApiSuccessResponse } from "@/lib/types/prisma";

// Types
export interface DrivePermission {
  id: string;
  email: string;
  role: string;
  type: string;
  displayName?: string;
}

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink: string;
}

export interface DriveInfoResponse {
  configured: boolean;
  message?: string;
  folder?: DriveFolderInfo;
  permissions?: DrivePermission[];
  permissionCount?: number;
}

export interface GrantAccessInput {
  role: "reader" | "commenter" | "writer";
  userIds?: string[];
  targetUsers?: "all" | "approved" | "active";
  sendNotification?: boolean;
  emailMessage?: string;
}

export interface GrantAccessResult {
  success: boolean;
  message: string;
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  failedEmails?: Array<{ email: string; error: string }>;
}

export interface RevokeAccessInput {
  email: string;
}

// Query keys
export const driveKeys = {
  all: QUERY_KEYS.DRIVE.ALL,
  info: QUERY_KEYS.DRIVE.INFO,
};

/**
 * Hook to get Drive folder info and permissions
 */
export function useDriveInfo() {
  return useQuery<ApiSuccessResponse<DriveInfoResponse>>({
    queryKey: driveKeys.info(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<DriveInfoResponse>>(API_ROUTES.DRIVE),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to grant access to Drive folder
 */
export function useGrantDriveAccess() {
  const queryClient = useQueryClient();

  return useMutation<ApiSuccessResponse<GrantAccessResult>, Error, GrantAccessInput>({
    mutationFn: (data) =>
      apiClient.post<ApiSuccessResponse<GrantAccessResult>>(
        API_ROUTES.DRIVE_GRANT_ACCESS,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driveKeys.info() });
    },
  });
}

/**
 * Hook to revoke access from Drive folder
 */
export function useRevokeDriveAccess() {
  const queryClient = useQueryClient();

  return useMutation<ApiSuccessResponse<{ success: boolean; message: string }>, Error, RevokeAccessInput>({
    mutationFn: (data) =>
      apiClient.post<ApiSuccessResponse<{ success: boolean; message: string }>>(
        API_ROUTES.DRIVE_REVOKE_ACCESS,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driveKeys.info() });
    },
  });
}
