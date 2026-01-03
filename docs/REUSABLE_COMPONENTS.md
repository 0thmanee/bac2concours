# Reusable Component Library

## Overview

This document outlines the reusable components available for building consistent CRUD interfaces across the application. These components follow our design system and ensure consistency across Books, Startups, and future resources.

## Component Catalog

### 1. SearchInput

**Location:** `components/ui/search-input.tsx`

A branded search input with clear button and consistent styling.

**Props:**

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
}
```

**Features:**

- Standard height: `h-10`
- Built-in clear button (X icon)
- Brand color focus states
- Dark mode support
- Debounced search capability

**Usage:**

```tsx
<SearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Rechercher un livre..."
  containerClassName="flex-1 min-w-[250px]"
/>
```

---

### 2. FilterSelect

**Location:** `components/ui/filter-select.tsx`

A dropdown filter built on Shadcn Select with consistent styling.

**Props:**

```typescript
interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[] | { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  label?: string;
}
```

**Features:**

- Standard height: `h-10`
- Supports string arrays or object arrays
- Brand color focus and selection states
- Dark mode support
- No shadow (clean design)

**Usage:**

```tsx
<FilterSelect
  value={selectedCategory}
  onChange={setSelectedCategory}
  options={["Tous", "Mathématiques", "Physique"]}
  placeholder="Catégorie"
  className="w-[180px]"
/>

// With object options
<FilterSelect
  value={selectedStatus}
  onChange={setSelectedStatus}
  options={[
    { value: "all", label: "Tous les statuts" },
    { value: "active", label: "Actif" },
    { value: "inactive", label: "Inactif" },
  ]}
/>
```

---

### 3. FilterPanel

**Location:** `components/ui/filter-panel.tsx`

A card wrapper for filter controls with consistent spacing.

**Props:**

```typescript
interface FilterPanelProps {
  children: React.ReactNode;
  className?: string;
}
```

**Features:**

- Standard padding: `p-5`
- Clean border (no shadow)
- Dark mode support
- Responsive layout support

**Usage:**

```tsx
<FilterPanel>
  <div className="flex flex-col sm:flex-row gap-3">
    <SearchInput {...} />
    <FilterSelect {...} />
    <FilterSelect {...} />
  </div>
</FilterPanel>
```

---

### 4. FilterGrid

**Location:** `components/ui/filter-panel.tsx`

A responsive grid layout for multiple filters.

**Props:**

```typescript
interface FilterGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}
```

**Usage:**

```tsx
<FilterPanel>
  <FilterGrid columns={3}>
    <FilterSelect label="Catégorie" {...} />
    <FilterSelect label="Niveau" {...} />
    <FilterSelect label="Statut" {...} />
  </FilterGrid>
</FilterPanel>
```

---

### 5. DataTable

**Location:** `components/ui/data-table.tsx`

A generic table component with loading and empty states.

**Props:**

```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}
```

**Features:**

- Generic type support for any data type
- Loading skeleton states
- Empty state with custom message
- Dark mode support
- Clean design (no shadows)

**Usage:**

```tsx
interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
}

const columns: Column<Book>[] = [
  {
    header: "Titre",
    accessor: "title",
  },
  {
    header: "Auteur",
    accessor: "author",
  },
  {
    header: "Statut",
    cell: (book) => (
      <Badge variant={book.status === "ACTIVE" ? "success" : "secondary"}>
        {book.status}
      </Badge>
    ),
  },
];

<DataTable
  columns={columns}
  data={books}
  isLoading={isLoading}
  emptyMessage="Aucun livre trouvé"
/>;
```

---

## Design Patterns

### Standard Layouts

#### List Page with Filters

```tsx
export default function ResourceListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tous");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ops-primary">Resources</h1>
        <p className="mt-1 text-sm text-ops-secondary">Manage your resources</p>
      </div>

      {/* Filters */}
      <FilterPanel>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
            containerClassName="flex-1 min-w-[250px]"
          />
          <FilterSelect
            value={selectedFilter}
            onChange={setSelectedFilter}
            options={filterOptions}
            className="w-full sm:w-[180px]"
          />
        </div>
      </FilterPanel>

      {/* Table */}
      <Card className="ops-card border border-ops">
        <DataTable columns={columns} data={resources} isLoading={isLoading} />
      </Card>
    </div>
  );
}
```

---

## Security Patterns

### API Route Security

All API routes **MUST** use the secure authentication from `lib/auth-security.ts`:

#### For Admin-Only Mutations (POST, PATCH, DELETE)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin, ApiAuthError } from "@/lib/auth-security";

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAdmin(); // Validates against database

    // Your logic here

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### For Read Operations with Role-Based Access

```typescript
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";

