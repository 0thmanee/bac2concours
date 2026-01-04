import { NextRequest } from "next/server";
import {
  handleApiRequest,
  getAuthenticatedUser,
  ApiError,
} from "@/lib/api-utils";
import {
  createProgressUpdateSchema,
  progressQueryParamsSchema,
} from "@/lib/validations/progress.validation";
import { progressService } from "@/lib/services/progress.service";
import { startupService } from "@/lib/services/startup.service";
import { notificationService } from "@/lib/services/notification.service";
import { USER_ROLE, MESSAGES } from "@/lib/constants";

// POST /api/progress - Create progress update (Student)
export async function POST(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();

    const body = await req.json();
    const validated = createProgressUpdateSchema.parse(body);

    // Verify student has access to this startup
    if (user.role === USER_ROLE.STUDENT) {
      const hasAccess = await startupService.isStudentOfStartup(
        validated.startupId,
        user.id
      );

      if (!hasAccess) {
        throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
      }
    }

    const update = await progressService.create({
      whatWasDone: validated.whatWasDone,
      whatIsBlocked: validated.whatIsBlocked,
      whatIsNext: validated.whatIsNext,
      startupId: validated.startupId,
      submittedById: user.id,
    });

    // Notify admins about the new progress update
    const startup = await startupService.findById(validated.startupId);
    if (startup) {
      notificationService
        .onProgressUpdateSubmitted({
          ...update,
          submittedBy: { name: user.name || "Unknown" },
          startup: { name: startup.name },
        })
        .catch(console.error);
    }

    return update;
  });
}

// GET /api/progress - List progress updates
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);

    const queryParams = progressQueryParamsSchema.parse({
      startupId: searchParams.get("startupId") || undefined,
      me: searchParams.get("me") || undefined,
    });

    let updates;

    if (user.role === USER_ROLE.STUDENT) {
      if (queryParams.me === "true") {
        // Student getting their own updates
        updates = await progressService.findAll({
          submittedById: user.id,
        });
      } else if (queryParams.startupId) {
        // Verify access
        const hasAccess = await startupService.isStudentOfStartup(
          queryParams.startupId,
          user.id
        );

        if (!hasAccess) {
          throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
        }

        updates = await progressService.findAll({
          startupId: queryParams.startupId,
          submittedById: user.id,
        });
      } else {
        updates = await progressService.findAll({
          submittedById: user.id,
        });
      }
    } else {
      // Admins can see all updates, optionally filtered by startup
      updates = await progressService.findAll({
        startupId: queryParams.startupId,
      });
    }

    return updates;
  });
}
