# Deployment Guide

This guide covers deploying GigFlow to production environments.

## 🚀 Quick Deploy

### Backend (Railway/Render)

1. **Create Account**
   - Sign up for [Railway](https://railway.app/) or [Render](https://render.com/)

2. **Connect Repository**
   - Connect your GitHub repository
   - Select the `backend` folder as root directory

3. **Environment Variables**
   ```env
   DATABASE_URL=postgresql://user:pass@host:port/db
   JWT_SECRET=your-super-secret-jwt-key-here
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PORT=3001
   NODE_ENV=production
   ```

4. **Build Settings**
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Node Version**: 18+

### Frontend (Vercel)

1. **Create Account**
   - Sign up for [Vercel](https://vercel.com/)

2. **Import Project**
   - Import from GitHub
   - Select the `frontend` folder as root directory

3. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-domain.railway.app
   ```

4. **Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## 🗄️ Database Setup

### Production Database (Neon)

1. **Create Database**
   ```bash
   # Sign up at https://neon.tech/
   # Create new project
   # Copy connection string
   ```

2. **Run Migrations**
   ```bash
   # Set DATABASE_URL in your environment
   npx prisma migrate deploy
   ```

3. **Setup Supabase Storage**
   ```bash
   npm run setup:supabase
   ```

## 🔧 Environment Configuration

### Backend Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:port/database?sslmode=require"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Server
PORT=3001
NODE_ENV=production

# Optional: Email (if implementing notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Environment Variables

```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com

# Optional: Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

## 🔒 Security Checklist

### Backend Security

- [ ] Use HTTPS in production
- [ ] Set secure JWT secret (32+ characters)
- [ ] Configure CORS with specific origins
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Enable database SSL

### Frontend Security

- [ ] Use HTTPS
- [ ] Configure CSP headers
- [ ] Sanitize user inputs
- [ ] Use secure cookie settings
- [ ] Implement proper error handling

## 📊 Monitoring

### Health Checks

```bash
# API Health
curl https://your-api-domain.com/

# Database Connection
curl https://your-api-domain.com/api/health

# File Upload Test
npm run test:upload
```

### Logging

```javascript
// Add to your backend for production logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Fails**
   ```bash
   # Check connection string
   npx prisma db pull
   
   # Verify SSL settings
   DATABASE_URL="...?sslmode=require"
   ```

2. **File Upload Fails**
   ```bash
   # Test Supabase connection
   npm run test:upload
   
   # Check environment variables
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

3. **CORS Errors**
   ```javascript
   // Update CORS origins in server.js
   origin: [
     "https://your-frontend-domain.vercel.app",
     "https://your-custom-domain.com"
   ]
   ```

4. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check Node.js version
   node --version  # Should be 18+
   ```

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes for frequently queried fields
   CREATE INDEX idx_workspace_user_id ON "Workspace"("userId");
   CREATE INDEX idx_file_workspace_id ON "File"("workspaceId");
   CREATE INDEX idx_message_workspace_id ON "Message"("workspaceId");
   ```

2. **Frontend Optimization**
   ```bash
   # Enable gzip compression
   # Add to vercel.json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

## 📈 Scaling

### Database Scaling
- Use connection pooling
- Implement read replicas
- Add database indexes
- Monitor query performance

### File Storage Scaling
- Monitor Supabase usage
- Implement file compression
- Add CDN for global distribution
- Consider file cleanup policies

### API Scaling
- Implement caching (Redis)
- Add rate limiting
- Use load balancers
- Monitor response times

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      - run: cd backend && npx prisma generate
      # Add deployment steps for your platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      # Vercel auto-deploys on push to main
```

## 📞 Support

If you encounter issues during deployment:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [GitHub Issues](https://github.com/yourusername/gigflow-freelancer/issues)
3. Contact support at deploy@gigflow.com

---

**Happy Deploying! 🚀**