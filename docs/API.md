# IncubationOS API Documentation

Complete interactive API documentation built with Swagger/OpenAPI 3.0.

## Access API Documentation

### Local Development

Visit: **http://localhost:4000/api-docs**

### Production

Visit: **https://your-domain.com/api-docs**

## Features

✅ **Interactive Testing** - Test all endpoints directly from the browser  
✅ **Complete Schema Documentation** - All request/response formats documented  
✅ **Authentication Support** - JWT bearer token authentication  
✅ **RBAC Documented** - Admin vs Student permissions clearly marked

## Authentication

All API endpoints require authentication via JWT token (except `/api/auth/[...nextauth]`).

To test authenticated endpoints:

1. Login via your auth provider
2. Copy your JWT token from browser cookies or session
3. Click "Authorize" button in Swagger UI
4. Paste token in the "Value" field (without "Bearer" prefix)
5. Test any endpoint!

## API Overview

### Resources

- **Startups** - CRUD operations for startup management
- **Budgets** - Budget category allocation and tracking
- **Expenses** - Expense submission, approval, and rejection
- **Progress** - Progress update tracking (immutable)
- **Settings** - Incubator configuration
- **Reports** - Analytics and reporting endpoints

### Roles

**ADMIN:**

- Full access to all operations
- Can approve/reject expenses
- Can manage all startups and budgets
- Can view all reports

**STUDENT:**

- Submit expenses for their startups
- View their own expenses
- Submit progress updates
- Limited to their assigned startups

## OpenAPI Spec

The raw OpenAPI 3.0 specification is available at:

- **JSON**: `/api/docs/openapi.json`

You can import this spec into:

- Postman
- Insomnia
- API testing tools
- Code generators

## Example Requests

### Create Startup (Admin)

```bash
POST /api/startups
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "TechStartup Inc",
  "description": "AI-powered solution",
  "industry": "Technology",
  "incubationStart": "2025-01-01",
  "incubationEnd": "2025-12-31",
  "totalBudget": 100000,
  "studentIds": ["student-uuid-1"]
}
```

### Submit Expense (Student)

```bash
POST /api/expenses
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "amount": 5000,
  "description": "Marketing campaign costs",
  "date": "2025-12-15",
  "categoryId": "category-uuid",
  "startupId": "startup-uuid",
  "receiptUrl": "https://example.com/receipt.pdf"
}
```

### Get Budget Report (Admin)

```bash
GET /api/reports/budget?startupId=startup-uuid
Authorization: Bearer <your-jwt-token>
```

## Response Codes

- **200** - Success
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

## Need Help?

- Check the interactive docs at `/api-docs`
- Review validation schemas in `/lib/validations/`
- Check service layer in `/lib/services/`
- Contact support at support@incubationos.com
