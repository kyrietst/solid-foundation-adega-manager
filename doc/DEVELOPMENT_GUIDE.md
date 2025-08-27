# Development Guide - Adega Manager

> **Enterprise Wine Cellar Management System - Technical Documentation**  
> Complete development guide for contributors and maintainers  
> Version: 2.6.0+ | Production System with 925+ Active Records | Advanced Reports & Payment System

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [Development Environment](#development-environment)
4. [Code Standards & Patterns](#code-standards--patterns)
5. [Testing Framework](#testing-framework)
6. [Database Development](#database-development)
7. [Reports & Analytics System](#reports--analytics-system)
8. [Payment System Development](#payment-system-development)
9. [Performance & Build](#performance--build)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Essential Commands
```bash
# Development
npm run dev          # Start development server (port 8080)
npm run build        # Production build with TypeScript compilation
npm run lint         # ESLint check (ZERO warnings policy)
npm run preview      # Preview production build locally

# Testing
npm run test         # Run Vitest test suite
npm run test:ui      # Vitest UI interface  
npm run test:coverage # Generate coverage reports (80%+ required)
npm run test:watch   # Watch mode for development

# Database & Backup
npm run backup       # Create database backup (automated Supabase)
npm run restore      # Restore database from backup
npm run setup:env    # Setup environment variables
```

### Environment Variables
```env
# Required - Supabase Configuration
VITE_SUPABASE_URL=https://uujkzvbgnfzuzlztrzln.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - Development
NODE_ENV=development
```

### First-Time Setup
```bash
1. git clone <repository>
2. npm install
3. npm run setup:env  # Or create .env manually
4. npm run dev        # Verify startup on http://localhost:8080
5. Test database connection via Supabase dashboard
```

---

## System Architecture

### Technology Stack (Current)

#### Frontend Foundation
- **React 18.3.1** + **TypeScript 5.5.3** + **Vite 5.4.1** (SWC build)
- **Tailwind CSS 3.4.17** - 12-color Adega Wine Cellar theme + dark mode
- **Motion 12.23.9** (Framer Motion) - Animations and transitions

#### UI Framework Stack
- **Aceternity UI** - Premium animated components (primary choice)
- **Shadcn/ui** - Built on Radix UI primitives (20+ base components)
- **Lucide React + Tabler Icons** - Comprehensive icon system
- **Navigation**: Modern sidebar with role-based filtering + hover animations

#### State & Data Management
- **TanStack React Query 5.56.2** - Server state with intelligent caching
- **Zustand 5.0.5** - Global client state management
- **Context API** - Auth and notifications
- **React Hook Form 7.53.0 + Zod 3.23.8** - Type-safe form validation

#### Backend & Database
- **Supabase PostgreSQL** - Enterprise features with real-time subscriptions
- **48 Stored Procedures** - Complex business logic
- **57 RLS Policies** - Enterprise security implementation
- **16 Production Tables** - 925+ real records in active use

#### Data Visualization & Tables
- **Recharts 2.15.3** - Analytics dashboards and charts
- **TanStack React Table 8.21.3** - Advanced data grids
- **TanStack React Virtual 3.13.12** - Performance virtualization for large datasets

#### Additional Libraries
- **Date-fns 3.6.0** - Date manipulation
- **Simplex-noise 4.0.3** - Procedural generation for organic wave backgrounds
- **React Router DOM 6.26.2** - Client-side routing
- **React Three Fiber + Three.js** - WebGL 3D rendering for fluid blob backgrounds
- **@react-three/fiber** - React renderer for Three.js with declarative component API

### Directory Structure (v2.0.0 Feature-First)

```
src/
├── app/                    # Application configuration
│   ├── layout/            # Main layout components
│   │   └── Sidebar.tsx    # Modern sidebar with Aceternity UI
│   └── providers/         # Context providers (Auth, Notifications)
├── core/                  # Core system utilities
│   ├── api/              # Supabase client and types
│   ├── config/           # Configuration utilities
│   └── types/            # Core TypeScript definitions
├── features/             # Feature-based organization
│   ├── customers/        # CRM module
│   ├── dashboard/        # Analytics and overview
│   ├── delivery/         # Logistics management  
│   ├── inventory/        # Stock management
│   ├── movements/        # Stock operations
│   ├── reports/          # Reporting system
│   ├── sales/            # POS system
│   └── users/            # User management
├── shared/               # Shared utilities and components
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── templates/        # Component templates
│   └── ui/               # UI component system
│       ├── composite/    # Complex reusable components
│       ├── layout/       # Layout components
│       └── primitives/   # Base UI primitives
├── hooks/                # Legacy hooks (being migrated to shared/)
└── __tests__/           # Test utilities and setup
```

### Database Architecture (Production)

#### Core Business Tables (370+ records)
```sql
-- Products (125 records) - Complete catalog
products: id, name, category, price, cost, stock, min_stock, barcode, 
         volume, supplier, notes, created_at, updated_at

-- Customers (91 records) - CRM with segmentation  
customers: id, name, email, phone, address, segment, ltv, 
          frequency, last_purchase, created_at, updated_at

-- Sales (52 records) - Complete sales tracking
sales: id, customer_id, total, status, payment_method, 
       delivery_address, delivery_status, created_at, updated_at

-- Sale Items - Line item details with validation
sale_items: sale_id, product_id, quantity, unit_price, total

-- Inventory Movements - Complete audit trail
inventory_movements: id, product_id, movement_type, quantity, 
                    reason, user_id, created_at
```

#### Advanced CRM Tables (73+ records)
```sql
-- AI-powered customer insights
customer_insights: id, customer_id, insight_type, confidence_score, 
                   data, created_at

-- Interaction timeline tracking  
customer_interactions: id, customer_id, interaction_type, details,
                      user_id, created_at

-- Automated event tracking
customer_events: id, customer_id, event_type, event_data, created_at

-- Historical data preservation
customer_history: id, customer_id, field_name, old_value, 
                 new_value, changed_at, changed_by
```

#### System & Security Tables (480+ records)
```sql
-- Complete audit trail (920+ records)
audit_logs: id, table_name, operation, old_data, new_data, 
           user_id, ip_address, user_agent, created_at

-- Multi-role user system (3 active users)
users: id, email, role, created_at, updated_at
profiles: id, name, role, permissions, created_at, updated_at

-- Financial management
accounts_receivable: id, customer_id, amount, status, due_date
payment_methods: id, name, type, active, created_at
```

#### Enterprise Stored Procedures (48 functions)
```sql
-- Core business operations
process_sale(customer_id, items[], payment_method) 
delete_sale_with_items(sale_id)
adjust_product_stock(product_id, quantity, reason)
recalc_customer_insights(customer_id)

-- Analytics & reporting
get_sales_trends(start_date, end_date, period)
get_top_products(start_date, end_date, limit) 
get_customer_metrics()
get_financial_metrics()

-- Security & authentication
create_admin_user(email, password, name)
has_role(user_id, role_name)
handle_new_user()
```

#### Security Implementation (57 RLS Policies)
```sql
-- Role-based access control
Admin: Full system access (all operations)
Employee: Operations access (no cost prices visible)  
Delivery: Only assigned deliveries access

-- Granular permissions per table
- SELECT policies for data visibility
- INSERT/UPDATE policies for data modification
- DELETE policies for data removal
- Automatic audit logging for all operations
```

---

## Development Environment

### Build Configuration

#### Vite Configuration (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  server: { 
    port: 8080, 
    host: '::', // IPv6 support
    open: false 
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Strategic code splitting for optimal caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-*', 'lucide-react'],
          supabase: ['@supabase/supabase-js', '@tanstack/react-query']
        }
      }
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})
```

#### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": false,           // Relaxed mode for development flexibility
    "noImplicitAny": false,    // Allow implicit any types
    "noUnusedLocals": false,   // Don't error on unused variables
    "strictNullChecks": false, // Allow null/undefined flexibility
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Tailwind Theme System
```javascript
// 12-color Adega Wine Cellar palette
module.exports = {
  theme: {
    extend: {
      colors: {
        // Dark theme progression
        'adega-black': 'hsl(0, 0%, 8%)',     // #141414
        'adega-charcoal': 'hsl(0, 0%, 16%)', // #292929
        'adega-slate': 'hsl(0, 0%, 24%)',    // #3d3d3d
        'adega-gray': 'hsl(0, 0%, 32%)',     // #525252
        'adega-silver': 'hsl(0, 0%, 45%)',   // #737373
        'adega-light': 'hsl(0, 0%, 60%)',    // #999999
        
        // Accent colors  
        'adega-blue': 'hsl(220, 100%, 70%)',  // #6694ff
        'adega-green': 'hsl(120, 60%, 60%)',  // #66cc66
        'adega-red': 'hsl(0, 100%, 70%)',     // #ff6666
        'adega-purple': 'hsl(270, 100%, 70%)', // #b366ff
        'adega-gold': 'hsl(45, 100%, 60%)',   // #ffcc33
        'adega-yellow': 'hsl(45, 100%, 70%)'  // #ffdb66
      }
    }
  }
}
```

### Development Workflow

#### Branch Strategy
```bash
# Main branch for production
git checkout main

# Feature branches for development  
git checkout -b feature/module-name
git checkout -b fix/issue-description
git checkout -b refactor/component-name

# Always pull latest before starting
git pull origin main
```

#### Code Quality Pipeline
```bash
# Before every commit (enforced)
npm run lint        # ESLint - ZERO warnings policy
npm run build       # TypeScript compilation check
npm run test        # Run test suite

# Optional but recommended
npm run test:coverage # Verify coverage thresholds
```

---

## UI Standardization Patterns (v2.5.0)

### Modern Component Standardization

#### Header Pattern with BlurIn Animation
**Standard Implementation:**
```tsx
import { BlurIn } from '@/components/ui/blur-in';

// Padrão de cabeçalho com animação e gradiente
<BlurIn>
  <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">
    <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
      Título da Página
    </span>
    <div className="mt-4 w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full shadow-lg shadow-yellow-500/30"></div>
  </h1>
</BlurIn>
```

**Usage Guidelines:**
- Use for all main page headers
- BlurIn animation provides smooth entrance effect
- Gradient text uses yellow/amber Adega theme colors
- Underline gradient matches text gradient
- Center alignment with responsive text sizing

#### Glassmorphism Container Pattern
**Standard Implementation:**
```tsx
// Container com glass morphism e mouse tracking
<div 
  className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hero-spotlight p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300"
  onMouseMove={handleMouseMove}
>
  {children}
</div>
```

**Key Features:**
- `bg-black/80` - Semi-transparent black background
- `backdrop-blur-sm` - Glass blur effect
- `border-white/10` - Subtle border
- `hero-spotlight` - Custom CSS class for purple glow effect
- `hover:shadow-purple-500/10` - Purple shadow on hover
- `transition-all duration-300` - Smooth transitions

#### Purple Glow Mouse Tracking Animation
**Implementation:**
```tsx
import { useMouseTracker } from '@/hooks/ui/useMouseTracker';

const { handleMouseMove } = useMouseTracker();

// Apply to containers that need mouse tracking
<div onMouseMove={handleMouseMove}>
  {/* Content */}
</div>
```

**CSS Classes Required:**
```css
.hero-spotlight {
  position: relative;
  overflow: hidden;
}

.hero-spotlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(147, 51, 234, 0.1), transparent 40%);
  pointer-events: none;
}
```

#### Button Standardization
**Standard Button Variants:**
```tsx
// Primary button with gradient
<Button className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold">
  Ação Principal
</Button>

// Secondary button with outline
<Button variant="outline" className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10">
  Ação Secundária
</Button>

// Danger button for destructive actions
<Button variant="destructive" className="bg-red-600/80 hover:bg-red-700 text-white">
  Ação Destrutiva
</Button>
```

#### Card Pattern with Enhanced Effects
**Standard Card Implementation:**
```tsx
<Card className="bg-black/60 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
  <CardHeader>
    <CardTitle className="text-white flex items-center gap-2">
      <Icon className="w-5 h-5 text-yellow-400" />
      Título do Card
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

**Enhanced Features:**
- Glass morphism background
- Purple hover effects
- Smooth transitions
- Icon integration with yellow accent
- Consistent spacing and typography

#### Table Styling Pattern
**Modern Table Implementation:**
```tsx
<div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
  <Table>
    <TableHeader>
      <TableRow className="border-white/10 hover:bg-white/5">
        <TableHead className="text-yellow-400 font-semibold">Header</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="border-white/10 hover:bg-white/5 transition-colors">
        <TableCell className="text-white">Content</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### Page Width Standardization

#### Container Width Architecture
**Implementation in Index.tsx:**
```tsx
// Simplified container logic with blacklist approach
<div className={activeTab === 'customer' || activeTab === 'activities' 
  ? 'max-w-7xl mx-auto h-full'                           // 1280px - Reading pages
  : 'max-w-[1500px] 2xl:max-w-[1800px] mx-auto h-full'   // 1500px/1800px - All others
}>
```

**Width Standards:**
- **Reading Pages** (`max-w-7xl`): 1280px for customer profiles and activities
- **Dashboard Pages** (`max-w-[1500px] 2xl:max-w-[1800px]`): 1500px (2XL: 1800px) for all main pages
- **Responsive**: Automatically adjusts for smaller screens
- **Consistent**: Single source of truth for width management

**Benefits:**
- Simplified maintenance (blacklist vs whitelist)
- Automatic width assignment for new pages
- Better utilization of screen real estate
- Consistent user experience across modules

### Animation and Transition Standards

#### Transition Classes
```css
/* Standard transition durations */
.transition-fast { transition: all 150ms ease-in-out; }
.transition-normal { transition: all 300ms ease-in-out; }
.transition-slow { transition: all 500ms ease-in-out; }

/* Hover effects */
.hover-lift:hover { transform: translateY(-2px); }
.hover-scale:hover { transform: scale(1.02); }
.hover-glow:hover { box-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
```

#### Loading States
```tsx
// Consistent loading spinner
<LoadingSpinner size="lg" variant="gold" />

// Loading screen for page transitions
<LoadingScreen text="Carregando..." />
```

## Code Standards & Patterns

### React Component Patterns

#### Feature Module Structure
```typescript
// Standard feature module organization
src/features/[module]/
├── components/           # React components
│   ├── [Module].tsx     # Main component
│   ├── [Module]Container.tsx      # Container pattern
│   ├── [Module]Presentation.tsx   # Presentation pattern
│   ├── [Component]Dialog.tsx      # Modal dialogs
│   ├── [Component]Form.tsx        # Forms
│   ├── [Component]Table.tsx       # Data tables
│   ├── __tests__/       # Component tests
│   └── index.ts         # Barrel exports
├── hooks/               # Feature-specific hooks
│   ├── use[Module].ts   # Main data hook
│   ├── use[Module]Logic.ts        # Business logic
│   ├── use[Module]Validation.ts   # Validation logic
│   ├── __tests__/       # Hook tests
│   └── index.ts         # Barrel exports
└── types/               # Feature-specific types
    ├── types.ts         # Main type definitions
    └── index.ts         # Barrel exports
```

#### Container/Presentation Pattern
```typescript
// Container Component (Logic)
export function ProductsContainer() {
  const { products, loading, error } = useProducts();
  const { filters, setFilters } = useProductFilters();
  
  return (
    <ProductsPresentation 
      products={products}
      loading={loading}
      error={error}
      filters={filters}
      onFiltersChange={setFilters}
    />
  );
}

// Presentation Component (UI Only)
interface ProductsPresentationProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductsPresentation({ 
  products, loading, error, filters, onFiltersChange 
}: ProductsPresentationProps) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div className="space-y-4">
      <ProductFilters value={filters} onChange={onFiltersChange} />
      <ProductGrid products={products} />
    </div>
  );
}
```

### React Hook Patterns

#### Custom Hook Structure
```typescript
// Data fetching hook
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
}

