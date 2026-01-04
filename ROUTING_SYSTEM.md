# Role-Based Routing System

## Overview

Complete role-based access control (RBAC) system with secure server-side authentication and authorization.

## Architecture

### 1. Route Definitions (`/lib/routes.ts`)

- **AUTH_ROUTES**: Login, Register, Verify Email, Forgot/Reset Password
- **ADMIN_ROUTES**: Dashboard, Startups, Budgets, Expenses, Settings, Reports
- **STUDENT_ROUTES**: Dashboard, Expenses, Progress Updates
- **Helper Functions**: `isPublicRoute()`, `isAdminRoute()`, `isStudentRoute()`, `getDefaultDashboard()`

### 2. Middleware (`/middleware.ts`)

Server-side route protection:

- Allows public routes (auth pages)
- Redirects unauthenticated users to `/login`
- Enforces role-based access (ADMIN → `/admin/*`, STUDENT → `/student/*`)
- Redirects unauthorized access to `/forbidden`
- Redirects root path (`/`) to role-specific dashboard

### 3. Layouts

#### Admin Layout (`/app/admin/layout.tsx`)

- Server component with `auth()` check
- Verifies ADMIN role
- Renders `AdminSidebar` + children
- Automatic redirects for unauthorized access

#### Student Layout (`/app/student/layout.tsx`)

- Server component with `auth()` check
- Verifies STUDENT role
- Renders `StudentSidebar` + children
- Automatic redirects for unauthorized access

### 4. Sidebars

#### Admin Sidebar (`/components/layouts/admin-sidebar.tsx`)

Navigation items:

- Dashboard (`/admin`)
- Startups (`/admin/startups`)
- Budgets (`/admin/budgets`)
- Expenses (`/admin/expenses`)
- Reports (`/admin/reports`)
- Settings (`/admin/settings`)
- Logout button

#### Student Sidebar (`/components/layouts/student-sidebar.tsx`)

Navigation items:

- Dashboard (`/student`)
- Expenses (`/student/expenses`)
- Progress Updates (`/student/progress`)
- Logout button

### 5. Dashboard Pages

#### Admin Dashboard (`/app/admin/page.tsx`)

- Welcome message with user name
- Stats grid: Total Startups, Budget Allocated, Total Expenses, Active Programs
- Quick actions: Add New Startup, Review Expenses, Generate Report

#### Student Dashboard (`/app/student/page.tsx`)

- Welcome message with user name
- Startup info card
- Stats grid: Budget Allocated, Total Expenses, Remaining Budget
- Quick actions: Submit Expense, Update Progress
- Recent activity feed

### 6. Feature Pages (Placeholder)

#### Admin Pages

- `/app/admin/startups/page.tsx` - Startup management
- `/app/admin/budgets/page.tsx` - Budget allocation
- `/app/admin/expenses/page.tsx` - Expense review
- `/app/admin/settings/page.tsx` - System settings
- `/app/admin/reports/page.tsx` - Report generation

#### Student Pages

- `/app/student/expenses/page.tsx` - Expense tracking
- `/app/student/progress/page.tsx` - Progress updates

### 7. Error Page

- `/app/forbidden/page.tsx` - 403 Access Denied
- Shows when users try to access routes they don't have permission for
- Links to dashboard and login

## Security Features

### Multi-Layer Protection

1. **Middleware Layer**: First line of defense, runs on every request
2. **Layout Layer**: Server-side auth checks in layouts
3. **Page Layer**: Additional auth verification in pages

### Server-Side Checks

- All auth checks use `await auth()` from Auth.js
- Server components prevent client-side bypassing
- Automatic redirects based on authentication and role

### Role-Based Access

- ADMIN can only access `/admin/*` routes
- STUDENT can only access `/student/*` routes
- Cross-role access blocked with `/forbidden` redirect

## User Flow

### Admin Login

1. User logs in with ADMIN role
2. Redirected to `/admin` (dashboard)
3. Sidebar navigation available
4. All admin routes accessible
5. Student routes blocked (→ `/forbidden`)

### Student Login

1. User logs in with STUDENT role
2. Redirected to `/student` (dashboard)
3. Sidebar navigation available
4. All student routes accessible
5. Admin routes blocked (→ `/forbidden`)

### Unauthenticated Access

1. User tries to access protected route
2. Middleware redirects to `/login`
3. After successful login, redirected to role-specific dashboard

## File Structure

```
/app
├── page.tsx (root - role-based redirect)
├── forbidden/
│   └── page.tsx (403 page)
├── admin/
│   ├── layout.tsx (admin layout + auth)
│   ├── page.tsx (admin dashboard)
│   ├── startups/page.tsx
│   ├── budgets/page.tsx
│   ├── expenses/page.tsx
│   ├── settings/page.tsx
│   └── reports/page.tsx
└── student/
    ├── layout.tsx (student layout + auth)
    ├── page.tsx (student dashboard)
    ├── expenses/page.tsx
    └── progress/page.tsx

/components/layouts
├── admin-sidebar.tsx
└── student-sidebar.tsx

/lib
├── routes.ts (route definitions + helpers)
└── auth.ts (Auth.js config)

middleware.ts (route protection)
```

## Next Steps

### Immediate

- Test complete auth flow with both roles
- Verify all redirects work correctly
- Test forbidden page access

### Feature Development

1. **Startup Management** (Admin)

   - CRUD operations for startups
   - Assign students to startups
   - Track startup status

2. **Budget Allocation** (Admin)

   - Create budget allocations
   - Track budget usage
   - Budget approval workflow

3. **Expense Tracking** (Student + Admin)

   - Submit expenses (Student)
   - Review/approve expenses (Admin)
   - Upload receipts
   - Track expense status

4. **Progress Updates** (Student)

   - Submit progress reports
   - Milestone tracking
   - File attachments

5. **Reports & Export** (Admin)

   - Financial reports
   - Expense summaries
   - Export to PDF/Excel

6. **Settings** (Admin)
   - User management
   - System configuration
   - Email templates

## Testing Checklist

- [ ] Admin can access all `/admin/*` routes
- [ ] Admin cannot access `/student/*` routes
- [ ] Student can access all `/student/*` routes
- [ ] Student cannot access `/admin/*` routes
- [ ] Unauthenticated users redirected to `/login`
- [ ] Root path (`/`) redirects to correct dashboard
- [ ] Forbidden page shows for unauthorized access
- [ ] Logout works from both sidebars
- [ ] Active route highlighting works in sidebars
- [ ] All dashboard stats display correctly
