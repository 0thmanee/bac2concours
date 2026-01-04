import { NextRequest, NextResponse } from "next/server";
import { fileService } from "@/lib/services/file.service";
import { requireApiAdmin, ApiAuthError } from "@/lib/auth-security";

/**
 * DELETE /api/files/[fileId]
 * Delete a file (Admin only or file owner)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    await requireApiAdmin();
    const { fileId } = await params;

    await fileService.deleteFile(fileId);

    return NextResponse.json({
      success: true,
      message: "Fichier supprimé avec succès",
    });
  } catch (error) {
    console.error("File deletion error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Fichier introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Échec de la suppression du fichier" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/files/[fileId]
 * Get file details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    await requireApiAdmin();
    const { fileId } = await params;

    const file = await fileService.getFile(fileId);

    if (!file) {
      return NextResponse.json(
        { error: "Fichier introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: file,
    });
  } catch (error) {
    console.error("File retrieval error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Échec de la récupération du fichier" },
      { status: 500 }
    );
  }
}
