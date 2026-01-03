import { NextRequest } from "next/server";
import { handleApiRequest, ApiError } from "@/lib/api-utils";
import { requireApiAdmin } from "@/lib/auth-security";
import { updateStartupSchema } from "@/lib/validations/startup.validation";
import { startupService } from "@/lib/services/startup.service";
import { MESSAGES } from "@/lib/constants";

// GET /api/startups/[id] - Get single startup
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireApiAdmin();

    const { id } = await params;
    const startup = await startupService.findById(id);

    if (!startup) {
      throw new ApiError(404, MESSAGES.ERROR.STARTUP_NOT_FOUND);
    }

    return startup;
  });
}

// PATCH /api/startups/[id] - Update startup
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireApiAdmin();

    const { id } = await params;
    const body = await req.json();
    const validated = updateStartupSchema.parse(body);

    const startup = await startupService.findById(id);

    if (!startup) {
      throw new ApiError(404, MESSAGES.ERROR.STARTUP_NOT_FOUND);
    }

    const incubationStart = validated.incubationStart
      ? new Date(validated.incubationStart)
      : undefined;
    const incubationEnd = validated.incubationEnd
      ? new Date(validated.incubationEnd)
      : undefined;

    const updated = await startupService.update(id, {
      name: validated.name,
      description: validated.description,
      industry: validated.industry,
      incubationStart,
      incubationEnd,
      totalBudget: validated.totalBudget,
      status: validated.status,
      founderIds: validated.founderIds,
    });

    return updated;
  });
}

// DELETE /api/startups/[id] - Soft delete startup
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireApiAdmin();

    const { id } = await params;
    const startup = await startupService.findById(id);

    if (!startup) {
      throw new ApiError(404, MESSAGES.ERROR.STARTUP_NOT_FOUND);
    }

    const updated = await startupService.softDelete(id);

    return { message: MESSAGES.SUCCESS.STARTUP_DELETED, startup: updated };
  });
}
