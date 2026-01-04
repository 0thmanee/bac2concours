/**
 * File Service - Supabase Storage Integration
 * Handles file uploads, downloads, and deletions
 */

import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import { FileType, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

interface UploadFileOptions {
  file: File;
  userId: string;
  type: FileType;
  folder?: string; // Optional subfolder (e.g., "books", "payments")
  metadata?: Record<string, unknown>;
}

interface UploadFileResult {
  id: string;
  filename: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  type: FileType;
}

export const fileService = {
  /**
   * Upload file to Supabase Storage and create database record
   */
  async uploadFile({
    file,
    userId,
    type,
    folder = "general",
    metadata = {},
  }: UploadFileOptions): Promise<UploadFileResult> {
    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "bin";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const storagePath = `${folder}/${uniqueFilename}`;

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL (works only if bucket is public)
    // For private buckets, use signed URLs in the frontend
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    // Create database record
    const fileRecord = await prisma.file.create({
      data: {
        filename: file.name,
        storagePath,
        publicUrl,
        mimeType: file.type,
        size: file.size,
        type,
        uploadedById: userId,
        metadata: {
          uploadedBy: userId,
          originalName: file.name,
          ...metadata,
        },
      },
    });

    return {
      id: fileRecord.id,
      filename: fileRecord.filename,
      publicUrl: fileRecord.publicUrl,
      mimeType: fileRecord.mimeType,
      size: fileRecord.size,
      type: fileRecord.type,
    };
  },

  /**
   * Delete file from Supabase Storage and database
   */
  async deleteFile(fileId: string): Promise<void> {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    // Delete from Supabase Storage
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([file.storagePath]);

      if (error) {
        console.error("Supabase deletion error:", error);
      }
    } catch (error) {
      console.error("Storage deletion error:", error);
      // Continue to delete database record even if storage deletion fails
    }

    // Delete from database
    await prisma.file.delete({
      where: { id: fileId },
    });
  },

  /**
   * Get file by ID
   */
  async getFile(fileId: string) {
    return prisma.file.findUnique({
      where: { id: fileId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Get files by user
   */
  async getFilesByUser(userId: string, type?: FileType) {
    return prisma.file.findMany({
      where: {
        uploadedById: userId,
        ...(type && { type }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Get files by type
   */
  async getFilesByType(type: FileType, limit?: number) {
    return prisma.file.findMany({
      where: { type },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit && { take: limit }),
    });
  },

  /**
   * Generate signed URL for private file access (24 hours expiration)
   */
  async getSignedUrl(fileId: string, expirationMinutes = 60): Promise<string> {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(file.storagePath, expirationMinutes * 60);

    if (error || !data) {
      throw new Error(`Failed to generate signed URL: ${error?.message}`);
    }

    return data.signedUrl;
  },

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    fileId: string,
    metadata: Prisma.InputJsonValue
  ): Promise<void> {
    await prisma.file.update({
      where: { id: fileId },
      data: { metadata },
    });
  },
};
