# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) and other AI assistants when working with code in this repository. This is an **enterprise-grade wine cellar management system** in active production.

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
- `npm run dev` - Start development server (runs on port 8080)
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
- `npm run test:coverage` - Generate coverage reports (80%+ required)
- `npm run test:watch` - Watch mode for development
- `npm run test:maintenance` - Test maintenance utilities

### Critical Notes
- **Vitest testing framework** - Comprehensive test suite with accessibility testing
- **Port 8080** - Development server default port
- **TypeScript relaxed mode** - `strict: false` for development flexibility
- **Always lint before commits** - Zero warnings policy enforced
- **Coverage thresholds** - 80% lines, 70% branches, 85% functions required

## Architecture Overview (Current State)

### Technology Stack
- **Frontend**: React 18.3.1 + TypeScript 5.5.3 + Vite 5.4.1 (ultra-fast build with SWC)
- **UI Framework**: 
  - **Aceternity UI** - Premium animated components
  - **Shadcn/ui** - Built on Radix UI primitives (20+ components)
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
- **Icons**: Lucide React + Tabler Icons (comprehensive icon system)
- **Animations**: Motion 12.23.9 (Framer Motion) + Aceternity keyframes
- **Additional**: Date-fns 3.6.0, Simplex-noise 4.0.3, React Router DOM 6.26.2

### Database Current State (925+ records)

#### **16 Production Tables** with Real Data:
```
📊 Core Business (370+ records)
├── products (125) - Complete catalog with barcode, turnover analysis
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

### Directory Structure (v2.0.0 - Refactored)
```
src/
├── components/          # React components organized by feature
│   ├── ui/             # Sistema completo de componentes reutilizáveis (v2.0.0)
│   │   ├── pagination-controls.tsx     # Sistema de paginação padronizado
│   │   ├── stat-card.tsx              # Cartões estatísticos (6 variantes)
│   │   ├── loading-spinner.tsx        # Spinners de loading variados  
│   │   ├── search-input.tsx           # Input de busca com debounce
│   │   ├── filter-toggle.tsx          # Toggle de filtros animado
│   │   ├── empty-state.tsx            # Estados vazios reutilizáveis
│   │   ├── theme-showcase.tsx         # Demo do sistema de themes
│   │   ├── sidebar.tsx                # Modern animated sidebar
│   │   └── [shadcn+aceternity]        # Base components
│   ├── examples/       # Componentes de demonstração
│   │   └── EntityHookDemo.tsx         # Demo dos hooks genéricos
│   ├── Sidebar.tsx     # Main sidebar component with Aceternity UI integration
│   ├── inventory/      # Stock management (ProductForm, TurnoverAnalysis, BarcodeInput)
│   ├── sales/          # POS system (Cart, ProductsGrid, CustomerSearch, SalesPage)
│   ├── clients/        # CRM (CustomerForm, interactions, timeline)
│   └── [modules]/      # Dashboard, Delivery, Movements, UserManagement
├── contexts/           # Global providers (Auth, Notifications)
├── hooks/              # 18+ custom hooks reutilizáveis (v2.0.0)
│   ├── use-pagination.ts              # Hook de paginação genérico
│   ├── use-form-with-toast.ts         # Hook de formulário com toast
│   ├── use-entity.ts                  # Hooks genéricos para Supabase
│   ├── use-entity-examples.ts         # Exemplos de migração
│   ├── use-cart.ts                    # Shopping cart management
│   ├── use-crm.ts                     # CRM operations and analytics
│   ├── use-sales.ts                   # Sales processing and reporting
│   ├── use-product.ts                 # Product management
│   ├── use-barcode.ts                 # Barcode scanning integration
│   └── [specialized]                  # useInventoryCalculations, useLowStock, etc.
├── integrations/       
│   └── supabase/       # Supabase client and auto-generated types
├── lib/                # Core utilities expandidos (v2.0.0)
│   ├── utils.ts                       # Base utilities (formatCurrency, etc.)
│   ├── theme.ts                       # Sistema de cores Adega Wine Cellar
│   └── theme-utils.ts                 # 30+ utility functions para themes
├── pages/              # Main routes (Auth, Index, NotFound)
└── types/              # TypeScript definitions (inventory.types.ts, supabase.ts)
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
- **Turnover analysis** - Fast/Medium/Slow automatic classification
- **Barcode support** - Full scanner integration for operations
- **Automated alerts** - Low stock notifications with reorder suggestions
- **Movement tracking** - Complete audit trail of all stock changes

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
- **Status workflow** - pending → delivering → delivered with notifications

