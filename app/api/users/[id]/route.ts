import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin, ApiError } from "@/lib/api-utils";
import { userService } from "@/lib/services/user.service";
import { notificationService } from "@/lib/services/notification.service";
import { updateUserSchema } from "@/lib/validations/user.validation";
import { MESSAGES, USER_STATUS } from "@/lib/constants";

// GET /api/users/[id] - Get single user (Admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const { id } = await params;
    const user = await userService.findById(id);

    if (!user) {
      throw new ApiError(
        404,
        MESSAGES.ERROR.USER_NOT_FOUND || "User not found"
      );
    }

    return user;
  });
}

// PATCH /api/users/[id] - Update user (Admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const { id } = await params;
    const body = await req.json();
    const validated = updateUserSchema.parse(body);

    // Get current user state to check if status changed
    const existingUser = await userService.findById(id);
    if (!existingUser) {
      throw new ApiError(
        404,
        MESSAGES.ERROR.USER_NOT_FOUND || "User not found"
      );
    }

    try {
      const user = await userService.update(id, validated);

      // Check if status changed and send notification
      if (validated.status && validated.status !== existingUser.status) {
        const fullUser = await userService.findByIdWithEmail(id);
        if (fullUser) {
          if (validated.status === USER_STATUS.ACTIVE) {
            notificationService.onUserActivated(fullUser).catch(console.error);
          } else if (validated.status === USER_STATUS.INACTIVE) {
            notificationService
              .onUserDeactivated(fullUser)
              .catch(console.error);
          }
        }
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already taken")) {
          throw new ApiError(
            400,
            MESSAGES.ERROR.EMAIL_ALREADY_EXISTS || "Email already taken"
          );
        }
        if (error.message.includes("not found")) {
          throw new ApiError(
            404,
            MESSAGES.ERROR.USER_NOT_FOUND || "User not found"
          );
        }
      }
      throw error;
    }
  });
}

// DELETE /api/users/[id] - Delete user (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const { id } = await params;

    try {
      await userService.delete(id);
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          throw new ApiError(
            404,
            MESSAGES.ERROR.USER_NOT_FOUND || "User not found"
          );
        }
        if (error.message.includes("assigned startups")) {
          throw new ApiError(400, error.message);
        }
      }
      throw error;
    }
  });
}
