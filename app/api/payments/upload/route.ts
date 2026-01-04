import { NextRequest, NextResponse } from "next/server";
import { fileService } from "@/lib/services/file.service";
import { paymentService } from "@/lib/services/payment.service";
import { requireApiStudent, ApiAuthError } from "@/lib/auth-security";
import {
  validateFileSize,
  isAllowedMimeType,
  FILE_VALIDATION_ERRORS,
  getFileSizeLimitLabel,
} from "@/lib/validations/file.validation";
import { FileType } from "@prisma/client";
import { MESSAGES } from "@/lib/constants";

// POST /api/payments/upload - Upload payment proof
export async function POST(req: NextRequest) {
  try {
    // Validate user is authenticated student
    const user = await requireApiStudent();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: FILE_VALIDATION_ERRORS.NO_FILE },
        { status: 400 }
      );
    }

    // Validate file size for payment proof
    if (!validateFileSize(file.size, FileType.PAYMENT_PROOF)) {
      return NextResponse.json(
        {
          error: `${
            FILE_VALIDATION_ERRORS.FILE_TOO_LARGE
          } (max ${getFileSizeLimitLabel(FileType.PAYMENT_PROOF)})`,
        },
        { status: 400 }
      );
    }

    // Validate file type for payment proof
    if (!isAllowedMimeType(file.type, FileType.PAYMENT_PROOF)) {
      return NextResponse.json(
        { error: FILE_VALIDATION_ERRORS.INVALID_MIME_TYPE },
        { status: 400 }
      );
    }

    // Upload file to Firebase
    const uploadResult = await fileService.uploadFile({
      file,
      userId: user.id,
      type: FileType.PAYMENT_PROOF,
      folder: "payments",
      metadata: {
        purpose: "payment_verification",
      },
    });

    // Submit payment proof with the file URL
    const result = await paymentService.submitPaymentProof(
      user.id,
      uploadResult.publicUrl
    );

    return NextResponse.json({
      success: true,
      message: MESSAGES.SUCCESS.PAYMENT_UPLOADED,
      data: {
        ...result,
        file: uploadResult,
      },
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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.PAYMENT_UPLOAD_FAILED },
      { status: 500 }
    );
  }
}
