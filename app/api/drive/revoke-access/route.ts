import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { googleDriveService } from "@/lib/services/google-drive.service";

// Validation schema for revoke access request
const revokeAccessSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * POST /api/drive/revoke-access - Revoke folder access for a user
 */
export async function POST(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    if (!googleDriveService.isConfigured()) {
      throw new Error("Google Drive integration is not configured");
    }

    const body = await req.json();
    const { email } = revokeAccessSchema.parse(body);

    const result = await googleDriveService.revokeAccess(email);

    if (!result.success) {
      throw new Error(result.error || "Failed to revoke access");
    }

    return {
      success: true,
      message: `Access revoked for ${email}`,
    };
  });
}
