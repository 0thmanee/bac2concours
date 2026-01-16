import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { googleDriveService } from "@/lib/services/google-drive.service";

/**
 * GET /api/drive - Get Google Drive folder info and permissions
 */
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    if (!googleDriveService.isConfigured()) {
      return {
        configured: false,
        message: "Google Drive integration is not configured",
      };
    }

    const [folderInfo, permissions] = await Promise.all([
      googleDriveService.getFolderInfo(),
      googleDriveService.listPermissions(),
    ]);

    return {
      configured: true,
      folder: folderInfo,
      permissions,
      permissionCount: permissions.length,
    };
  });
}