// Business logic hook
export function useProductLogic() {
  const queryClient = useQueryClient();
  
  const createProduct = useMutation({
    mutationFn: async (product: NewProduct) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    }
  });
  
  return { createProduct };
}

// Form validation hook
export function useProductValidation() {
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.number().positive('Price must be positive'),
    stock: z.number().min(0, 'Stock cannot be negative')
  });
  
  return { schema };
}
```

### TypeScript Patterns

#### Type Definitions
```typescript
// Database entity types (auto-generated)
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number | null;
  stock: number;
  min_stock: number;
  barcode?: string;
  created_at: string;
  updated_at: string;
}

// Form types
export type NewProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProduct = Partial<NewProduct> & { id: string };

// Filter types
export interface ProductFilters {
  category?: string;
  search?: string;
  lowStock?: boolean;
}

// Component prop types
export interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  showCostPrice?: boolean;
}
```

#### Error Handling Patterns
```typescript
// Error boundary wrapper
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook error handling
export function useErrorHandler() {
  const { toast } = useToast();
  
  return useCallback((error: unknown, context?: string) => {
    console.error(`Error in ${context}:`, error);
    
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
      
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive'
    });
  }, [toast]);
}
```

### Event Handler Conventions

#### Naming Patterns
```typescript
// Event handler naming: handle + Action + Context
const handleSubmitForm = (data: FormData) => { /* ... */ };
const handleDeleteProduct = (id: string) => { /* ... */ };
const handleFilterChange = (filters: Filters) => { /* ... */ };
const handlePageChange = (page: number) => { /* ... */ };
const handleSortChange = (field: string, direction: 'asc' | 'desc') => { /* ... */ };

