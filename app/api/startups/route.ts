import { NextRequest } from "next/server";
import { handleApiRequest, ApiError } from "@/lib/api-utils";
import { requireApiAdmin } from "@/lib/auth-security";
import {
  createStartupSchema,
  startupQueryParamsSchema,
} from "@/lib/validations/startup.validation";
import { startupService } from "@/lib/services/startup.service";

// GET /api/startups - List all startups (Admin only)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireApiAdmin();

    const { searchParams } = new URL(req.url);
    const queryParams = startupQueryParamsSchema.parse({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      includeDeleted:
        searchParams.get("includeDeleted") === "true" || undefined,
    });

    // Check if we need spent budgets (for admin startups page)
    const includeSpentBudgets =
      searchParams.get("includeSpentBudgets") === "true";

    if (includeSpentBudgets) {
      const startups = await startupService.findAllWithSpentBudgets(
        queryParams
      );
      return startups;
    }

    const startups = await startupService.findAll(queryParams);
    return startups;
  });
}

// POST /api/startups - Create startup (Admin only)
export async function POST(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireApiAdmin();

    const body = await req.json();
    const validated = createStartupSchema.parse(body);

    const startup = await startupService.create({
      name: validated.name,
      description: validated.description,
      industry: validated.industry,
      incubationStart: new Date(validated.incubationStart),
      incubationEnd: new Date(validated.incubationEnd),
      totalBudget: validated.totalBudget,
      studentIds: validated.studentIds,
    });

    return startup;
  });
}
