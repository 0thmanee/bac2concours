import { NextResponse } from "next/server";
import { paymentService } from "@/lib/services/payment.service";
import { MESSAGES } from "@/lib/constants";
import { requireApiAdmin, ApiAuthError } from "@/lib/auth-security";

// GET /api/payments/pending - Get all pending payments (Admin only)
export async function GET() {
  try {
    // Validate user is admin
    await requireApiAdmin();

    const pendingPayments = await paymentService.getPendingPayments();
    const metrics = await paymentService.getPaymentMetrics();

    return NextResponse.json({
      success: true,
      data: {
        payments: pendingPayments,
        metrics,
      },
    });
  } catch (error) {
    console.error("Get pending payments error:", error);

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