// Boolean state handlers: toggle + Property
const toggleShowInactive = () => setShowInactive(prev => !prev);
const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
```

#### CRUD Operation Patterns
```typescript
// Create operations
const handleCreateProduct = async (productData: NewProduct) => {
  try {
    await createProduct.mutateAsync(productData);
    setIsDialogOpen(false);
    form.reset();
  } catch (error) {
    handleError(error, 'creating product');
  }
};

// Update operations  
const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
  try {
    await updateProduct.mutateAsync({ id, ...updates });
    setEditingId(null);
  } catch (error) {
    handleError(error, 'updating product');
  }
};

// Delete operations with confirmation
const handleDeleteProduct = async (id: string) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    await deleteProduct.mutateAsync(id);
  } catch (error) {
    handleError(error, 'deleting product');
  }
};
```

---

## Testing Framework

### Test Environment Setup

#### Vitest Configuration (vitest.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4
      }
    },
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        branches: 70, 
        functions: 85,
        statements: 80
      },
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
});
```

#### Test Setup (src/__tests__/setup.ts)
```typescript
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));
```

### Testing Patterns

#### Component Testing (AAA Pattern)
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductForm } from '../ProductForm';
import { TestWrapper } from '@/__tests__/utils/test-utils';

describe('ProductForm', () => {
  it('should create product successfully', async () => {
    // Arrange
    const mockOnSuccess = vi.fn();
    const productData = {
      name: 'Test Wine',
      price: 29.99,
      stock: 10
    };
    
    render(
      <TestWrapper>
        <ProductForm onSuccess={mockOnSuccess} />
      </TestWrapper>
    );
    
    // Act
    await fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: productData.name }
    });
    await fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: productData.price }
    });
    await fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining(productData)
      );
    });
  });
});
```

#### Hook Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from '../useProducts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProducts', () => {
  it('should fetch products successfully', async () => {
    // Arrange
    const mockProducts = [{ id: '1', name: 'Test Wine' }];
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
      })
    });
    
    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper()
    });
    
    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockProducts);
    });
  });
});
```

