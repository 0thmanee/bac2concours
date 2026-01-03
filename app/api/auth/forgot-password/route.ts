import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenService } from "@/lib/services/token.service";
import { emailService } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations/auth.validation";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    // Always return success message
    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, we've sent password reset instructions.",
        },
        { status: 200 }
      );
    }

    // Generate password reset token and send email
    const token = await tokenService.createPasswordResetToken(email);
    await emailService.sendPasswordResetEmail(email, token);

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, we've sent password reset instructions.",
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
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
