/**
 * Video Service
 * Business logic for managing educational videos
 */

import { prisma } from "@/lib/prisma";
import type {
  CreateVideoInput,
  UpdateVideoInput,
  VideoFilters,
  VideoStats,
  VideoFilterOptions,
} from "@/lib/validations/video.validation";
import { extractYouTubeId } from "@/lib/validations/video.validation";
import { notificationService } from "@/lib/services/notification.service";

export const videoService = {
  /**
   * Get all videos with optional filtering, pagination, and sorting
   */
  async findAll(filters: VideoFilters) {
    const {
      search,
      category,
      school,
      level,
      subject,
      status,
      isPublic,
      tags,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filters;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;
    if (school) where.school = school;
    if (level) where.level = level;
    if (subject) where.subject = subject;
    if (status) where.status = status;
    if (typeof isPublic === "boolean") where.isPublic = isPublic;
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Get total count
    const total = await prisma.video.count({ where });

    // Get paginated videos
    const videos = await prisma.video.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        youtubeId: true,
        thumbnailFileId: true,
        thumbnailFile: true,
        school: true,
        category: true,
        level: true,
        subject: true,
        tags: true,
        duration: true,
        views: true,
        rating: true,
        status: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get a single video by ID
   */
  async findById(id: string) {
    return prisma.video.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        thumbnailFile: true,
      },
    });
  },

  /**
   * Create a new video
   */
  async create(data: CreateVideoInput, uploadedById: string) {
    // Extract YouTube ID from URL
    const youtubeId = extractYouTubeId(data.url);

    const video = await prisma.video.create({
      data: {
        ...data,
        youtubeId,
        uploadedById,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        thumbnailFile: true,
      },
    });

    // Notify students about the new video if it's active
    if (data.status === "ACTIVE") {
      notificationService
        .onNewResourcePublished("VIDEO", video.title, video.id)
        .catch(console.error);
    }

    return video;
  },

  /**
   * Update a video
   */
  async update(id: string, data: UpdateVideoInput) {
    // Only include defined values (not undefined)
    const cleanedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanedData[key] = value;
      }
    }

    // If URL is being updated, extract new YouTube ID
    if (data.url) {
      cleanedData.youtubeId = extractYouTubeId(data.url);
    }

    return prisma.video.update({
      where: { id },
      data: cleanedData,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        thumbnailFile: true,
      },
    });
  },

  /**
   * Delete a video
   */
  async delete(id: string) {
    return prisma.video.delete({
      where: { id },
    });
  },

  /**
   * Increment video views count
   */
  async incrementViews(id: string) {
    return prisma.video.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  },

  /**
   * Get video statistics for dashboard
   */
  async getStats(): Promise<VideoStats> {
    const [total, active, inactive, aggregations] = await Promise.all([
      prisma.video.count(),
      prisma.video.count({ where: { status: "ACTIVE" } }),
      prisma.video.count({ where: { status: "INACTIVE" } }),
      prisma.video.aggregate({
        _sum: {
          views: true,
        },
        _avg: {
          rating: true,
        },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      totalViews: aggregations._sum.views || 0,
      averageRating: aggregations._avg.rating || 0,
    };
  },

  /**
   * Get unique filter options for dropdowns
   */
  async getFilterOptions(): Promise<VideoFilterOptions> {
    const videos = await prisma.video.findMany({
      select: {
        category: true,
        school: true,
        level: true,
        subject: true,
      },
    });

    // Extract unique values
    const categories = [...new Set(videos.map((v) => v.category))].sort();
    const schools = [...new Set(videos.map((v) => v.school))].sort();
    const levels = [...new Set(videos.map((v) => v.level))].sort();
    const subjects = [...new Set(videos.map((v) => v.subject))].sort();

    return {
      categories,
      schools,
      levels,
      subjects,
    };
  },

  /**
   * Get related videos based on category and school
   */
  async getRelated(id: string, limit = 6) {
    const video = await prisma.video.findUnique({
      where: { id },
      select: { category: true, school: true },
    });

    if (!video) {
      return [];
    }

    return prisma.video.findMany({
      where: {
        AND: [
          { id: { not: id } },
          { status: "ACTIVE" },
          { isPublic: true },
          {
            OR: [{ category: video.category }, { school: video.school }],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        thumbnailFileId: true,
        thumbnailFile: true,
        duration: true,
        views: true,
        rating: true,
        category: true,
        level: true,
      },
      take: limit,
      orderBy: { views: "desc" },
    });
  },
};
