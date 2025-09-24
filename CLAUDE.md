# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Adega Manager** is a comprehensive, enterprise-ready wine cellar management system built with modern technologies. The application is **currently in production** with 925+ real records and daily operations, featuring:

- **Complete POS System** - Point of sale with intelligent cart and multi-payment support
- **Advanced CRM** - Customer segmentation, AI insights, interaction timeline
- **Intelligent Inventory** - Turnover analysis, barcode support, automated alerts
- **Delivery Tracking** - Full logistics management with real-time updates
- **Enterprise Security** - Multi-role RLS with 57 active policies
- **Real-time Analytics** - Dashboards and reporting with live data
- **Modern UI** - Aceternity UI components with advanced animations and interactions

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (runs on port 8080, fallback to 8081+)
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run lint` - Run ESLint for code quality checks (ALWAYS run before commits)
- `npm run preview` - Preview production build locally

### Database and Backup Commands
- `npm run backup` - Create database backup (automated Supabase backup)
- `npm run restore` - Restore database from backup
- `npm run backup:full` - Create full system backup with configurations
- `npm run setup:env` - Setup environment variables

### Testing Commands
- `npm run test` - Run Vitest test suite
- `npm run test:ui` - Vitest UI interface
- `npm run test:run` - Run tests once (CI mode)
- `npm run test:coverage` - Generate coverage reports
- `npm run test:watch` - Watch mode for development
- `npm run test:maintenance` - Test maintenance utilities
- `npm run test:cleanup` - Cleanup test artifacts
- `npm run test:health` - Health check for test environment

### Database Migration Commands (v2.0.0 - New)
- `npm run migration:create name` - Create new migration file
- `npm run migration:apply` - Apply pending migrations to remote database
- `npm run migration:status` - List all migrations and their status
- `npm run migration:diff name` - Generate migration based on schema differences
- `npm run migration:pull` - Pull latest schema from remote database
- `npm run db:new name` - Direct Supabase CLI: create migration
- `npm run db:up` - Direct Supabase CLI: push migrations to remote
- `npm run db:status` - Direct Supabase CLI: list migration status

### Critical Notes
- **Vitest testing framework** - Modern testing with JSDOM environment configured in src/__tests__/setup.ts
- **Port 8080** - Development server default port with IPv6 support, auto-fallback to next available port
- **TypeScript relaxed mode** - Flexible development with selective strict checking
- **Always lint before commits** - Zero warnings policy enforced via ESLint flat config
- **Test setup** - Global mocks for matchMedia, IntersectionObserver, localStorage included in setup.ts

## Architecture Overview (Current State)

### Technology Stack
- **Frontend**: React 19.1.1 + TypeScript 5.5.3 + Vite 5.4.1 (ultra-fast build with SWC)
- **UI Framework**: 
  - **Aceternity UI** - Premium animated components via MCP integration
  - **Shadcn/ui** - Built on Radix UI primitives (25+ components)
  - **Tailwind CSS 3.4.17** - 12-color Adega Wine Cellar palette + dark mode
- **Navigation**: Modern sidebar with role-based filtering and hover animations
- **Backend**: Supabase PostgreSQL with enterprise features
- **State Management**: 
  - **TanStack React Query 5.56.2** - Server state with intelligent caching
  - **Zustand 5.0.5** - Global client state
  - **Context API** - Auth and notifications
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8 validation (type-safe)
- **Data Visualization**: 
  - **Recharts 2.15.3** - Analytics and dashboards
  - **TanStack React Table 8.21.3** - Advanced data grids
  - **TanStack React Virtual 3.13.12** - Performance virtualization
- **Icons**: Lucide React 0.462.0 + Tabler Icons (comprehensive icon system)
- **Animations**: Motion 12.23.9 (Framer Motion) + Aceternity keyframes
- **Additional**: Date-fns 3.6.0, Simplex-noise 4.0.3, React Router DOM 6.26.2

### Database Current State (925+ records)

#### **16 Production Tables** with Real Data:
```
📊 Core Business (370+ records)
├── products (125) - Complete catalog with barcode, turnover analysis
├── product_variants - Product variant system for unit/package tracking
├── customers (91) - CRM with automated segmentation  
├── sales (52) - Sales with delivery tracking and multiple status
├── sale_items - Sale line items with validation
└── inventory_movements - Complete stock control (in/out/fiado/devolucao)

