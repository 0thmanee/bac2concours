# Supabase Storage Setup Guide

Complete guide to setting up Supabase Storage for the file upload system.

---

## Step 1: Create Supabase Account & Project

1. **Sign up**: Go to [https://app.supabase.com](https://app.supabase.com)
2. **Create Organization** (if first time)
3. **New Project**:
   - Project name: `incubation-os` (or your choice)
   - Database password: Generate a strong password
   - Region: Choose closest to your users
   - Pricing: **Free tier** (1GB storage included)
4. **Wait** for project provisioning (~2 minutes)

---

## Step 2: Create Storage Bucket

1. Navigate to **Storage** in left sidebar
2. Click **Create a new bucket**
3. Configure bucket:
   ```
   Name: files
   Public bucket: ✅ Yes (for public file access)
   File size limit: 50 MB (optional)
   Allowed MIME types: Leave empty for all types
   ```
4. Click **Create bucket**

### Configure Bucket Policies (Optional - for better security)

If you want to control who can upload/delete files:

1. Go to **Policies** tab in your bucket
2. Add policy for uploads:
   ```sql
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'files');
   ```
3. Add policy for public reads:
   ```sql
   CREATE POLICY "Public can view files"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'files');
   ```

---

## Step 3: Get API Credentials

1. Go to **Settings** → **API** in left sidebar
2. Copy the following values:

### Project URL

```
https://xxxxxxxxxxxxx.supabase.co
```

### Service Role Key (Secret!)

```
eyJhbGc... (long string)
```

⚠️ **Important**: Use `service_role` key (NOT `anon` key) for server-side operations

---

## Step 4: Update Environment Variables

Add these to your `.env` file:

```env
# ============================================================
# SUPABASE STORAGE
# ============================================================
SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
SUPABASE_STORAGE_BUCKET="files"
```

Replace the placeholders with your actual values.

---

## Step 5: Test the Setup

1. **Restart your development server**:

   ```bash
   npm run dev
   ```

2. **Try uploading a file**:

   - Log in as a student
   - Go to Payment page
   - Upload a payment proof
   - Should see success message

3. **Verify in Supabase**:
   - Go to **Storage** → **files** bucket
   - You should see `payments/` folder with uploaded file

---

## Free Tier Limits

| Resource        | Free Tier            |
| --------------- | -------------------- |
| Storage         | 1 GB                 |
| Bandwidth       | 2 GB/month           |
| File size limit | 50 MB (configurable) |

**Cost after limits**: ~$0.021/GB for storage, $0.09/GB for bandwidth

---

## Security Best Practices

### 1. **Never expose service_role key to client**

- Only use in server-side code (`lib/supabase.ts`)
- Never send in API responses
- Add to `.gitignore` (already done)

### 2. **Use Row Level Security (RLS)**

- Enable RLS on storage buckets
- Create policies for insert/update/delete
- Public read for files is OK if needed

### 3. **Validate files before upload**

- Check file size (already implemented)
- Check MIME type (already implemented)
- Sanitize filenames (already implemented with UUID)

### 4. **Monitor usage**

- Check **Settings** → **Usage** regularly
- Set up billing alerts before hitting limits
- Archive old files if needed

---

## Troubleshooting

### Error: "The bucket does not exist"

- Make sure bucket name is exactly `files`
- Check `SUPABASE_STORAGE_BUCKET` in `.env`

### Error: "Invalid API key"

- Verify you copied the **service_role** key (not anon key)
- Check for extra spaces in `.env`
- Restart dev server after changing `.env`

### Error: "Policy violation"

- If using RLS, check your bucket policies
- Make sure public read is enabled for public access
- Service role bypasses RLS by default

### Files not appearing

- Check Supabase **Storage** → **files** bucket
- Verify `publicUrl` in database `File` table
- Check browser console for CORS errors

---

## Migration from Firebase (if applicable)

If you previously used Firebase:

1. ✅ Firebase Admin SDK removed
2. ✅ File service updated to Supabase
3. ✅ Environment variables changed
4. ⚠️ **Old files in Firebase won't auto-migrate**
   - Manually download from Firebase Console
   - Re-upload to Supabase if needed
   - Or keep Firebase for old files only

---

## Next Steps

- [ ] Configure bucket in Supabase Dashboard
- [ ] Add environment variables to `.env`
- [ ] Test payment proof upload
- [ ] Implement book cover upload UI
- [ ] Add image optimization (optional)
- [ ] Set up RLS policies for production

---

## Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage Pricing](https://supabase.com/pricing)
- [RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)
