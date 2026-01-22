# Gigflow Freelancer - Monorepo

A modern freelancer management platform built with React, Express, and MongoDB.

## 🏗️ Monorepo Structure

```
gigflow-freelancer/
├── frontend/          # React + Vite frontend application
├── backend/           # Express + MongoDB backend API
├── shared/            # Shared types and utilities
└── supabase/          # Legacy Supabase migrations (to be removed)
```

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) installed globally
- MongoDB Atlas account (or local MongoDB)
- Node.js 18+ (for compatibility)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd gigflow-freelancer
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy backend environment template
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB URI and other config
   ```

3. **Start development servers:**
   ```bash
   # Start both frontend and backend simultaneously
   bun run dev
   
   # Or start them separately:
   bun run dev:frontend  # Frontend on http://localhost:8080
   bun run dev:backend   # Backend on http://localhost:3001
   ```

## 📦 Workspaces

### Frontend (`@gigflow/frontend`)
- **Tech Stack:** React 18, TypeScript, Vite, TailwindCSS
- **Port:** 8080
- **Scripts:**
  - `bun run dev` - Start development server
  - `bun run build` - Build for production
  - `bun run lint` - Run ESLint

### Backend (`@gigflow/backend`)
- **Tech Stack:** Express, MongoDB, Socket.IO, JWT
- **Port:** 3001
- **Scripts:**
  - `bun run dev` - Start development server with hot reload
  - `bun run build` - Build for production
  - `bun run start` - Start production server
  - `bun run migrate` - Run database migrations

### Shared (`@gigflow/shared`)
- **Purpose:** Shared TypeScript types and utilities
- **Scripts:**
  - `bun run build` - Compile TypeScript
  - `bun run dev` - Watch mode compilation

## 🛠️ Development Scripts

```bash
# Development
bun run dev                    # Start both frontend and backend
bun run dev:frontend          # Start only frontend
bun run dev:backend           # Start only backend

# Building
bun run build                 # Build all workspaces
bun run build:frontend        # Build only frontend
bun run build:backend         # Build only backend
bun run build:shared          # Build only shared package

# Utilities
bun run clean                 # Clean all build artifacts
bun run install:all           # Reinstall all dependencies
bun run migrate               # Run database migrations
```

## 🔧 Configuration

### Environment Variables

**Backend (`.env`):**
```env
MONGODB_URI=mongodb+srv://...
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Database Connection
The backend connects to MongoDB Atlas. Update the `MONGODB_URI` in `backend/.env` with your connection string.

## 🌐 API Endpoints

- **Health Check:** `GET /health`
- **API Base:** `http://localhost:3001/api`
- **Auth:** `/api/auth/*`
- **Users:** `/api/users/*`
- **Workspaces:** `/api/workspaces/*`
- **Messages:** `/api/messages/*`
- **Invoices:** `/api/invoices/*`
- **Files:** `/api/files/*`

## 🔄 Migration Status

### ✅ Completed
- Monorepo structure with Bun workspaces
- Backend scaffolding with Express + MongoDB
- Basic authentication routes
- Database connection and models
- Real-time Socket.IO setup
- Frontend build configuration
- TypeScript configuration for all workspaces

### 🚧 In Progress
- Full CRUD API implementation
- JWT authentication middleware
- File upload system
- Email notifications
- Payment integration (PayPal + Razorpay)

### 📋 Todo
- Remove Supabase dependencies from frontend
- Data migration from Supabase to MongoDB
- Complete API integration in frontend
- Production deployment setup
- Testing suite setup

---

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript  
- React
- shadcn-ui
- Tailwind CSS
- Express.js
- MongoDB
- Socket.IO
