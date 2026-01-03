# Authentication Flow - Quick Reference

## 🔄 Complete User Journeys

### ADMIN Journey (First User)

```
1. Register
   ↓
2. Auto-verified, Auto-activated
   ↓
3. Login → Redirect to /admin dashboard
   ↓
4. Full access to:
   - User management
   - Startup management
   - Payment approvals
   - All admin features
```

### FOUNDER Journey (Subsequent Users)

```
1. Register
   ↓
2. Email sent → Verify email
   ↓
3. Login → Redirect to /founder/payment
   ↓
4. Upload payment proof
   ↓
5. Status: PENDING → Show waiting page
   ↓
6. Admin Reviews
   ↓
   ┌─────────────┴──────────────┐
   ↓                            ↓
7a. APPROVED                 7b. REJECTED
   - User.status = ACTIVE       - Rejection reason stored
   - Email: Approval notice     - Email: Rejection + reason
   - Redirect to dashboard      - Redirect to rejection page
   - Full founder access        - Can resubmit (back to step 4)
```

## 🛡️ Protection Helpers Reference

### Server Components (Layouts)

```typescript
// Any authenticated user
const user = await requireAuth();
// → Redirects to /login if not authenticated
// → Redirects to /login if email not verified
// → Returns User object

// Admin only
const admin = await requireAdmin();
// → All checks from requireAuth()
// → Redirects to /forbidden if not ADMIN
// → Returns User object (role: ADMIN)

// Founder only
const founder = await requireFounder();
// → All checks from requireAuth()
// → Redirects to /forbidden if not FOUNDER
// → Returns User object (role: FOUNDER)
```

### API Routes

```typescript
// Any authenticated user
const user = await validateApiSession();
// → Returns User | null (no throw)

const user = await requireApiAuth();
// → Throws ApiAuthError(401) if not authenticated
// → Returns User object

// Admin only
const admin = await requireApiAdmin();
// → Throws ApiAuthError(401) if not authenticated
// → Throws ApiAuthError(403) if not ADMIN
// → Returns User object

// Founder only
const founder = await requireApiFounder();
// → Throws ApiAuthError(401) if not authenticated
// → Throws ApiAuthError(403) if not FOUNDER
// → Returns User object
```

## 📁 File Location Reference

### Authentication

| Feature | File Path |
|---------|-----------|
| NextAuth config | `lib/auth.ts` |
| Auth helpers | `lib/auth-security.ts` |
| Auth validation | `lib/validations/auth.validation.ts` |
| Registration API | `app/api/auth/register/route.ts` |
| Email verification | `app/api/auth/verify-email/route.ts` |
| Login page | `app/(auth)/login/page.tsx` |
| Register page | `app/(auth)/register/page.tsx` |

### Payment System

| Feature | File Path |
|---------|-----------|
| Payment types | `lib/types/payment.ts` |
| Payment hooks | `lib/hooks/use-payment.ts` |
| Payment service | `lib/services/payment.service.ts` |
| Payment validation | `lib/validations/payment.validation.ts` |
| Upload page | `app/founder/payment/page.tsx` |
| Rejection page | `app/founder/payment-rejected/page.tsx` |
| Admin review page | `app/admin/payments/page.tsx` |
| Upload API | `app/api/payments/upload/route.ts` |
| Review API | `app/api/payments/[userId]/review/route.ts` |
| Status API | `app/api/payments/status/route.ts` |
| Pending API | `app/api/payments/pending/route.ts` |

### Layouts

| Route Pattern | Layout File |
|--------------|-------------|
| `/admin/*` | `app/admin/layout.tsx` |
| `/founder` | `app/founder/layout.tsx` |
| `/founder/(dashboard)/*` | `app/founder/(dashboard)/layout.tsx` |
| `/founder/payment` | `app/founder/payment/layout.tsx` |
| `/founder/payment-rejected` | `app/founder/payment-rejected/layout.tsx` |

## 🔐 Validation Schemas

### Registration
```typescript
registerSchema = {
  name: string (2-100 chars),
  email: string (valid email, max 255),
  password: string (8-128 chars, 1 upper, 1 lower, 1 number)
}
```

### Login
```typescript
loginSchema = {
  email: string (valid email),
  password: string (min 1 char)
}
```

### Payment Review
```typescript
reviewPaymentSchema = {
  action: "approve" | "reject",
  rejectionReason?: string (required if reject, min 10 chars)
}
```

