/**
 * QCM Service
 * Business logic for managing questions and quizzes
 */

import { prisma } from "@/lib/prisma";
import { QuestionStatus } from "@prisma/client";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionFilters,
  QuestionStats,
  QuestionFilterOptions,
  StartQuizInput,
  SubmitQuizInput,
  QuizHistoryFilters,
  QuizResult,
  QuestionOption,
} from "@/lib/validations/qcm.validation";
import { notificationService } from "@/lib/services/notification.service";

export const qcmService = {
  // ============================================================
  // QUESTION CRUD
  // ============================================================

  /**
   * Get all questions with optional filtering, pagination, and sorting
   */
  async findAllQuestions(filters: QuestionFilters) {
    const {
      search,
      school,
      matiere,
      chapter,
      difficulty,
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
        { text: { contains: search, mode: "insensitive" } },
        { chapter: { contains: search, mode: "insensitive" } },
      ];
    }

    if (school) where.school = school;
    if (matiere) where.matiere = matiere;
    if (chapter) where.chapter = chapter;
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;
    if (typeof isPublic === "boolean") where.isPublic = isPublic;
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Get total count
    const total = await prisma.question.count({ where });

    // Get paginated questions
    const questions = await prisma.question.findMany({
      where,
      select: {
        id: true,
        text: true,
        options: true,
        correctIds: true,
        school: true,
        matiere: true,
        chapter: true,
        difficulty: true,
        points: true,
        timeLimit: true,
        status: true,
        isPublic: true,
        timesAnswered: true,
        timesCorrect: true,
        tags: true,
        createdAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      questions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get a single question by ID
   */
  async findQuestionById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        imageFile: true,
      },
    });
  },

  /**
   * Create a new question
   */
  async createQuestion(data: CreateQuestionInput, uploadedById: string) {
    const question = await prisma.question.create({
      data: {
        ...data,
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
        imageFile: true,
      },
    });

    // Notify students about the new question if it's active and public
    if (data.status === "ACTIVE" && data.isPublic !== false) {
      notificationService
        .onNewResourcePublished("QCM", `Question: ${data.matiere}`, question.id)
        .catch(console.error);
    }

    return question;
  },

  /**
   * Update a question
   */
  async updateQuestion(id: string, data: UpdateQuestionInput) {
    // Get current question to check for status changes
    const currentQuestion = await prisma.question.findUnique({
      where: { id },
      select: { status: true, text: true },
    });

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        imageFile: true,
      },
    });

    // Notify admins if status changed
    if (currentQuestion && data.status && data.status !== currentQuestion.status) {
      notificationService
        .onResourceStatusChanged(
          "QUESTION",
          currentQuestion.text.substring(0, 50) + "...",
          currentQuestion.status,
          data.status,
          updatedQuestion.uploadedById
        )
        .catch(console.error);
    }

    return updatedQuestion;
  },

  /**
   * Delete a question
   */
  async deleteQuestion(id: string) {
    // Get question details before deletion
    const question = await prisma.question.findUnique({
      where: { id },
      select: { text: true, uploadedById: true },
    });

    const result = await prisma.question.delete({
      where: { id },
    });

    // Notify admins about deletion
    if (question) {
      notificationService
        .onResourceDeleted(
          "QUESTION",
          question.text.substring(0, 50) + "...",
          question.uploadedById
        )
        .catch(console.error);
    }

    return result;
  },

  /**
   * Get question statistics
   */
  async getQuestionStats(): Promise<QuestionStats> {
    const [
      totalQuestions,
      activeQuestions,
      questionsBySchool,
      questionsByMatiere,
      questionsByDifficulty,
      successRateData,
    ] = await Promise.all([
      prisma.question.count(),
      prisma.question.count({ where: { status: QuestionStatus.ACTIVE } }),
      prisma.question.groupBy({
        by: ["school"],
        _count: { id: true },
      }),
      prisma.question.groupBy({
        by: ["matiere"],
        _count: { id: true },
      }),
      prisma.question.groupBy({
        by: ["difficulty"],
        _count: { id: true },
      }),
      prisma.question.aggregate({
        _sum: { timesAnswered: true, timesCorrect: true },
      }),
    ]);

    const totalAnswered = successRateData._sum.timesAnswered || 0;
    const totalCorrect = successRateData._sum.timesCorrect || 0;
    const averageSuccessRate =
      totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    return {
      totalQuestions,
      activeQuestions,
      questionsBySchool: Object.fromEntries(
        questionsBySchool.map((g) => [g.school, g._count.id])
      ),
      questionsByMatiere: Object.fromEntries(
        questionsByMatiere.map((g) => [g.matiere, g._count.id])
      ),
      questionsByDifficulty: Object.fromEntries(
        questionsByDifficulty.map((g) => [g.difficulty, g._count.id])
      ),
      averageSuccessRate: Math.round(averageSuccessRate * 10) / 10,
    };
  },

  /**
   * Get filter options for questions
   */
  async getQuestionFilterOptions(): Promise<QuestionFilterOptions> {
    const [schoolsData, matieresData, chaptersData] = await Promise.all([
      prisma.question.findMany({
        where: { status: QuestionStatus.ACTIVE },
        select: { school: true },
        distinct: ["school"],
      }),
      prisma.question.findMany({
        where: { status: QuestionStatus.ACTIVE },
        select: { matiere: true },
        distinct: ["matiere"],
      }),
      prisma.question.findMany({
        where: { status: QuestionStatus.ACTIVE, chapter: { not: null } },
        select: { chapter: true },
        distinct: ["chapter"],
      }),
    ]);

    return {
      schools: schoolsData.map((s) => s.school).sort(),
      matieres: matieresData.map((m) => m.matiere).sort(),
      chapters: chaptersData
        .map((c) => c.chapter)
        .filter((c): c is string => c !== null)
        .sort(),
      difficulties: ["EASY", "MEDIUM", "HARD"],
    };
  },

  // ============================================================
  // QUIZ OPERATIONS
  // ============================================================

  /**
   * Get random questions for a quiz
   */
  async getRandomQuestions(input: StartQuizInput) {
    const { school, matiere, questionCount } = input;

    // Get random questions matching criteria
    const questions = await prisma.$queryRaw<
      Array<{
        id: string;
        text: string;
        options: QuestionOption[];
        school: string;
        matiere: string;
        chapter: string | null;
        difficulty: string;
        points: number;
        timeLimit: number | null;
        imageFileId: string | null;
      }>
    >`
      SELECT id, text, options, school, matiere, chapter, difficulty, points, "timeLimit", "imageFileId"
      FROM questions
      WHERE school = ${school}
        AND matiere = ${matiere}
        AND status = 'ACTIVE'
        AND "isPublic" = true
      ORDER BY RANDOM()
      LIMIT ${questionCount}
    `;

    return questions;
  },

  /**
   * Submit quiz and calculate results
   */
  async submitQuiz(
    userId: string,
    input: SubmitQuizInput
  ): Promise<QuizResult> {
    const { school, matiere, answers, totalTimeSpent } = input;

    // Get all questions for this submission
    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        correctIds: true,
        points: true,
      },
    });

    // Calculate scores
    let totalPoints = 0;
    let maxPoints = 0;
    let correctCount = 0;

    const answerResults = answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) {
        return {
          questionId: answer.questionId,
          selectedIds: answer.selectedIds,
          isCorrect: false,
          pointsEarned: 0,
          timeSpent: answer.timeSpent,
        };
      }

      maxPoints += question.points;

      // Check if answer is correct (all correct IDs selected, no incorrect ones)
      const isCorrect =
        answer.selectedIds.length === question.correctIds.length &&
        answer.selectedIds.every((id) => question.correctIds.includes(id));

      const pointsEarned = isCorrect ? question.points : 0;
      if (isCorrect) {
        correctCount++;
        totalPoints += pointsEarned;
      }

      return {
        questionId: answer.questionId,
        selectedIds: answer.selectedIds,
        isCorrect,
        pointsEarned,
        timeSpent: answer.timeSpent,
      };
    });

    const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    // Create quiz attempt with answers
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        school,
        matiere,
        totalQuestions: answers.length,
        score: correctCount,
        totalPoints,
        maxPoints,
        percentage: Math.round(percentage * 10) / 10,
        timeSpent: totalTimeSpent,
        completedAt: new Date(),
        answers: {
          create: answerResults,
        },
      },
    });

    // Update question statistics
    await Promise.all(
      answerResults.map((result) =>
        prisma.question.update({
          where: { id: result.questionId },
          data: {
            timesAnswered: { increment: 1 },
            ...(result.isCorrect && { timesCorrect: { increment: 1 } }),
          },
        })
      )
    );

    // Notify student about quiz completion
    notificationService
      .onQuizCompleted(userId, {
        school,
        matiere,
        score: correctCount,
        totalQuestions: answers.length,
        percentage: Math.round(percentage * 10) / 10,
      })
      .catch(console.error);

    return {
      attemptId: attempt.id,
      score: correctCount,
      totalQuestions: answers.length,
      totalPoints,
      maxPoints,
      percentage: Math.round(percentage * 10) / 10,
      timeSpent: totalTimeSpent ?? null,
      school,
      matiere,
    };
  },

  /**
   * Get quiz history for a user
   */
  async getQuizHistory(userId: string, filters: QuizHistoryFilters) {
    const { school, matiere, page, limit, sortBy, sortOrder } = filters;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };
    if (school) where.school = school;
    if (matiere) where.matiere = matiere;

    const total = await prisma.quizAttempt.count({ where });

    const attempts = await prisma.quizAttempt.findMany({
      where,
      select: {
        id: true,
        school: true,
        matiere: true,
        totalQuestions: true,
        score: true,
        totalPoints: true,
        maxPoints: true,
        percentage: true,
        timeSpent: true,
        completedAt: true,
        createdAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      attempts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get a specific quiz attempt with answers
   */
  async getQuizAttempt(attemptId: string, userId: string) {
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId, // Ensure user can only view their own attempts
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                options: true,
                correctIds: true,
                explanation: true,
                school: true,
                matiere: true,
                chapter: true,
                difficulty: true,
                points: true,
              },
            },
          },
        },
      },
    });

    return attempt;
  },

  /**
   * Get quiz filter options (schools and matieres with available questions)
   */
  async getQuizFilterOptions() {
    const [schoolsData, matieresData] = await Promise.all([
      prisma.question.findMany({
        where: { status: QuestionStatus.ACTIVE, isPublic: true },
        select: { school: true },
        distinct: ["school"],
      }),
      prisma.question.findMany({
        where: { status: QuestionStatus.ACTIVE, isPublic: true },
        select: { matiere: true },
        distinct: ["matiere"],
      }),
    ]);

    return {
      schools: schoolsData.map((s) => s.school).sort(),
      matieres: matieresData.map((m) => m.matiere).sort(),
    };
  },

  /**
   * Get available matieres for a specific school
   */
  async getMatieresForSchool(school: string) {
    const matieresData = await prisma.question.findMany({
      where: {
        school,
        status: QuestionStatus.ACTIVE,
        isPublic: true,
      },
      select: { matiere: true },
      distinct: ["matiere"],
    });

    return matieresData.map((m) => m.matiere).sort();
  },

  /**
   * Get question count for school/matiere combination
   */
  async getQuestionCount(school: string, matiere: string) {
    return prisma.question.count({
      where: {
        school,
        matiere,
        status: QuestionStatus.ACTIVE,
        isPublic: true,
      },
    });
  },
};
