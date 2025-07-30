# The Good and The Bad: Habit Tracker

A minimalist habit tracking application built with modern web technologies, focusing on Material You (Material 3) design principles and providing a simple, mobile-first interface for daily habit tracking.

## Features

- 📱 **Mobile-first design** with responsive layout
- 🎨 **Material You design system** following Material 3 principles
- ⚡ **Real-time updates** with optimistic UI
- 📊 **Progress tracking** with visual indicators
- 🔄 **Habit streaks** and consistency metrics
- 💾 **PostgreSQL database** with Drizzle ORM
- 🔐 **Session-based authentication**

## Tech Stack

### Frontend
- **React** with TypeScript
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Radix UI** primitives with **shadcn/ui** components
- **Tailwind CSS** with Material You design tokens
- **Vite** for development and bundling

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout
- **PostgreSQL** with Drizzle ORM
- **Express sessions** with PostgreSQL storage
- **RESTful API** design

## Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd tgatb-habit-tracker
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database connection and secrets
   ```

3. **Set up database**
   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/habit_tracker
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-session-secret-here
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Database Setup

### Local PostgreSQL
1. Install PostgreSQL
2. Create database: `createdb habit_tracker`
3. Update `DATABASE_URL` in `.env`

### Cloud Database (Recommended)
- **Neon**: Free PostgreSQL with serverless scaling
- **Supabase**: PostgreSQL with additional features
- **Railway**: Simple PostgreSQL deployment
- **PlanetScale**: MySQL-compatible option

## Deployment

This application supports multiple deployment options:

### Vercel (Recommended for Serverless)

The application is optimized for Vercel deployment with serverless functions:

1. **Connect Repository**: Import your GitHub repository to Vercel
2. **Set Environment Variables**: Add `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`
3. **Deploy**: Vercel automatically builds and deploys

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

### Traditional Server Deployment

Deploy to any platform that supports Node.js:

- **Railway**: Connect repository, add PostgreSQL service
- **DigitalOcean App Platform**: Deploy with app spec
- **Heroku**: Add PostgreSQL addon
- **AWS**: Use Elastic Beanstalk with RDS

### Other Platforms
- **Netlify** with serverless functions
- **PlanetScale** for MySQL-compatible deployment

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Page components
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data access layer
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema
└── migrations/            # Database migrations
```

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL database
- npm or yarn

### Development Workflow
1. Make changes to code
2. TypeScript will auto-compile
3. Vite will hot-reload frontend
4. Server restarts automatically with tsx

### Code Style
- TypeScript strict mode enabled
- ESLint and Prettier recommended
- Material Design principles for UI
- RESTful API conventions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `npm run check`
5. Test your changes
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs
