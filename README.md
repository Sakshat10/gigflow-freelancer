# GigFlow - Freelancer Management Platform

<div align="center">

![GigFlow Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=GigFlow)

**A modern, full-stack freelancer management SaaS platform built for seamless client-freelancer collaboration.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-green.svg)](https://supabase.com/)

[Demo](https://gigflow-freelancer-dun.vercel.app) • [Documentation](#documentation) • [API Reference](#api-reference) • [Contributing](#contributing)

</div>

---

## 🚀 Overview

GigFlow is a comprehensive freelancer management platform that streamlines project collaboration between freelancers and their clients. Built with modern web technologies, it offers secure file sharing, real-time communication, invoice management, and project tracking in one unified platform.

### ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 📁 **File Management** - Secure file uploads with Supabase Storage integration
- 💬 **Real-time Chat** - Socket.IO powered messaging system
- 📊 **Project Management** - Kanban boards, todos, and progress tracking
- 💰 **Invoice System** - Automated invoicing with PayPal integration
- 🔗 **Client Sharing** - Secure workspace sharing via unique tokens
- 📱 **Responsive Design** - Mobile-first UI with shadcn/ui components
- 🔔 **Notifications** - Real-time updates and email notifications

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: React Context + Custom Hooks
- **Real-time**: Socket.IO Client

**Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Storage**: Supabase Storage
- **Real-time**: Socket.IO Server

**Infrastructure**
- **Database**: Neon PostgreSQL (Production) / Local PostgreSQL (Development)
- **File Storage**: Supabase Storage (Private Buckets)
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

### Project Structure

```
gigflow-freelancer/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── contexts/       # React contexts
│   │   └── types/          # TypeScript definitions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── lib/            # Utilities and configurations
│   │   └── middleware/     # Express middleware
│   ├── prisma/             # Database schema and migrations
│   ├── scripts/            # Setup and utility scripts
│   └── package.json
└── README.md
```

---

## � Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 13+ (Local or [Neon](https://neon.tech/))
- **Supabase Account** ([Sign up](https://supabase.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gigflow-freelancer.git
   cd gigflow-freelancer
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend && npm install
   
   # Frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   
   Create `backend/.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database"
   
   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-here"
   
   # Supabase Storage
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

   Create `frontend/.env.local`:
   ```env
   VITE_API_URL="http://localhost:3001"
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

5. **Supabase Storage Setup**
   ```bash
   cd backend
   npm run setup:supabase
   ```

6. **Start Development Servers**
   ```bash
   # Terminal 1: Backend (Port 3001)
   cd backend && npm run dev
   
   # Terminal 2: Frontend (Port 5173)
   cd frontend && npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health: http://localhost:3001/

---

## � API Reference

### Authentication Endpoints

```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
POST /api/auth/logout      # User logout
```

### Workspace Management

```http
GET    /api/workspaces              # List user workspaces
POST   /api/workspaces              # Create workspace
GET    /api/workspaces/:id          # Get workspace details
PATCH  /api/workspaces/:id          # Update workspace
DELETE /api/workspaces/:id          # Delete workspace
```

### File Management

**Freelancer Endpoints** (JWT Required)
```http
POST   /api/workspaces/:id/files                    # Upload file
GET    /api/workspaces/:id/files                    # List files
GET    /api/workspaces/:id/files/:fileId/download   # Download file
DELETE /api/workspaces/:id/files/:fileId            # Delete file
```

**Client Endpoints** (ShareToken Based)
```http
POST   /api/client/:shareToken/files                    # Upload file
GET    /api/client/:shareToken/files                    # List files
GET    /api/client/:shareToken/files/:fileId/download   # Download file
```

### Real-time Features

```http
GET    /api/workspaces/:id/messages     # Get messages
POST   /api/workspaces/:id/messages     # Send message
GET    /api/client/:shareToken/messages # Client messages
POST   /api/client/:shareToken/messages # Client send message
```

### Project Management

```http
GET    /api/workspaces/:id/todos        # List todos
POST   /api/workspaces/:id/todos        # Create todo
PATCH  /api/workspaces/:id/todos/:id    # Update todo
DELETE /api/workspaces/:id/todos/:id    # Delete todo
```

### Invoice System

```http
GET    /api/workspaces/:id/invoices     # List invoices
POST   /api/workspaces/:id/invoices     # Create invoice
GET    /api/workspaces/:id/invoices/:id # Get invoice
PATCH  /api/workspaces/:id/invoices/:id # Update invoice
DELETE /api/workspaces/:id/invoices/:id # Delete invoice
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** with secure HTTP-only cookies
- **Role-based Access Control** (Freelancer vs Client)
- **Workspace Isolation** via unique share tokens
- **Password Hashing** with bcrypt

### File Security
- **Private Storage** with Supabase (no public access)
- **Signed URLs** with 5-minute expiry
- **File Type Validation** and size limits (10MB)
- **Workspace-scoped Access** control

### API Security
- **CORS Protection** with allowed origins
- **Input Validation** and sanitization
- **SQL Injection Protection** via Prisma ORM
- **Rate Limiting** (recommended for production)

---

## 📁 File Upload System

GigFlow features a robust file management system built on Supabase Storage:

### Features
- ✅ **Secure Uploads** for freelancers and clients
- ✅ **Private Storage** with signed download URLs
- ✅ **10MB File Limit** (free tier optimized)
- ✅ **Multiple File Types** (images, documents, archives)
- ✅ **Access Control** (freelancers can delete, clients cannot)
- ✅ **Cloud-native** (no local file storage)

### Storage Structure
```
workspace-files/
└── workspaces/
    └── {workspaceId}/
        ├── 1642678901234_document.pdf
        ├── 1642678902345_image.jpg
        └── 1642678903456_spreadsheet.xlsx
```

### Usage Example
```javascript
// Upload file
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/workspaces/123/files', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

// Download file
const downloadResponse = await fetch('/api/workspaces/123/files/456/download');
const { downloadUrl } = await downloadResponse.json();
window.open(downloadUrl, '_blank');
```

---

## 🛠️ Development

### Available Scripts

**Backend**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run setup:supabase   # Setup Supabase storage
npm run test:upload      # Test file upload system
```

**Frontend**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# View database
npx prisma studio
```

### Testing File Uploads

```bash
cd backend

# Setup Supabase bucket
npm run setup:supabase

# Test upload functionality
npm run test:upload
```

---

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. **Environment Variables**
   ```env
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_production_jwt_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3001
   ```

2. **Build Command**: `npm install && npx prisma generate`
3. **Start Command**: `npm start`

### Frontend Deployment (Vercel)

1. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-domain.com
   ```

2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`

### Database Setup (Production)

```bash
# Run migrations
npx prisma migrate deploy

# Setup Supabase storage
npm run setup:supabase
```

---

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Go to Settings → API
3. Copy your project URL and service role key
4. Add to your `.env` file
5. Run `npm run setup:supabase`

### PayPal Integration

1. Create PayPal developer account
2. Get client ID and secret
3. Configure in user settings
4. Test with sandbox environment

### Email Notifications (Optional)

Configure SMTP settings for email notifications:
```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

---

## 📊 Monitoring & Analytics

### Health Checks
- **API Health**: `GET /` returns "GigFlow API is running"
- **Database**: Prisma connection status
- **Storage**: Supabase bucket accessibility

### Logging
- **Error Logging**: Console errors with stack traces
- **Access Logs**: Request/response logging
- **File Operations**: Upload/download tracking

### Performance Monitoring
- **Response Times**: API endpoint performance
- **File Upload Speed**: Storage operation metrics
- **Database Queries**: Prisma query optimization

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Documentation
- [API Documentation](#api-reference)
- [File Upload Guide](backend/SUPABASE_FILE_STORAGE.md)
- [Deployment Guide](#deployment)

### Community
- **Issues**: [GitHub Issues](https://github.com/yourusername/gigflow-freelancer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gigflow-freelancer/discussions)
- **Email**: support@gigflow.com

### Troubleshooting

**Common Issues:**

1. **Port 5000 in use**: Use `PORT=3001 npm run dev`
2. **Database connection**: Check `DATABASE_URL` in `.env`
3. **File upload fails**: Verify Supabase credentials
4. **CORS errors**: Check allowed origins in backend

---

## 🎯 Roadmap

### Current Version (v1.0)
- ✅ Core workspace management
- ✅ File upload system
- ✅ Real-time messaging
- ✅ Invoice generation
- ✅ Client sharing

### Upcoming Features (v1.1)
- 📧 Email notifications
- 📊 Analytics dashboard
- 🔄 Automated backups
- 📱 Mobile app
- 🎨 Custom branding

### Future Enhancements (v2.0)
- 🤖 AI-powered insights
- 📈 Advanced reporting
- 🔗 Third-party integrations
- 🌍 Multi-language support
- 📋 Contract management

---

<div align="center">

**Built with ❤️ by the GigFlow Team**

[Website](https://gigflow.com) • [Twitter](https://twitter.com/gigflow) • [LinkedIn](https://linkedin.com/company/gigflow)

</div>
