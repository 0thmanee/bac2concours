# Resource Creation Flow: Prisma → Frontend

This document describes how resources are created end-to-end and defines the **canonical pattern**. Files that deviate are listed in [Pattern violations](#pattern-violations).

---

## 1. Stack Overview

- **Database**: PostgreSQL via **Prisma** (`lib/prisma.ts`) — uses `@prisma/adapter-pg` and a connection pool.
- **API**: Next.js App Router route handlers under `app/api/`.
- **Backend layer**: Dedicated **services** in `lib/services/*.service.ts` use Prisma; API routes **never** call Prisma directly for create/update/delete.
- **Validation**: **Zod** schemas in `lib/validations/*.validation.ts` (create/update/filters); same schema can back both API and form.
- **Frontend**: React with **react-hook-form** + **zodResolver**, **TanStack Query** (mutations + cache invalidation), shared **apiClient** for HTTP.

---

## 2. Canonical Flow (Single Pattern)

For **Books**, **Videos**, **Schools**, and **Questions**, creation follows this path:

```
UI Form (react-hook-form + create*Schema)
    → useCreate*() mutation (apiClient.post to /api/*)
        → API route POST (auth + body parse + create*Schema.parse)
            → *Service.create(validated, userId)
                → prisma.*.create({ data: { ...validated, uploadedById } })
                    → DB
```

- **Auth**: Create endpoints use **`requireApiAdmin()`** from `lib/auth-security.ts` (returns user or throws `ApiAuthError` with status).
- **Body**: `req.json()` then **`create*Schema.parse(body)`**; on failure the route returns 400 with formatted Zod errors.
- **Service**: Receives typed `Create*Input` and `uploadedById`; performs **`prisma.*.create()`** (with optional `include` for relations). Side effects (e.g. notifications) stay in the service.
- **Response**: API returns **`{ success: true, message?, data }`**; hooks expect `data` and invalidate relevant query keys.

---

## 3. Resource-by-Resource Creation Flow

### 3.1 Books

| Layer          | Location                             | Details                                                                                                                                                                                  |
| -------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**     | `schema.prisma`                      | `Book` (title, author, school, category, coverFileId, fileUrl, fileName, fileSize, totalPages, level, subjects, tags, status, isPublic, uploadedById, etc.).                             |
| **Validation** | `lib/validations/book.validation.ts` | `createBookSchema` → `CreateBookInput`.                                                                                                                                                  |
| **Service**    | `lib/services/book.service.ts`       | `create(data, uploadedById)` → `prisma.book.create({ ...data, uploadedById })`, then optional `notificationService.onNewResourcePublished("BOOK", ...)`.                                 |
| **API**        | `app/api/books/route.ts`             | `POST`: `requireApiAdmin()` → `createBookSchema.parse(body)` → `bookService.create(validated, user.id)` → 201 + `data: book`.                                                            |
| **Hook**       | `lib/hooks/use-books.ts`             | `useCreateBook()`: `apiClient.post(API_ROUTES.BOOKS, data)`; onSuccess invalidates books list/stats/filters.                                                                             |
| **Frontend**   | `app/admin/books/new/page.tsx`       | Form with `createBookSchema` + zodResolver. Optional: upload cover via `useUploadFile` → set `data.coverFileId` → `createMutation.mutateAsync(data)`; on failure, delete uploaded cover. |

### 3.2 Videos

| Layer          | Location                              | Details                                                                                                                                                               |
| -------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**     | `schema.prisma`                       | `Video` (title, description, url, thumbnailFileId, school, category, level, subjects, tags, duration, youtubeId, status, isPublic, uploadedById, etc.).               |
| **Validation** | `lib/validations/video.validation.ts` | `createVideoSchema` (YouTube URL), `CreateVideoInput`.                                                                                                                |
| **Service**    | `lib/services/video.service.ts`       | `create(data, uploadedById)`: `extractYouTubeId(data.url)`, then `prisma.video.create({ ...data, youtubeId, uploadedById })`; optional notification if status ACTIVE. |
| **API**        | `app/api/videos/route.ts`             | `POST`: `requireApiAdmin()` → `createVideoSchema.parse(body)` → `videoService.create(validated, user.id)` → 201.                                                      |
| **Hook**       | `lib/hooks/use-videos.ts`             | `useCreateVideo()`: `apiClient.post(API_ROUTES.VIDEOS, data)`; invalidates videos + stats.                                                                            |
| **Frontend**   | `app/admin/videos/new/page.tsx`       | Form + optional thumbnail: `useUploadFile` → `data.thumbnailFileId` → `createMutation.mutateAsync(data)`.                                                             |

### 3.3 Schools

| Layer          | Location                               | Details                                                                                                                                                                                             |
| -------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**     | `schema.prisma`                        | `School` (name, shortName, type, description, imageFileId, logoFileId, city, address, region, contact, admission, stats, programs, specializations, etc., uploadedById).                            |
| **Validation** | `lib/validations/school.validation.ts` | `createSchoolSchema` (type, optional image/logo file ids, arrays, numbers).                                                                                                                         |
| **Service**    | `lib/services/school.service.ts`       | `create(data, uploadedById)`: clean empty strings for email/website, then `prisma.school.create({ ...cleanedData, uploadedById })`. No notification.                                                |
| **API**        | `app/api/schools/route.ts`             | `POST`: `requireApiAdmin()` → `createSchoolSchema.parse(body)` → `schoolService.create(validated, user.id)` → 201.                                                                                  |
| **Hook**       | `lib/hooks/use-schools.ts`             | `useCreateSchool()`: `apiClient.post(API_ROUTES.SCHOOLS, data)`; invalidates schools + stats.                                                                                                       |
| **Frontend**   | `app/admin/schools/new/page.tsx`       | Form + optional image and logo: upload both via `useUploadFile`, set `data.imageFileId` / `data.logoFileId`; on failure, `useDeleteFile` for uploaded IDs, then `createMutation.mutateAsync(data)`. |

### 3.4 Questions (QCM)

| Layer          | Location                            | Details                                                                                                                                                                                |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**     | `schema.prisma`                     | `Question` (text, options JSON, correctIds, explanation, school, matiere, chapter, difficulty, imageFileId, tags, points, timeLimit, status, isPublic, uploadedById, etc.).            |
| **Validation** | `lib/validations/qcm.validation.ts` | `createQuestionSchema` (options array with id/text/contentType/imageFileId, correctIds, etc.).                                                                                         |
| **Service**    | `lib/services/qcm.service.ts`       | `createQuestion(data, uploadedById)` → `prisma.question.create({ ...data, uploadedById })`; optional notification if ACTIVE and public.                                                |
| **API**        | `app/api/questions/route.ts`        | `POST`: `requireApiAdmin()` → `createQuestionSchema.parse(body)` → `qcmService.createQuestion(validated, user.id)` → 201.                                                              |
| **Hook**       | `lib/hooks/use-qcm.ts`              | `useCreateQuestion()`: `apiClient.post(API_ROUTES.QUESTIONS, data)`; invalidates questions list/stats/filters and quiz filters.                                                        |
| **Frontend**   | `app/admin/qcm/new/page.tsx`        | Form: optional question image + per-option images uploaded via `useUploadFile`; options and correctIds built in state, then merged into `data` and `createMutation.mutateAsync(data)`. |

### 3.5 Users

| Layer          | Location                             | Details                                                                                                                                                                                                  |
| -------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**     | `schema.prisma`                      | `User` (email, password, name, role, status, emailVerified, payment fields, etc.).                                                                                                                       |
| **Validation** | `lib/validations/user.validation.ts` | `createUserSchema` (name, email, password, role, optional status).                                                                                                                                       |
| **Service**    | `lib/services/user.service.ts`       | `create(data)`: check existing email, hash password, `prisma.user.create({ name, email, password, role, status, emailVerified })` (no uploadedById; user is the entity).                                 |
| **API**        | `app/api/users/route.ts`             | `POST`: uses `handleApiRequest` + `requireAdmin()` from `lib/api-utils` (not `requireApiAdmin`). Body: `createUserSchema.parse(body)` → `userService.create(validated)`; on duplicate email returns 400. |
| **Hook**       | (used from admin users page)         | Create user mutation calling `/api/users` (e.g. `useCreateUser()`).                                                                                                                                      |
| **Frontend**   | `app/admin/users/page.tsx`           | `CreateUserDialog`: form with `createUserSchema`; `onCreate.mutateAsync(data)` (no file upload).                                                                                                         |

### 3.6 User registration (public)

| Layer   | Location                         | Details                                                                                                                                                                                                                                                           |
| ------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API** | `app/api/auth/register/route.ts` | No service layer. Validates with `registerSchema`, checks existing user, hashes password, first user → ADMIN/ACTIVE/emailVerified, others → STUDENT/INACTIVE; **`prisma.user.create(...)` directly in route**. Then token + verification email and notifications. |

### 3.7 Files

| Layer        | Location                                | Details                                                                                                                                                                                                       |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**   | `schema.prisma`                         | `File` (filename, storagePath, publicUrl, mimeType, size, type, uploadedById, metadata).                                                                                                                      |
| **Service**  | `lib/services/file.service.ts`          | `uploadFile({ file, userId, type, folder, metadata })`: upload buffer to **Supabase Storage**, then `prisma.file.create({ filename, storagePath, publicUrl, mimeType, size, type, uploadedById, metadata })`. |
| **API**      | `app/api/files/upload/route.ts`         | `POST`: `validateApiSession()` (not requireApiAdmin), FormData (file, type, folder, metadata), `fileUploadSchema` + size/MIME checks → `fileService.uploadFile(...)` → 200 + file record.                     |
| **Frontend** | Used inside Book/Video/School/QCM forms | `useUploadFile()`: FormData POST to `/api/files/upload`; result `data.id` (and `publicUrl`) used as `coverFileId` / `thumbnailFileId` / `imageFileId` / `logoFileId` when creating the main resource.         |

Files are **only** created via upload; Books/Videos/Schools/Questions reference them by ID.

### 3.8 Settings resources (Categories, Levels, Matières)

| Layer       | Location                                                     | Details                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**  | `schema.prisma`                                              | `Category`, `Level`, `Matiere` (name, description, isActive, order).                                                                                                                                |
| **Service** | `lib/services/settings-resources.service.ts`                 | `categoryService.create`, `levelService.create`, `matiereService.create`: compute `order` (max+1 if not provided), then `prisma.category.create` / `prisma.level.create` / `prisma.matiere.create`. |
| **API**     | `app/api/settings/categories/route.ts` (and levels/matieres) | `POST`: **`validateApiSession()`** + **manual** `user.role !== "ADMIN"` check (not `requireApiAdmin()`), then `createCategorySchema.parse(body)` → `categoryService.create(validated)` → 201.       |

---

## 4. Cross-Cutting Details

- **Auth for create**: Canonical pattern uses **`requireApiAdmin()`** in the route (throws 401/403). No redirects in API routes.
- **Validation**: One Zod create schema per resource; types `Create*Input` inferred. Same schema can back the form (zodResolver).
- **Errors**: API returns `{ error: string }` (or Zod formatting); frontend uses `getErrorMessage(error)` and toast.
- **Response shape**: `{ success: true, message?, data }` for success; `{ success: false, error }` or equivalent for errors when using the shared pattern.
- **Cache**: After create, hooks invalidate list/stats/filters so lists and dashboards stay in sync.

---

## 5. Summary Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (Admin)                                                        │
│  app/admin/{books,videos,schools,qcm}/new/page.tsx  |  users page dialog  │
│  • react-hook-form + create*Schema (zodResolver)                          │
│  • Optional: useUploadFile → set *FileId on data                           │
│  • useCreate*().mutateAsync(data)                                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  HOOKS  lib/hooks/use-*.ts                                                │
│  • useCreateBook/Video/School/Question/User                               │
│  • apiClient.post(API_ROUTES.*, data)  |  GET /api/files/upload (FormData)│
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  API ROUTES  app/api/{books,videos,schools,questions,files/upload}/route │
│  • requireApiAdmin() (or requireAdmin for users, none for register)      │
│  • body = await req.json() (or FormData for files)                        │
│  • create*Schema.parse(body) → 400 on ZodError                            │
│  • *Service.create(validated, user.id)                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  SERVICES  lib/services/*.service.ts                                     │
│  • book/video/school/qcm: prisma.*.create({ ...data, uploadedById })      │
│  • user: hash password, prisma.user.create                               │
│  • file: Supabase upload + prisma.file.create                            │
│  • Optional: notificationService.onNewResourcePublished / etc.            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PRISMA  lib/prisma.ts  →  schema.prisma                                 │
│  • Single PrismaClient (pg adapter, pool)                                 │
│  • Models: User, Book, Video, School, Question, File, Category, Level…   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Pattern Violations

**Original (canonical) pattern:**

1. **Auth**: Use **`requireApiAdmin()`** from `lib/auth-security.ts` for admin-only create routes. Returns user or throws `ApiAuthError`; no redirects.
2. **No Prisma in routes**: All DB writes go through a **service** in `lib/services/*.service.ts`.
3. **Response**: Success = `NextResponse.json({ success: true, message?, data }, { status: 201 })`; errors via explicit returns with status and `{ error }`.
4. **Error handling**: Catch `ApiAuthError`, `ZodError`, then generic; return JSON with status, no `handleApiRequest` wrapper that changes response shape.

The following **files and resources break** this pattern:

| #   | File                                   | Resource             | What’s not allowed                                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `app/api/users/route.ts`               | User (admin-created) | Uses **`handleApiRequest`** + **`requireAdmin()`** from `lib/api-utils.ts` instead of **`requireApiAdmin()`** from `lib/auth-security.ts`. Response is **`successResponse(result)`** (only `{ success: true, data }`), so success shape differs from canonical `{ success: true, message?, data }` and error shape is different. |
| 2   | `app/api/auth/register/route.ts`       | User (registration)  | **Prisma used directly in the route** (`prisma.user.create`). No service layer. Auth is public (no requireApiAdmin), which is intentional but structure breaks “no Prisma in routes” and “go through service”.                                                                                                                   |
| 3   | `app/api/settings/categories/route.ts` | Category             | Uses **`validateApiSession()`** + **manual** `if (!user \|\| user.role !== "ADMIN")` instead of **`requireApiAdmin()`**. Inconsistent auth pattern.                                                                                                                                                                              |
| 4   | `app/api/settings/levels/route.ts`     | Level                | Same as categories: **`validateApiSession()`** + manual admin check instead of **`requireApiAdmin()`**.                                                                                                                                                                                                                          |
| 5   | `app/api/settings/matieres/route.ts`   | Matière              | Same as categories: **`validateApiSession()`** + manual admin check instead of **`requireApiAdmin()`**.                                                                                                                                                                                                                          |
| 6   | `app/api/files/upload/route.ts`        | File                 | Uses **`validateApiSession()`** (any authenticated user can upload). Allowed if upload is intentionally non-admin; if upload should be admin-only, it should use **`requireApiAdmin()`** to match the pattern.                                                                                                                   |

**Summary:**

- **Auth**: Users API and settings (categories/levels/matieres) don’t use `requireApiAdmin()`; users uses a different helper and response wrapper.
- **No Prisma in routes**: Register route calls `prisma.user.create` directly.
- **Response shape**: Users API uses `handleApiRequest` / `successResponse`, which doesn’t match the canonical success/error format.

To align with the original pattern you would:

- Use **`requireApiAdmin()`** in `app/api/users/route.ts`, `app/api/settings/categories/route.ts`, `app/api/settings/levels/route.ts`, `app/api/settings/matieres/route.ts` (and optionally in `app/api/files/upload/route.ts` if upload must be admin-only).
- In users route: drop `handleApiRequest`, return `NextResponse.json({ success: true, message?, data }, { status: 201 })` on success and explicit error JSON on failure.
- For register: introduce e.g. `authService.register(validated)` that performs the user existence check, hash, and `prisma.user.create`, and call it from the route so the route stays free of direct Prisma.
