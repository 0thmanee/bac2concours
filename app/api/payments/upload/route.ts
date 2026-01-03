import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/services/payment.service";
import { VALIDATION, MESSAGES } from "@/lib/constants";
import { requireApiFounder, ApiAuthError } from "@/lib/auth-security";

// POST /api/payments/upload - Upload payment proof
export async function POST(req: NextRequest) {
  try {
    // Validate user is authenticated founder
    const user = await requireApiFounder();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > VALIDATION.PAYMENT.MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.PAYMENT_FILE_TOO_LARGE },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = VALIDATION.PAYMENT.ALLOWED_FILE_TYPES as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.PAYMENT_INVALID_FILE_TYPE },
        { status: 400 }
      );
    }

    // Upload file
    const paymentProofUrl = await paymentService.uploadPaymentProof(
      user.id,
      file
    );

    // Submit payment proof
    const result = await paymentService.submitPaymentProof(
      user.id,
      paymentProofUrl
    );

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.PAYMENT_UPLOADED,
      data: result,
    });
  } catch (error) {
    console.error("Payment upload error:", error);
    
    // Handle authentication errors
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
      { error: MESSAGES.ERROR.PAYMENT_UPLOAD_FAILED },
      { status: 500 }
    );
  }
}
