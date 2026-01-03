import { NextRequest, NextResponse } from "next/server";
import { tokenService } from "@/lib/services/token.service";
import { verifyEmailRequestSchema } from "@/lib/validations/auth.validation";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailRequestSchema.parse(body);

    const result = await tokenService.verifyEmailToken(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to verify email" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Email verified successfully! You can now login.",
        email: result.email,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}