export async function GET(req: NextRequest) {
  try {
    const user = await validateApiSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply role-based filtering
    const filters = parseQueryParams(req);

    if (user.role !== "ADMIN") {
      // Force public-only for non-admins
      filters.isPublic = true;
      filters.status = "ACTIVE";
    }

    const data = await service.findAll(filters);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    // Error handling
  }
}
```

---

## Service Layer Pattern

Services contain **pure business logic** with no authentication:

```typescript
// lib/services/resource.service.ts
class ResourceService {
  async findAll(filters: ResourceFilters) {
    return await prisma.resource.findMany({
      where: {
        ...(filters.search && {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
        ...(filters.status && { status: filters.status }),
        ...(filters.isPublic !== undefined && { isPublic: filters.isPublic }),
      },
      orderBy: { [filters.sortBy || "createdAt"]: filters.sortOrder || "desc" },
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
      take: filters.limit || 20,
    });
  }

  async findById(id: string) {
    return await prisma.resource.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async create(data: CreateResourceInput, userId: string) {
    return await prisma.resource.create({
      data: { ...data, uploadedById: userId },
    });
  }

  async update(id: string, data: UpdateResourceInput) {
    return await prisma.resource.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.resource.delete({
      where: { id },
    });
  }
}
```

---

## Validation Pattern

Use Zod schemas for all inputs:

```typescript
// lib/validations/resource.validation.ts
import { z } from "zod";

export const createResourceSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PROCESSING"]).default("ACTIVE"),
  isPublic: z.boolean().default(true),
});

export const updateResourceSchema = createResourceSchema.partial();

export const resourceFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PROCESSING"]).optional(),
  isPublic: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceFilters = z.infer<typeof resourceFiltersSchema>;
```

---

## React Query Hooks Pattern

```typescript
// lib/hooks/use-resources.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, API_ROUTES } from "@/lib/constants";

export function useResources(filters?: ResourceFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.RESOURCES.LIST(filters),
    queryFn: () => apiClient.get(API_ROUTES.RESOURCES, { params: filters }),
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.RESOURCES.DETAIL(id),
    queryFn: () => apiClient.get(`${API_ROUTES.RESOURCES}/${id}`),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceInput) =>
      apiClient.post(API_ROUTES.RESOURCES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.ALL });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceInput }) =>
      apiClient.patch(`${API_ROUTES.RESOURCES}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RESOURCES.DETAIL(id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.ALL });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`${API_ROUTES.RESOURCES}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESOURCES.ALL });
    },
  });
}
```

---

## Design System Standards

### Heights

- All inputs, selects, and buttons: `h-10`
- Padding: `py-0` with `leading-10` for vertical centering

### Borders

- Use `border border-ops` for standard borders
- Use `border-gray-200 dark:border-gray-800` for component-level control

### Cards

- Use `ops-card` class for consistent card styling
- Use `border border-ops` for visible borders
- **No shadows** - clean, flat design

### Colors

- Primary brand: `brand-500` (hover: `brand-600`)
- Focus rings: `focus:ring-brand-500/20 focus:border-brand-500`
- Text hierarchy:
  - Primary: `text-ops-primary` (headings)
  - Secondary: `text-ops-secondary` (body)
  - Tertiary: `text-ops-tertiary` (labels, metadata)

### Spacing

- Section gaps: `space-y-6`
- Form gaps: `space-y-4`
- Filter gaps: `gap-3`
- Card padding: `p-5` or `p-6`

---

## Checklist for New Resources

When adding a new resource (e.g., Categories, Expenses, etc.):

### 1. Prisma Schema ✓

- [ ] Define model with proper fields
- [ ] Add status enum if needed
- [ ] Include `uploadedById` relation if applicable
- [ ] Add `createdAt` and `updatedAt` timestamps
- [ ] Add proper indexes

### 2. Service Layer ✓

- [ ] Create `lib/services/[resource].service.ts`
- [ ] Implement `findAll` with filtering/pagination
- [ ] Implement `findById` with relations
- [ ] Implement `create` with user ID
- [ ] Implement `update`
- [ ] Implement `delete`
- [ ] No authentication in service layer

### 3. Validation ✓

- [ ] Create `lib/validations/[resource].validation.ts`
- [ ] Define `createResourceSchema`
- [ ] Define `updateResourceSchema` (partial)
- [ ] Define `resourceFiltersSchema`
- [ ] Export TypeScript types

### 4. API Routes ✓

- [ ] Create `app/api/[resources]/route.ts`
  - [ ] GET with `validateApiSession`
  - [ ] Role-based filtering for non-admins
  - [ ] POST with `requireApiAdmin`
- [ ] Create `app/api/[resources]/[id]/route.ts`
  - [ ] GET with `validateApiSession`
  - [ ] PATCH with `requireApiAdmin`
  - [ ] DELETE with `requireApiAdmin`
- [ ] Proper error handling with `ApiAuthError`

### 5. React Query Hooks ✓

- [ ] Create `lib/hooks/use-[resources].ts`
- [ ] `useResources` for list
- [ ] `useResource` for detail
- [ ] `useCreateResource` with invalidation
- [ ] `useUpdateResource` with invalidation
- [ ] `useDeleteResource` with invalidation

### 6. Admin Pages ✓

- [ ] List page: `app/admin/[resources]/page.tsx`
  - [ ] Use `SearchInput` and `FilterSelect`
  - [ ] Use `FilterPanel`
  - [ ] Use `DataTable` or custom cards
  - [ ] Add "New" button
- [ ] New page: `app/admin/[resources]/new/page.tsx`
  - [ ] Form with validation
  - [ ] Use `ops-card` and `border border-ops`
  - [ ] Success/error toasts
- [ ] View page: `app/admin/[resources]/[id]/page.tsx`
  - [ ] Display all details
  - [ ] Edit and Delete actions
  - [ ] Confirmation dialogs
- [ ] Edit page: `app/admin/[resources]/[id]/edit/page.tsx`
  - [ ] Pre-populate form
  - [ ] Same validation as create

### 7. Constants ✓

- [ ] Add to `API_ROUTES` in `lib/constants.ts`
- [ ] Add to `ADMIN_ROUTES` in `lib/constants.ts`
- [ ] Add success/error messages
- [ ] Add query keys pattern

---

## Migration Guide: Books vs Startups

### Key Differences Identified

1. **Authentication Method** ✅ FIXED

   - ❌ Startups used `requireAdmin` from `lib/api-utils.ts`
   - ✅ Books uses `requireApiAdmin` from `lib/auth-security.ts`
   - **Action Taken:** Updated all startup routes to use secure auth

2. **Response Format**

   - Startups: Uses `handleApiRequest` wrapper (returns `{ success, data }`)
   - Books: Manual try/catch with explicit `NextResponse.json`
   - **Both are valid** - Books pattern is more explicit and easier to debug

3. **Error Handling**
   - Startups: `ApiError` from `api-utils.ts`
   - Books: `ApiAuthError` from `auth-security.ts`
   - **Recommendation:** Use `ApiAuthError` for consistency

---

## Security Best Practices

### ✅ DO

- Use `requireApiAdmin` for all mutations (POST, PATCH, DELETE)
- Use `validateApiSession` for reads with role-based filtering
- Validate all inputs with Zod schemas
- Check database state (not just JWT) for every request
- Return 404 for unauthorized access (don't reveal existence)
- Use consistent error messages from `MESSAGES` constants

### ❌ DON'T

- Don't check auth in service layer (handle at API level)
- Don't trust JWT alone (always validate against database)
- Don't reveal whether resource exists for unauthorized users
- Don't expose internal error details to client
- Don't allow non-admins to see inactive/private resources

---

## Summary

This component library provides everything needed to build consistent, secure CRUD interfaces:

- **UI Components:** SearchInput, FilterSelect, FilterPanel, DataTable
- **Security:** Database-validated auth with `requireApiAdmin`/`validateApiSession`
- **Services:** Pure business logic separated from auth
- **Validation:** Zod schemas for all inputs
- **Hooks:** React Query patterns for data fetching
- **Design:** Clean, flat design with no shadows, consistent heights and spacing

Follow these patterns for all new resources to maintain consistency and security across the application.
