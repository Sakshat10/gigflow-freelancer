# 📁 File Upload & Storage Implementation

This document explains the Supabase-based file upload and storage system for GigFlow.

## 🏗️ Architecture Overview

- **Storage**: Supabase Storage (private bucket)
- **Metadata**: PostgreSQL database via Prisma
- **Upload**: Multer for multipart/form-data handling
- **Security**: JWT auth + signed URLs for downloads
- **Access Control**: Freelancer (full access) + Client (upload/download only)

## 🔧 Setup Instructions

### 1. Environment Variables

Add these to your `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

⚠️ **IMPORTANT**: Never expose the service role key to the frontend!

### 2. Create Storage Bucket

Run the setup script:

```bash
cd backend
node scripts/setup-supabase.js
```

This creates a private bucket named `workspace-files` with proper security settings.

### 3. Install Dependencies

Dependencies are already added to `package.json`:
- `@supabase/supabase-js` - Supabase client
- `multer` - File upload handling

## 📡 API Endpoints

### Freelancer Endpoints (JWT Required)

#### Upload File
```http
POST /api/workspaces/{workspaceId}/files
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}

Body: FormData with 'file' field
```

#### List Files
```http
GET /api/workspaces/{workspaceId}/files
Authorization: Bearer {jwt_token}
```

#### Download File
```http
GET /api/workspaces/{workspaceId}/files/{fileId}/download
Authorization: Bearer {jwt_token}
```

Returns signed URL valid for 10 minutes.

#### Delete File
```http
DELETE /api/workspaces/{workspaceId}/files/{fileId}
Authorization: Bearer {jwt_token}
```

### Client Endpoints (No Auth - ShareToken Based)

#### Upload File
```http
POST /api/client/{shareToken}/files
Content-Type: multipart/form-data

Body: FormData with 'file' field
```

#### List Files
```http
GET /api/client/{shareToken}/files
```

#### Download File
```http
GET /api/client/{shareToken}/files/{fileId}/download
```

Returns signed URL valid for 10 minutes.

## 🗂️ File Storage Structure

Files are stored in Supabase Storage with this path structure:

```
workspace-files/
└── workspaces/
    └── {workspaceId}/
        ├── {uuid1}.pdf
        ├── {uuid2}.jpg
        └── {uuid3}.docx
```

- Each file gets a unique UUID filename to prevent conflicts
- Original filename is stored in database for display
- Path format: `workspaces/{workspaceId}/{uniqueFilename}`

## 🔒 Security Features

### Access Control
- **Freelancers**: Full CRUD access to their workspace files
- **Clients**: Upload and download only (no delete)
- **Private Bucket**: No public access, all downloads via signed URLs

### File Validation
- **Size Limit**: 10MB per file (Supabase free tier friendly)
- **File Types**: Images, documents, archives, code files
- **Count Limit**: Max 5 files per upload request

### Signed URLs
- **Expiry**: 10 minutes for security
- **Generated on-demand**: No permanent public URLs
- **Workspace isolation**: Users can only access their workspace files

## 📊 Database Schema

The existing `File` model stores metadata:

```prisma
model File {
  id          String   @id @default(uuid())
  workspaceId String
  filename    String   // Original filename for display
  size        Int      // File size in bytes
  mimeType    String   // MIME type
  uploadedBy  String   // "freelancer" | "client"
  uploadedAt  DateTime @default(now())
  fileUrl     String   // Unique filename in Supabase

  workspace Workspace     @relation(fields: [workspaceId], references: [id])
  comments  FileComment[]
}
```

## 🚀 Frontend Integration

### Upload Example (JavaScript)

```javascript
// Freelancer upload
const uploadFile = async (workspaceId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`/api/workspaces/${workspaceId}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};

// Client upload
const clientUploadFile = async (shareToken, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`/api/client/${shareToken}/files`, {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

### Download Example

```javascript
// Get download URL
const downloadFile = async (workspaceId, fileId) => {
  const response = await fetch(`/api/workspaces/${workspaceId}/files/${fileId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { downloadUrl, filename } = await response.json();
  
  // Trigger download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.click();
};
```

## 🔍 Error Handling

Common error responses:

```javascript
// File too large
{ error: "File too large. Maximum size is 10MB." }

// Invalid file type
{ error: "File type image/bmp is not allowed" }

// No file uploaded
{ error: "No file uploaded" }

// Upload failed
{ error: "Upload failed: Storage quota exceeded" }

// Download failed
{ error: "Download failed: File not found" }
```

## 🎯 Free Tier Considerations

This implementation is optimized for Supabase free tier:

- **Storage**: 1GB total (monitor usage)
- **Bandwidth**: 2GB/month (signed URLs help manage this)
- **File Size**: 10MB limit per file
- **Private Bucket**: No public access costs

## 🧪 Testing

Test the implementation:

1. **Setup**: Run `node scripts/setup-supabase.js`
2. **Upload**: Use Postman or frontend to upload files
3. **Download**: Verify signed URLs work
4. **Access Control**: Test freelancer vs client permissions
5. **Error Cases**: Test file size limits, invalid types

## 🚨 Important Notes

- **No Local Storage**: Files are never stored locally (cloud-safe)
- **Service Role Key**: Keep it secret, never expose to frontend
- **Signed URLs**: Expire after 10 minutes for security
- **Unique Filenames**: Prevent conflicts with UUID naming
- **Workspace Isolation**: Users can only access their workspace files

## 🔄 Migration from Local Storage

If you had local file storage before:

1. Files in `backend/uploads/` are no longer used
2. Update frontend to use new API endpoints
3. Migrate existing files to Supabase if needed
4. Remove local upload directories

This implementation provides a secure, scalable, and cloud-native file storage solution for GigFlow! 🎉