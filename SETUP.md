# HREIN - Local & Production Setup Guide

## Quick Start - Local Development

### 1. Backend Setup
```bash
cd backend

# Copy .env.local and update with your credentials
# Key variables to set:
# - MONGO_URI: Your MongoDB Atlas connection string
# - JWT_SECRET: A random secret key (or keep the default for dev)
# - EMAIL credentials for sending OTPs

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend will run on **http://localhost:5000**

### 2. Frontend Setup
```bash
cd frontend

# The .env.local is already configured for local development
# It will use http://localhost:5000/api automatically

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on **http://localhost:5173** (or http://localhost:3000 depending on your Vite config)

### 3. Access the Application
- **Frontend**: http://localhost:5173 (or http://localhost:3000)
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## Environment Variables Explained

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:5000/api
```
- When this is set, the frontend knows exactly where the API is
- In development, it defaults to `http://localhost:5000/api` if not set
- In production, it defaults to the current domain's `/api` if not set

### Backend (.env.local)
```
PORT=5000                                           # Backend port
NODE_ENV=development                                # Environment
MONGO_URI=...                                       # MongoDB connection
JWT_SECRET=...                                      # JWT encryption key
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,...  # Allowed origins
```

## Production Deployment

### Before Deploying:

1. **Frontend Environment** - Set `VITE_API_BASE_URL` to your production API URL:
   ```
   VITE_API_BASE_URL=https://www.hyrein.in/api
   ```

2. **Backend Environment** - Keep these production values:
   ```
   NODE_ENV=production
   PORT=5000 (or your hosting provider's assigned port)
   MONGO_URI=your_production_mongodb
   CORS_ORIGIN=https://hyrein.in,https://www.hyrein.in,https://yourfrontend.vercel.app
   ```

3. **Important Security Changes**:
   - Change `JWT_SECRET` to a strong random value
   - Set real email credentials (not dev credentials)
   - Update email sender address in `EMAIL_FROM`
   - Ensure `NODE_ENV=production`

### Deployment Checklist

- ✅ Backend CORS_ORIGIN includes your frontend domain
- ✅ Frontend VITE_API_BASE_URL points to production API
- ✅ All secret keys are changed from defaults
- ✅ Database connection uses production MongoDB
- ✅ Email service is properly configured
- ✅ HTTPS/SSL is enabled on production domain
- ✅ All environment variables are set on the hosting platform

## Troubleshooting

### CORS Error: "Access to fetch blocked by CORS policy"
- **Cause**: Frontend origin is not in backend's ALLOWED_ORIGINS
- **Fix**: Add the frontend's domain to `CORS_ORIGIN` environment variable in backend

### API endpoint shows production domain when running locally
- **Cause**: `VITE_API_BASE_URL` environment variable not set correctly
- **Fix**: Ensure `.env.local` file in frontend folder contains:
  ```
  VITE_API_BASE_URL=http://localhost:5000/api
  ```

### "Invalid credentials" error despite correct password
- **May be**: CORS error preventing proper API response
- **Check**: Browser console for CORS errors in red text

### Backend runs but frontend can't reach it
- **Check**: Backend is running on port 5000
- **Check**: Frontend .env.local has correct API URL
- **Check**: No firewall blocking port 5000

## Port Configuration

If you need to use different ports:

1. **Change Backend Port**: Edit `backend/.env.local`
   ```
   PORT=8000  # Changed from 5000
   ```

2. **Update Frontend**: Edit `frontend/.env.local`
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. **Update CORS**: In `backend/.env.local`
   ```
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
   ```

## Database Setup

Ensure your MongoDB connection string is valid:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hrein?retryWrites=true&w=majority
```

The first time you run the backend, it will:
- Create MongoDB collections
- Initialize database schema
- Seed optional admin account

## API Documentation

After starting the backend, test with:
```bash
curl http://localhost:5000/health
```

Should return: `{"status":"Server is running"}`

For authentication endpoints, see backend auth routes in `backend/routes/authRoutes.js`
