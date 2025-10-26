# Supabase Storage Bucket Setup Guide

This guide will help you set up the Supabase storage bucket required for CV uploads in TrustWork.

## Prerequisites

- A Supabase project created
- Database schema already applied (from `supabase/schema.sql`)
- Access to Supabase Dashboard or SQL Editor

## Method 1: Using Supabase Dashboard (Recommended for Beginners)

1. **Navigate to Storage**
   - Log in to your [Supabase Dashboard](https://app.supabase.com)
   - Select your TrustWork project
   - Click on "Storage" in the left sidebar

2. **Create the Bucket**
   - Click the "Create bucket" button
   - Enter the following details:
     - **Name**: `resumes` (must be exactly this name)
     - **Public bucket**: Toggle ON (enabled)
     - **File size limit**: 10 MB (10485760 bytes)
     - **Allowed MIME types**: 
       - `application/pdf`
       - `application/msword`
       - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. **Configure CORS (if needed)**
   - If you're running the app locally or on a custom domain, add your origins:
     - `http://localhost:8080` (for local development)
     - `http://localhost:5173` (alternative local port)
     - Your production domain

4. **Set Storage Policies**
   - Click on the `resumes` bucket
   - Go to "Policies" tab
   - The policies should be automatically applied from the storage-setup.sql script
   - If not, run the `supabase/storage-setup.sql` script in the SQL Editor

## Method 2: Using SQL Editor (Recommended for Advanced Users)

1. **Open SQL Editor**
   - Go to your Supabase Dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Run Storage Setup Script**
   - Copy the entire contents of `supabase/storage-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify Creation**
   - Go to "Storage" in the left sidebar
   - You should see the `resumes` bucket listed
   - Click on it to verify the policies are in place

## Method 3: Using Supabase CLI (For Local Development)

If you're using Supabase locally with the CLI:

```bash
# Start Supabase locally
supabase start

# Apply the storage setup
supabase db push

# Or run the SQL directly
supabase db execute -f supabase/storage-setup.sql
```

## Verifying the Setup

1. **Check Bucket Exists**
   - Go to Storage > Buckets in your Supabase Dashboard
   - You should see a bucket named `resumes`
   - It should be marked as "Public"

2. **Test Upload**
   - Start your TrustWork app: `npm run dev`
   - Sign in with a test account
   - Navigate to Settings or Setup page
   - Try uploading a CV file
   - You should see a success message

3. **Common Issues**
   - **"Bucket not found" error**: The bucket name must be exactly `resumes`
   - **Upload fails**: Check that your user is authenticated
   - **CORS errors**: Add your app's URL to the CORS configuration
   - **File too large**: Maximum file size is 10MB

## Bucket Configuration Details

### Bucket Name
- **Name**: `resumes`
- **Important**: Do not change this name. The application code expects this exact name.

### Security Settings
- **Public Access**: Enabled (for MVP)
  - Files are publicly accessible via URL
  - Anyone with the URL can view the file
  - For production, consider using signed URLs with private access

### File Policies
- **Upload**: Users can only upload to folders matching their user ID
- **Update**: Users can only update their own files
- **Delete**: Users can only delete their own files
- **Read**: Public read access (for MVP)

### File Organization
Files are stored with the following structure:
```
resumes/
  ├── {user_id_1}/
  │   └── {timestamp}-{filename}.pdf
  ├── {user_id_2}/
  │   └── {timestamp}-{filename}.pdf
  └── ...
```

## Security Considerations for Production

For production deployments, consider these security improvements:

1. **Private Bucket**
   - Set `public` to `false`
   - Use signed URLs with expiration times
   - Update `src/lib/storage.ts` to use `createSignedUrl()`

2. **File Validation**
   - Implement server-side file type validation
   - Scan uploaded files for malware
   - Limit file names to prevent path traversal

3. **Rate Limiting**
   - Add rate limits to upload endpoints
   - Prevent abuse and excessive storage use

4. **Monitoring**
   - Monitor storage usage
   - Set up alerts for unusual activity
   - Log all upload attempts

## Troubleshooting

### Error: "Bucket not found"
**Cause**: The `resumes` bucket doesn't exist in your Supabase project.

**Solution**: 
1. Follow Method 1 or Method 2 above to create the bucket
2. Ensure the bucket name is exactly `resumes` (lowercase, no spaces)

### Error: "Access denied" or "RLS policy violation"
**Cause**: Storage policies are not set up correctly.

**Solution**:
1. Run the `supabase/storage-setup.sql` script
2. Verify policies exist in Dashboard > Storage > resumes > Policies

### Error: "File too large"
**Cause**: File exceeds the 10MB limit.

**Solution**:
1. Compress the file before uploading
2. Or increase the bucket's file size limit in Dashboard > Storage > resumes > Settings

### Error: "Invalid file type"
**Cause**: File type is not in the allowed list.

**Solution**:
1. Ensure file is PDF, DOC, or DOCX
2. Check file extension matches content type
3. Verify allowed MIME types in bucket settings

## Need Help?

If you encounter issues not covered in this guide:

1. Check Supabase logs in Dashboard > Logs
2. Check browser console for detailed error messages
3. Verify your `.env` file has correct Supabase credentials
4. Ensure you're signed in when testing uploads
5. Open an issue on the GitHub repository with:
   - Error message
   - Browser console logs
   - Steps to reproduce

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control#policy-examples)