#### Accessibility Testing
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProductCard } from '../ProductCard';

expect.extend(toHaveNoViolations);

describe('ProductCard Accessibility', () => {
  it('should not have accessibility violations', async () => {
    // Arrange
    const product = { id: '1', name: 'Test Wine', price: 29.99 };
    const { container } = render(<ProductCard product={product} />);
    
    // Act
    const results = await axe(container);
    
    // Assert
    expect(results).toHaveNoViolations();
  });
  
  it('should have proper ARIA labels', () => {
    const product = { id: '1', name: 'Test Wine', price: 29.99 };
    render(<ProductCard product={product} />);
    
    expect(screen.getByRole('button', { name: /edit test wine/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete test wine/i })).toBeInTheDocument();
  });
});
```

### Coverage Analysis

#### Interpreting Coverage Reports
```bash
# Generate detailed coverage report
npm run test:coverage

# Coverage thresholds (enforced in CI)
Lines: 80%+     # Statement coverage
Branches: 70%+  # Conditional coverage  
Functions: 85%+ # Function coverage
Statements: 80% # Overall statement coverage
```

#### Improving Coverage Strategies
1. **Component Testing**: Test all render paths and user interactions
2. **Hook Testing**: Test all hook states and side effects
3. **Error Boundaries**: Test error handling and recovery
4. **Edge Cases**: Test loading states, empty data, and error conditions
5. **Accessibility**: Include axe testing in component suites

---

## Database Development

### Supabase Integration

#### Client Configuration (src/integrations/supabase/client.ts)
```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

#### Type Generation
```bash
# Generate TypeScript types from database schema
supabase gen types typescript --project-id uujkzvbgnfzuzlztrzln > src/integrations/supabase/types.ts

# Update types after schema changes
npm run types:generate
```

### RLS (Row Level Security) Patterns

#### Policy Examples
```sql
-- Admin full access
CREATE POLICY "Admin full access" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Employee read access (hide cost prices)  
CREATE POLICY "Employee read access" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'employee')
    )
  );

-- Customer data isolation
CREATE POLICY "Users see own data" ON customers
  FOR ALL USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'employee')
    )
  );
```

