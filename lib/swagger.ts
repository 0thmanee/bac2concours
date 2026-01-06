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
    { name: "Users", description: "User management operations" },
    { name: "Books", description: "Educational books and resources" },
    { name: "Videos", description: "Educational videos" },
    { name: "Payments", description: "Payment verification" },
    { name: "Settings", description: "Platform settings" },
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
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["ADMIN", "STUDENT"] },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
          paymentStatus: {
            type: "string",
            enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Book: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          author: { type: "string" },
          school: { type: "string" },
          category: { type: "string" },
          description: { type: "string", nullable: true },
          fileUrl: { type: "string" },
          fileName: { type: "string" },
          fileSize: { type: "string" },
          totalPages: { type: "integer" },
          level: { type: "string" },
          subject: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          downloads: { type: "integer" },
          views: { type: "integer" },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "PROCESSING"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Video: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          url: { type: "string" },
          youtubeId: { type: "string", nullable: true },
          school: { type: "string" },
          category: { type: "string" },
          level: { type: "string" },
          subject: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          duration: { type: "integer", nullable: true },
          views: { type: "integer" },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "PROCESSING"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Settings: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          incubatorName: { type: "string" },
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
        description: "Create a new student account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/api/auth/session": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Authenticate user and create session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
        },
      },
      delete: {
        tags: ["Auth"],
        summary: "Logout",
        description: "End current session",
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        description: "Admin only - Get paginated list of users",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "role",
            in: "query",
            schema: { type: "string", enum: ["ADMIN", "STUDENT"] },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
          },
        ],
        responses: {
          200: {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/books": {
      get: {
        tags: ["Books"],
        summary: "List all books",
        description: "Get paginated list of books",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "level", in: "query", schema: { type: "string" } },
          { name: "school", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "List of books",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Book" },
                    },
                    pagination: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Books"],
        summary: "Create a new book",
        description: "Admin only - Add a new book to the library",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Book" },
            },
          },
        },
        responses: {
          201: { description: "Book created successfully" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/videos": {
      get: {
        tags: ["Videos"],
        summary: "List all videos",
        description: "Get paginated list of videos",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "level", in: "query", schema: { type: "string" } },
          { name: "school", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "List of videos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Video" },
                    },
                    pagination: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Videos"],
        summary: "Create a new video",
        description: "Admin only - Add a new educational video",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Video" },
            },
          },
        },
        responses: {
          201: { description: "Video created successfully" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/payments/pending": {
      get: {
        tags: ["Payments"],
        summary: "List pending payments",
        description:
          "Admin only - Get list of users with pending payment verification",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of pending payments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
      },
    },
    "/api/settings": {
      get: {
        tags: ["Settings"],
        summary: "Get settings",
        description: "Admin only - Get platform settings",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Settings data",
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
        description: "Admin only - Update platform settings",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  incubatorName: { type: "string" },
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
  },
};
