# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive wine cellar management system (Adega Manager) built with React, TypeScript, and Supabase. The application provides complete business management features including inventory control, sales, customer relationship management (CRM), delivery tracking, and detailed reporting.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (runs on port 8080)
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

### Database and Backup Commands
- `npm run backup` - Create database backup
- `npm run restore` - Restore database from backup
- `npm run backup:full` - Create full system backup
- `npm run setup:env` - Setup environment variables

### Important Notes
- No test runner is configured in this project
- The application uses Vite as the build tool
- Development server runs on port 8080 by default
- TypeScript compilation is required for builds (`tsc && vite build`)

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, auth, real-time, storage)
- **State Management**: React Query for server state, Context API for app state
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Key Directory Structure
```
src/
├── components/          # React components
│   ├── ui/             # Shadcn/ui components and custom UI components
│   ├── inventory/      # Inventory management components
│   ├── sales/          # Sales workflow components
│   └── clients/       # Customer management components
├── contexts/           # React context providers (Auth, Notifications)
├── hooks/             # Custom React hooks and data fetchers
├── integrations/      # External service integrations
│   └── supabase/      # Supabase client and types
├── lib/               # Utility functions
├── pages/             # Main application pages
└── types/             # TypeScript type definitions
```

## Application Modules

### Core Features
1. **Dashboard** - Business overview with KPIs and analytics
2. **Sales** - Point of sale system with cart, customer search, and payment processing
3. **Inventory** - Enhanced product catalog, stock management, and turnover analysis
4. **Customers (CRM)** - Customer profiles, segmentation, interaction tracking, and analytics
5. **Delivery** - Order fulfillment and delivery tracking
6. **Movements** - Inventory movement tracking and stock operations
7. **User Management** - Role-based access control

### Recent Changes
- **Reports module removed**: Advanced reporting system has been deprecated
- **Enhanced inventory focus**: New inventory management components and calculations
- **Code refactoring**: Ongoing DRY (Don't Repeat Yourself) improvements across components

### Key Technical Patterns

#### Authentication Flow
- Uses Supabase Auth with JWT tokens
- Protected routes via `ProtectedRoute` component
- Auth context provides user state throughout app

#### Database Integration
- Supabase PostgreSQL with Row Level Security (RLS)
- Real-time subscriptions for live updates
- Type-safe database operations with generated types

#### State Management
- React Query for server state caching and synchronization
- Context API for global app state (auth, notifications)
- Local component state with useState for UI-specific data

#### Component Architecture
- Uses Shadcn/ui component library built on Radix UI
- Custom components follow consistent naming (PascalCase)
- Modular structure with feature-based organization

## Development Guidelines

### Code Style
- TypeScript strict mode is disabled (`noImplicitAny: false`)
- ESLint configured with React hooks rules
- Unused parameters and variables warnings are disabled
- Use absolute imports with `@/` prefix for src directory

### Database Operations
- All database operations go through Supabase client
- Use React Query hooks for data fetching and caching
- Implement proper error handling for database operations
- Follow RLS policies for secure data access

### Component Development
- Keep components focused and single-purpose
- Extract complex logic into custom hooks
- Use TypeScript interfaces for component props
- Follow existing patterns in the codebase

### Environment Setup
- Required environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Use `.env` file for local development
- Run `npm run setup:env` to configure environment

## Common Workflows

### Adding New Features
1. Create components in appropriate feature directory
2. Add custom hooks for data operations in `hooks/` directory
3. Update types in `types/` directory if needed
4. Integrate with existing routing and navigation

### Working with Inventory
- Inventory components are in `src/components/inventory/`
- Inventory calculations hook: `src/hooks/useInventoryCalculations.ts`
- Product forms and turnover analysis available
- Low stock monitoring with `src/hooks/useLowStock.ts`

### Database Schema Changes
- Make changes in Supabase dashboard
- Regenerate types with Supabase CLI
- Update affected components and hooks
- Test with proper RLS policies

## Important Notes

### Backup System
- Automated backup scripts are configured (`backup.cjs`, `restore-backup.cjs`)
- Full backup capabilities with `full-backup.cjs`
- Backup files stored in `backups/` directory

### Real-time Features
- Uses Supabase real-time for live updates
- Notification system with `NotificationBell` component
- Real-time inventory and sales updates

### Performance Considerations
- React Query handles caching and background updates
- Lazy loading is not implemented - consider for large datasets
- Image optimization may be needed for product photos

### CRM System
- Advanced customer segmentation and analytics
- Automated interaction tracking
- Customer timeline and purchase history
- Profile completeness indicators

### Development Tools
- **Zustand** for additional state management needs
- **Lovable** integration for rapid development (`lovable-tagger`)
- **Component Development**: Custom UI components in `src/components/ui/` follow Shadcn/ui patterns

### Code Quality
- Active refactoring initiative to eliminate code duplication
- Focus on DRY principles across components
- See `tarefas/refatoracao-dry.md` for current refactoring tasks

Always run `npm run lint` before committing changes to ensure code quality.