#### Permission Checking
```typescript
// Hook for permission checking
export function usePermissions() {
  const { user } = useAuth();
  
  const hasRole = useCallback((role: string) => {
    return user?.user_metadata?.role === role;
  }, [user]);
  
  const canAccessModule = useCallback((module: string) => {
    const rolePermissions = {
      admin: ['dashboard', 'sales', 'inventory', 'customers', 'users'],
      employee: ['dashboard', 'sales', 'inventory', 'customers'],
      delivery: ['delivery']
    };
    
    const userRole = user?.user_metadata?.role;
    return rolePermissions[userRole]?.includes(module) || false;
  }, [user]);
  
  return { hasRole, canAccessModule };
}
```

### Database Operations

#### Query Patterns with React Query
```typescript
// List query with caching
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*');
        
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      if (filters?.lowStock) {
        query = query.filter('stock', 'lte', 'min_stock');
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000    // 30 minutes
  });
}

// Mutation with optimistic updates
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: NewProduct) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });
      
      // Snapshot previous value
      const previousProducts = queryClient.getQueryData(['products']);
      
      // Optimistically update
      queryClient.setQueryData(['products'], (old: Product[] = []) => [
        ...old,
        { ...newProduct, id: 'temp-id', created_at: new Date().toISOString() }
      ]);
      
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      // Rollback on error
      queryClient.setQueryData(['products'], context?.previousProducts);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}
```

#### Stored Procedure Usage
```typescript
// Complex business logic via stored procedures
export function useProcessSale() {
  return useMutation({
    mutationFn: async (saleData: {
      customer_id: string;
      items: Array<{ product_id: string; quantity: number; price: number }>;
      payment_method: string;
    }) => {
      const { data, error } = await supabase.rpc('process_sale', saleData);
      
      if (error) throw error;
      return data;
    },
    onSuccess: (saleId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      
      toast.success(`Sale ${saleId} processed successfully`);
    }
  });
}
```

---

## Reports & Analytics System (v2.6.0)

### Advanced Chart Development with Recharts

#### Modern Chart Implementation Patterns

**Sales by Category - Donut Chart with External Legend**:
```typescript
// Location: src/features/reports/components/SalesReportsSection.tsx
// Advanced donut chart with centralized labels and external legend

// Key technical implementation:
const processedCategoryData = React.useMemo(() => {
  if (!categoryData || categoryData.length === 0) return [];
  // Show ALL categories for complete report view (no grouping)
  return categoryData.sort((a, b) => b.revenue - a.revenue);
}, [categoryData]);

// Custom label renderer with perfect centering
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.02) return null; // Hide labels smaller than 2%
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} y={y} 
      fill="white" 
      textAnchor="middle"           // Perfect horizontal centering
      dominantBaseline="central"    // Perfect vertical centering
      className="text-sm font-bold"
      style={{
        textShadow: '0 2px 4px rgba(0,0,0,0.9)',
        fontSize: '13px',
        fontWeight: '700'
      }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Enhanced chart with donut design
<PieChart>
  <Pie
    data={processedCategoryData || []}
    cx="50%" cy="50%"
    labelLine={false}
    label={(props) => renderCustomLabel(props, processedCategoryData)}
    outerRadius={120}
    innerRadius={60}              // Creates donut effect
    fill="#8884d8"
    dataKey="revenue"
  >
    {(processedCategoryData || []).map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
</PieChart>
```

#### Chart Color System (19+ Colors)
```typescript
// Expanded color palette for comprehensive category support
const COLORS = [
  '#f59e0b', // amber - Bebida Mista  
  '#3b82f6', // blue - Cerveja
  '#10b981', // emerald - Bebidas Quentes
  '#8b5cf6', // purple - Refrigerante
  '#f97316', // orange - Whisky
  '#06b6d4', // cyan - Energético
  '#84cc16', // lime - Vodka
  '#f43f5e', // rose - Cigarro
  '#6366f1', // indigo - Água
  '#14b8a6', // teal - Vinho
  // ... additional colors for all possible categories
];
```

#### External Legend Implementation
```typescript
// Grid-based legend for better category visibility
<div className="grid grid-cols-3 gap-2">
  {(processedCategoryData || []).map((entry, index) => (
    <div key={entry.category} className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0" 
        style={{ backgroundColor: COLORS[index % COLORS.length] }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white truncate font-medium">
          {translateCategory(entry.category)}
        </div>
        <div className="text-xs text-gray-400 font-medium">
          {formatCurrency(entry.revenue)}
        </div>
      </div>
    </div>
  ))}
</div>
```

### Manual Fallback Calculations

#### RPC Failure Handling Strategy
```typescript
// Robust fallback system when stored procedures fail
try {
  // Try RPC first for performance
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_top_products', { days_back: period, product_limit: 10 });
  
  if (rpcError) throw new Error('RPC failed');
  
  return rpcData;
} catch (rpcError) {
  console.warn('RPC get_top_products failed, using manual calculation:', rpcError);
  
  // Manual calculation fallback
  const { data: manualData, error: manualError } = await supabase
    .from('sales')
    .select(`
      sale_items (
        product_id,
        quantity,
        unit_price,
        products (id, name)
      )
    `)
    .gte('created_at', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString());
  
  if (manualError) throw manualError;
  
  // Aggregate and calculate manually
  const productSales = new Map();
  // ... manual aggregation logic
  
  return Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}
```

#### Data Translation Functions
```typescript
// Consistent Portuguese translations for categories
const translateCategory = (category: string): string => {
  const translations: Record<string, string> = {
    'beverages': 'Bebidas',
    'beer': 'Cerveja', 
    'wine': 'Vinho',
    'whisky': 'Whisky',
    'vodka': 'Vodka',
    'gin': 'Gin',
    'cigarettes': 'Cigarro',
    'energy_drinks': 'Energético',
    'soft_drinks': 'Refrigerante',
    'hot_beverages': 'Bebidas Quentes',
    'mixed_drinks': 'Bebida Mista',
    'water': 'Água'
  };
  return translations[category?.toLowerCase()] || category || 'Sem categoria';
};

// Product name truncation for chart readability
const truncateProductName = (name: string, maxLength = 15) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};
```

