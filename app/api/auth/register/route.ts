import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth.validation";
import { ZodError } from "zod";
import { tokenService } from "@/lib/services/token.service";
import { emailService } from "@/lib/email";
import { notificationService } from "@/lib/services/notification.service";
import { USER_ROLE, USER_STATUS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 10);

    // Check if this is the first user (make them ADMIN)
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    // Create user
    // First user = ADMIN with ACTIVE status and auto-verified email
    // Others = FOUNDER with INACTIVE status (until assigned to startup) and unverified email
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: isFirstUser ? USER_ROLE.ADMIN : USER_ROLE.FOUNDER,
        status: isFirstUser ? USER_STATUS.ACTIVE : USER_STATUS.INACTIVE,
        emailVerified: isFirstUser ? new Date() : null, // First user is auto-verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate verification token and send email (only for non-first users)
    // First user is auto-verified, so skip email verification
    if (!isFirstUser) {
      // This is done asynchronously and won't block the response
      tokenService
        .createVerificationToken(validated.email)
        .then((token) => {
          return emailService.sendVerificationEmail(validated.email, token);
        })
        .catch((error) => {
          // We don't fail the registration if email sending fails
          // Error is silently handled - user can request resend later
        });

      // Notify admins about the new user registration
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (fullUser) {
        notificationService.onNewUserRegistered(fullUser).catch(console.error);
      }
    }

    return NextResponse.json(
      {
        message: isFirstUser
          ? "Admin account created successfully! You can now login."
          : "Account created successfully. Please check your email to verify your account.",
        user,
        requiresVerification: !isFirstUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
