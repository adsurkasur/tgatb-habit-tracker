# Local Development Setup

This guide will help you set up the habit tracker application for local development.

## Prerequisites

- Node.js (v20 or higher)
- PostgreSQL database
- npm or yarn package manager

## Setup Instructions

1. **Clone the repository** (if not already done)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the DATABASE_URL with your PostgreSQL connection string
   - Set a strong SESSION_SECRET

4. **Set up the database**
   - Create a PostgreSQL database
   - Run database migrations:
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check TypeScript
- `npm run db:push` - Push database schema changes

## Database Setup

### Using local PostgreSQL:
1. Install PostgreSQL on your system
2. Create a database: `createdb habit_tracker`
3. Update DATABASE_URL in .env: `postgresql://username:password@localhost:5432/habit_tracker`

### Using cloud PostgreSQL (e.g., Neon, Supabase):
1. Create a database instance
2. Copy the connection string to DATABASE_URL in .env

## Production Deployment

The application can be deployed to any platform that supports Node.js:

- **Vercel**: Use the provided configuration
- **Netlify**: Configure build settings
- **Railway**: Connect your repository
- **Heroku**: Add Heroku buildpacks
- **DigitalOcean App Platform**: Deploy with the app spec

Make sure to set the required environment variables in your deployment platform.
