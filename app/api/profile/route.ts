import { NextRequest } from "next/server";
import { handleApiRequest, getAuthenticatedUser, ApiError } from "@/lib/api-utils";
import { userService } from "@/lib/services/user.service";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/user.validation";
import { MESSAGES } from "@/lib/constants";

// GET /api/profile - Get current user's profile
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();
    const profile = await userService.findById(user.id);
    
    if (!profile) {
      throw new ApiError(404, MESSAGES.ERROR.USER_NOT_FOUND);
    }

    return profile;
  });
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const validated = updateProfileSchema.parse(body) as UpdateProfileInput;

    try {
      // UpdateProfileInput is compatible with UpdateUserInput (subset of fields)
      const updated = await userService.update(user.id, validated);
      return updated;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already taken") || error.message.includes("already exists")) {
          throw new ApiError(400, MESSAGES.ERROR.EMAIL_ALREADY_EXISTS);
        }
      }
      throw error;
    }
  });
}
