import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin, ApiError } from "@/lib/api-utils";
import { userService } from "@/lib/services/user.service";
import {
  createUserSchema,
  userQueryParamsSchema,
} from "@/lib/validations/user.validation";
import { MESSAGES } from "@/lib/constants";

// GET /api/users - List users (Admin only)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const queryParams = userQueryParamsSchema.parse({
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    });

    const users = await userService.findAll(queryParams);

    return users;
  });
}

// POST /api/users - Create user (Admin only)
export async function POST(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const body = await req.json();
    const validated = createUserSchema.parse(body);

    try {
      const user = await userService.create(validated);
      return user;
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        throw new ApiError(400, MESSAGES.ERROR.EMAIL_ALREADY_EXISTS || "Email already exists");
      }
      throw error;
    }
  });
}