### File Upload
```typescript
- Max size: 5 MB (VALIDATION.PAYMENT.MAX_FILE_SIZE)
- Allowed types: image/jpeg, image/png, image/webp, application/pdf
```

## 🎯 Payment Status Values

```typescript
enum PaymentStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",  // Just registered, no upload yet
  PENDING = "PENDING",              // Uploaded, awaiting admin review
  APPROVED = "APPROVED",            // Admin approved, can access dashboard
  REJECTED = "REJECTED"             // Admin rejected, can resubmit
}
```

## 🚦 Redirect Rules

### Unauthenticated
- Any protected route → `/login?callbackUrl={route}`

### Wrong Role
- Founder accessing admin → `/forbidden`
- Admin accessing founder → `/forbidden`

### Email Not Verified
- Try to login → `/login?error=email_not_verified`

### Payment Status (Founders)

| Current Status | Accessing `/founder` | Result |
|----------------|---------------------|--------|
| NOT_SUBMITTED | Dashboard | Redirect to `/founder/payment` |
| PENDING | Dashboard | Redirect to `/founder/payment` |
| REJECTED | Dashboard | Redirect to `/founder/payment-rejected` |
| APPROVED | Dashboard | ✅ Access granted |
| APPROVED | Payment page | Redirect to `/founder` |
| REJECTED | Payment page | Redirect to `/founder/payment-rejected` |
| NOT_SUBMITTED/PENDING | Rejection page | Redirect to `/founder/payment` |

## 📧 Email Notifications

| Event | Recipients | Template |
|-------|-----------|----------|
| New user registration | User | Verification email with link |
| New user registration | All admins | New user notification |
| Payment uploaded | All admins | New payment notification |
| Payment approved | Founder | Approval notice + dashboard link |
| Payment rejected | Founder | Rejection notice + reason + resubmit link |

## 🧪 Quick Test Scenarios

### Test Admin Access
```bash
1. Register first user (becomes admin)
2. Should login without email verification
3. Should land on /admin dashboard
4. Should see all admin features
```

### Test Founder Happy Path
```bash
1. Register (not first user)
2. Verify email via link
3. Login → should redirect to /founder/payment
4. Upload payment proof
5. Should show "waiting" message
6. Admin approves
7. Should receive email
8. Should access /founder dashboard
```

### Test Rejection Flow
```bash
1. Admin rejects payment with reason
2. Founder receives email with reason
3. Founder redirected to /founder/payment-rejected
4. Founder sees rejection reason
5. Founder clicks "Soumettre à nouveau"
6. Founder uploads new file
7. Process continues from step 5 of happy path
```

### Test Security
```bash
1. Try /admin as founder → should see 403 forbidden
2. Try /founder as admin → should see 403 forbidden
3. Try /founder without payment approval → redirect to payment page
4. Delete user while logged in → next request should fail auth
```

## 🎨 Constants Reference

```typescript
// Roles
USER_ROLE.ADMIN = "ADMIN"
USER_ROLE.FOUNDER = "FOUNDER"

// Status
USER_STATUS.ACTIVE = "ACTIVE"
USER_STATUS.INACTIVE = "INACTIVE"

// Payment Status
PAYMENT_STATUS.NOT_SUBMITTED = "NOT_SUBMITTED"
PAYMENT_STATUS.PENDING = "PENDING"
PAYMENT_STATUS.APPROVED = "APPROVED"
PAYMENT_STATUS.REJECTED = "REJECTED"

// Routes
AUTH_ROUTES.LOGIN = "/login"
AUTH_ROUTES.REGISTER = "/register"
FOUNDER_ROUTES.DASHBOARD = "/founder"
FOUNDER_ROUTES.PAYMENT = "/founder/payment"
FOUNDER_ROUTES.PAYMENT_REJECTED = "/founder/payment-rejected"
ADMIN_ROUTES.DASHBOARD = "/admin"
ADMIN_ROUTES.PAYMENTS = "/admin/payments"
```

---

**For detailed documentation, see:**
- [AUTH_FLOW_AUDIT.md](./AUTH_FLOW_AUDIT.md) - Comprehensive audit
- [AUTH_FLOW_CLEANUP_SUMMARY.md](./AUTH_FLOW_CLEANUP_SUMMARY.md) - Cleanup summary
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Security analysis