📈 Advanced CRM (73+ records)
├── customer_insights (6) - AI-powered insights with confidence scores
├── customer_interactions (4) - Complete interaction timeline
├── customer_events (63) - Automated event tracking
└── customer_history (3) - Historical data preservation

🔐 System & Security (480+ records)
├── audit_logs (920) - Complete audit trail with IP tracking
├── users/profiles (3 each) - Multi-role: admin/employee/delivery
├── accounts_receivable (6) - Financial management
└── payment_methods (6) - Configurable payment options
```

#### **48 Stored Procedures** (Enterprise Logic):
```sql
-- Core Business Operations
process_sale(customer_id, items, payment_method) -- Complete sale processing
delete_sale_with_items(sale_id) -- Safe deletion with integrity
adjust_product_stock(product_id, quantity, reason) -- Stock management
recalc_customer_insights(customer_id) -- AI insights recalculation

-- Analytics & Reporting  
get_sales_trends(start_date, end_date, period) -- Trend analysis
get_top_products(start_date, end_date, limit) -- Best sellers
get_customer_metrics() -- CRM analytics
get_financial_metrics() -- Financial KPIs

-- Security & Auth
create_admin_user(email, password, name) -- Admin creation
has_role(user_id, role) -- Permission checking
handle_new_user() -- Automatic user setup
```

#### **57 RLS Policies** (Enterprise Security):
- **Admin**: Full system access
- **Employee**: Operations access (no cost prices)
- **Delivery**: Only assigned deliveries
- **Granular control** per table and operation
- **IP tracking** and audit logging

### Directory Structure (v2.0.0 - Feature-Based Architecture)
```
src/
├── app/                    # Application setup (layout, providers, router)
├── components/             # Legacy components being migrated
├── core/                   # Core system architecture
│   ├── api/supabase/      # Supabase client and types
│   ├── config/            # Theme, utils, error handling, timeouts
│   └── types/             # TypeScript definitions (branded, database, generic)
├── features/               # Feature-based modules (v2.0.0)
│   ├── customers/         # CRM system - 25+ components
│   ├── dashboard/         # Executive overview - KPIs and charts
│   ├── inventory/         # Stock management - Product forms, barcode
│   ├── sales/             # POS system - Cart, checkout, products grid
│   ├── delivery/          # Logistics management
│   ├── movements/         # Stock operations and audit
│   ├── reports/           # Advanced reporting system
│   ├── suppliers/         # Supplier management
│   └── users/             # User management and permissions
├── shared/                 # Shared components and utilities (v2.0.0)
│   ├── ui/                # Complete UI system
│   │   ├── composite/     # StatCard, PaginationControls, LoadingSpinner
│   │   ├── primitives/    # Shadcn/ui base components (25+ components)
│   │   └── layout/        # DataTable, FormDialog, PageContainer
│   ├── hooks/             # 40+ reusable hooks
│   │   ├── common/        # usePagination, useEntity, useFormWithToast
│   │   ├── auth/          # usePermissions, useAuthErrorHandler
│   │   └── audit/         # useAuditErrorHandler
│   └── templates/         # Container/Presentation templates
├── hooks/                  # Feature-specific hooks
├── pages/                 # Main routes (Auth, Index, NotFound)
└── __tests__/             # Comprehensive test suite
    ├── accessibility/     # WCAG compliance tests
    ├── integration/       # End-to-end workflow tests
    ├── performance/       # Performance testing
    ├── setup.ts          # Vitest configuration and global mocks
    └── utils/            # Test utilities and mocks
