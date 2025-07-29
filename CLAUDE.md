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

### Critical Notes
- **No test runner configured** - Manual testing required
- **Port 8080** - Development server default port
- **TypeScript strict mode disabled** - `noImplicitAny: false` for flexibility
- **Always lint before commits** - Code quality enforcement

## Architecture Overview (Current State)

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite (ultra-fast build)
- **UI Framework**: Aceternity UI (premium components with animations) + Shadcn/ui + Tailwind CSS design system
- **Navigation**: Modern sidebar with Aceternity UI components, role-based filtering, and hover animations
- **Backend**: Supabase PostgreSQL with enterprise features
- **State Management**: React Query (server state) + Context API (global state)
- **Forms**: React Hook Form + Zod validation (type-safe)
- **Charts**: Recharts for analytics and dashboards
- **Icons**: Lucide React (consistent icon system)
- **Additional**: Zustand for complex state, Date-fns for date manipulation

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

### Directory Structure (Current)
```
src/
├── components/          # React components organized by feature
│   ├── ui/             # Aceternity UI + Shadcn/ui components (fully customized)
│   │   ├── sidebar.tsx # Modern animated sidebar with role-based navigation
│   │   └── [others]    # Various UI components
│   ├── Sidebar.tsx     # Main sidebar component with Aceternity UI integration
│   ├── inventory/      # Stock management (ProductForm, TurnoverAnalysis, BarcodeInput)
│   ├── sales/          # POS system (Cart, ProductsGrid, CustomerSearch, SalesPage)
│   ├── clients/        # CRM (CustomerForm, interactions, timeline)
│   └── [modules]/      # Dashboard, Delivery, Movements, UserManagement
├── contexts/           # Global providers (Auth, Notifications)
├── hooks/              # 15+ custom hooks for business logic
│   ├── use-cart.ts     # Shopping cart management
│   ├── use-crm.ts      # CRM operations and analytics
│   ├── use-sales.ts    # Sales processing and reporting
│   ├── use-product.ts  # Product management
│   ├── use-barcode.ts  # Barcode scanning integration
│   └── [specialized]   # useInventoryCalculations, useLowStock, etc.
├── integrations/       
│   └── supabase/       # Supabase client and auto-generated types
├── lib/                # Core utilities (utils.ts, validations)
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

### Code Style and Quality
- **TypeScript**: Strict mode disabled for flexibility, but maintain type safety
- **ESLint**: Configured with React hooks rules - **ALWAYS run before commits**
- **Absolute imports**: Use `@/` prefix for all src directory imports
- **Component naming**: PascalCase for components, camelCase for functions
- **File organization**: Feature-based structure, group related functionality
- **UI Components**: Prefer Aceternity UI components for modern animations and interactions

### Database Operations (Security Critical)
- **All operations through Supabase client** - Never direct SQL from frontend
- **React Query for caching** - Implement proper cache invalidation
- **RLS policies mandatory** - Every table must have appropriate policies
- **Error handling required** - Graceful degradation for all database operations
- **Audit logging** - Critical operations must be logged automatically

### Component Development Best Practices
- **Single responsibility** - Each component should have one clear purpose
- **Custom hooks** - Extract complex logic into reusable hooks
- **TypeScript interfaces** - Define clear prop types for all components
- **Existing patterns** - Follow established patterns in the codebase
- **Performance considerations** - Use React.memo, useMemo, useCallback appropriately
- **Aceternity UI Integration** - Use Aceternity components for enhanced UX with animations
- **Role-based rendering** - Always implement proper role-based access control in UI

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

### Adding New Features
1. **Analyze existing patterns** - Review similar features in codebase
2. **Create feature branch** - Follow naming conventions
3. **Components first** - Build UI components in appropriate directory
4. **Add hooks** - Create custom hooks for data operations
5. **Update types** - Add TypeScript definitions as needed
6. **Implement RLS** - Add database policies for new tables/operations
7. **Test thoroughly** - Manual testing of all user flows
8. **Lint and commit** - Always run `npm run lint` before committing

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

### Latest Changes (July 2025)
- **✅ Aceternity UI Integration**: Successfully implemented modern UI components with animations
- **✅ Modern Sidebar**: New sidebar with role-based navigation and hover animations
- **✅ Documentation Update**: Complete documentation cleanup and modernization
- **✅ Component Architecture**: Established pattern for Aceternity UI + Shadcn/ui integration
- **✅ MCP Integration**: Enhanced development workflow with MCP tools

### Current Development Focus
- **UI Modernization**: Continued adoption of Aceternity UI components
- **Performance Optimization**: Leveraging React Query and modern patterns
- **User Experience**: Enhanced animations and interactions
- **Mobile Responsiveness**: Ensuring all new components work across devices

### Available MCP Tools
- **Aceternity UI MCP**: For component installation and management
- **Shadcn UI MCP**: For base component operations
- **Supabase MCP**: For database operations and management
- **Context7 MCP**: For documentation and code reference

## Project Status: ENTERPRISE PRODUCTION READY

**Current State**: Fully functional enterprise application with 925+ real records, daily operations, complete security implementation, and comprehensive feature set. The system is mature, stable, and actively used for business operations with modern UI enhancements.