### 6. **Movements** - Stock Operations
- **Movement types** - IN (receiving), OUT (sales), FIADO (credit), DEVOLUCAO (returns)
- **Automatic logging** - All movements tracked with user and timestamp
- **Inventory reconciliation** - Real-time stock level updates
- **Audit trail** - Complete history for compliance and analysis

### 7. **User Management** - Role-Based Security
- **Multi-role system** - Admin, Employee, Delivery with granular permissions
- **Profile management** - User details, roles, access control
- **Activity monitoring** - Login tracking and session management
- **Permission enforcement** - RLS-based security at database level

## Development Guidelines (Critical)

### Build System & Configuration
- **Vite Configuration**: Advanced chunk splitting for optimal performance
  - `vendor` chunk: Core React libraries
  - `charts` chunk: Recharts isolated for better caching
  - `ui` chunk: Radix UI + Lucide icons
  - `supabase` chunk: Database and query libraries
- **Development Server**: Port 8080, IPv6 support, hot reload
- **TypeScript**: Relaxed mode (`strict: false`) for development flexibility
- **Bundle Optimization**: Strategic code splitting, tree shaking enabled

### Code Style and Quality
- **ESLint**: Flat config with React hooks rules - **ZERO warnings policy**
- **TypeScript**: Relaxed mode but maintain type safety in practice
- **Absolute imports**: Use `@/` prefix for all src directory imports
- **Component naming**: PascalCase for components, camelCase for functions
- **File organization**: Feature-based structure, group related functionality
- **UI Components**: Aceternity UI first, then Shadcn/ui, then custom components

### Testing Requirements
- **Vitest Framework**: Modern testing with JSDOM environment
- **Coverage Thresholds**: Lines 80%, Branches 70%, Functions 85%, Statements 80%
- **Accessibility Testing**: jest-axe + @axe-core/react for WCAG compliance
- **Test Structure**: Component tests, hook tests, accessibility tests
- **Performance Testing**: Multi-threaded pool (1-4 threads), 10s timeouts

### Database Operations (Security Critical)
- **All operations through Supabase client** - Never direct SQL from frontend
- **React Query for caching** - Implement proper cache invalidation
- **RLS policies mandatory** - Every table must have appropriate policies
- **Error handling required** - Graceful degradation for all database operations
- **Audit logging** - Critical operations must be logged automatically

### Component Development Best Practices (v2.0.0)
- **Use reusable components first** - Check if `PaginationControls`, `StatCard`, `LoadingSpinner`, `SearchInput`, `EmptyState` can be used
- **Single responsibility** - Each component should have one clear purpose
- **Custom hooks** - Use `usePagination`, `useEntity`, `useFormWithToast` hooks when applicable
- **TypeScript interfaces** - Define clear prop types for all components
- **Existing patterns** - Follow established patterns in the codebase
- **Performance considerations** - Use React.memo, useMemo, useCallback appropriately
- **Aceternity UI Integration** - Use Aceternity components for enhanced UX with animations
- **Role-based rendering** - Always implement proper role-based access control in UI
- **Theme consistency** - Use Adega Wine Cellar theme utilities from `@/lib/theme-utils`

### UI/UX Development with Aceternity UI
- **Component Selection** - Always check Aceternity UI library first for components
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
```ts
// Key optimizations in vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: { port: 8080, host: '::' },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-*', 'lucide-react'],
          supabase: ['@supabase/supabase-js', '@tanstack/react-query']
        }
      }
    }
  }
})
```

### TypeScript Configuration
```ts
// Relaxed mode for development flexibility
{
  "strict": false,
  "noImplicitAny": false,
  "noUnusedLocals": false,
  "strictNullChecks": false
}
```

### Tailwind Theme System
```ts
// 12-color Adega Wine Cellar palette
colors: {
  'adega-black': 'hsl(0, 0%, 8%)',
  'adega-charcoal': 'hsl(0, 0%, 16%)',
  // ... through to ...
  'adega-yellow': 'hsl(45, 100%, 70%)'
}
```

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

