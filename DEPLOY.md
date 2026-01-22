# Gigflow Freelancer - Quick Deploy Commands

## 🚀 Quick Start (One-time setup)

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Generate JWT Secret
```bash
openssl rand -base64 32
```
Copy the output - you'll need it for Railway environment variables.

---

## 🛤️ Railway Deployment

### Deploy Backend

1. **Go to:** https://railway.app/new
2. **Select:** "Deploy from GitHub repo"
3. **Choose:** `gigflow-freelancer` repository
4. **Add PostgreSQL:** Click "New" → "Database" → "PostgreSQL"
5. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=<paste-generated-secret-here>
   FRONTEND_URL=https://your-app.vercel.app
   ```
6. **Generate Domain:** Settings → Generate Domain
7. **Copy Backend URL** (e.g., `https://gigflow-production.up.railway.app`)

---

## ▲ Vercel Deployment

### Deploy Frontend

1. **Update frontend/.env.production:**
   ```bash
   echo "VITE_API_URL=https://your-backend.up.railway.app" > frontend/.env.production
   echo "VITE_SOCKET_URL=https://your-backend.up.railway.app" >> frontend/.env.production
   ```

2. **Deploy with Vercel CLI:**
   ```bash
   npm install -g vercel
   cd frontend
   vercel login
   vercel --prod
   ```

   **OR use Vercel Dashboard:**
   - Go to: https://vercel.com/new
   - Import your GitHub repo
   - Set Root Directory: `frontend`
   - Add environment variables:
     - `VITE_API_URL`: Your Railway backend URL
     - `VITE_SOCKET_URL`: Your Railway backend URL
   - Deploy

3. **Update Backend CORS:**
   - Go back to Railway
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy (automatic)

---

## ✅ Verification Commands

### Test Backend
```bash
# Health check
curl https://your-backend.up.railway.app/api/health

# Check database connection
curl https://your-backend.up.railway.app/api/workspaces
```

### Test Frontend
Open your Vercel URL in a browser and:
1. Try logging in
2. Create a workspace
3. Test real-time chat
4. Upload a file

---

## 🔄 Future Deployments

After initial setup, deployments are automatic:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main
```

Both Railway and Vercel will auto-deploy! ✨

---

## 🐛 Quick Troubleshooting

**Backend not starting?**
```bash
# Check Railway logs
railway logs

# Or use dashboard: railway.app → Your Project → Logs
```

**Database errors?**
```bash
# Run migrations manually
railway run npx prisma migrate deploy
```

**CORS errors?**
- Check `FRONTEND_URL` matches your Vercel domain exactly
- Ensure no trailing slash in URLs

**Frontend build failing?**
- Verify `VITE_API_URL` and `VITE_SOCKET_URL` are set
- Check Vercel build logs

---

## 📊 Monitor Your App

- **Railway:** https://railway.app → Your Project → Metrics
- **Vercel:** https://vercel.com → Your Project → Analytics

---

Need detailed guide? See [DEPLOYMENT.md](./DEPLOYMENT.md)
