# 📁 Supabase File Storage Implementation

This document explains the complete Supabase Storage integration for GigFlow's file upload system.

## 🏗️ Architecture Overview

- **Storage**: Supabase Storage (private bucket: `workspace-files`)
- **Database**: PostgreSQL with Prisma ORM for file metadata
- **Upload**: Express + Multer (memory storage, no local files)
- **Security**: JWT auth + signed URLs (5-minute expiry)
- **Access Control**: Freelancer (full CRUD) + Client (upload/download only)

## 🔧 Setup Instructions

### 1. Environment Variables

Add to your `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **CRITICAL**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend!

### 2. Create Storage Bucket

```bash
cd backend
node scripts/setup-supabase.js
```

### 3. Test Implementation

```bash
node scripts/test-file-upload.js
```

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

Returns:
```json
{
  "downloadUrl": "https://supabase-signed-url...",
  "filename": "document.pdf",
  "expiresIn": 300
}
```

#### Delete File
```http
DELETE /api/workspaces/{workspaceId}/files/{fileId}
Authorization: Bearer {jwt_token}
```

### Client Endpoints (ShareToken Based)

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

❌ **Note**: Clients cannot delete files

## 🗂️ File Storage Structure

```
workspace-files/
└── workspaces/
    └── {workspaceId}/
        ├── 1642678901234_document.pdf
        ├── 1642678902345_image.jpg
        └── 1642678903456_spreadsheet.xlsx
```

- **Path Format**: `workspaces/{workspaceId}/{timestamp}_{sanitized_filename}`
- **Unique Names**: Timestamp prefix prevents conflicts
- **Safe Names**: Special characters sanitized

## 🔒 Security Features

### Access Control Matrix

| Role       | Upload | Download | Delete |
|------------|--------|----------|--------|
| Freelancer | ✅     | ✅       | ✅     |
| Client     | ✅     | ✅       | ❌     |

### File Validation
- **Size Limit**: 10MB per file
- **File Types**: Images, documents, archives, code files
- **MIME Types**: Validated server-side
- **Malicious Files**: Blocked by type validation

### Signed URLs
- **Expiry**: 5 minutes for security
- **Private Access**: No public file URLs
- **Workspace Isolation**: Users only access their files

## 📊 Database Schema

```prisma
model File {
  id          String   @id @default(uuid())
  workspaceId String
  filename    String   // Original filename for display
  storagePath String?  // Supabase storage path
  size        Int      // File size in bytes
  uploadedBy  String   // "freelancer" | "client"
  fileUrl     String   // Backward compatibility
  createdAt   DateTime @default(now())

  workspace Workspace     @relation(fields: [workspaceId], references: [id])
  comments  FileComment[]
}
```

## 🚀 Implementation Details

### Multer Configuration
```javascript
// Memory storage - no local files
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        // Validate MIME types
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} not allowed`), false);
        }
    }
});
```

### Supabase Integration
```javascript
// Upload file
const uploadResult = await uploadFile(
    workspaceId,
    filename,
    fileBuffer,
    mimeType
);

// Generate download URL
const signedUrlResult = await getSignedUrl(storagePath, 300);

// Delete file
const deleteResult = await deleteFile(storagePath);
```

## 🔄 Migration from Base64

### Legacy File Handling
- **Old Files**: `storagePath` is `null` for pre-migration files
- **Download**: Returns 410 Gone for legacy files
- **Graceful Degradation**: System continues working during migration

### Migration Strategy
1. Deploy new system with nullable `storagePath`
2. New uploads go to Supabase Storage
3. Legacy files show "no longer available" message
4. Optional: Migrate existing files if needed

## 🧪 Testing

### Manual Testing
```bash
# Setup
node scripts/setup-supabase.js

# Test
node scripts/test-file-upload.js

# Upload via curl
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "file=@test.pdf" \
  http://localhost:5000/api/workspaces/WORKSPACE_ID/files
```

### Frontend Integration
```javascript
// Upload file
const formData = new FormData();
formData.append('file', file);

const response = await fetch(`/api/workspaces/${workspaceId}/files`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
});

// Download file
const downloadResponse = await fetch(`/api/workspaces/${workspaceId}/files/${fileId}/download`, {
    headers: { 'Authorization': `Bearer ${token}` }
});

const { downloadUrl, filename } = await downloadResponse.json();

// Trigger download
const link = document.createElement('a');
link.href = downloadUrl;
link.download = filename;
link.click();
```

## 🚨 Error Handling

### Common Errors
```javascript
// File too large
{ error: "File too large. Maximum size is 10MB." }

// Invalid file type
{ error: "File type application/exe is not allowed" }

// No file uploaded
{ error: "No file uploaded" }

// Legacy file access
{ error: "File no longer available. This file was uploaded before the storage migration." }

// Storage error
{ error: "Upload failed: Storage quota exceeded" }
```

### Error Recovery
- **Storage Failures**: Continue with DB operations
- **Network Issues**: Retry mechanism recommended
- **Quota Limits**: Monitor Supabase usage

## 🎯 Free Tier Optimization

### Supabase Limits
- **Storage**: 1GB total
- **Bandwidth**: 2GB/month
- **File Size**: 10MB per file (our limit)
- **API Calls**: 500,000/month

### Optimization Strategies
- **Signed URLs**: Reduce bandwidth usage
- **File Compression**: Client-side before upload
- **Usage Monitoring**: Track storage consumption
- **Cleanup**: Delete unused files

## 🔍 Monitoring & Maintenance

### Health Checks
```bash
# Test Supabase connection
node scripts/test-file-upload.js

# Check bucket status
node -e "
import { supabase } from './src/lib/supabase.js';
const { data } = await supabase.storage.listBuckets();
console.log(data);
"
```

### Maintenance Tasks
- **Storage Cleanup**: Remove orphaned files
- **Usage Monitoring**: Track bandwidth and storage
- **Error Logging**: Monitor upload failures
- **Performance**: Optimize large file handling

## 🚀 Production Deployment

### Environment Setup
```env
# Production .env
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key
```

### Deployment Checklist
- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Storage bucket created
- [ ] Database schema migrated
- [ ] File upload tested
- [ ] Download URLs working
- [ ] Access control verified
- [ ] Error handling tested

## 🎉 Success Metrics

✅ **Files stored in Supabase Storage (not DB)**  
✅ **No local file storage**  
✅ **Secure signed URLs with expiry**  
✅ **Proper access control (freelancer vs client)**  
✅ **10MB file size limit enforced**  
✅ **Multiple file type support**  
✅ **Express-friendly implementation**  
✅ **Backward compatibility with legacy files**  
✅ **Production-ready error handling**  

Your GigFlow file upload system is now fully implemented with Supabase Storage! 🎊