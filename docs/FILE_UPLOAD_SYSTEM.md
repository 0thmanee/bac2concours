# Supabase File Upload System - Implementation Summary

## ✅ Completed Tasks

### 1. Supabase Configuration

- ✅ Installed `@supabase/supabase-js` package
- ✅ Removed `firebase-admin` package
- ✅ Created [lib/supabase.ts](lib/supabase.ts) with Supabase Storage configuration
- ✅ Service role authentication using environment variables
- ✅ Free tier: 1GB storage included

### 2. Database Schema (Prisma)

- ✅ Added `FileType` enum (IMAGE, DOCUMENT, PAYMENT_PROOF, OTHER)
- ✅ Created `File` model with:
  - Storage path, public URL, MIME type, size
  - Relations to User (uploadedBy)
  - Reverse relations for Book (covers and PDFs)
  - Metadata JSON field for extensibility
- ✅ Updated `Book` model with:
  - `coverFileId` and `pdfFileId` (optional FKs to File)
  - Kept `coverUrl` and `fileUrl` as fallback for direct URLs
- ✅ Migration applied: `20260103232142_add_file_model_and_book_file_relations`

### 3. File Service Layer

Supabase Storage, creates DB record

- ✅ **deleteFile()** - Removes from Supabase and database
- ✅ **getFile()** - Fetch file details with uploader info
- ✅ **getFilesByUser()** - List files by user and type
- ✅ **getFilesByType()** - List files by type
- ✅ **getSignedUrl()** - Generate temporary signed URLs (24 hour
- ✅ **getFilesByType()** - List files by type
- ✅ **getSignedUrl()** - Generate temporary signed URLs (for future private files)
- ✅ **updateFileMetadata()** - Update file metadata

### 4. Validation Layer

- ✅ Created [lib/validations/file.validation.ts](lib/validations/file.validation.ts)
- ✅ Size limits by file type:
  - IMAGE: 5 MB
  - DOCUMENT: 50 MB
  - PAYMENT_PROOF: 5 MB
  - OTHER: 10 MB
- ✅ Allowed MIME types by file type
- ✅ Helper functions:
  - `validateFileSize()`
  - `isAllowedMimeType()`
  - `getFileSizeLimitLabel()`
  - `getAcceptedExtensions()`
- ✅ Zod schemas for API validation

### 5. API Routes

- ✅ **POST /api/files/upload** - Upload any file type
  - Validates session
  - Checks file size and MIME type
  - Uploads to Firebase
  - Returns file URL and metadata
- ✅ **GET /api/files/[fileId]** - Get file details (Admin only)
- ✅ **DELETE /api/files/[fileId]** - Delete file (Admin only)

### 6. React Query Hooks

- ✅ Created [lib/hooks/use-files.ts](lib/hooks/use-files.ts)
- ✅ **useUploadFile()** - Upload file mutation
- ✅ **useDeleteFile()** - Delete file mutation
- ✅ Auto-invalidates queries on success

### 7. Payment Integration

- ✅ Updated [app/api/payments/upload/route.ts](app/api/payments/upload/route.ts)
  - Now uses `fileService.uploadFile()` instead of local storage
  - Uploads to Firebase Storage in `payments/` folder
  - Validates using file validation system
- ✅ Updated [lib/services/payment.service.ts](lib/services/payment.service.ts)
  - Removed local file system code
  - Now receives Firebase URL from API
- ✅ Updated [lib/hooks/use-payment.ts](lib/hooks/use-payment.ts)
  - Invalidates files cache on upload

## 📁 File Structure

```
lib/
├── firebase-admin.ts          # Firebase config
├── services/
│   ├── file.service.ts        # File operations
│   └── payment.service.ts     # Payment logic (updated)
├── validations/
│   └── file.validation.ts     # File validation schemas
└── hooks/
    ├── use-files.ts           # File upload hooks
    └── use-payment.ts         # Payment hooks (updated)

app/api/
├── files/
│   ├── upload/route.ts        # POST /api/files/upload
│   └── [fileId]/route.ts      # GET, DELETE /api/files/[fileId]
└── payments/
    └── upload/route.ts        # Payment proof upload (updated)

prisma/
├── schema.prisma              # File + Book models
└── migrations/
    └── 20260103232142_add_file_model_and_book_file_relations/
```

## 🔑 Environment Variables Required

Add to your `.env` file:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
```

## 🚀 Usage Examples

### Upload an Image (Cover Photo)

```typescript
import { useUploadFile } from "@/lib/hooks/use-files";
import { FileType } from "@prisma/client";

const uploadMutation = useUploadFile();

const handleUpload = async (file: File) => {
  const result = await uploadMutation.mutateAsync({
    file,
    type: FileType.IMAGE,
    folder: "covers",
    metadata: { purpose: "book_cover" },
  });

  console.log("Uploaded:", result.data.publicUrl);
};
```

### Upload a PDF Document

```typescript
const uploadPdf = async (file: File) => {
  const result = await uploadMutation.mutateAsync({
    file,
    type: FileType.DOCUMENT,
    folder: "books",
    metadata: { bookId: "abc123" },
  });

  return result.data.id; // File ID for database relation
};
```

### Upload Payment Proof (Already Integrated)

The payment upload is already using the new system:

```typescript
// In app/founder/payment/page.tsx
const uploadMutation = useUploadPaymentProof();

await uploadMutation.mutateAsync(selectedFile);
// Automatically uploads to Firebase and updates user.paymentProofUrl
```

## 📝 Next Steps for Books

### To implement cover and PDF uploads for books:

1. **Update Book Form UI** to include:

   - File upload for cover (with URL fallback)
   - File upload for PDF (with URL fallback)
   - Radio buttons to choose "Upload file" or "Paste URL"

2. **Update Book Service**:

   ```typescript
   async create(data: CreateBookInput, userId: string, coverFileId?: string, pdfFileId?: string) {
     return prisma.book.create({
       data: {
         ...data,
         uploadedById: userId,
         coverFileId, // Link to uploaded file
         pdfFileId,   // Link to uploaded file
       },
     });
   }
   ```

3. **Update Book API Routes**:

   - Accept optional `coverFileId` and `pdfFileId` in create/update
   - Delete associated files when book is deleted

4. **Update Book Validation**:
   - Make `fileUrl` optional if `pdfFileId` is provided
   - Add logic to require either URL or file upload

## 🎯 Benefits

1. **Centralized File Management**

   - All files tracked in database
   - Easy to list, search, and delete
   - Audit trail (who uploaded when)

2. **Scalable Storage**

   - Firebase Storage handles CDN
   - No local disk space issues
   - Global distribution

3. **Reusable**

   - Same system for books, payments, profiles
   - Consistent validation
   - Type-safe with FileType enum

4. **Secure**

   - Session validation on all uploads
   - Size and type restrictions
   - Admin-only file deletion

5. **Flexible**
   - Supports both file uploads and direct URLs
   - Metadata field for custom data
   - Easy to extend for new file types

## 🔧 Maintenance

- **Monitor Firebase Storage** usage in Firebase Console
- **Clean up orphaned files** periodically (files not linked to any resource)
- **Set up Firebase Storage Rules** for additional security
- **Add file compression** for images (future enhancement)
- **Implement file versioning** if needed (future enhancement)

---

**Status**: ✅ Core file upload system complete and integrated with payments
**Next**: Integrate with book covers and PDFs in admin forms
