# Gigflow Freelancer - Monorepo

A modern freelancer management platform built with React, Express, and PostgreSQL.

## 🏗️ Monorepo Structure

```
gigflow-freelancer/
├── frontend/          # React + Vite frontend application
├── backend/           # Express + PostgreSQL backend API
└── shared/            # Shared types and utilities (if needed)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon, Supabase, or local)
- Supabase account (for file storage)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd gigflow-freelancer
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies  
   cd ../frontend && npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy backend environment template
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database URL, JWT secret, and Supabase config
   ```

3. **Set up Supabase Storage:**
   ```bash
   cd backend
   node scripts/setup-supabase.js
   ```

4. **Start development servers:**
   ```bash
   # Backend (from backend directory)
   npm run dev  # Runs on http://localhost:5000
   
   # Frontend (from frontend directory)  
   npm run dev  # Runs on http://localhost:5173
   ```

## 📦 Project Structure

### Frontend
- **Tech Stack:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Port:** 5173
- **Features:** Dashboard, workspaces, file uploads, invoicing, real-time chat

### Backend  
- **Tech Stack:** Express, PostgreSQL, Prisma, Socket.IO, JWT, Supabase Storage
- **Port:** 5000
- **Features:** REST API, file uploads, authentication, real-time messaging

## 📁 File Upload & Storage

This project includes a complete file upload system using **Supabase Storage**:

### Features
- ✅ **Secure file uploads** (freelancers + clients)
- ✅ **Private storage** with signed URLs for downloads
- ✅ **10MB file size limit** (free tier friendly)
- ✅ **Multiple file types** supported (images, documents, archives)
- ✅ **Access control** (freelancers can delete, clients cannot)
- ✅ **Cloud-native** (no local file storage)

### Setup
1. Create a Supabase project
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `backend/.env`
3. Run `node scripts/setup-supabase.js` to create the storage bucket
4. Start uploading files through the API!

📖 **Detailed documentation:** See `backend/FILE_UPLOAD_README.md`

## 🛠️ Development Scripts

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
```

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔧 Configuration

### Environment Variables

**Backend (`backend/.env`):**
```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-jwt-secret-key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

⚠️ **Security:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend!

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/me` - Get current user

### Workspaces
- `GET /api/workspaces` - List user workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace details

### File Upload (Freelancer)
- `POST /api/workspaces/:id/files` - Upload file
- `GET /api/workspaces/:id/files` - List files
- `GET /api/workspaces/:id/files/:fileId/download` - Get download URL
- `DELETE /api/workspaces/:id/files/:fileId` - Delete file

### File Upload (Client)
- `POST /api/client/:shareToken/files` - Upload file
- `GET /api/client/:shareToken/files` - List files  
- `GET /api/client/:shareToken/files/:fileId/download` - Get download URL

### Real-time Features
- Socket.IO for live messaging
- File upload notifications
- Workspace activity updates

## 🔄 Database Schema

Using **Prisma** with PostgreSQL:

- **Users** - Freelancer accounts with authentication
- **Workspaces** - Project containers with share tokens
- **Files** - File metadata with Supabase storage URLs
- **Messages** - Real-time chat between freelancers and clients
- **Invoices** - Billing and payment tracking
- **Todos** - Task management per workspace

## 🚀 Deployment

### Backend
- Deploy to Vercel, Railway, or any Node.js hosting
- Set environment variables in production
- Ensure PostgreSQL database is accessible

### Frontend  
- Deploy to Vercel, Netlify, or any static hosting
- Build with `npm run build`
- Configure API base URL for production

### File Storage
- Supabase Storage handles all file operations
- No server storage needed (cloud-native)
- Automatic scaling and CDN distribution

---

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Private file storage** with time-limited signed URLs  
- **Input validation** and file type restrictions
- **CORS protection** with allowed origins
- **SQL injection protection** via Prisma ORM
- **Environment variable isolation** (no secrets in frontend)

## 🎯 Key Technologies

- **Frontend:** React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** Express.js, Node.js, Prisma ORM
- **Database:** PostgreSQL (Neon/Supabase)
- **Storage:** Supabase Storage (private buckets)
- **Real-time:** Socket.IO
- **Authentication:** JWT tokens
- **File Handling:** Multer + Supabase Storage
