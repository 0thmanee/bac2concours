import { NextRequest } from "next/server";
import {
  handleApiRequest,
  getAuthenticatedUser,
  ApiError,
} from "@/lib/api-utils";
import { progressService } from "@/lib/services/progress.service";
import { USER_ROLE, MESSAGES } from "@/lib/constants";

// GET /api/progress/[id] - Get single progress update
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const update = await progressService.findById(id);

    if (!update) {
      throw new ApiError(404, MESSAGES.ERROR.PROGRESS_NOT_FOUND);
    }

    // Founders can only view their own progress updates
    if (user.role === USER_ROLE.FOUNDER && update.submittedById !== user.id) {
      throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
    }

    return update;
  });
}