```

## Application Modules (Production Features)

### 1. **Dashboard** - Executive Overview
- **Real-time KPIs** - Sales, inventory, customers with live updates
- **Interactive charts** - Trends, top products, customer analytics
- **Smart alerts** - Low stock, important sales, system notifications
- **Performance metrics** - Financial and operational indicators

### 2. **Sales (POS)** - Complete Point of Sale
- **Product search** - By name, category, barcode with instant results
- **Intelligent cart** - Automatic calculations, discounts, validations
- **Customer integration** - Quick customer search and selection
- **Multi-payment** - Various payment methods with status tracking
- **Real-time validation** - Stock verification before completion

### 3. **Inventory** - Intelligent Stock Management
- **Complete product catalog** - 12 fields including barcode, volume, margins
- **Product variants system** - Support for unit/package tracking with hierarchical barcodes
- **Turnover analysis** - Fast/Medium/Slow automatic classification
- **Barcode support** - Full scanner integration for operations
- **Stock conversion system** - Automatic conversion between unit and package variants
- **Automated alerts** - Low stock notifications with reorder suggestions
- **Movement tracking** - Complete audit trail of all stock changes
- **Expandable modals** - All inventory modals (Add, Edit, Adjust, History) use 1200px width for better UX

### 4. **Customers (CRM)** - Enterprise CRM
- **Automated segmentation** - High Value, Regular, Occasional, New based on LTV
- **AI insights** - Machine learning-powered customer analysis
- **Interaction timeline** - Complete history of all customer touchpoints
- **Purchase patterns** - Frequency analysis and preference detection
- **Profile completeness** - Data quality indicators and suggestions

### 5. **Delivery** - Logistics Management
- **Complete tracking** - Real-time status updates for all deliveries
- **Driver assignment** - Automatic assignment with role-based access
- **Route optimization** - Delivery planning and management
- **Status workflow** - pending → preparing → out_for_delivery → delivered with notifications

### 6. **Reports** - Advanced Analytics
- **Sales analytics** - Top products with manual fallback for real data
- **Category analysis** - Product categories (not payment methods) with translations
- **Financial reports** - Payment methods, aging analysis, DSO metrics
- **Performance dashboards** - KPIs with forced manual calculations when RPC fails

### 7. **Suppliers** - Vendor Management
- **Complete supplier profiles** - Contact information, terms, history
- **Purchase order management** - Order tracking and fulfillment
- **Performance analytics** - Supplier rating and delivery metrics

## Development Guidelines (Critical)

### Build System & Configuration
- **Vite Configuration**: Advanced chunk splitting for optimal performance
  - `vendor` chunk: Core React libraries
  - `charts` chunk: Recharts isolated for better caching
  - `ui` chunk: Radix UI + Lucide icons
  - `supabase` chunk: Database and query libraries
  - `utils` chunk: Date-fns, clsx, tailwind-merge
- **Development Server**: Port 8080 with automatic fallback to next available port
- **TypeScript**: Relaxed mode (`strict: false`) for development flexibility
- **Bundle Optimization**: Strategic code splitting, tree shaking enabled

### Code Style and Quality
- **ESLint**: Flat config with React hooks rules - **ZERO warnings policy**
- **TypeScript**: Relaxed mode but maintain type safety in practice  
- **Absolute imports**: Use `@/` prefix for all src directory imports
- **Component naming**: PascalCase for components, camelCase for functions
- **File organization**: Feature-based structure with shared utilities
- **UI Components**: Check shared/ui first, then Aceternity UI, then Shadcn/ui, then custom

### Testing Requirements
- **Vitest Framework**: Modern testing with JSDOM environment configured in src/__tests__/setup.ts
- **Global Mocks**: matchMedia, IntersectionObserver, ResizeObserver, localStorage, sessionStorage
- **Test Structure**: Accessibility, integration, performance tests organized in __tests__ directory
- **Coverage**: Automatic coverage generation with v8 provider
- **Accessibility Testing**: @axe-core/react + jest-axe for WCAG compliance

### Database Operations (Security Critical)
- **All operations through Supabase client** - Never direct SQL from frontend
- **React Query for caching** - Implement proper cache invalidation
- **RLS policies mandatory** - Every table must have appropriate policies
- **Error handling required** - Graceful degradation for all database operations
- **Audit logging** - Critical operations must be logged automatically

### Component Development Best Practices (v2.0.0)
- **Use shared/ui components first** - Check `shared/ui/composite/` for StatCard, PaginationControls, LoadingSpinner, SearchInput, EmptyState
- **Follow feature-based structure** - Place new components in appropriate `features/` module
- **Leverage shared hooks** - Use `usePagination`, `useEntity`, `useFormWithToast` from `shared/hooks/common/`
- **TypeScript interfaces** - Define clear prop types for all components
- **Container/Presentation pattern** - Separate business logic from UI rendering
- **Performance optimization** - Use React.memo, useMemo, useCallback appropriately
- **Accessibility compliance** - Follow WCAG 2.1 AA standards with proper ARIA attributes
- **Role-based rendering** - Always implement proper role-based access control in UI

### Standardized Component Editing Workflow (CSS Best Practices)
When standardizing components or fixing styling issues, follow this proven workflow:

#### 1. **CSS Specificity Analysis** (Critical)
- **Check for conflicting utility functions** - Theme utility functions may override direct Tailwind classes
- **Identify gradient conflicts** - `text-transparent bg-clip-text` requires no conflicting color classes
- **Example**: `getSFProTextClasses('h1', 'accent')` returns `text-primary-yellow` which conflicts with `text-transparent`
- **Solution**: Use direct Tailwind classes instead of utility functions for gradients

#### 2. **Adega Gradient Implementation** (Standard)
```tsx
// ✅ CORRECT - Direct Tailwind classes
className="font-sf-black text-3xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"

