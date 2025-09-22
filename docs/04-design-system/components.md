# Component Documentation

Complete reference for all design system components, patterns, and usage guidelines.

## 📋 Table of Contents

- [Component Hierarchy](#component-hierarchy)
- [Primitive Components](#primitive-components)
- [Composite Components](#composite-components)
- [Layout Components](#layout-components)
- [Effect Components](#effect-components)
- [Usage Patterns](#usage-patterns)
- [Best Practices](#best-practices)

## 🏗️ Component Hierarchy

### Layer 1: Foundation
**Location:** `tailwind.config.ts`
**Purpose:** Single source of truth for design tokens

```typescript
// Design token definitions
colors: {
  'accent-gold': {
    '100': '#FFD700', // Primary golden color
    '90': '#FFC700',  // Slightly darker
    // ... complete scale
  }
}
```

### Layer 2: Primitives
**Location:** `src/shared/ui/primitives/`
**Purpose:** Base Shadcn/ui components with design token integration

```typescript
// Example: Button primitive
<Button variant="default" size="sm" className="bg-accent-gold-100">
```

### Layer 3: Composites
**Location:** `src/shared/ui/composite/`
**Purpose:** Reusable patterns and complex components

```typescript
// Example: StatCard composite
<StatCard variant="gold" title="Total Sales" value="$12,345" />
```

### Layer 4: Features
**Location:** `src/features/*/components/`
**Purpose:** Business-specific components

```typescript
// Example: Feature component
<InventoryManagement />
```

## 🧱 Primitive Components

### Button System

#### Variants
```tsx
// Primary actions
<Button variant="default" className="bg-accent-blue">Primary</Button>

// Secondary actions
<Button variant="secondary" className="bg-gray-200">Secondary</Button>

// Destructive actions
<Button variant="destructive" className="bg-accent-red">Delete</Button>

// Golden accent (brand)
<Button className="bg-accent-gold-100 text-primary-black">Gold Action</Button>
```

#### Sizes
```tsx
<Button size="sm">Small</Button>      <!-- 32px height -->
<Button size="default">Default</Button> <!-- 40px height -->
<Button size="lg">Large</Button>      <!-- 48px height -->
<Button size="icon">🔍</Button>       <!-- Square icon button -->
```

### Card System

#### Basic Cards
```tsx
// Standard content card
<Card className="p-6 bg-card border-border">
  <CardHeader>
    <CardTitle className="text-card-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Golden Accent Cards
```tsx
// Premium content with golden accents
<Card className="border-accent-gold-100/20 bg-gradient-to-br from-primary-black to-black-90">
  <div className="absolute inset-0 bg-gradient-to-r from-accent-gold-100/5 to-accent-gold-80/10 rounded-xl" />
  <CardContent className="relative z-above">
    Premium content
  </CardContent>
</Card>
```

### Input System

#### Standard Inputs
```tsx
// Form inputs with design tokens
<Input
  placeholder="Search products..."
  className="bg-background border-border focus:ring-accent-blue"
/>

// Labeled inputs
<div className="space-y-2">
  <Label className="text-foreground font-sf-pro-display">Product Name</Label>
  <Input className="w-col-xl" />
</div>
```

#### Search Inputs
```tsx
// Standardized search with debounce
<SearchInput
  placeholder="Search customers..."
  onSearch={handleSearch}
  debounceMs={300}
  className="w-col-2xl"
/>
```

### Dialog/Modal System

#### BaseModal (Recommended)
```tsx
// Standardized modal with size tokens
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  size="modal-1200"  // For inventory modals
  title="Edit Product"
>
  <ModalContent />
</BaseModal>

// Alternative sizes
<BaseModal size="modal-sm">   // Small modal
<BaseModal size="modal-lg">   // Large modal
<BaseModal size="modal-xl">   // Extra large
<BaseModal size="modal-full"> // Full screen
```

#### Custom Dialog Sizes
```tsx
// Custom width with maxWidth prop
<BaseModal
  maxWidth="1400px"
  className="max-h-dialog-xl"
>
  Wide content
</BaseModal>
```

### Badge System

#### Status Badges
```tsx
// Status indicators
<Badge variant="default" className="bg-accent-blue">Active</Badge>
<Badge variant="success" className="bg-accent-green">Completed</Badge>
<Badge variant="warning" className="bg-accent-orange">Pending</Badge>
<Badge variant="destructive" className="bg-accent-red">Error</Badge>

// Golden accent badges
<Badge className="bg-accent-gold-100 text-primary-black">Premium</Badge>
```

#### Custom Badge Colors
```tsx
// Role-based badges
<Badge className="bg-accent-purple text-white">Admin</Badge>
<Badge className="bg-gray-600 text-white">Employee</Badge>
<Badge className="bg-accent-blue text-white">Delivery</Badge>
```

## 🎯 Composite Components

### StatCard System

#### Variants
```tsx
// Default statistics card
<StatCard
  title="Total Products"
  value="125"
  variant="default"
  description="Active inventory items"
/>

// Success metrics
<StatCard
  title="Sales Growth"
  value="+23.5%"
  variant="success"
  icon={TrendingUp}
/>

// Warning indicators
<StatCard
  title="Low Stock Items"
  value="8"
  variant="warning"
  description="Require reordering"
/>

// Error states
<StatCard
  title="Failed Deliveries"
  value="2"
  variant="error"
  description="Need attention"
/>

// Premium/golden metrics
<StatCard
  title="Premium Sales"
  value="$45,678"
  variant="gold"
  description="High-value transactions"
/>

// Purple accent for special metrics
<StatCard
  title="AI Insights"
  value="12"
  variant="purple"
  description="Generated recommendations"
/>
```

#### Custom StatCard Usage
```tsx
// With custom content
<StatCard
  title="Custom Metric"
  value={
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-accent-gold-100">$23,456</span>
      <Badge variant="success">+12%</Badge>
    </div>
  }
  variant="default"
/>
```

### PaginationControls

#### Standard Pagination
```tsx
// With usePagination hook
const pagination = usePagination(data, 10); // 10 items per page

<PaginationControls
  currentPage={pagination.currentPage}
  totalPages={pagination.totalPages}
  onPageChange={pagination.setCurrentPage}
  showFirst={true}
  showLast={true}
/>
```

#### Custom Pagination
```tsx
// Large datasets with custom sizing
<PaginationControls
  currentPage={1}
  totalPages={50}
  onPageChange={handlePageChange}
  siblingCount={2}    // Show 2 pages before/after current
  className="mt-6"
/>
```

### LoadingSpinner System

#### Standard Loading States
```tsx
// Basic spinner
<LoadingSpinner />

// With message
<LoadingSpinner message="Loading products..." />

// Size variants
<LoadingSpinner size="sm" />   // Small spinner
<LoadingSpinner size="lg" />   // Large spinner

// Colored spinners
<LoadingSpinner className="text-accent-gold-100" />
```

#### Loading Screen
```tsx
// Full-screen loading
<LoadingScreen
  message="Initializing application..."
  className="bg-primary-black"
/>
```

### SearchInput Component

#### Basic Search
```tsx
// Debounced search input
<SearchInput
  placeholder="Search products by name or barcode..."
  onSearch={handleSearch}
  debounceMs={300}
  className="w-full max-w-col-3xl"
/>
```

#### Advanced Search
```tsx
// With clear functionality
<SearchInput
  value={searchTerm}
  onSearch={setSearchTerm}
  onClear={() => setSearchTerm('')}
  showClearButton={true}
  placeholder="Advanced product search..."
/>
```

### EmptyState Components

#### Generic Empty State
```tsx
// Basic empty state
<EmptyState
  title="No products found"
  description="Try adjusting your search filters"
  icon={Package}
  action={
    <Button onClick={handleAddProduct}>
      <Plus className="h-4 w-4 mr-2" />
      Add Product
    </Button>
  }
/>
```

#### Specialized Empty States
```tsx
// No search results
<EmptySearchResults
  searchTerm={searchTerm}
  onClearSearch={() => setSearchTerm('')}
/>

// No data state
<EmptyDataState
  title="No sales data"
  description="Start by creating your first sale"
  actionText="Create Sale"
  onAction={handleCreateSale}
/>
```

### FilterToggle System

#### Collapsible Filters
```tsx
// Standard filter toggle
<FilterToggle
  title="Advanced Filters"
  isOpen={filtersOpen}
  onToggle={setFiltersOpen}
  count={activeFilters.length}
>
  <div className="grid grid-cols-2 gap-4 p-4">
    <Select>...</Select>
    <Input>...</Input>
  </div>
</FilterToggle>
```

## 📐 Layout Components

### PageContainer

#### Standard Page Layout
```tsx
// Consistent page wrapper
<PageContainer
  title="Inventory Management"
  subtitle="Manage your wine collection"
  action={
    <Button onClick={handleAddProduct}>
      <Plus className="h-4 w-4 mr-2" />
      Add Product
    </Button>
  }
>
  <PageContent />
</PageContainer>
```

### DataTable System

#### Basic Data Table
```tsx
// With TanStack React Table
<DataTable
  data={products}
  columns={productColumns}
  pagination={pagination}
  loading={isLoading}
  className="w-full"
/>
```

#### Custom Table Columns
```tsx
// Column definitions with design tokens
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
    size: 200, // Uses col-3xl token
  },
  {
    accessorKey: "price",
    header: "Price",
    size: 120, // Uses col-md token
    cell: ({ row }) => (
      <span className="font-semibold text-accent-gold-100">
        ${row.getValue("price")}
      </span>
    ),
  },
];
```

### Sidebar Layout

#### Navigation Sidebar
```tsx
// Role-based navigation
<Sidebar className="bg-sidebar border-sidebar-border">
  <SidebarHeader className="border-b border-sidebar-border">
    <h2 className="text-sidebar-foreground font-sf-pro-display">
      Adega Manager
    </h2>
  </SidebarHeader>

  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/dashboard" className="text-sidebar-foreground">
              Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

## ✨ Effect Components

### Aceternity UI Integration

#### Background Effects
```tsx
// Optimized gradient background
<TropicalDuskGlow className="absolute inset-0 z-below">
  <div className="relative z-content">
    Content over background
  </div>
</TropicalDuskGlow>
```

#### Text Effects
```tsx
// Animated text entrance
<BlurIn
  word="Welcome to Adega Manager"
  className="text-4xl font-sf-pro-display text-accent-gold-100"
  duration={0.8}
/>

// Gradient text animation
<GradientText className="text-2xl font-bold">
  Premium Analytics
</GradientText>
```

#### Card Effects
```tsx
// Neon border effect
<NeonGradientCard className="border-accent-gold-100/20">
  <div className="p-6">
    Premium content with glow
  </div>
</NeonGradientCard>

// Moving border effect
<MovingBorder
  borderRadius="0.5rem"
  className="bg-primary-black border-accent-gold-100"
>
  Dynamic border animation
</MovingBorder>
```

### Glow Effects

#### Simple Glow
```tsx
// Basic glow effect
<SimpleGlow className="text-accent-gold-100">
  Glowing text
</SimpleGlow>

// Custom glow colors
<GlowEffect
  color="blue"
  intensity="medium"
  className="rounded-lg p-4"
>
  Blue glow container
</GlowEffect>
```

## 📋 Usage Patterns

### Form Patterns

#### Standard Form Layout
```tsx
// Consistent form structure
<form className="space-y-6">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="name" className="text-foreground">Name</Label>
      <Input
        id="name"
        className="mt-1 w-full"
        placeholder="Product name"
      />
    </div>

    <div>
      <Label htmlFor="price" className="text-foreground">Price</Label>
      <Input
        id="price"
        type="number"
        className="mt-1 w-col-md"
        placeholder="0.00"
      />
    </div>
  </div>

  <div className="flex justify-end gap-3">
    <Button variant="outline" type="button">
      Cancel
    </Button>
    <Button type="submit" className="bg-accent-gold-100 text-primary-black">
      Save Product
    </Button>
  </div>
</form>
```

### List Patterns

#### Product Grid
```tsx
// Responsive product grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map(product => (
    <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md"
      />
      <div className="mt-4">
        <h3 className="font-sf-pro-display font-semibold text-foreground">
          {product.name}
        </h3>
        <p className="text-accent-gold-100 font-bold mt-2">
          ${product.price}
        </p>
      </div>
    </Card>
  ))}
</div>
```

#### Data List with Actions
```tsx
// List with consistent action patterns
<div className="space-y-2">
  {items.map(item => (
    <Card key={item.id} className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="success">{item.status}</Badge>
          <span className="font-sf-pro-display">{item.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  ))}
</div>
```

### Dashboard Patterns

#### KPI Cards Row
```tsx
// Consistent KPI display
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <StatCard
    title="Total Revenue"
    value="$45,678"
    variant="gold"
    description="This month"
  />
  <StatCard
    title="Active Products"
    value="125"
    variant="success"
    description="In inventory"
  />
  <StatCard
    title="Pending Orders"
    value="8"
    variant="warning"
    description="Need attention"
  />
  <StatCard
    title="Low Stock"
    value="3"
    variant="error"
    description="Reorder required"
  />
</div>
```

#### Chart Layout
```tsx
// Consistent chart presentation
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card className="p-6">
    <CardHeader>
      <CardTitle className="text-foreground">Sales Trend</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={salesData}>
          <Line stroke="hsl(var(--accent-blue))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  <Card className="p-6">
    <CardHeader>
      <CardTitle className="text-foreground">Category Distribution</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            fill="hsl(var(--accent-gold-100))"
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</div>
```

## ✅ Best Practices

### Component Selection Hierarchy

1. **Check `shared/ui/composite/` first** - Use existing patterns
2. **Extend `shared/ui/primitives/`** - Build on Shadcn/ui base
3. **Integrate Aceternity UI** - For advanced effects
4. **Create custom only if necessary** - Following design tokens

### Design Token Usage

```tsx
// ✅ Correct - Using design tokens
<div className="bg-primary-black text-accent-gold-100 w-modal-1200 h-content-md">

// ❌ Incorrect - Hardcoded values
<div style={{ backgroundColor: '#000000', color: '#FFD700', width: '1200px', height: '60vh' }}>
```

### Performance Optimization

```tsx
// ✅ Memoize expensive components
const ExpensiveComponent = memo(({ data }) => {
  return (
    <StatCard
      title="Complex Calculation"
      value={useMemo(() => calculateValue(data), [data])}
    />
  );
});

// ✅ Use React Query for data
const { data, isLoading } = useQuery(['products'], fetchProducts);

if (isLoading) return <LoadingSpinner />;
```

### Accessibility Compliance

```tsx
// ✅ Proper ARIA attributes
<Button
  aria-label="Delete product"
  aria-describedby="delete-description"
  className="bg-accent-red text-white"
>
  <Trash className="h-4 w-4" />
</Button>
<div id="delete-description" className="sr-only">
  This action cannot be undone
</div>

// ✅ Proper heading hierarchy
<div>
  <h1 className="text-3xl font-sf-pro-display text-foreground">Dashboard</h1>
  <h2 className="text-xl font-sf-pro-display text-muted-foreground">Overview</h2>
  <h3 className="text-lg font-sf-pro-display text-foreground">KPIs</h3>
</div>
```

### Responsive Design

```tsx
// ✅ Mobile-first responsive design
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <StatCard className="w-full" />
</div>

// ✅ Responsive text sizes
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-sf-pro-display">

// ✅ Responsive spacing
<div className="p-4 sm:p-6 lg:p-8">
```

### Error Handling

```tsx
// ✅ Graceful error states
{error ? (
  <EmptyState
    title="Failed to load data"
    description={error.message}
    icon={AlertCircle}
    action={
      <Button onClick={refetch} variant="outline">
        Try Again
      </Button>
    }
  />
) : (
  <DataTable data={data} />
)}
```

---

**Component Documentation Version:** 2.1.0
**Last Updated:** September 16, 2025
**Total Components:** 45+ primitives, 12+ composites
**Coverage:** 100% design token integration ✅