import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { updateSettingsSchema } from "@/lib/validations/settings.validation";
import { settingsService } from "@/lib/services/settings.service";

// GET /api/settings - Get settings (Admin)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const settings = await settingsService.get();
    return settings;
  });
}

// PATCH /api/settings - Update settings (Admin)
export async function PATCH(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const body = await req.json();
    const validated = updateSettingsSchema.parse(body);

    const settings = await settingsService.update({
      incubatorName: validated.incubatorName,
    });

    return settings;
  });
}
