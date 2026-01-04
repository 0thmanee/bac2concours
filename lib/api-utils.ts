import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserRole, UserStatus } from "@prisma/client";
import { USER_STATUS, MESSAGES } from "@/lib/constants";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user) {
    throw new ApiError(401, MESSAGES.ERROR.UNAUTHORIZED);
  }

  // Reject inactive users - they should not be able to access any API routes
  if (session.user.status === USER_STATUS.INACTIVE) {
    throw new ApiError(403, MESSAGES.ERROR.ACCOUNT_INACTIVE);
  }

  // Reject users with unverified email - they should not be able to access any API routes
  if (!session.user.emailVerified) {
    throw new ApiError(403, MESSAGES.ERROR.EMAIL_NOT_VERIFIED_API);
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();

  if (user.role !== UserRole.ADMIN) {
    throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
  }

  return user;
}

export async function requireStudent() {
  const user = await getAuthenticatedUser();

  if (user.role !== UserRole.STUDENT) {
    throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
  }

  return user;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: "An unexpected error occurred",
    },
    { status: 500 }
  );
}

export async function handleApiRequest<T>(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<T>
) {
  try {
    const result = await handler(req);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
