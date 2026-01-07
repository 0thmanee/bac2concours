# IncubationOS - Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** database access (local or cloud)
- **Git** for version control

### 2. Clone & Install

```bash
# Navigate to project directory
cd IncubationOS

# Install dependencies
npm install
```

### 3. Database Setup

#### Option A: Cloud Database (Recommended for Quick Start)

**Using Neon (Free tier available)**

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string

**Using Supabase (Free tier available)**

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection String
4. Copy the connection string

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb incubationos

# Connection string will be:
# postgresql://YOUR_USERNAME@localhost:5432/incubationos
```

### 4. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your favorite editor
```

**Required environment variables:**

```env
# Database (from step 3)
DATABASE_URL="postgresql://user:password@host:5432/incubationos"

# Auth Secret (generate new one)
AUTH_SECRET="run: openssl rand -base64 32"

# Base URL
NEXTAUTH_URL="http://localhost:4000"
```

**Generate AUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 5. Database Migration & Seed

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:4000](http://localhost:4000)

### 7. Login with Demo Accounts

**Admin Account:**

- Email: `admin@incubationos.com`
- Password: `admin123456`

**Student Account:**

- Email: `student@example.com`
- Password: `student123456`

---

## 🔧 Detailed Configuration

### Optional Services (for full features)

#### File Storage (for receipt uploads)

**AWS S3:**

```env
S3_BUCKET_NAME="your-bucket-name"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
```

**Cloudflare R2 (S3-compatible):**

```env
S3_BUCKET_NAME="your-bucket-name"
S3_REGION="auto"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
```

#### Transactional Email

**Resend (Recommended):**

```env
EMAIL_FROM="noreply@yourdomain.com"
RESEND_API_KEY="re_123456789"
```

Get API key: [https://resend.com](https://resend.com)

**Postmark:**

```env
EMAIL_FROM="noreply@yourdomain.com"
POSTMARK_API_KEY="your-postmark-key"
```

#### Error Tracking (Optional)

**Sentry:**

```env
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project"
SENTRY_AUTH_TOKEN="your-auth-token"
```

Get started: [https://sentry.io](https://sentry.io)

---

## 📦 Available Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:4000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Database
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run migrations
npm run db:push          # Push schema without migration
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio (DB GUI)
```

---

## 🐛 Troubleshooting

### Issue: "Module '@prisma/client' has no exported member..."

**Solution:**

```bash
npm run db:generate
```

### Issue: Database connection error

**Solution:**

1. Check your `DATABASE_URL` in `.env`
2. Ensure database is running
3. Test connection:

```bash
npx prisma db pull
```

### Issue: Auth not working

**Solution:**

1. Ensure `AUTH_SECRET` is set in `.env`
2. Restart dev server
3. Clear browser cookies

### Issue: TypeScript errors

**Solution:**

```bash
# Check for errors
npm run type-check

# Regenerate Prisma types
npm run db:generate
```

### Issue: Port 4000 already in use

**Solution:**

```bash
# Use different port
PORT=3001 npm run dev
```

---

## 🚢 Production Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

2. **Connect to Vercel**

   - Go to [https://vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env`
   - **Important**: Generate a new `AUTH_SECRET` for production

4. **Deploy**
   - Vercel deploys automatically on push to main branch
   - Set up database (Neon/Supabase)
   - Run migrations in production

### Database Migration in Production

**Option 1: Vercel Build Command**

Update `package.json`:

```json
"scripts": {
  "build": "prisma generate && prisma migrate deploy && next build"
}
```

**Option 2: Manual Migration**

```bash
# After deploying
DATABASE_URL="your-production-db" npx prisma migrate deploy
```

---

## 📚 Next Steps

After setup, you can:

1. ✅ Explore the admin dashboard
2. ✅ Create your first startup
3. ✅ Set up budget categories
4. ✅ Submit and approve expenses
5. ✅ View reports

### Customize for Your Incubator

- Update incubator name in Settings
- Configure update frequency (weekly/monthly)
- Add your own budget categories
- Invite real students

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Generate new `AUTH_SECRET`
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Review database access permissions
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Review CORS settings if using external APIs

---

## 📞 Support

For issues or questions:

- Check [TECH_STACK.md](./TECH_STACK.md) for architecture details
- Review [README.md](./README.md) for MVP specifications
- Check GitHub Issues

---

## ⚡ Performance Tips

1. **Database Connection Pooling** (for production):

   ```env
   DATABASE_URL="postgresql://user:pass@host/db?connection_limit=10&pool_timeout=20"
   ```

2. **Enable Next.js Caching**:

   - Static pages cached automatically
   - Use `revalidate` for ISR

3. **Optimize Images**:
   - Use Next.js `<Image>` component
   - Configure image domains in `next.config.js`

---

## 🎯 MVP Completion Checklist

- [x] Tech stack configured
- [x] Database schema created
- [x] Authentication set up
- [ ] Core features implemented
- [ ] Testing completed
- [ ] Production deployment ready

**You're all set! Happy coding! 🚀**
