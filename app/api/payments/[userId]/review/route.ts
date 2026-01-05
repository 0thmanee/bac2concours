import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/services/payment.service";
import { reviewPaymentSchema } from "@/lib/validations/payment.validation";
import { MESSAGES, VALIDATION } from "@/lib/constants";
import { ZodError } from "zod";
import { requireApiAdmin, ApiAuthError } from "@/lib/auth-security";
import { formatZodError } from "@/lib/utils/error.utils";

// POST /api/payments/[userId]/review - Approve or reject payment (Admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Validate user is admin
    await requireApiAdmin();

    const { userId } = await params;
    const body = await req.json();

    // Validate input
    const validated = reviewPaymentSchema.parse(body);

    let result;

    if (validated.action === "approve") {
      result = await paymentService.approvePayment(userId);
      return NextResponse.json({
        success: true,
        message: MESSAGES.SUCCESS.PAYMENT_APPROVED,
        data: result,
      });
    } else {
      // Reject
      if (
        !validated.rejectionReason ||
        validated.rejectionReason.length <
          VALIDATION.PAYMENT.REJECTION_REASON_MIN_LENGTH
      ) {
        return NextResponse.json(
          { error: MESSAGES.ERROR.PAYMENT_REJECTION_REASON_REQUIRED },
          { status: 400 }
        );
      }

      result = await paymentService.rejectPayment(
        userId,
        validated.rejectionReason
      );
      return NextResponse.json({
        success: true,
        message: MESSAGES.SUCCESS.PAYMENT_REJECTED,
        data: result,
      });
    }
  } catch (error) {
    console.error("Review payment error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