### Chart Development Best Practices

#### Performance Optimizations
1. **React.useMemo**: Always wrap data processing in useMemo for expensive calculations
2. **Conditional Rendering**: Hide labels for slices smaller than 2% to prevent overlap
3. **Strategic Data Grouping**: Group small categories only when needed for dashboard views
4. **Responsive Design**: Use responsive containers and adjust chart sizes per viewport

#### UX Guidelines
1. **Label Positioning**: Always use `textAnchor="middle"` and `dominantBaseline="central"` for perfect centering
2. **Color Consistency**: Use systematic color assignments with fallback to index-based selection
3. **Legend Placement**: External legends for detailed views, internal for overview dashboards
4. **Tooltip Enhancement**: Rich tooltips with currency formatting and percentage calculations

#### Chart Types and Use Cases
```typescript
// Donut Charts - For category distributions with detailed legends
<Pie innerRadius={60} outerRadius={120} />

// Bar Charts - For time series and comparative analysis  
<BarChart>
  <Bar dataKey="revenue" fill={COLORS[0]} />
  <XAxis dataKey="name" angle={-45} textAnchor="end" />
</BarChart>

// Line Charts - For trend analysis over time
<LineChart>
  <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} />
  <ResponsiveContainer width="100%" height={300} />
</LineChart>
```

---

## Payment System Development (v2.6.0)

### Standardized Payment Methods Architecture

#### Database Structure
```sql
-- Standardized payment_methods table (Production)
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 'PIX', 'Cartão de Crédito', 'Débito', 'Dinheiro'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  type payment_method_enum,              -- 'pix', 'credit', 'debit', 'cash'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Current production data (4 standardized methods)
INSERT INTO payment_methods (name, description, type) VALUES 
('PIX', 'Transferência instantânea via PIX', 'pix'),
('Cartão de Crédito', 'Pagamento com cartão de crédito', 'credit'),
('Débito', 'Pagamento com cartão de débito', 'debit'),
('Dinheiro', 'Pagamento em espécie', 'cash');
```

#### Frontend Implementation
```typescript
// Payment method hook with standardized values
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache
  });
}

// Sales form integration
export function SalesCheckout() {
  const { data: paymentMethods } = usePaymentMethods();
  
  return (
    <Select onValueChange={(value) => setPaymentMethod(value)}>
      <SelectContent>
        {paymentMethods?.map(method => (
          <SelectItem key={method.id} value={method.name}>
            {method.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

#### Data Migration Strategy
```typescript
// Historical data migration pattern (Applied in production)
const migratePaymentMethods = async () => {
  // Step 1: Update existing sales records
  await supabase.rpc('migrate_payment_methods', {
    mapping: {
      'credit_card': 'Cartão de Crédito',
      'pix': 'PIX', 
      'cash': 'Dinheiro'
    }
  });
  
  // Step 2: Update filter dropdowns
  // Step 3: Update report calculations
  // Step 4: Validate data consistency
};
```

### Filter System Enhancement

#### Case-Insensitive Search Implementation
```typescript
// Advanced search with payment method filtering
const filteredSales = React.useMemo(() => {
  if (!sales) return [];
  
  return sales.filter(sale => {
    // Expanded search criteria including payment methods
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      sale.id.toLowerCase().includes(searchLower) ||
      sale.customer?.name?.toLowerCase().includes(searchLower) ||
      sale.seller?.name?.toLowerCase().includes(searchLower) ||
      sale.payment_method?.toLowerCase().includes(searchLower) ||
      formatPaymentMethod(sale.payment_method).toLowerCase().includes(searchLower) ||
      sale.status?.toLowerCase().includes(searchLower) ||
      formatCurrency(Number(sale.final_amount || sale.total_amount || 0)).includes(searchTerm) ||
      format(new Date(sale.created_at), "dd/MM/yyyy", { locale: ptBR }).includes(searchTerm);
    
    // Case-insensitive payment method filtering
    const matchesPayment = paymentFilter === 'all' || 
      sale.payment_method?.toLowerCase() === paymentFilter.toLowerCase();
    
    return matchesSearch && matchesPayment;
  });
}, [sales, searchTerm, paymentFilter]);
```

#### Dropdown Standardization
```typescript
// Standardized payment method dropdown with database values
<SelectContent className="bg-gray-900/95 backdrop-blur-sm border border-white/20 shadow-2xl">
  <SelectItem value="all">Todos os métodos</SelectItem>
  <SelectItem value="PIX">PIX</SelectItem>
  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
  <SelectItem value="Débito">Débito</SelectItem>
  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
