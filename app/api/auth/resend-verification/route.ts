import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenService } from "@/lib/services/token.service";
import { emailService } from "@/lib/email";
import { resendVerificationSchema } from "@/lib/validations/auth.validation";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendVerificationSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json(
        {
          message:
            "If an account with that email exists and is unverified, we've sent a new verification email.",
        },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "This email is already verified. You can login." },
        { status: 400 }
      );
    }

    // Generate new verification token and send email
    const token = await tokenService.createVerificationToken(email);
    await emailService.sendVerificationEmail(email, token);

    return NextResponse.json(
      {
        message: "Verification email sent! Please check your inbox.",
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
      { error: "Failed to send verification email. Please try again." },
      { status: 500 }
    );
  }
}
