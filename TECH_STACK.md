# IncubationOS - Tech Stack Documentation

## 🚀 Project Overview

IncubationOS is a lightweight SaaS platform that helps incubators allocate budgets, track expenses, monitor startup progress, and generate reports.

## 📚 Tech Stack

### Frontend

- **Next.js 14+** (App Router) - React framework with server-side rendering
- **TypeScript** (Strict mode) - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible, customizable UI components

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Relational database

### Authentication

- **Auth.js (NextAuth v5)** - Authentication with JWT sessions
- **bcryptjs** - Password hashing
- **RBAC** - Role-based access control (ADMIN, STUDENT)

### Forms & Validation

- **React Hook Form** - Performant form handling
- **Zod** - Schema validation (shared client/server)

### Additional Tools

- **Resend** - Transactional emails
- **S3-Compatible Storage** - Receipt/document uploads
- **Sentry** - Error tracking (optional)

## 📁 Project Structure

```
IncubationOS/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (grouped)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── startups/             # Startup management
│   │   ├── expenses/             # Expense tracking
│   │   ├── reports/              # Reports & exports
│   │   └── settings/             # Settings
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Auth.js handlers
│   │   ├── startups/
│   │   ├── expenses/
│   │   ├── progress-updates/
│   │   └── reports/
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── layouts/                  # Layout components
│   └── dashboard/                # Dashboard-specific components
├── lib/                          # Utility functions
│   ├── actions/                  # Server actions
│   ├── services/                 # Business logic
│   ├── auth.ts                   # Auth.js configuration
│   ├── auth-utils.ts             # Auth helper functions
│   ├── prisma.ts                 # Prisma client
│   ├── validations.ts            # Zod schemas
│   └── utils.ts                  # General utilities
├── prisma/
│   └── schema.prisma             # Database schema
├── types/                        # TypeScript type definitions
│   └── next-auth.d.ts            # Auth.js types
├── middleware.ts                 # Next.js middleware (auth guard)
└── .env                          # Environment variables

```

## 🗄️ Database Schema

### Key Models:

- **User** - Admin & Student accounts with role-based access
- **Startup** - Incubator startups with budget allocation
- **BudgetCategory** - Categorized budget allocation (Marketing, Development, etc.)
- **Expense** - Expense submissions with approval workflow
- **ProgressUpdate** - Weekly/monthly progress tracking
- **IncubatorSettings** - Global incubator configuration

### Relationships:

- One-to-many: Startup → BudgetCategories
- One-to-many: Startup → Expenses
- One-to-many: Startup → ProgressUpdates
- Many-to-many: Startup ↔ Students (User)

## 🔐 Authentication Flow

1. **Login**: Email/password credentials
2. **Session**: JWT-based sessions
3. **Authorization**: Role-based route guards (middleware)
4. **Password Reset**: Email-based recovery (to be implemented)

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Visit http://localhost:4000

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🚢 Deployment

### Recommended: Vercel

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Database: Neon or Supabase

- **Neon**: https://neon.tech (Serverless Postgres)
- **Supabase**: https://supabase.com (Full backend platform)

## 🔒 Security Best Practices

- ✅ All passwords hashed with bcryptjs
- ✅ HTTPS in production
- ✅ Input validation on every endpoint
- ✅ Authorization checks per request
- ✅ Soft deletes for critical data
- ✅ Audit timestamps on all models

## 📝 MVP Scope

### ✅ Included in MVP:

- Budget allocation & tracking
- Expense submission & approval
- Progress updates (weekly/monthly)
- Admin dashboard
- Basic reporting & CSV export
- Role-based access control

### ❌ Not in MVP:

- Mobile app
- Real-time notifications
- Messaging/chat
- Mentor management
- Investor access
- AI features
- Payment processing

## 🎯 Next Steps After Setup

1. Configure your database connection in `.env`
2. Run migrations: `npx prisma migrate dev`
3. Create first admin user (see seed script)
4. Start building core features
5. Deploy to Vercel

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma client
npx prisma generate
```

### Type Errors

```bash
# Check for type errors
npm run type-check
```

## 📄 License

Proprietary - IncubationOS MVP
