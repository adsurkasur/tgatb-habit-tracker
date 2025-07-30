# The Good and The Bad: Habit Tracker

A minimalist habit tracking application built with **Next.js 14+ and App Router**, focusing on Material You (Material 3) design principles and providing a simple, mobile-first interface for daily habit tracking.

## Features

- 📱 **Mobile-first design** with responsive layout
- 🎨 **Material You design system** following Material 3 principles
- ⚡ **Real-time updates** with optimistic UI
- 📊 **Progress tracking** with visual indicators
- 🔄 **Habit streaks** and consistency metrics
- 💾 **LocalStorage-based** data persistence (with database migration planned)
- � **Next.js App Router** with server components

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI**: Shadcn/ui, Radix UI, Tailwind CSS
- **State Management**: TanStack Query
- **Storage**: LocalStorage (planned: PostgreSQL with Drizzle ORM)
- **Deployment**: Vercel-ready

## Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd tgatb-habit-tracker
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality
- `npm run check` - Run TypeScript type checking

## Storage

Currently uses **LocalStorage** for data persistence. All habits and tracking data are stored locally in your browser.

**Planned Features:**
- Database migration to PostgreSQL with Drizzle ORM
- User authentication and multi-device sync
- Cloud backup and restore

## Deployment

This application is optimized for **Vercel deployment**:

1. **Connect Repository**: Import your GitHub repository to Vercel
2. **Deploy**: Vercel automatically builds and deploys with zero configuration
3. **Access**: Your app will be available at `your-app.vercel.app`

The Next.js App Router architecture makes deployment seamless with automatic:
- Static generation for optimal performance
- API routes as serverless functions
- Edge runtime support

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
