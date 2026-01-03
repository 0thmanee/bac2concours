import { NextResponse } from "next/server";
import { paymentService } from "@/lib/services/payment.service";
import { MESSAGES } from "@/lib/constants";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";

// GET /api/payments/status - Get current user's payment status
export async function GET() {
  try {
    const user = await validateApiSession();

    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const status = await paymentService.getPaymentStatus(user.id);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Get payment status error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
