import { NextRequest, NextResponse } from "next/server";
import { fileService } from "@/lib/services/file.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import {
  fileUploadSchema,
  validateFileSize,
  isAllowedMimeType,
  FILE_VALIDATION_ERRORS,
  getFileSizeLimitLabel,
} from "@/lib/validations/file.validation";
import { FileType } from "@prisma/client";

/**
 * POST /api/files/upload
 * Upload file to Firebase Storage
 */
export async function POST(req: NextRequest) {
  try {
    const user = await validateApiSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as FileType;
    const folder = formData.get("folder") as string | undefined;
    const metadataStr = formData.get("metadata") as string | undefined;

    if (!file) {
      return NextResponse.json(
        { error: FILE_VALIDATION_ERRORS.NO_FILE },
        { status: 400 }
      );
    }

    // Validate input
    const validated = fileUploadSchema.parse({
      type,
      folder,
      metadata: metadataStr ? JSON.parse(metadataStr) : undefined,
    });

    // Validate file size
    if (!validateFileSize(file.size, validated.type)) {
      return NextResponse.json(
        {
          error: `${
            FILE_VALIDATION_ERRORS.FILE_TOO_LARGE
          } (max ${getFileSizeLimitLabel(validated.type)})`,
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!isAllowedMimeType(file.type, validated.type)) {
      return NextResponse.json(
        { error: FILE_VALIDATION_ERRORS.INVALID_MIME_TYPE },
        { status: 400 }
      );
    }

    // Upload file
    const result = await fileService.uploadFile({
      file,
      userId: user.id,
      type: validated.type,
      folder: validated.folder,
      metadata: validated.metadata,
    });

    return NextResponse.json({
      success: true,
      message: "Fichier téléchargé avec succès",
      data: result,
    });
  } catch (error) {
    console.error("File upload error:", error);

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
      { error: "Échec du téléchargement du fichier" },
      { status: 500 }
    );
  }
}