### Working with Navigation & Sidebar
- **Main component**: `src/components/Sidebar.tsx` (Aceternity UI implementation)
- **Base UI component**: `src/components/ui/sidebar.tsx` (Aceternity UI component)
- **Role-based filtering**: Automatic filtering based on user role (admin/employee/delivery)
- **Navigation structure**: 7 main categories with hierarchical organization
- **Animations**: Hover-to-expand with smooth Framer Motion transitions
- **Integration**: React Router integration for navigation

### Working with Inventory
- **Main components**: `src/components/inventory/`
- **Core calculations**: `src/hooks/useInventoryCalculations.ts`
- **Low stock monitoring**: `src/hooks/useLowStock.ts`
- **Barcode integration**: `src/hooks/use-barcode.ts`
- **Product management**: Complete CRUD with turnover analysis

### CRM Operations
- **Customer components**: `src/components/clients/`
- **CRM hooks**: `src/hooks/use-crm.ts`
- **Segmentation logic**: Automated based on purchase history and LTV
- **Insights system**: AI-powered with confidence scoring
- **Interaction tracking**: Automatic logging of all customer touchpoints

### Sales Processing
- **POS components**: `src/components/sales/`
- **Cart management**: `src/hooks/use-cart.ts`
- **Sales operations**: `src/hooks/use-sales.ts`
- **Payment processing**: Multi-method support with validation
- **Stock integration**: Real-time stock checking and updates

### v2.0.0 Reusable Components System
- **Pagination**: Use `usePagination` hook + `PaginationControls` component for all lists
- **Statistics**: Use `StatCard` component with 6 variants (default, success, warning, error, purple, gold)
- **Loading states**: Use `LoadingSpinner` or `LoadingScreen` components
- **Search functionality**: Use `SearchInput` component with built-in debounce
- **Empty states**: Use `EmptyState` base or pre-configured (`EmptyProducts`, `EmptyCustomers`, etc.)
- **Filtering**: Use `FilterToggle` component for collapsible filters
- **Forms**: Use `useFormWithToast` hook for standardized form handling
- **Entity operations**: Use `useEntity`, `useEntityList`, `useEntityMutation` hooks
- **Theme consistency**: Use utilities from `@/lib/theme-utils` (30+ functions available)

### Database Schema Changes
1. **Supabase dashboard** - Make schema changes directly
2. **Regenerate types** - Use Supabase CLI: `supabase gen types typescript`
3. **Update components** - Modify affected React components
4. **Add RLS policies** - Implement security policies for new tables
5. **Test thoroughly** - Verify all affected functionality
6. **Backup first** - Always backup before major changes

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
- **Optimized queries** - Stored procedures for complex operations
- **Responsive design** - Works on desktop and mobile devices
- **Fast development** - Vite hot reload for rapid iteration

### Security Posture
- **Enterprise RLS** - 57 active policies protecting all data
- **Audit logging** - 920+ audit logs with IP and user agent tracking
- **Role separation** - Clear boundaries between admin/employee/delivery
- **Input validation** - Zod schemas preventing invalid data
- **Session management** - JWT tokens with automatic refresh

### Integration Points
- **Supabase** - Primary backend service
- **Lovable** - Rapid development platform integration
- **N8N** - Automation platform (logs in automation_logs table)
- **Barcode scanners** - Hardware integration for inventory
- **Aceternity UI** - Modern UI components via MCP integration
- **MCP Tools** - Multiple Context Providers for enhanced development

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

### Performance Issues
- **Slow queries** - Check pg_stat_statements in Supabase
- **Large datasets** - Implement pagination for lists
- **Memory usage** - Use React DevTools Profiler
- **Bundle size** - Analyze with Vite bundle analyzer

### Security Alerts from Supabase Advisors
⚠️ **Current Issues to Address:**
1. **3 Views with SECURITY DEFINER** (ERROR level)
2. **45+ Functions without search_path** (WARNING level)  
3. **Password protection disabled** (WARNING level)

## Development Tips for AI Assistants

### When Adding Features
1. **Study existing code** - Look for similar patterns before implementing
2. **Follow naming conventions** - Maintain consistency with existing code
3. **Implement security first** - RLS policies before UI components
4. **Test with real data** - Use the 925+ existing records for testing
5. **Consider mobile** - Responsive design is critical
6. **Performance first** - Use React Query effectively

