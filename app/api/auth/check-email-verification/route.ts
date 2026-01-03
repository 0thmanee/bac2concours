import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { compare } from "bcryptjs";

const checkEmailSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = checkEmailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerified: true,
        password: true,
      },
    });

    // If user doesn't exist, return false (don't reveal if user exists)
    if (!user) {
      return NextResponse.json({ unverified: false }, { status: 200 });
    }

    // Verify password - if password is wrong, user can't log in anyway, so return false
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ unverified: false }, { status: 200 });
    }

    // Password is correct - check if email is verified
    // If user exists, password is correct, but email is not verified, return unverified: true
    if (!user.emailVerified) {
      return NextResponse.json({ unverified: true }, { status: 200 });
    }

    // User exists, password is correct, and email is verified
    return NextResponse.json({ unverified: false }, { status: 200 });
  } catch (error) {
    // On any error, return false to fall through to generic error handling
    return NextResponse.json({ unverified: false }, { status: 200 });
  }
}