</SelectContent>
```

### Payment System Testing

#### Integration Tests
```typescript
describe('Payment System Integration', () => {
  it('should handle all standardized payment methods', async () => {
    const paymentMethods = ['PIX', 'Cartão de Crédito', 'Débito', 'Dinheiro'];
    
    for (const method of paymentMethods) {
      const sale = await createTestSale({ payment_method: method });
      expect(sale.payment_method).toBe(method);
      
      // Test filtering
      const filtered = await filterSalesByPayment(method);
      expect(filtered.some(s => s.id === sale.id)).toBe(true);
    }
  });
  
  it('should migrate legacy payment methods correctly', async () => {
    // Test historical data migration
    const legacyMethods = { 'credit_card': 'Cartão de Crédito', 'pix': 'PIX', 'cash': 'Dinheiro' };
    
    for (const [old, new_] of Object.entries(legacyMethods)) {
      const result = await migrateSalePaymentMethod(old);
      expect(result.payment_method).toBe(new_);
    }
  });
});
```

### Development Guidelines for Payment Systems

#### Code Standards
1. **Always use database values**: Never hardcode payment method strings
2. **Implement fallback handling**: Graceful degradation when payment methods are unavailable  
3. **Maintain data consistency**: Ensure frontend and backend use same standardized values
4. **Case-insensitive operations**: All comparisons must handle case variations
5. **Audit trail**: Log all payment method changes and migrations

#### Security Considerations
1. **Input validation**: Validate payment methods against allowed values
2. **RLS policies**: Ensure payment data respects user role permissions
3. **Audit logging**: Track all payment-related operations for compliance
4. **Data isolation**: Payment methods respect multi-tenant security patterns

---

## Advanced UI Development

### Background System Development

#### WebGL Fluid Blob Implementation
```typescript
// Advanced shader-based background component
// Location: src/components/ui/fluid-blob.tsx

// Key technical components:
1. Custom GLSL shaders (vertex + fragment)
2. Ray marching with Signed Distance Fields (SDF)
3. Multi-sphere composition with smooth blending
4. Time-based rotation animations
5. Fresnel-based luminance (monochrome B/W)

// Shader development patterns (current, monochrome B/W):
const fragmentShader = `
  // SDF-based ray marching for organic shapes
  float sdf(vec3 p) {
    // Multiple rotating spheres with smooth min blending
    vec3 p1 = rotate(p, vec3(0.0, 0.0, 1.0), time/5.0);
    float final = sphereSDF(p1 - vec3(-0.5, 0.0, 0.0), 0.35);
    return smin(final, nextSphere, 0.1); // Smooth blending
  }

  // Monochrome fresnel (white-on-black). No color mixing.
  // Inside hit: gl_FragColor = vec4(vec3(fresnel), 1.0);
  // Miss: gl_FragColor = vec4(1.0); // solid white background in shader
`;

