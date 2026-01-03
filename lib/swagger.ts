export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "2BAConcours API",
    version: "1.0.0",
    description:
      "API documentation for 2BAConcours - Plateforme de préparation aux concours pour les étudiants marocains",
    contact: {
      name: "API Support",
      email: "support@2baconcours.ma",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      description: "API Server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication and registration" },
    { name: "Startups", description: "Startup management operations" },
    { name: "Budgets", description: "Budget category operations" },
    { name: "Expenses", description: "Expense tracking and approval" },
    { name: "Progress", description: "Progress update tracking" },
    { name: "Settings", description: "Incubator settings" },
    { name: "Reports", description: "Analytics and reporting" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Startup: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          industry: { type: "string", nullable: true },
          incubationStart: { type: "string", format: "date" },
          incubationEnd: { type: "string", format: "date" },
          totalBudget: { type: "number" },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
          isDeleted: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          founders: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
        },
      },
      BudgetCategory: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          maxBudget: { type: "number" },
          startupId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Expense: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          amount: { type: "number" },
          description: { type: "string" },
          date: { type: "string", format: "date" },
          receiptUrl: { type: "string", nullable: true },
          status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] },
          adminComment: { type: "string", nullable: true },
          categoryId: { type: "string", format: "uuid" },
          startupId: { type: "string", format: "uuid" },
          submittedById: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProgressUpdate: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          whatWasDone: { type: "string" },
          whatIsBlocked: { type: "string" },
          whatIsNext: { type: "string" },
          startupId: { type: "string", format: "uuid" },
          submittedById: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
      Settings: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          incubatorName: { type: "string" },
          updateFrequency: { type: "string", enum: ["WEEKLY", "MONTHLY"] },
          autoApproveExpenses: { type: "boolean" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Create a new user account with FOUNDER role",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 2,
                    example: "John Doe",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    example: "SecurePass123",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        role: { type: "string", enum: ["ADMIN", "FOUNDER"] },
                        createdAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error or user already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/startups": {
      get: {
        tags: ["Startups"],
        summary: "List all startups",
        description: "Get all startups (Admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of startups",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Startup" },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - Admin only" },
        },
      },
      post: {
        tags: ["Startups"],
        summary: "Create a new startup",
        description: "Create a new startup (Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "name",
                  "incubationStart",
                  "incubationEnd",
                  "totalBudget",
                  "founderIds",
                ],
                properties: {
                  name: { type: "string", minLength: 2 },
                  description: { type: "string" },
                  industry: { type: "string" },
                  incubationStart: { type: "string", format: "date" },
                  incubationEnd: { type: "string", format: "date" },
                  totalBudget: { type: "number", minimum: 0 },
                  founderIds: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Startup created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Startup" },
              },
            },
          },
          400: { description: "Bad request - validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - Admin only" },
        },
      },
    },
    "/api/startups/{id}": {
      get: {
        tags: ["Startups"],
        summary: "Get startup by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Startup details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Startup" },
              },
            },
          },
          404: { description: "Startup not found" },
        },
      },
      patch: {
        tags: ["Startups"],
        summary: "Update startup",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  industry: { type: "string" },
                  incubationStart: { type: "string", format: "date" },
                  incubationEnd: { type: "string", format: "date" },
                  totalBudget: { type: "number" },
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
                  founderIds: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Startup updated" },
          404: { description: "Startup not found" },
        },
      },
      delete: {
        tags: ["Startups"],
        summary: "Soft delete startup",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Startup deleted" },
          404: { description: "Startup not found" },
        },
      },
    },
    "/api/startups/{id}/budgets": {
      get: {
        tags: ["Budgets"],
        summary: "List budget categories for a startup",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "List of budget categories",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BudgetCategory" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Budgets"],
        summary: "Create budget category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "maxBudget"],
                properties: {
                  name: { type: "string", minLength: 2 },
                  maxBudget: { type: "number", minimum: 0 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Budget category created" },
          400: { description: "Would exceed startup total budget" },
        },
      },
    },
    "/api/budgets/{id}": {
      get: {
        tags: ["Budgets"],
        summary: "Get budget category by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Budget category details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BudgetCategory" },
              },
            },
          },
          404: { description: "Budget category not found" },
        },
      },
      patch: {
        tags: ["Budgets"],
        summary: "Update budget category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  maxBudget: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Budget category updated" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Budgets"],
        summary: "Delete budget category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Budget category deleted" },
          400: { description: "Cannot delete - has expenses" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/expenses": {
      get: {
        tags: ["Expenses"],
        summary: "List expenses",
        description: "Founders see their own, Admins see all",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startupId",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
          },
        ],
        responses: {
          200: {
            description: "List of expenses",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Expense" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Expenses"],
        summary: "Create expense",
        description: "Submit an expense (Founder)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "amount",
                  "description",
                  "date",
                  "categoryId",
                  "startupId",
                ],
                properties: {
                  amount: { type: "number", minimum: 0 },
                  description: { type: "string", minLength: 5 },
                  date: { type: "string", format: "date" },
                  categoryId: { type: "string" },
                  startupId: { type: "string" },
                  receiptUrl: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Expense created" },
          400: { description: "Would exceed budget" },
          403: { description: "No access to startup" },
        },
      },
    },
    "/api/expenses/{id}": {
      get: {
        tags: ["Expenses"],
        summary: "Get expense by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Expense details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Expense" },
              },
            },
          },
          404: { description: "Expense not found" },
        },
      },
      patch: {
        tags: ["Expenses"],
        summary: "Update expense",
        description: "Founders can only edit their own PENDING expenses",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number" },
                  description: { type: "string" },
                  date: { type: "string", format: "date" },
                  categoryId: { type: "string" },
                  receiptUrl: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Expense updated" },
          400: { description: "Cannot edit non-pending expenses" },
          403: { description: "Not your expense" },
        },
      },
    },
    "/api/expenses/{id}/approve": {
      patch: {
        tags: ["Expenses"],
        summary: "Approve expense",
        description: "Admin only",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  adminComment: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Expense approved" },
          400: { description: "Would exceed budget or already processed" },
        },
      },
    },
    "/api/expenses/{id}/reject": {
      patch: {
        tags: ["Expenses"],
        summary: "Reject expense",
        description: "Admin only",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["adminComment"],
                properties: {
                  adminComment: { type: "string", minLength: 5 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Expense rejected" },
          400: { description: "Already processed" },
        },
      },
    },
    "/api/progress": {
      get: {
        tags: ["Progress"],
        summary: "List progress updates",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startupId",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "me",
            in: "query",
            schema: { type: "string" },
            description: "Set to 'true' for founders to get only their updates",
          },
        ],
        responses: {
          200: {
            description: "List of progress updates",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ProgressUpdate" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Progress"],
        summary: "Create progress update",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "whatWasDone",
                  "whatIsBlocked",
                  "whatIsNext",
                  "startupId",
                ],
                properties: {
                  whatWasDone: { type: "string", minLength: 10 },
                  whatIsBlocked: { type: "string", minLength: 5 },
                  whatIsNext: { type: "string", minLength: 10 },
                  startupId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Progress update created" },
          403: { description: "No access to startup" },
        },
      },
    },
    "/api/progress/{id}": {
      get: {
        tags: ["Progress"],
        summary: "Get progress update by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Progress update details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProgressUpdate" },
              },
            },
          },
          404: { description: "Progress update not found" },
        },
      },
    },
    "/api/settings": {
      get: {
        tags: ["Settings"],
        summary: "Get incubator settings",
        description: "Admin only",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Settings",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Settings" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Settings"],
        summary: "Update settings",
        description: "Admin only",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  incubatorName: { type: "string" },
                  updateFrequency: {
                    type: "string",
                    enum: ["WEEKLY", "MONTHLY"],
                  },
                  autoApproveExpenses: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Settings updated" },
        },
      },
    },
    "/api/reports/budget": {
      get: {
        tags: ["Reports"],
        summary: "Budget usage report",
        description: "Admin only - Get budget utilization across startups",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startupId",
            in: "query",
            schema: { type: "string" },
            description: "Filter by specific startup",
          },
        ],
        responses: {
          200: {
            description: "Budget report data",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      startup: { type: "object" },
                      budget: {
                        type: "object",
                        properties: {
                          total: { type: "number" },
                          allocated: { type: "number" },
                          spent: { type: "number" },
                          remaining: { type: "number" },
                        },
                      },
                      categories: { type: "array" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/reports/expenses": {
      get: {
        tags: ["Reports"],
        summary: "Expense breakdown report",
        description: "Admin only - Detailed expense analytics",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startupId",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
          },
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" },
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" },
          },
        ],
        responses: {
          200: { description: "Expense report data" },
        },
      },
    },
    "/api/reports/activity": {
      get: {
        tags: ["Reports"],
        summary: "Activity timeline report",
        description: "Admin only - Timeline of progress updates and expenses",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startupId",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" },
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" },
          },
        ],
        responses: {
          200: { description: "Activity report data" },
        },
      },
    },
  },
};
