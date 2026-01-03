import { NextRequest } from "next/server";
import {
  handleApiRequest,
  getAuthenticatedUser,
  ApiError,
} from "@/lib/api-utils";
import { startupService } from "@/lib/services/startup.service";
import { USER_ROLE } from "@/lib/constants";

// GET /api/startups/me - Get founder's startups
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();

    // Only founders can access this endpoint
    if (user.role !== USER_ROLE.FOUNDER) {
      throw new ApiError(403, "Only founders can access their own startups");
    }

    // Get startups where the user is a founder
    const startups = await startupService.findByFounderId(user.id);

    return startups;
  });
}