### When Debugging
1. **Check Supabase logs** - Real-time error tracking available
2. **Verify RLS policies** - Most access issues are policy-related
3. **Use React DevTools** - Essential for state management debugging
4. **Check audit logs** - User action history available in database
5. **Test with different roles** - Admin/Employee/Delivery perspectives

### When Modifying Database
1. **Backup first** - `npm run backup` before any changes
2. **Test in development** - Never modify production directly
3. **Update types** - Regenerate TypeScript definitions
4. **Consider migrations** - Document all schema changes
5. **Verify RLS** - Test security policies thoroughly

Always remember: This is a **production system** with real business data. Prioritize data integrity, security, and user experience in all modifications.

## Recent Updates & Current Implementation

### v2.0.0 - Major Refactoring Complete (July 31, 2025)
- **✅ Reusable Components System**: 16 components created, 1,800+ lines eliminated (90% duplication removed)
- **✅ Universal Pagination System**: `usePagination` hook + `PaginationControls` component
- **✅ Generic Supabase Hooks**: `useEntity`, `useEntityList`, `useEntityMutation` for standardized queries
- **✅ Adega Wine Cellar Theme System**: Complete 12-color palette + 30+ utility functions
- **✅ UI Components Standardized**: StatCard, LoadingSpinner, SearchInput, EmptyState, FilterToggle
- **✅ Form System**: `useFormWithToast` hook for React Query + Zod integration
- **✅ Build Validation**: All changes tested successfully with `npm run build`

### Latest Changes (July 2025)
- **✅ Aceternity UI Integration**: Successfully implemented modern UI components with animations
- **✅ Modern Sidebar**: New sidebar with role-based navigation and hover animations
- **✅ Documentation Update**: Complete documentation cleanup and modernization
- **✅ Component Architecture**: Established pattern for Aceternity UI + Shadcn/ui integration
- **✅ MCP Integration**: Enhanced development workflow with MCP tools

### Current Development Focus
- **✅ DRY Principles**: Code duplication eliminated through reusable system
- **Performance Optimization**: Leveraging React Query and modern patterns
- **User Experience**: Enhanced animations and interactions with consistent theming
- **Developer Experience**: Standardized patterns for faster development

### Available MCP Tools
- **Aceternity UI MCP**: For component installation and management
- **Shadcn UI MCP**: For base component operations
- **Supabase MCP**: For database operations and management
- **Context7 MCP**: For documentation and code reference

## Quick Reference: v2.0.0 Reusable Components

### Most Common Components (Use These First!)

```tsx
// Pagination for any list
const { currentPage, itemsPerPage, paginatedItems, goToPage, setItemsPerPage } = 
  usePagination(items, { initialItemsPerPage: 12 });

<PaginationControls 
  currentPage={currentPage} 
  totalPages={totalPages} 
  onPageChange={goToPage}
  itemsPerPageOptions={[6, 12, 20, 50]}
/>

// Statistics cards
<StatCard 
  title="Total Sales" 
  value={formatCurrency(value)} 
  icon={DollarSign} 
  variant="success" 
/>

// Loading states
<LoadingSpinner size="lg" color="gold" />
<LoadingScreen text="Loading products..." />

// Search inputs
<SearchInput value={search} onChange={setSearch} placeholder="Search..." />

// Empty states
<EmptyProducts />
<EmptyCustomers />
<EmptySearchResults searchTerm="applied filters" />

// Entity queries (replaces custom hooks)
const { data: products } = useEntityList({
  table: 'products',
  filters: { category: selectedCategory },
  search: { columns: ['name'], term: searchTerm }
});

// Forms with toast
const { form, onSubmit } = useFormWithToast({
  schema: productSchema,
  onSuccess: (data) => console.log('Created!'),
  successMessage: 'Product created successfully!'
});

// Theme utilities
const statusClasses = getStockStatusClasses(stock, minStock);
const valueClasses = getValueClasses('lg', 'gold');
```

## Project Status: ENTERPRISE PRODUCTION READY (v2.0.0)

**Current State**: Fully functional enterprise application with 925+ real records, daily operations, complete security implementation, comprehensive feature set, and now a **complete reusable components system** that eliminated 90% of code duplication. The system is mature, stable, actively used for business operations, and optimized for rapid future development.