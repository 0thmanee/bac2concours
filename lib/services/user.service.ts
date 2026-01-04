import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { USER_ROLE, USER_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserQueryParams,
} from "@/lib/validations/user.validation";
import type { UserRole, UserStatus, PaymentStatus } from "@prisma/client";

export const userService = {
  // Get all users with filters and pagination
  async findAll(options: UserQueryParams) {
    const { role, status, search, page = 1, limit = 10 } = options;

    // Build where clause
    const where = {
      ...(role && { role: role as UserRole }),
      ...(status && { status: status as UserStatus }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        paymentStatus: true,
        paymentProofUrl: true,
        paymentSubmittedAt: true,
        paymentReviewedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            startups: true,
            expenses: true,
            progressUpdates: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Get single user by ID
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        startups: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            startups: true,
            expenses: true,
            progressUpdates: true,
          },
        },
      },
    });
  },

  // Get full user data including email and password (for notifications)
  async findByIdWithEmail(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  // Create user
  async create(data: CreateUserInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10);

    // Create user
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as UserRole,
        status: (data.status || USER_STATUS.INACTIVE) as UserStatus,
        emailVerified: data.status === USER_STATUS.ACTIVE ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Update user
  async update(id: string, data: UpdateUserInput) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new Error("Email is already taken by another user");
      }

      updateData.email = data.email;
    }
    if (data.password !== undefined) {
      updateData.password = await hash(data.password, 10);
    }
    if (data.role !== undefined) updateData.role = data.role as UserRole;
    if (data.status !== undefined) {
      updateData.status = data.status as UserStatus;
      // Auto-verify email when activating user
      if (data.status === USER_STATUS.ACTIVE) {
        updateData.emailVerified = new Date();
      }
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Delete user
  async delete(id: string) {
    // Check if user has any startups assigned
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        startups: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.startups.length > 0) {
      throw new Error(
        "Cannot delete user with assigned startups. Please remove them from startups first."
      );
    }

    return prisma.user.delete({
      where: { id },
    });
  },

  // Get user metrics
  async getMetrics() {
    const [totalCount, adminCount, studentCount, activeCount, verifiedCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { role: USER_ROLE.ADMIN },
        }),
        prisma.user.count({
          where: { role: USER_ROLE.STUDENT },
        }),
        prisma.user.count({
          where: { status: USER_STATUS.ACTIVE },
        }),
        prisma.user.count({
          where: { emailVerified: { not: null } },
        }),
      ]);

    return {
      totalCount,
      adminCount,
      studentCount,
      activeCount,
      verifiedCount,
    };
  },
};
