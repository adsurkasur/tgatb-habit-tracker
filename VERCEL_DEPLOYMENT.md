# Vercel Deployment Guide

This guide explains how to deploy the Habit Tracker application to Vercel.

## Architecture

The application has been configured to support both traditional server deployment and Vercel's serverless functions:

- **Client**: React app built with Vite
- **API**: Express.js routes that work as serverless functions on Vercel
- **Database**: PostgreSQL (recommended: Neon, Supabase, or PlanetScale)

## Files Added for Vercel

- `vercel.json` - Vercel configuration
- `api/api-handler.ts` - Main API handler for serverless functions
- `api/habit-delete.ts` - Individual habit deletion endpoint
- `api/habit-logs.ts` - Habit logs retrieval endpoint
- `api/habit-track.ts` - Habit tracking endpoint
- `server/api-routes.ts` - Shared API route logic

## Environment Variables

Set these in your Vercel dashboard:

```
DATABASE_URL=your-postgresql-connection-string
SESSION_SECRET=your-session-secret
NODE_ENV=production
```

## Deployment Steps

### 1. Prepare Your Repository

Ensure your code is committed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/in with your Git provider
3. Click "Import Project"
4. Select your repository

### 3. Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Build Command**: `npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install`

### 4. Set Environment Variables

In your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add the required variables:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NODE_ENV` (set to "production")

### 5. Deploy

Click "Deploy" and Vercel will:

1. Install dependencies
2. Build the client application
3. Deploy API functions
4. Provide a URL for your application

## Database Setup

### Using Neon (Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to Vercel environment variables

### Using Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add to Vercel environment variables

## Local Development vs Production

- **Local**: Use `npm run dev` - runs Express server
- **Vercel**: Uses serverless functions via `api/[...path].ts`
- **Build**: Use `npm run build` - builds client for production

## API Routes

The following routes are available:

- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `DELETE /api/habits/:id` - Delete habit
- `GET /api/habits/:id/logs` - Get habit logs
- `POST /api/habits/:id/track` - Track habit completion
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Troubleshooting

### Build Failures

- Check that all dependencies are in `package.json`
- Ensure TypeScript compiles without errors: `npm run check`
- Verify environment variables are set

### API Issues

- Check Vercel function logs in dashboard
- Ensure database connection string is correct
- Verify CORS headers are set properly

### Database Issues

- Ensure database is accessible from Vercel
- Check connection limits
- Verify schema is up to date: `npm run db:push`

## Monitoring

- View logs in Vercel dashboard
- Monitor function executions
- Set up alerts for errors

## Scaling

Vercel automatically scales serverless functions based on demand. For high-traffic applications:

- Consider upgrading to Vercel Pro
- Optimize database queries
- Use connection pooling for database
- Consider adding Redis for caching
