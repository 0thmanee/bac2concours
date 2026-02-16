/**
 * Announcement Service
 * Business logic for announcements (e.g. school registration, events)
 */

import { prisma } from "@/lib/prisma";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  AnnouncementFilters,
} from "@/lib/validations/announcement.validation";
import { notificationService } from "@/lib/services/notification.service";

export const announcementService = {
  async findAll(filters: AnnouncementFilters) {
    const { search, type, status, schoolId, page, limit, sortBy, sortOrder } =
      filters;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type) where.type = type;
    if (status) where.status = status;
    if (schoolId) where.schoolId = schoolId;

    const total = await prisma.announcement.count({ where });

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        school: {
          select: { id: true, name: true, shortName: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      announcements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string) {
    return prisma.announcement.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        school: {
          select: { id: true, name: true, shortName: true, city: true },
        },
      },
    });
  },

  async create(data: CreateAnnouncementInput, createdById: string) {
    const announcement = await prisma.announcement.create({
      data: {
        ...data,
        linkUrl: data.linkUrl?.trim() || null,
        schoolId: data.schoolId || null,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        school: {
          select: { id: true, name: true, shortName: true },
        },
      },
    });

    if (data.status === "PUBLISHED") {
      notificationService
        .onAnnouncementPublished(
          announcement.id,
          announcement.title,
          announcement.content,
        )
        .catch(console.error);
    }

    return announcement;
  },

  async update(id: string, data: UpdateAnnouncementInput) {
    const current = await prisma.announcement.findUnique({
      where: { id },
      select: { status: true },
    });

    const cleanedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanedData[key] =
          key === "linkUrl" && typeof value === "string" && !value.trim()
            ? null
            : value;
      }
    }

    if (data.status === "PUBLISHED" && current?.status !== "PUBLISHED") {
      cleanedData.publishedAt = new Date();
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: cleanedData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        school: {
          select: { id: true, name: true, shortName: true },
        },
      },
    });

    if (data.status === "PUBLISHED" && current?.status !== "PUBLISHED") {
      notificationService
        .onAnnouncementPublished(
          announcement.id,
          announcement.title,
          announcement.content,
        )
        .catch(console.error);
    }

    return announcement;
  },

  async delete(id: string) {
    return prisma.announcement.delete({
      where: { id },
    });
  },

  async publish(id: string) {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) throw new Error("Announcement not found");
    if (announcement.status === "PUBLISHED") {
      return prisma.announcement.findUnique({
        where: { id },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          school: { select: { id: true, name: true, shortName: true } },
        },
      });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        school: { select: { id: true, name: true, shortName: true } },
      },
    });

    notificationService
      .onAnnouncementPublished(updated.id, updated.title, updated.content)
      .catch(console.error);

    return updated;
  },
};
