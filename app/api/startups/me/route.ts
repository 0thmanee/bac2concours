import { NextRequest } from "next/server";
import {
  handleApiRequest,
  getAuthenticatedUser,
  ApiError,
} from "@/lib/api-utils";
import { startupService } from "@/lib/services/startup.service";
import { USER_ROLE } from "@/lib/constants";

// GET /api/startups/me - Get student's startups
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();

    // Only students can access this endpoint
    if (user.role !== USER_ROLE.STUDENT) {
      throw new ApiError(403, "Only students can access their own startups");
    }

    // Get startups where the user is a student
    const startups = await startupService.findByStudentId(user.id);

    return startups;
  });
}