// ❌ WRONG - Theme utility conflicts
className={cn(
  getSFProTextClasses('h1', 'accent'), // Returns 'text-primary-yellow'
  "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]"
)}
```

#### 3. **PageHeader Standardization Pattern**
```tsx
// Replace manual headers with PageHeader component
<PageHeader
  title="FEATURE NAME"
  count={data?.length || 0}
  countLabel="items"
>
  {/* Action buttons as children */}
  <Button>Export</Button>
  <Button>Add New</Button>
</PageHeader>
```

#### 4. **Progressive Debugging Approach**
1. **Identify root cause** - Use browser DevTools to inspect computed styles
2. **Remove conflicting elements** - Eliminate glassmorphism, backgrounds, utility functions
3. **Simplify CSS classes** - Use direct Tailwind classes for critical styling
4. **Test thoroughly** - Verify gradient appears correctly across different browsers
5. **Clean up imports** - Remove unused utility function imports

#### 5. **CSS Class Validation**
- **Verify class existence** - Check that all referenced CSS classes exist in stylesheets
- **Remove non-existent classes** - Classes like `text-shadow-glow-yellow` may not be defined
- **Use standard Tailwind** - Prefer documented Tailwind classes over custom utilities

### UI/UX Development with Aceternity UI
- **Component Selection** - Always check Aceternity UI library first via MCP integration
- **Animation Integration** - Leverage Framer Motion animations through Aceternity components
- **Navigation Pattern** - Use the established sidebar pattern with role-based filtering
- **Responsive Design** - Ensure all Aceternity components work on mobile devices
- **Theme Consistency** - Follow dark theme patterns established in the system
- **Installation Process** - Use MCP Aceternity tool for adding new components

### Security Guidelines (Enterprise Critical)
- **RLS policies first** - Implement security before functionality
- **Role-based access** - Verify user roles in components and hooks
- **Input validation** - Zod schemas for all user inputs
- **Audit trail** - Log sensitive operations automatically
- **Environment variables** - Never expose sensitive data to frontend

## Build Configuration Details

### Vite Configuration
Key optimizations in vite.config.ts include strategic chunk splitting for optimal caching and performance. The build is configured with manual chunks for vendor libraries, charts, UI components, Supabase integration, and utilities. The server uses IPv6 support with automatic port fallback.

### TypeScript Configuration
Uses relaxed mode for development flexibility while maintaining practical type safety. Configured with absolute imports via `@/*` paths and optimized for rapid development iterations.

### Tailwind Theme System
Complete Adega Wine Cellar color architecture with 12-color palette, professional neutrals, modern accents, and comprehensive utility functions for consistent theming across the application.

## Environment Setup

### Required Variables
```env
# Supabase Configuration (CRITICAL)
VITE_SUPABASE_URL=https://uujkzvbgnfzuzlztrzln.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development (Optional)
NODE_ENV=development
```

### Setup Process
1. **Install dependencies**: `npm install`
2. **Environment setup**: `npm run setup:env` or manually create `.env`
3. **Start development**: `npm run dev`
4. **Verify connection**: Check Supabase dashboard access
5. **Test basic flows**: Login, view products, create test sale

## Common Workflows (For AI Assistants)

### Adding New Features (v2.0.0 Updated)
1. **Check reusable components first** - Use existing `PaginationControls`, `StatCard`, `LoadingSpinner`, etc.
2. **Analyze existing patterns** - Review similar features in codebase
3. **Use existing hooks** - Consider `usePagination`, `useEntity`, `useFormWithToast`
4. **Create feature branch** - Follow naming conventions
5. **Components with theme consistency** - Use Adega Wine Cellar utilities
6. **Add hooks** - Create custom hooks for data operations if needed
7. **Update types** - Add TypeScript definitions as needed
8. **Implement RLS** - Add database policies for new tables/operations
9. **Test thoroughly** - Manual testing of all user flows
10. **Lint and commit** - Always run `npm run lint` before committing

### Working with Reports
- **Main component**: `src/features/reports/components/SalesReportsSection.tsx`
- **Fallback strategies**: Manual calculations when RPC stored procedures fail
- **Data translation**: Functions for converting English terms to Portuguese
- **Chart responsiveness**: Proper truncation and tooltip handling for long product names
- **Category filtering**: Ensure product categories (not payment methods) are displayed

### Working with Navigation & Sidebar
- **Main component**: `src/components/Sidebar.tsx` (Aceternity UI implementation)
- **Base UI component**: `src/components/ui/sidebar.tsx` (Aceternity UI component)
- **Role-based filtering**: Automatic filtering based on user role (admin/employee/delivery)
- **Navigation structure**: 7 main categories with hierarchical organization
- **Animations**: Hover-to-expand with smooth Framer Motion transitions

### v2.0.0 Reusable Components System
- **Pagination**: Use `usePagination` hook + `PaginationControls` component for all lists
- **Statistics**: Use `StatCard` component with 6 variants (default, success, warning, error, purple, gold)
- **Loading states**: Use `LoadingSpinner` or `LoadingScreen` components
- **Search functionality**: Use `SearchInput` component with built-in debounce
- **Empty states**: Use `EmptyState` base or pre-configured components
- **Filtering**: Use `FilterToggle` component for collapsible filters
- **Forms**: Use `useFormWithToast` hook for standardized form handling
- **Entity operations**: Use `useEntity`, `useEntityList`, `useEntityMutation` hooks
- **Modal system**: Use `BaseModal` component for consistent modal sizes (sm/md/lg/xl/2xl/3xl/4xl/full)
  - Supports `maxWidth` prop for custom widths
  - All inventory modals standardized to 1200px width for improved UX
  - Uses Radix UI Dialog with proper style inheritance

### Database Schema Changes (v2.0.0 - Migration-First Approach)
**IMPORTANT: Use migration-first workflow instead of direct dashboard changes**

1. **Create migration** - Use `npm run migration:create descriptive_name`
2. **Edit SQL file** - Write migration in `supabase/migrations/` with rollback comments
3. **Apply migration** - Use `npm run migration:apply` to push to remote database
4. **Regenerate types** - Use Supabase CLI: `supabase gen types typescript` (if needed)
5. **Update components** - Modify affected React components
6. **Test thoroughly** - Verify all affected functionality in development branch
7. **Create Pull Request** - GitHub Actions will validate lint, build, and tests
8. **Manual production deploy** - After PR merge, manually apply migration to production

**Migration Commands:**
- `npm run migration:create add_new_feature` - Create new migration
- `npm run migration:status` - Check which migrations are applied
- `npm run migration:apply` - Apply pending migrations

## Git Workflow & CI/CD (v2.0.0 - New Development Process)

### Branch Strategy
- **main** - Production-ready code, protected branch
- **development/simplification** - Main development branch for system simplification
- **feature/*** - Feature branches off development/simplification
- **hotfix/*** - Emergency fixes directly to main (rare)

### Development Workflow
1. **Create feature branch** from development/simplification
   ```bash
   git checkout development/simplification
   git pull origin development/simplification
   git checkout -b feature/new-functionality
   ```

2. **Develop with migrations**
   ```bash
   npm run migration:create add_new_functionality
   # Edit migration file
   npm run migration:apply
   # Develop React components
   npm run dev
   ```

3. **Quality checks before commit**
   ```bash
   npm run lint        # Zero warnings required
   npm run build       # Must compile successfully
   npm run test:run    # All tests must pass
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new functionality with database migration"
   git push origin feature/new-functionality
   ```

5. **Create Pull Request** to development/simplification
   - GitHub Actions automatically runs quality gates
   - Checks: ESLint, TypeScript build, unit tests
   - Auto-comments with results
   - Merge only after passing all checks

6. **Production deployment** (manual)
   ```bash
   git checkout main
   git merge development/simplification
   npm run migration:apply  # Apply migrations to production
   # Manual verification and deploy
   ```

### GitHub Actions CI/CD
**File:** `.github/workflows/ci.yml`

**Triggers:** Pull requests to main or development/* branches

**Quality Gates:**
- ✅ ESLint code quality check (zero warnings)
- ✅ TypeScript compilation check
- ✅ Unit and integration tests
- ✅ Security audit (npm audit)
- ✅ Bundle size analysis

**No Automatic Deployment:** Manual control for production safety

### Documentation Requirements
- **Migration Guide:** `docs/06-operations/guides/MIGRATIONS_GUIDE.md`
- **Complete examples** and troubleshooting included
- **Beginner-friendly explanations** of technical concepts

## Critical System Information

### Current Production Status
- **925+ real records** in active use
- **Daily operations** with real business transactions
- **113 database migrations** applied (fully mature system)
- **3 active users** with different roles (admin/employee/delivery)
- **Multiple payment methods** configured and in use

### Performance Characteristics
- **React Query caching** - Intelligent server state management
- **Real-time updates** - Supabase subscriptions for live data
- **Optimized queries** - Stored procedures for complex operations with manual fallbacks
- **Responsive design** - Works on desktop and mobile devices
- **Fast development** - Vite hot reload for rapid iteration

### Security Posture
- **Enterprise RLS** - 57 active policies protecting all data
- **Audit logging** - 920+ audit logs with IP and user agent tracking
- **Role separation** - Clear boundaries between admin/employee/delivery
- **Input validation** - Zod schemas preventing invalid data
- **Session management** - JWT tokens with automatic refresh

### Integration Points
- **Supabase** - Primary backend service with enterprise features
- **Lovable** - Rapid development platform integration
- **N8N** - Automation platform (logs in automation_logs table)
- **Barcode scanners** - Hardware integration for inventory operations
- **Aceternity UI** - Modern UI components via MCP integration
- **MCP Tools** - Multiple Context Providers for enhanced development workflow

## Available MCP Tools
- **Aceternity UI MCP**: For component installation and management (`mcp__aceternityui__*`)
- **Shadcn UI MCP**: For base component operations (`mcp__shadcn-ui__*`)  
- **Supabase MCP**: For database operations and management (`mcp__supabase__*`)
- **Context7 MCP**: For documentation and code reference (`mcp__context7__*`)

## Troubleshooting (For AI Assistants)

### Common Issues and Solutions

**🔴 Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules .vite
npm install
npm run dev
```

**🔴 Database Connection Issues:**
```bash
# Verify environment variables
npm run setup:env
# Check Supabase dashboard connectivity
```

**🔴 TypeScript Errors:**
```bash
# Regenerate Supabase types
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

**🔴 RLS Policy Errors:**
```sql
-- Check user role in Supabase dashboard
SELECT * FROM profiles WHERE id = auth.uid();
```

**🔴 Reports Data Issues:**
- Check if stored procedures exist in Supabase
- Verify manual fallback calculations are working
- Ensure data translation functions are applied
- Test with different user roles for data access

**🔴 Modal/UI Cache Issues:**
```bash
# Clear Vite cache completely
pkill -f "vite"
rm -rf node_modules/.vite .vite dist
npm run dev

# Browser cache: Hard refresh
# Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```
- **HMR Cache**: Hot Module Replacement can cache old component versions
- **CSS Cache**: Tailwind classes may not update without clearing cache
- **Component Props**: BaseModal props need complete cache clear to apply
- **Style Overrides**: Use inline styles with !important for critical styling

### Performance Issues
- **Slow queries** - Check pg_stat_statements in Supabase
- **Large datasets** - Implement pagination for lists
- **Memory usage** - Use React DevTools Profiler
- **Bundle size** - Analyze with Vite bundle analyzer

### Development Tips for AI Assistants

#### When Adding Features
1. **Study existing code** - Look for similar patterns before implementing
2. **Follow naming conventions** - Maintain consistency with existing code
3. **Implement security first** - RLS policies before UI components
4. **Test with real data** - Use the 925+ existing records for testing
5. **Consider mobile** - Responsive design is critical
6. **Performance first** - Use React Query effectively

#### When Debugging Reports
1. **Check console logs** - Look for RPC failure messages and fallback activations
2. **Verify data structure** - Ensure chart data matches expected format
3. **Test translations** - Confirm English terms are properly converted to Portuguese
4. **Validate filters** - Check search functionality works with actual database content

#### When Modifying Database
1. **Backup first** - `npm run backup` before any changes
2. **Test in development** - Never modify production directly
3. **Update types** - Regenerate TypeScript definitions
4. **Consider migrations** - Document all schema changes
5. **Verify RLS** - Test security policies thoroughly

Always remember: This is a **production system** with real business data. Prioritize data integrity, security, and user experience in all modifications.

## Documentation Architecture (v2.0.0)

### Centralized Documentation System
The project uses a **comprehensive, organized documentation architecture** located in the `docs/` folder. All documentation has been migrated from scattered locations throughout the system into this structured hierarchy:

```
docs/
├── 01-getting-started/     # Quick start guides and installation
├── 02-architecture/        # System architecture and technical design
├── 03-modules/            # Feature-specific documentation (10 modules)
├── 04-design-system/      # Complete Design System v2.0.0 documentation
├── 05-business/           # Business rules and stakeholder information
├── 06-operations/         # User manuals and operational procedures
├── 07-changelog/          # Version history and migration guides
├── 08-testing/            # Testing strategies and procedures
├── 09-api/               # API documentation and integrations
└── 10-legacy/            # Historical documentation and reports
```

### Key Documentation Features
- **📚 Complete Coverage**: Every system aspect documented with examples
- **🎯 Role-Based**: Different sections for developers, users, and stakeholders
- **🔗 Cross-Referenced**: Extensive linking between related documentation
- **📊 Up-to-Date**: Reflects current v2.0.0 system state with 925+ production records
- **🗂️ Organized**: Numbered hierarchy for logical reading progression
- **🏛️ Legacy Preserved**: Historical documentation maintained in structured archive

### Documentation Guidelines
- **ALWAYS reference docs/ first** when seeking project information
- **Follow the numbered structure** for logical information discovery
- **Use cross-references** to link related concepts across sections
- **Maintain consistency** with established templates and patterns
- **Update documentation** when implementing new features or changes

### Root Documentation Files
- **README.md** - Project overview and quick links (GitHub standard)
- **CLAUDE.md** - This file - Claude Code instructions and project context
- **docs/README.md** - Main documentation navigation hub

**Migration Status**: ✅ **COMPLETE** - All scattered .md files consolidated into organized structure, eliminating documentation confusion.

## Project Status: ENTERPRISE PRODUCTION READY (v2.0.0)

**Current State**: Fully functional enterprise application with 925+ real records, daily operations, complete security implementation, comprehensive feature set, complete reusable components system that eliminated 90% of code duplication, and **centralized documentation architecture** that provides comprehensive guidance for all stakeholders. The system is mature, stable, actively used for business operations, and optimized for rapid future development with modern tooling and MCP integrations.