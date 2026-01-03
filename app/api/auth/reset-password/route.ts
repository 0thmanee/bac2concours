import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { tokenService } from "@/lib/services/token.service";
import { resetPasswordApiSchema } from "@/lib/validations/auth.validation";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordApiSchema.parse(body);

    // Verify token
    const verification = await tokenService.verifyPasswordResetToken(token);

    if (!verification.success || !verification.email) {
      return NextResponse.json(
        { error: verification.error || "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { email: verification.email },
      data: { password: hashedPassword },
    });

    // Consume the token so it can't be reused
    await tokenService.consumePasswordResetToken(token);

    return NextResponse.json(
      {
        message:
          "Password reset successfully! You can now login with your new password.",
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
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
