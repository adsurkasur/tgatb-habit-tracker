# Replit.md - Habit Tracker Application

## Overview

This is a full-stack habit tracking application called "The Good and The Bad: Habit Tracker" built with modern web technologies. The application focuses on minimalist design following Material You (Material 3) principles and provides a simple, mobile-first interface for daily habit tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React hooks with custom `useHabits` hook for habit management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with Material You design system
- **Build Tool**: Vite for development and bundling
- **Data Fetching**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Type System**: TypeScript throughout the application
- **Database**: PostgreSQL with Drizzle ORM (configured for Neon Database)
- **Session Management**: Express sessions with PostgreSQL storage
- **API Structure**: RESTful API with `/api` prefix

### Design System
- **Material You (Material 3)**: Strict adherence to Google's design principles
- **Color System**: Based on seed color `#6750A4` (deep purple) with tonal variations
- **Typography**: Inter font family for all text elements
- **Theme Support**: Light and dark mode support with CSS custom properties
- **Mobile-First**: Responsive design optimized for mobile devices

## Key Components

### Data Models
- **Habit**: Core entity with id, name, type (good/bad), streak count, and timestamps
- **HabitLog**: Individual tracking entries with date and completion status
- **UserSettings**: User preferences including dark mode, language, and motivator personality

### Frontend Components
- **HabitCard**: Main interface for displaying and tracking individual habits
- **NavigationDrawer**: Side navigation with habit lists and settings access
- **AddHabitDialog**: Modal for creating new habits
- **SettingsScreen**: User preferences and data management interface

### Storage System
- **Local Storage**: Client-side persistence using `HabitStorage` class
- **Database**: PostgreSQL schema defined in Drizzle ORM
- **Memory Storage**: Fallback in-memory storage for development

### Motivational System
- **Motivator**: Provides encouraging/adaptive/harsh feedback based on user preference
- **Streak Tracking**: Visual feedback for habit consistency
- **Toast Notifications**: Real-time feedback for user actions

## Data Flow

1. **Habit Creation**: User creates habits through AddHabitDialog → stored locally and in database
2. **Daily Tracking**: User marks habits as complete/incomplete through HabitCard interface
3. **Streak Calculation**: Automatic streak computation based on consecutive completion days
4. **Persistence**: Data synchronized between local storage and PostgreSQL database
5. **Settings Management**: User preferences stored locally and synced across sessions

## External Dependencies

### UI/UX Libraries
- **Radix UI**: Accessible, unstyled UI primitives
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework
- **Class Variance Authority**: Component variant management

### Backend Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Express**: Web application framework
- **Drizzle ORM**: Type-safe database operations

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR (Hot Module Replacement)
- **Database**: Neon serverless PostgreSQL with environment-based configuration
- **Environment Variables**: `DATABASE_URL` required for database connectivity

### Production Build
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles Node.js server to `dist/index.js`
- **Static Assets**: Served through Express with Vite middleware in development

### Key Architectural Decisions

1. **Local-First Approach**: Habits stored in localStorage for offline functionality with database sync
2. **Material 3 Design**: Chosen for modern, accessible, and consistent user experience
3. **Type Safety**: Full TypeScript implementation for better developer experience and fewer runtime errors
4. **Component Composition**: Radix UI + shadcn/ui for reusable, accessible components
5. **Mobile-First Design**: Primary focus on mobile experience with responsive design
6. **Serverless Database**: Neon PostgreSQL for scalability and reduced operational overhead