# Storage Abstraction Layer

This document explains the pluggable storage system used in Classes360.

## 🎯 Overview

The storage abstraction layer provides a provider-agnostic interface for file operations. Currently supports:

- **R2** (Cloudflare) - Default provider
- **S3** - Future
- **Cloudinary** - Future

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Business Logic & Components       │
│     (never call providers directly)  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│    storageService (Wrapper)         │
│   - getUploadUrl()                  │
│   - deleteFile()                    │
│   - verify()                        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Storage Provider (Pluggable)     │
│   - R2Provider (current)            │
│   - S3Provider (future)             │
│   - CloudinaryProvider (future)     │
└─────────────────────────────────────┘
```

## 📁 File Structure

```
src/lib/storage/
├── index.ts                  # Public exports
├── storageService.ts         # Main wrapper service
├── types.ts                  # TypeScript interfaces
└── providers/
    ├── r2Provider.ts         # Cloudflare R2 implementation
    ├── s3Provider.ts         # AWS S3 (future)
    └── cloudinaryProvider.ts # Cloudinary (future)

src/app/api/v1/
└── upload-url/
    └── route.ts              # API endpoint for getting upload URLs

src/hooks/
└── useFileUpload.ts          # React hook for client-side uploads
```

## 🔄 Upload Flow

### Step 1: Request Upload URL

```typescript
// Client requests upload URL from API
const response = await fetch('/api/v1/upload-url', {
  method: 'POST',
  body: JSON.stringify({
    fileType: 'image/jpeg',
    folder: 'institutes',
    fileName: 'logo.jpg',
    fileSize: file.size
  })
});

const { uploadUrl, fileUrl } = await response.json();
```

### Step 2: Upload File Directly to Storage

```typescript
// Client uploads file directly (browser)
// File NEVER passes through Node.js server
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/jpeg' },
  body: file
});
```

### Step 3: Save File URL to Database

```typescript
// Save returned URL to database
await updateInstitute({
  logo: fileUrl  // e.g., https://bucket.r2.dev/institutes/123/...
});
```

## 🪝 React Hook Usage

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

export function LogoUploader() {
  const { uploadFile, isLoading, error } = useFileUpload({
    onSuccess: (fileUrl) => {
      console.log('Uploaded:', fileUrl);
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileUrl = await uploadFile(file, 'institutes');
      // Update form or UI with fileUrl
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <Input type="file" onChange={handleFileChange} disabled={isLoading} />
      {isLoading && <p>Uploading...</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## ⚙️ Configuration

### Environment Variables

```env
# Required: Choose storage provider
STORAGE_PROVIDER=r2

# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_ACCESS_KEY_SECRET=your_access_secret
CLOUDFLARE_BUCKET_NAME=classes360
CLOUDFLARE_R2_PUBLIC_URL=https://bucket.123abc.r2.dev
```

### Getting Cloudflare R2 Credentials

1. Create R2 bucket in Cloudflare Dashboard
2. Create API token with R2 permissions
3. Get credentials from API token page
4. Set public URL for direct access

## 📋 API Endpoint: POST /api/v1/upload-url

### Request

```json
{
  "fileType": "image/jpeg",
  "folder": "institutes",
  "fileName": "logo.jpg",
  "fileSize": 1048576
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileType` | string | ✓ | MIME type: `image/jpeg`, `image/png`, `image/webp`, `application/pdf` |
| `folder` | string | ✓ | Storage folder: `institutes`, `users`, `courses`, `documents` |
| `fileName` | string | | Original filename (for reference) |
| `fileSize` | number | | File size in bytes (for validation) |

### Response

```json
{
  "uploadUrl": "https://bucket.r2.amazonaws.com/...",
  "fileUrl": "https://bucket.r2.dev/institutes/123/...",
  "expiresAt": 1234567890000,
  "expiresIn": 3600
}
```

### Security Rules

- ✓ Requires authentication
- ✓ Validates file type (whitelist: JPEG, PNG, WebP, PDF)
- ✓ Enforces file size limits (2MB for images, 10MB for PDFs)
- ✓ Maps user to institute/entity ID
- ✓ Upload URL expires in 1 hour
- ✓ Rate-limited per user (future)

## 🔐 Security Considerations

### ✓ What's Secure

- **No server-side file storage**: Files uploaded directly to R2
- **Bandwidth efficient**: Browser uploads directly, no server relay
- **Pre-signed URLs**: Time-limited, scoped to specific operations
- **Type validation**: Whitelist of allowed file types
- **Size limits**: Enforced before upload
- **Auth required**: All uploads require user session

### Storage Folder Strategy

```
R2 Bucket Structure:
└── institutes/
    ├── {instituteId}/
    │   ├── logo/
    │   ├── banner/
    │   └── favicon/
├── users/
│   ├── {userId}/
│   │   └── profile/
├── courses/
│   ├── {courseId}/
│   │   └── banner/
└── documents/
    ├── {docId}/
    │   └── pdf/
```

## 🔄 Switching Providers

To switch from R2 to S3:

1. Set environment variable:
   ```env
   STORAGE_PROVIDER=s3
   ```

2. Add S3 credentials to environment

3. **No code changes needed** - `storageService` automatically uses S3 provider

That's it! All business logic continues working unchanged.

## 📦 Current Image Fields

| Model | Field | Folder |
|-------|-------|--------|
| Institute | `logo` | `institutes` |
| Institute | `banner` | `institutes` |
| Institute | `heroImage` | `institutes` |
| Institute | `faviconUrl` | `institutes` |
| Course | `banner` | `courses` |
| Note | `fileUrl` | `documents` |

## ✅ TODO: Update Components

- [ ] Update institute profile form to use `useFileUpload`
- [ ] Update course form to use `useFileUpload`
- [ ] Add file upload UI components
- [ ] Add progress indicators
- [ ] Add error handling UI
- [ ] Update API endpoints to validate file URLs
- [ ] Add file deletion on entity delete

## 🚀 Future Enhancements

- [ ] S3 provider implementation
- [ ] Cloudinary provider implementation
- [ ] File preview generation
- [ ] Resize images on upload
- [ ] CDN integration
- [ ] Analytics tracking
- [ ] Per-user rate limiting
- [ ] File virus scanning
