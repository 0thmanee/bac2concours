# 🚀 2BAConcours - Guide de Développement

Ceci est le guide technique accompagnant le [README.md](./README.md) principal.

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database connection

# 3. Set up database
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Start development
npm run dev
```

**Identifiants de connexion:**

- Admin: `admin@2baconcours.ma` / `admin123456`
- Étudiant: `student@example.com` / `student123456`

📖 **Full setup instructions:** See [SETUP.md](./SETUP.md)

---

## 📚 Documentation

- **[README.md](./README.md)** - Complete MVP specification and requirements
- **[SETUP.md](./SETUP.md)** - Detailed setup and deployment guide
- **[TECH_STACK.md](./TECH_STACK.md)** - Architecture and tech stack documentation

---

## 🏗️ Tech Stack

**Frontend:** Next.js 14 (App Router) • TypeScript • Tailwind CSS • shadcn/ui  
**Backend:** Next.js API Routes • Prisma ORM • PostgreSQL  
**Auth:** Auth.js (NextAuth v5) • bcryptjs • JWT sessions  
**Forms:** React Hook Form • Zod validation

---

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API route handlers
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── dashboard/        # Dashboard components
├── lib/                   # Utilities & business logic
│   ├── actions/          # Server actions
│   ├── services/         # Business logic layer
│   ├── auth.ts           # Auth.js config
│   ├── prisma.ts         # Prisma client
│   └── validations.ts    # Zod schemas
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
└── types/                # TypeScript definitions
```

---

## 🗄️ Database Schema

```prisma
User (ADMIN | STUDENT)
  ├── QuizAttempt[]
  ├── BookFavorite[]
  └── VideoHistory[]

School
  ├── Book[]
  ├── Video[]
  └── QcmQuestion[]

Book
  └── BookFavorite[]

Video
  └── VideoHistory[]

QcmQuestion
  └── QuizAttempt[]

Settings (global config)
```

**Fonctionnalités Clés:**

- RBAC (Role-Based Access Control)
- Soft deletes on critical data
- Audit timestamps on all models
- Type-safe queries via Prisma

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Lint code
npm run type-check       # TypeScript checks

# Database
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run migrations
npm run db:push          # Push schema (no migration)
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio (GUI)
```

---

## 🔐 Authentication & Authorization

### Rôles

- **ADMIN**: Accès complet pour gérer le contenu (écoles, livres, vidéos, QCM)
- **STUDENT**: Accès aux ressources, quiz et suivi de progression

### Auth Flow

1. Email/password login via Auth.js
2. JWT session stored in secure cookie
3. Middleware protects routes
4. Role checks on every API endpoint

### Protected Routes

```typescript
// middleware.ts handles auth
// lib/auth-utils.ts provides helpers:
await getCurrentUser(); // Get user or redirect
await requireAdmin(); // Admin only
await requireStudent(); // Student only
```

---

## 📝 Form Validation

All forms use **React Hook Form** + **Zod** for type-safe validation:

```typescript
// Client-side
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpenseSchema } from "@/lib/validations";

const form = useForm({
  resolver: zodResolver(createExpenseSchema),
});

// Server-side (same schema!)
const validated = createExpenseSchema.parse(data);
```

**Available schemas:** See `lib/validations.ts`

---

## 🎨 UI Components

Built with **shadcn/ui** (Radix UI + Tailwind):

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
// ... and more
```

**Installed components:**

- Button, Input, Label, Textarea
- Card, Table, Badge
- Dialog, Dropdown Menu
- Form, Select
- Avatar, Separator, Skeleton

Add more: `npx shadcn@latest add [component]`

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy automatically

### Database Options

- **Neon**: Serverless Postgres (recommended)
- **Supabase**: Full backend platform
- **Railway**: Easy Postgres hosting

### Environment Variables

Required in production:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-new-one"
NEXTAUTH_URL="https://yourdomain.com"
```

Optional services:

```env
S3_BUCKET_NAME="..."          # Receipt uploads
RESEND_API_KEY="..."          # Transactional email
NEXT_PUBLIC_SENTRY_DSN="..."  # Error tracking
```

---

## 🧪 Testing Strategy (Post-MVP)

```bash
# Unit tests (to be added)
npm run test

# E2E tests (to be added)
npm run test:e2e

# Type checking
npm run type-check
```

---

## 🔒 Security Best Practices

✅ **Implemented:**

- Password hashing (bcryptjs)
- JWT sessions (httpOnly cookies)
- CSRF protection (Auth.js)
- Input validation (Zod)
- Role-based authorization
- Soft deletes

⚠️ **Production checklist:**

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] New AUTH_SECRET generated
- [ ] Database connection limits set
- [ ] Error tracking configured
- [ ] Rate limiting (add if needed)

---

## 📊 MVP Features Checklist

### ✅ Completed (Setup)

- [x] Next.js + TypeScript + Tailwind
- [x] Prisma + PostgreSQL schema
- [x] Auth.js authentication
- [x] RBAC implementation
- [x] Form validation (Zod)
- [x] UI components (shadcn/ui)

### 🚧 To Implement

- [ ] Login/Register pages
- [ ] Admin Dashboard
- [ ] Startup Management
- [ ] Budget Allocation
- [ ] Expense Tracking
- [ ] Progress Updates
- [ ] Reports & Export
- [ ] Settings Page

### ❌ Out of Scope (MVP)

- Mobile app
- Real-time notifications
- Chat/messaging
- AI features
- Payment processing

---

## 🐛 Common Issues

### Database connection error

```bash
# Check connection
npx prisma db pull

# Regenerate client
npm run db:generate
```

### Type errors after schema changes

```bash
npm run db:generate
npm run type-check
```

### Auth not working

```bash
# Check .env has AUTH_SECRET
# Restart dev server
# Clear browser cookies
```

---

## 📚 Learning Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Docs](https://www.prisma.io/docs)
- [Auth.js Guide](https://authjs.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

## 🎯 Development Workflow

1. **Plan Feature** → Check MVP spec in README.md
2. **Design Schema** → Update `prisma/schema.prisma`
3. **Create Migration** → `npm run db:migrate`
4. **Build API** → Create route in `app/api/`
5. **Build UI** → Create page in `app/`
6. **Validate** → Add Zod schema in `lib/validations.ts`
7. **Test** → Manual testing in dev
8. **Deploy** → Push to GitHub → Auto-deploy

---

## 📞 Support

- **MVP Spec**: See main [README.md](./README.md)
- **Setup Help**: See [SETUP.md](./SETUP.md)
- **Tech Details**: See [TECH_STACK.md](./TECH_STACK.md)

---

## ⚡ Performance Tips

1. Use Server Components by default
2. Add `loading.tsx` for instant feedback
3. Use Prisma `select` to limit fields
4. Enable Next.js caching with `revalidate`
5. Optimize images with next/image

---

## 🎉 You're Ready!

The tech stack is fully configured. Time to build the MVP!

**Next steps:**

1. Read the MVP spec: [README.md](./README.md)
2. Start with authentication pages
3. Build admin dashboard
4. Implement core features

**Happy coding! 🚀**