// React Three Fiber integration:
export const LavaLamp = () => (
  <div style={{ width: '100%', height: '100%', background: '#000', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <Canvas orthographic gl={{ antialias: true }}>
      <LavaLampShader />
    </Canvas>
  </div>
);
```

##### Current configuration (2025-01)
- Default theme: Monochrome black/white (matches 21st.dev original component).
- Wrapper: absolute container with solid black background (`#000`), full-viewport, `pointer-events: none`.
- Material flags: no transparency, no custom blending (removed `MultiplyBlending`), no depth write overrides.
- Result: prevents color wash on UI cards when combined with Tailwind `backdrop-blur-*`.

##### Integration and Z-Index
- Injected globally in `src/App.tsx` as a fixed underlay: `fixed inset-0 z-0` with the app content at `z-10`.
- Safe to enable per-route if needed (e.g., show on Dashboard, disable on Auth), by conditionally rendering `<LavaLamp />`.

##### Developer guidance
- Avoid reintroducing alpha/Multiply blending. It will “wash” card colors once `backdrop-blur` is applied by glass components.
- Keep the container black; if a different palette is desired, prefer tweaking UI accents rather than coloring the blob.
- Respect `prefers-reduced-motion` if implementing future animation throttling.
- When profiling, verify GPU load on low-end devices; consider pausing the render loop when tab is hidden.

#### Canvas2D Wavy Background Implementation
```typescript
// Simplex noise-based wave animation
// Location: src/shared/ui/layout/wavy-background.tsx

// Key features:
1. Simplex 3D noise for organic wave movement
2. Multi-wave layering system (5 waves)
3. Real-time canvas rendering with requestAnimationFrame
4. Browser compatibility and Safari optimization
5. Responsive resize handling

// Animation implementation:
const drawWave = (n: number) => {
  nt += getSpeed(); // Time progression
  for (i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.strokeStyle = waveColors[i % waveColors.length];
    for (x = 0; x < w; x += 5) {
      const y = noise(x / 800, 0.3 * i, nt) * 100; // 3D simplex noise
      ctx.lineTo(x, y + h * 0.5);
    }
    ctx.stroke();
  }
};

// Performance optimization:
useEffect(() => {
  init(); // Setup canvas and start animation
  return () => cancelAnimationFrame(animationId); // Cleanup
}, []);
```

#### Background Development Guidelines
1. **Performance First**: Always use requestAnimationFrame for animations
2. **Browser Compatibility**: Test WebGL fallbacks and Safari-specific optimizations
3. **Accessibility**: Respect `prefers-reduced-motion` user preference
4. **Theme Integration**: Use Adega Wine Cellar color palette consistently
5. **Memory Management**: Proper cleanup of WebGL contexts and animation frames
6. **Responsive Design**: Handle window resize events and device orientation changes

#### Shader Development Best Practices
```glsl
// GLSL development patterns for organic animations:

// 1. Rotation matrices for multi-axis movement
mat4 rotationMatrix(vec3 axis, float angle) {
  // Standard 3D rotation matrix implementation
}

// 2. Smooth minimum for organic blending
float smin(float a, float b, float k) {
  float h = max(k-abs(a-b), 0.0)/k;
  return min(a,b) - h*h*h*k*(1.0/6.0);
}

// 3. SDF-based rendering for smooth surfaces
float sphereSDF(vec3 p, float r) {
  return length(p) - r;
}

// 4. Ray marching for complex geometry
float rayMarch(vec3 rayOrigin, vec3 ray) {
  float t = 0.0;
  for (int i = 0; i < 100; i++) {
    vec3 p = rayOrigin + ray * t;
    float d = sdf(p);
    if (d < 0.001) return t;
    t += d;
  }
  return -1.0;
}
```

---

## Performance & Build

### Build Optimization

#### Bundle Analysis
```bash
# Analyze bundle size and composition
npm run build
npm run preview

# Check specific chunk sizes
ls -la dist/assets/
```

#### Performance Monitoring
```typescript
// React Query DevTools (development only)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Your routes */}
        </Routes>
      </Router>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

// Performance measurement
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    };
  });
}
```

### Memory Management
```typescript
// Proper cleanup in useEffect
export function useWebSocket(url: string) {
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => console.log('Connected');
    ws.onmessage = (event) => console.log('Message:', event.data);
    ws.onerror = (error) => console.error('WebSocket error:', error);
    
    return () => {
      ws.close();
    };
  }, [url]);
}

// Query cleanup
export function useCleanupQueries() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    return () => {
      queryClient.clear(); // Clear all queries on unmount
    };
  }, [queryClient]);
}
```

---

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear caches and reinstall
rm -rf node_modules .vite dist
npm install
npm run build

# TypeScript issues
npm run build -- --mode development
```

#### Database Connection
```bash
# Test Supabase connection
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
     "$VITE_SUPABASE_URL/rest/v1/products?select=*&limit=1"

# Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'products';
```

#### React Query Issues
```typescript
// Debug query states
export function QueryDebugger({ queryKey }: { queryKey: string[] }) {
  const queryClient = useQueryClient();
  const query = queryClient.getQueryState(queryKey);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Query ${queryKey.join('.')}:`, {
      status: query?.status,
      fetchStatus: query?.fetchStatus,
      error: query?.error,
      lastUpdated: query?.dataUpdatedAt
    });
  }
  
  return null;
}
```

#### Reports & Charts Issues (v2.6.0)

**Chart Labels Not Centering:**
```typescript
// ❌ Wrong - causes misaligned labels
<text textAnchor={x > cx ? 'start' : 'end'}>
  {percentage}
</text>

// ✅ Correct - perfect centering
<text 
  textAnchor="middle"           // Horizontal center
  dominantBaseline="central"    // Vertical center
>
  {percentage}
</text>
```

**Category Data Not Showing All Categories:**
```typescript
// ❌ Wrong - groups small categories  
const processedData = categoryData.filter(item => item.revenue >= threshold);

// ✅ Correct - shows all categories for reports
const processedData = categoryData.sort((a, b) => b.revenue - a.revenue);
```

**RPC Stored Procedure Failures:**
```typescript
// Implement robust fallback system
try {
  const { data: rpcData, error } = await supabase.rpc('get_top_products');
  if (error) throw error;
  return rpcData;
} catch (rpcError) {
  console.warn('RPC failed, using manual calculation:', rpcError);
  
  // Manual calculation fallback
  const { data: manualData } = await supabase
    .from('sales')
    .select('sale_items(product_id, quantity, unit_price, products(name))');
  
  // Aggregate manually
  return processManualData(manualData);
}
```

#### Payment System Issues (v2.6.0)

**Payment Method Filters Not Working:**
```bash
# Check database values
SELECT DISTINCT payment_method FROM sales;

# Verify filter dropdown matches database exactly
PIX (not pix)
Cartão de Crédito (not credit_card)
Débito (not debit)
Dinheiro (not cash)
```

**Case Sensitivity in Filters:**
```typescript
// ❌ Wrong - case sensitive matching
const matches = sale.payment_method === paymentFilter;

// ✅ Correct - case insensitive
const matches = sale.payment_method?.toLowerCase() === paymentFilter.toLowerCase();
```

**Empty Payment Methods Dropdown:**
```typescript
// Check if payment_methods table is populated
const { data: methods } = await supabase
  .from('payment_methods')
  .select('*')
  .eq('is_active', true);

if (!methods || methods.length === 0) {
  console.error('Payment methods table is empty. Run setup:payment-methods');
}
```

#### Performance Issues
```typescript
// Identify expensive renders
export function RenderTracker({ name }: { name: string }) {
  const renderCount = useRef(0);
  renderCount.current++;
  
  console.log(`${name} rendered ${renderCount.current} times`);
  
  return null;
}

// Memory leak detection
export function useMemoryLeakDetector() {
  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        console.log('Memory usage:', {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(performance.memory.totalJSHeapSize / 1048576),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
}
```

### Debug Tools

#### React DevTools Configuration
```typescript
// Add display names for better debugging
const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  return <div>{/* component content */}</div>;
});

// Profiler for performance analysis
export function ProfiledProductList({ products }: { products: Product[] }) {
  return (
    <React.Profiler id="ProductList" onRender={(id, phase, actualDuration) => {
      console.log('ProductList render:', { id, phase, actualDuration });
    }}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </React.Profiler>
  );
}
```

#### Network Debugging
```typescript
// Request interceptor for debugging
export function setupRequestDebugging() {
  if (process.env.NODE_ENV === 'development') {
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      console.log('Fetch request:', input, init);
      
      const response = await originalFetch(input, init);
      
      console.log('Fetch response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return response;
    };
  }
}
```

---

**Last Updated**: August 2025 | **Version**: 2.6.0  
**Status**: Production System | **Records**: 925+ Active  
**Coverage**: 80%+ Lines, 70%+ Branches, 85%+ Functions  
**New Features**: Advanced Chart System, Standardized Payment Methods, Enhanced Filters