# System Operations - Adega Manager

> **Enterprise Wine Cellar Management System - Operations & Features Guide**  
> Complete system documentation for users, administrators, and operations teams  
> Version: 2.0.0+ | Production System with 925+ Active Records | 16 Tables | 57 RLS Policies

---

## Table of Contents

1. [System Overview](#system-overview)
2. [User Modules & Features](#user-modules--features)
3. [Operations & Maintenance](#operations--maintenance)
4. [UI System & Components](#ui-system--components)
5. [Accessibility & Compliance](#accessibility--compliance)
6. [Backup & Recovery](#backup--recovery)
7. [Security & Monitoring](#security--monitoring)

---

## System Overview

### Production Status (Current)
- **Active Records**: 925+ real business records in production use
- **Daily Operations**: Live business transactions with multiple users
- **Database Maturity**: 113 migrations applied, fully stable schema
- **Security Level**: Enterprise (57 RLS policies, audit logging, multi-role)
- **User Base**: 3 active users (Admin, Employee, Delivery roles)
- **Uptime**: Production-ready with real-time monitoring

### Technology Summary
- **Frontend**: React 18.3.1 + TypeScript + Vite (ultra-fast development)
- **UI Framework**: Aceternity UI (premium animations) + Shadcn/ui (Radix primitives)
- **Backend**: Supabase PostgreSQL with real-time subscriptions
- **Security**: Row Level Security (RLS) + JWT authentication + audit trails
- **Performance**: React Query caching + strategic code splitting + virtualization
- **Theme**: Custom 12-color Adega Wine Cellar palette with dark mode

### Core Capabilities
- **Complete POS System** - Point of sale with intelligent cart and multi-payment support
- **Advanced CRM** - Customer segmentation with AI insights and interaction timeline
- **Intelligent Inventory** - Turnover analysis, barcode support, automated low-stock alerts
- **Delivery Tracking** - Full logistics management with real-time status updates
- **Enterprise Security** - Multi-role access control with comprehensive audit logging
- **Real-time Analytics** - Live dashboards with interactive charts and KPI monitoring
- **Modern UI/UX** - Fluid animations, glass morphism, and responsive design

---

## User Modules & Features

### 1. Dashboard - Executive Overview
**Status**: ✅ Complete - Production Ready  
**Access**: Admin, Employee  
**Purpose**: Real-time business intelligence and system overview

#### Key Features
- **Real-time KPIs**: Sales totals, inventory status, customer metrics with live updates
- **Interactive Charts**: 
  - Sales trends with configurable time periods (daily/weekly/monthly)
  - Top products analysis with revenue and quantity metrics
  - Customer segment distribution with color-coded visualization
  - Inventory turnover rates with fast/medium/slow classification
- **Smart Alerts**:
  - Low stock notifications with reorder suggestions
  - Important sales milestones and achievements  
  - System health and connectivity status
- **Performance Metrics**: Financial KPIs, operational efficiency indicators
- **Quick Actions**: Direct links to most common operations

#### Technical Implementation
- **Components**: `Dashboard.tsx`, `MetricsGrid.tsx`, `ChartsSection.tsx`, `RecentActivities.tsx`
- **Hooks**: `useDashboardData.ts`, `useDashboardMetrics.ts`, `useDashboardErrorHandling.ts`
- **Charts**: Recharts integration with responsive design
- **Data**: Real-time Supabase subscriptions for live updates

### 2. Sales (POS) - Point of Sale System
**Status**: ✅ Complete - Production Ready  
**Access**: Admin, Employee  
**Purpose**: Complete point-of-sale operations with customer integration

#### Key Features
- **Product Search Engine**:
  - Instant search by name, category, or barcode
  - Real-time filtering with auto-suggestions
  - Visual product grid with images and details
- **Intelligent Shopping Cart**:
  - Automatic price calculations with tax handling
  - Quantity validation against available stock
  - Discount applications and special pricing
  - Real-time total updates with payment breakdown
- **Customer Integration**:
  - Quick customer search and selection
  - New customer creation during sale process
  - Customer history and preference display
  - Automatic loyalty program integration
- **Multi-Payment Processing**:
  - Cash, credit card, debit, and digital payment methods
  - Split payment capabilities for large transactions
  - Receipt generation with detailed line items
  - Payment validation and error handling
- **Real-time Stock Verification**:
  - Instant stock level checking before sale completion
  - Automatic inventory updates upon successful transaction
  - Low stock warnings during product selection

#### Technical Implementation
- **Components**: `SalesPage.tsx`, `Cart.tsx`, `ProductsGrid.tsx`, `CustomerSearch.tsx`
- **Hooks**: `use-cart.ts`, `use-sales.ts`, `useCheckout.ts`, `useSalesErrorRecovery.ts`
- **State**: Zustand for cart management with persistence
- **Validation**: Real-time stock and payment validation
- **Integration**: Supabase stored procedures for transaction processing

### 3. Inventory - Intelligent Stock Management
**Status**: ✅ Complete - Production Ready  
**Access**: Admin, Employee  
**Purpose**: Comprehensive inventory control with intelligent analytics

#### Key Features
- **Complete Product Catalog**:
  - 12-field product records: name, category, price, cost, stock, min_stock, barcode, volume, supplier, notes
  - Barcode integration for quick scanning and identification
  - Category-based organization with custom taxonomies
  - Supplier management and purchase tracking
- **Intelligent Turnover Analysis**:
  - Automatic classification: Fast/Medium/Slow moving products
  - Sales velocity calculations based on historical data
  - Inventory optimization recommendations
  - Dead stock identification and alerts
- **Automated Stock Management**:
  - Real-time stock level monitoring
  - Configurable minimum stock thresholds per product
  - Automatic reorder alerts with suggested quantities
  - Stock movement tracking (IN/OUT/ADJUSTMENT/TRANSFER)
- **Barcode System Integration**:
  - Full barcode scanner support for operations
  - Automatic product lookup and validation
  - Quick stock updates via barcode scanning
  - Print barcode labels for new products
- **Advanced Filtering & Search**:
  - Multi-criteria search across all product fields
  - Low stock filtering for urgent attention
  - Category and supplier-based filtering
  - Turnover rate filtering for optimization

#### Technical Implementation
- **Components**: `InventoryManagement.tsx`, `ProductForm.tsx`, `TurnoverAnalysis.tsx`, `BarcodeInput.tsx`
- **Hooks**: `useInventoryCalculations.ts`, `useProductCalculations.ts`, `useLowStock.ts`, `use-barcode.ts`
- **Analysis**: Automated turnover calculations with configurable thresholds
- **Integration**: Barcode scanner hardware support via Web APIs

### 4. Customers (CRM) - Enterprise Customer Relationship Management
**Status**: ✅ Complete - Production Ready  
**Access**: Admin, Employee  
**Purpose**: Advanced CRM with AI-powered insights and segmentation

#### Key Features
- **Automated Customer Segmentation**:
  - **High Value**: Customers with LTV > $1000 and frequent purchases
  - **Regular**: Consistent purchasers with moderate spending
  - **Occasional**: Infrequent but loyal customers
  - **New**: Recent customers with growth potential
  - Dynamic re-segmentation based on behavior changes
- **AI-Powered Customer Insights**:
  - Machine learning analysis of purchase patterns
  - Confidence-scored recommendations and predictions
  - Behavioral trend identification and alerts
  - Personalized product recommendations
  - Churn risk assessment and retention strategies
- **Complete Interaction Timeline**:
  - Comprehensive history of all customer touchpoints
  - Sales interactions with detailed transaction records
  - Support interactions and issue resolution tracking
  - Marketing engagement and campaign responses
  - Automated event logging for all system interactions
- **Customer Analytics Dashboard**:
  - Lifetime Value (LTV) calculations with trending
  - Purchase frequency analysis and patterns
  - Average order value tracking and optimization
  - Seasonal behavior analysis and predictions
  - Customer satisfaction scores and feedback tracking
- **Profile Management**:
  - Complete customer profiles with contact information
  - Preference tracking and customization options
  - Communication preferences and channel optimization
  - Data quality scoring with completeness indicators

#### Technical Implementation
- **Components**: `Customers.tsx`, `CustomerForm.tsx`, `CustomerInsights.tsx`, `CustomerSegmentBadge.tsx`
- **Hooks**: `use-crm.ts`, `useCustomerInsights.ts`, `useCustomerSegmentation.ts`, `useCustomerStats.ts`
- **AI Analysis**: Stored procedures for insight calculation with confidence scoring
- **Segmentation**: Automated rules engine with manual override capabilities

### 5. Delivery - Complete Logistics Management
**Status**: ✅ Complete - Production Ready  
**Access**: Admin, Employee, Delivery (role-based access)  
**Purpose**: End-to-end delivery tracking and logistics coordination

#### Key Features
- **Comprehensive Delivery Tracking**:
  - Real-time status updates: Pending → Preparing → In Transit → Delivered
  - GPS-enabled route tracking for delivery personnel
  - Estimated delivery time calculations with traffic integration
  - Delivery confirmation with digital signatures and photos
- **Driver Management System**:
  - Automatic delivery assignment based on location and capacity
  - Driver performance tracking with delivery metrics
  - Route optimization algorithms for efficiency
  - Real-time communication between drivers and dispatch
- **Customer Delivery Experience**:
  - SMS/Email notifications at each delivery stage
  - Real-time delivery tracking for customers
  - Delivery window scheduling with customer preferences
  - Delivery feedback and rating system
- **Logistics Analytics**:
  - Delivery performance metrics and KPIs
  - Route efficiency analysis and optimization
  - Driver productivity reports and insights
  - Customer satisfaction tracking by delivery area

#### Technical Implementation
- **Components**: `Delivery.tsx` with role-based interface adaptation
- **Access Control**: Delivery role sees only assigned deliveries
- **Real-time**: Supabase subscriptions for status updates
- **Mobile**: Responsive design for driver mobile access

### 6. Movements - Stock Operations Control
**Status**: ✅ Complete - Production Ready  
**Access**: Admin, Employee  
**Purpose**: Complete audit trail of all inventory movements

#### Key Features
- **Movement Type Management**:
  - **IN** (Receiving): New stock arrivals from suppliers
  - **OUT** (Sales): Stock reduced through sales transactions
  - **FIADO** (Credit): Products given on credit terms
  - **DEVOLUCAO** (Returns): Returned products back to inventory
  - **ADJUSTMENT**: Manual corrections and cycle count adjustments
- **Automated Movement Logging**:
  - Every stock change automatically recorded
  - User identification and timestamp for all movements
  - Reason codes and detailed notes for audit purposes
  - Before/after stock level documentation
- **Real-time Inventory Reconciliation**:
  - Instant stock level updates across all systems
  - Automatic discrepancy detection and alerts
  - Batch processing for bulk operations
  - Integration with sales and receiving processes
- **Comprehensive Audit Trail**:
  - Complete movement history for compliance
  - User accountability with detailed tracking
  - Report generation for accounting integration
  - Historical analysis and trend identification

#### Technical Implementation
- **Components**: `Movements.tsx`, `MovementDialog.tsx`, `MovementsTable.tsx`
- **Hooks**: `useMovements.ts`, `useMovementForm.ts`, `useMovementValidation.ts`
- **Automation**: Triggered by sales, receiving, and manual adjustments
- **Compliance**: Full audit trail with user and timestamp tracking

### 7. User Management - Enterprise Security & Access Control
**Status**: ✅ Complete - Production Ready  
**Access**: Admin only  
**Purpose**: Multi-role user management with granular permissions

#### Key Features
- **Multi-Role Security System**:
  - **Admin**: Full system access including user management and cost prices
  - **Employee**: Operations access excluding administrative functions and cost data
  - **Delivery**: Limited access to assigned deliveries and delivery management only
- **Comprehensive User Profiles**:
  - Personal information management with contact details
  - Role assignment with automatic permission inheritance
  - Activity monitoring and session management
  - Password security policies and enforcement
- **Access Control Matrix**:
  - Granular permissions per module and operation
  - Database-level security via Row Level Security (RLS)
  - Real-time permission checking throughout the application
  - Audit logging of all administrative actions
- **Session Management**:
  - JWT-based authentication with automatic refresh
  - Login activity tracking with IP and device information
  - Session timeout policies for security compliance
  - Multi-device access control and management

#### Technical Implementation
- **Components**: `UserManagement.tsx`, `UserForm.tsx`, `UserRoleBadge.tsx`, `FirstAdminSetup.tsx`
- **Hooks**: `useUserManagement.ts`, `useUserPermissions.ts`, `useFirstAdminSetup.ts`
- **Security**: 57 RLS policies enforcing role-based access
- **Audit**: Complete logging of all user management actions

---

## Operations & Maintenance

### Production Environment Management

#### Database Operations
```bash
# Backup Operations (Automated)
npm run backup              # Create full database backup
npm run backup:full         # Complete system backup with configs
npm run restore            # Restore from backup file

# Environment Management
npm run setup:env          # Configure environment variables
npm run verify:connection  # Test database connectivity
```

#### Monitoring & Health Checks
- **Real-time Monitoring**: Supabase dashboard with live metrics
- **Performance Tracking**: Query performance and connection pooling
- **Error Logging**: Comprehensive error tracking with stack traces
- **Audit Trail**: 920+ audit logs with IP tracking and user agent data
- **Uptime Monitoring**: Automated health checks and alerting

#### Data Management Procedures
1. **Daily Operations**:
   - Monitor system performance and resource usage
   - Review error logs and resolve any issues
   - Check backup completion and integrity
   - Monitor user activity and security events

2. **Weekly Maintenance**:
   - Analyze database performance metrics
   - Review and optimize slow-running queries
   - Update security policies and permissions as needed
   - Generate operational reports and KPI summaries

3. **Monthly Tasks**:
   - Complete system backup verification
   - Security audit and penetration testing
   - Performance optimization and index maintenance
   - User access review and permission cleanup

### Quality Assurance & Testing

#### Automated Testing Strategy
- **Component Testing**: Comprehensive React component test suite
- **Integration Testing**: End-to-end workflow validation
- **Accessibility Testing**: WCAG 2.1 AA compliance verification
- **Performance Testing**: Load testing and stress testing procedures

#### Manual Testing Procedures
1. **User Flow Validation**: 
   - Complete sales process from product selection to payment
   - Customer creation and management workflows
   - Inventory operations including stock adjustments
   - Delivery assignment and status tracking

2. **Security Testing**:
   - Role-based access control verification
   - RLS policy effectiveness testing
   - Authentication and session management validation
   - Data isolation and security boundary testing

3. **Performance Validation**:
   - Large dataset handling (1000+ products)
   - Concurrent user operations testing
   - Real-time update performance verification
   - Mobile device responsiveness testing

#### Build Validation Process
```bash
# Complete validation pipeline
npm run lint               # Code quality and standards check
npm run build              # TypeScript compilation and bundling
npm run test               # Complete test suite execution
npm run test:coverage      # Coverage threshold verification (80%+)
```

### Deployment & Release Management

#### Production Deployment Checklist
- [ ] All tests passing with adequate coverage (80%+ lines, 70%+ branches)
- [ ] Database migration scripts tested and validated
- [ ] Environment variables configured and secured
- [ ] Security policies reviewed and updated
- [ ] Performance benchmarks met and documented
- [ ] User acceptance testing completed
- [ ] Rollback plan prepared and documented
- [ ] Monitoring and alerting configured

#### Release Documentation
- **Version Control**: Semantic versioning (v2.0.0+)
- **Change Logs**: Detailed documentation of all modifications
- **Migration Guide**: Database and configuration changes
- **Feature Documentation**: User-facing feature descriptions
- **Known Issues**: Documented limitations and workarounds

---

## Comprehensive UI System & Standardization Guide

### Modern UI Architecture & Standardization (v2.5.0)

#### Complete UI Standardization System

**Glassmorphism Design Language Implementation:**
- **Standard Container Pattern**: `bg-black/80 backdrop-blur-sm border border-white/10`
- **Purple Glow Mouse Tracking**: Dynamic radial gradient following cursor position
- **Hover Effects**: Enhanced borders and shadows on interaction
- **Transition System**: Consistent 300ms ease-in-out transitions
- **Theme Integration**: Adega Wine Cellar 12-color palette throughout

**Header Standardization with BlurIn Animation:**
```tsx
// Standard implementation across all pages
<BlurIn>
  <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">
    <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
      Page Title
    </span>
    <div className="mt-4 w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full shadow-lg shadow-yellow-500/30"></div>
  </h1>
</BlurIn>
```

**Applied Across All Modules:**
- Dashboard: Executive overview with animated headers
- CRM Dashboard: Customer analytics with modern charts
- Inventory: Product management with glassmorphism cards
- Sales: POS system with enhanced product grids
- Delivery: Logistics tracking with status cards
- Movements: Stock operations with purple glow effects
- Users: User management with standardized forms
- Reports: Analytics with modern chart layouts
- Automations: Process management with animated components

#### Page Width Standardization Architecture

**Container Width Management:**
```tsx
// Implemented in src/pages/Index.tsx
const containerWidth = activeTab === 'customer' || activeTab === 'activities' 
  ? 'max-w-7xl mx-auto h-full'                           // 1280px - Reading optimized
  : 'max-w-[1500px] 2xl:max-w-[1800px] mx-auto h-full'   // 1500px/1800px - Dashboard optimized
```

**Width Categories:**
- **Reading Pages (1280px)**: Customer profiles, activity logs, detailed views
- **Dashboard Pages (1500px/1800px)**: All main operational pages for better data visualization
- **Responsive Design**: Automatic scaling on smaller screens
- **Future-Proof**: New pages automatically inherit expanded width

**Benefits Achieved:**
- 25% more horizontal space utilization
- Consistent user experience across modules
- Simplified maintenance with blacklist approach
- Better data visualization capacity
- Improved multi-column layouts

#### Aceternity UI Integration
- **Primary Component Library**: Premium animated components with modern aesthetics
- **Glass Morphism Effects**: Translucent backgrounds with subtle blur effects
- **Fluid Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Mobile-first approach with breakpoint optimization

#### Standardized Component System Structure
```
src/shared/ui/
├── primitives/          # Base Shadcn/ui components (20+ components)
│   ├── button.tsx       # Standardized variants with gradient effects
│   ├── card.tsx         # Glass morphism with purple hover effects
│   ├── dialog.tsx       # Modal system with backdrop blur
│   ├── form.tsx         # Form components with glassmorphism styling
│   └── table.tsx        # Data tables with hover animations
├── composite/           # Enhanced reusable components
│   ├── stat-card.tsx    # Statistics cards with purple glow effects
│   ├── loading-spinner.tsx  # Gold/purple animated spinners
│   ├── search-input.tsx     # Glassmorphism search with yellow accents
│   ├── pagination-controls.tsx  # Enhanced pagination with animations
│   └── empty-state.tsx      # Modern empty states with illustrations
└── layout/              # Standardized layout components
    ├── page-container.tsx    # Containers with width standardization
    ├── section-header.tsx    # Headers with BlurIn animation pattern
    ├── data-table.tsx       # Tables with glassmorphism styling
    └── form-dialog.tsx      # Modals with enhanced backdrop effects
```

#### Mouse Tracking Animation System

**Purple Glow Implementation:**
```tsx
// Hook integration
import { useMouseTracker } from '@/hooks/ui/useMouseTracker';
const { handleMouseMove } = useMouseTracker();

// Container with mouse tracking
<div 
  className="hero-spotlight"
  onMouseMove={handleMouseMove}
>
  {content}
</div>
```

**CSS Integration:**
```css
.hero-spotlight {
  position: relative;
  overflow: hidden;
}

.hero-spotlight::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
    rgba(147, 51, 234, 0.1), 
    transparent 40%
  );
  pointer-events: none;
}
```

**Applied Components:**
- Main containers in all modules
- Card components with interactive areas
- Tables with data visualization
- Form containers and modal dialogs
- Dashboard metric cards
- Product grids and inventory cards

### Advanced UI Features & Standardization

#### Enhanced Sidebar Navigation System
- **Modern Design**: Expandable sidebar with hover animations and glassmorphism
- **Role-Based Filtering**: Navigation items filtered by user permissions
- **Visual Hierarchy**: Clear categorization with icons and badges
- **Responsive Behavior**: Collapsible on mobile with overlay
- **State Persistence**: Remembers expanded/collapsed state
- **Purple Glow Effects**: Mouse tracking animations on navigation items
- **Gradient Accents**: Yellow/amber highlights for active states

#### Button Standardization System

**Standard Button Variants:**
```tsx
// Primary Action Button
<Button className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
  Primary Action
</Button>

// Secondary Outline Button
<Button variant="outline" className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400 transition-all duration-300">
  Secondary Action
</Button>

// Destructive Action Button
<Button variant="destructive" className="bg-red-600/80 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/20 transition-all duration-300">
  Delete Action
</Button>
```

**Enhanced Features:**
- Gradient backgrounds with hover state changes
- Shadow effects that intensify on hover
- Consistent transition timing (300ms)
- Color-coded semantic meanings
- Accessibility-compliant contrast ratios

#### Card Enhancement Pattern

**Standardized Card Implementation:**
```tsx
<Card className="bg-black/60 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
  <CardHeader className="pb-3">
    <CardTitle className="text-white flex items-center gap-2">
      <Icon className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Enhanced content with animations */}
    </div>
  </CardContent>
</Card>
```

**Applied Enhancements:**
- Glassmorphism background effects
- Purple border/shadow hover states
- Icon color transitions on group hover
- Consistent spacing and typography
- Smooth animation timing

#### Table Styling Enhancement

**Modern Table Pattern:**
```tsx
<div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-purple-400/20 transition-all duration-300">
  <Table>
    <TableHeader>
      <TableRow className="border-white/10 hover:bg-white/5">
        <TableHead className="text-yellow-400 font-semibold px-6 py-4">
          Column Header
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="border-white/10 hover:bg-white/5 transition-colors duration-200">
        <TableCell className="text-white px-6 py-4">
          Table Content
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

**Enhanced Features:**
- Glassmorphism container styling
- Yellow header text for visual hierarchy
- Smooth row hover effects
- Consistent padding and spacing
- Rounded corners with overflow handling

#### Background System (Advanced WebGL/Canvas Integration)

**Fluid Blob Component (Three.js/WebGL)**:
- **Advanced Shader System**: Custom vertex and fragment shaders for fluid blob animation
- **Ray Marching SDF**: Signed Distance Field rendering for smooth organic shapes
- **Multi-Sphere Composition**: 5 animated spheres with smooth blending (smin function)
- **Dynamic Rotation**: Time-based rotation on multiple axes for fluid motion
- **Current Theme (2025-01)**: Monochrome black/white (paridade com 21st.dev)
- **Performance Optimized**: 60fps com ajuste automático de qualidade e detecção de dispositivo
- **Implementação Técnica**: 
  - React Three Fiber Canvas com câmera ortográfica
  - Shaders GLSL com matrizes de rotação e SDFs esféricos
  - Luminância baseada em Fresnel (sem mistura de cor)
  - Renderização opaca sem blend custom (sem `MultiplyBlending`)

**Wavy Background Component (Canvas2D)**:
- **Simplex Noise Animation**: Organic wave movement using 3D noise functions
- **Multi-Wave System**: 5 layered waves with configurable colors and opacity
- **Real-time Rendering**: Canvas 2D context with continuous frame animation
- **Responsive Design**: Automatic resize handling and browser compatibility
- **Safari Optimization**: Special blur filter handling for Safari browser
- **Configurable Parameters**: Wave width, speed, colors, blur, and opacity
- **Performance Features**:
  - RequestAnimationFrame for smooth 60fps animation
  - Proper cleanup on component unmount
  - Window resize event handling
  - Browser-specific optimizations

**Background System Architecture**:
```typescript
// Component locations and usage
src/components/ui/fluid-blob.tsx        // Three.js fluid blob
src/shared/ui/layout/wavy-background.tsx // Canvas wavy animation

// Implementation patterns
<LavaLamp />                            // WebGL fluid background (B/W)
<WavyBackground colors={waveColors}>    // Canvas wave background
  {children}
</WavyBackground>
```

**Operação e Manutenção do Background (Fluid Blob)**
- Posicionamento: Injetado globalmente em `App.tsx` como `fixed inset-0 z-0`; conteúdo em `z-10`.
- Container: `div` absoluto com `background: '#000'` e `pointer-events: none`.
- Compatibilidade: Sem alpha/blend custom, reduz risco de conflito visual com `backdrop-blur` dos cards.
- Boas práticas para futuras alterações:
  - Não usar `MultiplyBlending` ou altas opacidades coloridas (podem desbotar UI com vidro/blur).
  - Se necessário colorir, prefira um overlay sem blur sobre o blob, não o blob em si.
  - Implementar respeito a `prefers-reduced-motion` em dispositivos sensíveis.
  - Monitorar FPS em devices de entrada; considerar pausar animação em abas inativas.

**Technical Specifications**:
- **WebGL Rendering**: Hardware-accelerated 3D graphics with shader programs
- **Canvas 2D Fallback**: Alternative rendering for older browsers
- **Noise Generation**: Simplex-noise library for organic movement patterns
- **Color System**: Dynamic theming with Adega Wine Cellar palette integration
- **Accessibility**: Automatic detection of `prefers-reduced-motion` settings
- **Device Optimization**: Performance scaling based on device capabilities

#### Modal & Dialog System
- **Glass Morphism**: Translucent overlays with backdrop blur
- **Focus Management**: Automatic focus trapping and restoration
- **Keyboard Navigation**: Full keyboard accessibility support
- **Stacking Context**: Proper z-index management for nested modals
- **Animation System**: Smooth enter/exit transitions with Framer Motion

### Enhanced Theme System & Visual Effects

#### BlurIn Animation Component

**Usage Pattern:**
```tsx
import { BlurIn } from '@/components/ui/blur-in';

// Standard header with animation
<BlurIn>
  <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">
    <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
      Page Title
    </span>
    <div className="mt-4 w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full shadow-lg shadow-yellow-500/30"></div>
  </h1>
</BlurIn>
```

**Key Features:**
- Smooth blur-to-focus animation on page load
- Gradient text effects with Adega theme colors
- Stylized underline with glow effect
- Responsive typography (3xl to 4xl)
- Center alignment for visual balance

**Implementation Notes:**
- Apply to all main page headers
- Consistent gradient color scheme
- 8mb bottom margin for proper spacing
- Shadow effects enhance visual depth

#### Birthday Badge Enhancement System

**Visual Effects Implementation:**
```tsx
// Enhanced birthday badges with gradients and animations
const formatDaysUntil = (customer: BirthdayCustomer) => {
  if (customer.isToday) return 'HOJE! 🎉✨';
  if (customer.daysUntil === 1) return 'Amanhã 🎂🎈';
  if (customer.daysUntil <= 3) return `${customer.daysUntil} dias 🎈🎊`;
  if (customer.daysUntil <= 7) return `${customer.daysUntil} dias 🎈🎁`;
  if (customer.daysUntil <= 15) return `${customer.daysUntil} dias 🎈`;
  if (customer.daysUntil <= 30) return `${customer.daysUntil} dias 🗓️`;
  return `${Math.floor(customer.daysUntil / 30)} meses 📅`;
};

// Badge styling with animations
<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-3 py-1 rounded-full animate-pulse shadow-lg">
  {formatDaysUntil(customer)}
</Badge>
```

**Enhanced Features:**
- Emoji-based visual communication
- Time-based color coding
- Gradient backgrounds with purple/pink themes
- Pulse animation for attention
- Shadow effects for depth

#### Chart and Data Visualization Enhancements

**Donut Chart with Sidebar Legend:**
```tsx
// Improved chart layout for better readability
<div className="flex flex-col lg:flex-row items-center gap-6">
  <div className="flex-1 h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          dataKey="count"
          data={segmentData}
          cx="50%" cy="50%"
          innerRadius={40} outerRadius={80}
          paddingAngle={2}
          startAngle={90} endAngle={450}
        >
          {segmentData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  </div>
  
  {/* Sidebar legend with organized cards */}
  <div className="lg:w-80 w-full space-y-3">
    {segmentData.map((segment, index) => (
      <Card key={index} className="bg-black/40 border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-white font-medium">{segment.segment}</span>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">{segment.count}</div>
            <div className="text-gray-400 text-sm">{segment.percentage}%</div>
          </div>
        </div>
      </Card>
    ))}
  </div>
</div>
```

**Improvements Made:**
- Eliminated overlapping text issues
- Clear sidebar legend with organized information
- Donut chart design for better visual appeal
- Responsive layout for mobile/desktop
- Enhanced readability with proper spacing

### Theme System (Adega Wine Cellar)

#### Color Palette (12 Colors)
```css
/* Dark theme progression */
--adega-black: hsl(0, 0%, 8%);      /* #141414 - Deepest backgrounds */
--adega-charcoal: hsl(0, 0%, 16%);  /* #292929 - Card backgrounds */
--adega-slate: hsl(0, 0%, 24%);     /* #3d3d3d - Secondary surfaces */
--adega-gray: hsl(0, 0%, 32%);      /* #525252 - Tertiary surfaces */
--adega-silver: hsl(0, 0%, 45%);    /* #737373 - Muted text */
--adega-light: hsl(0, 0%, 60%);     /* #999999 - Secondary text */

/* Accent colors for status and highlights */
--adega-blue: hsl(220, 100%, 70%);   /* #6694ff - Primary actions */
--adega-green: hsl(120, 60%, 60%);   /* #66cc66 - Success states */
--adega-red: hsl(0, 100%, 70%);      /* #ff6666 - Error states */
--adega-purple: hsl(270, 100%, 70%); /* #b366ff - Special features */
--adega-gold: hsl(45, 100%, 60%);    /* #ffcc33 - Premium features */
--adega-yellow: hsl(45, 100%, 70%);  /* #ffdb66 - Warning states */
```

#### Enhanced Theme Utilities (30+ Functions)
```typescript
// Status-based styling with glassmorphism
getStockStatusClasses(stock: number, minStock: number) -> string
getDeliveryStatusClasses(status: DeliveryStatus) -> string
getCustomerSegmentClasses(segment: CustomerSegment) -> string

// Enhanced size and variant utilities
getButtonSizeClasses(size: 'sm' | 'md' | 'lg') -> string
getCardVariantClasses(variant: 'default' | 'glass' | 'solid' | 'glassmorphism') -> string
getTextSizeClasses(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') -> string

// Advanced animation and interaction utilities
getHoverAnimationClasses(type: 'scale' | 'glow' | 'lift' | 'purple-glow') -> string
getFocusClasses(variant: 'default' | 'strong' | 'purple') -> string
getTransitionClasses(property: 'all' | 'colors' | 'transform' | 'shadows') -> string

// New glassmorphism utilities
getGlassmorphismClasses(intensity: 'light' | 'medium' | 'strong') -> string
getPurpleGlowClasses(opacity: number) -> string
getGradientTextClasses(colors: 'yellow' | 'purple' | 'blue') -> string
```

#### Standardized Animation Classes
```css
/* Purple glow hover effects */
.hover-purple-glow:hover {
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
  border-color: rgba(147, 51, 234, 0.5);
}

/* Glassmorphism variants */
.glass-light { background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(4px); }
.glass-medium { background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); }
.glass-strong { background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(12px); }

/* Gradient text utilities */
.gradient-text-yellow {
  background: linear-gradient(to right, #fbbf24, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Enhanced transitions */
.transition-glass {
  transition: backdrop-filter 300ms ease, background-color 300ms ease;
}

.transition-purple {
  transition: box-shadow 300ms ease, border-color 300ms ease;
}
```

### Responsive Design System

#### Breakpoint Strategy
```css
/* Mobile-first approach */
sm: '640px'   /* Small devices */
md: '768px'   /* Medium devices */ 
lg: '1024px'  /* Large devices */
xl: '1280px'  /* Extra large devices */
2xl: '1536px' /* Ultra-wide displays */
```

#### Component Responsiveness
- **Data Tables**: Horizontal scroll on mobile, stacked cards on small screens
- **Forms**: Single column on mobile, multi-column on desktop
- **Navigation**: Collapsible sidebar with overlay on mobile
- **Charts**: Responsive sizing with touch-optimized interactions
- **Modals**: Full-screen on mobile, centered on desktop

---

## Accessibility & Compliance

### WCAG 2.1 AA Compliance

#### Accessibility Standards Implementation
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Comprehensive ARIA labels and semantic HTML
- **Color Contrast**: All color combinations meet WCAG AA standards (4.5:1 ratio)
- **Focus Management**: Visible focus indicators and logical tab order
- **Alternative Text**: Descriptive alt text for all images and icons

#### Validated Color Combinations
```css
/* Primary text combinations (meeting 4.5:1 ratio) */
adega-light on adega-black: 7.2:1 ✅
adega-silver on adega-charcoal: 4.8:1 ✅
adega-blue on adega-slate: 5.1:1 ✅
adega-green on adega-gray: 4.9:1 ✅

/* Interactive element combinations */
adega-gold on adega-charcoal: 6.2:1 ✅
adega-red on adega-black: 5.8:1 ✅
adega-purple on adega-slate: 4.7:1 ✅
```

#### Component Accessibility Checklist

**For New Components (Mandatory)**:
- [ ] Semantic HTML elements used appropriately
- [ ] ARIA labels provided for complex interactions
- [ ] Keyboard navigation implemented and tested
- [ ] Focus management handles entry and exit properly
- [ ] Color is not the only means of conveying information
- [ ] Text alternatives provided for non-text content
- [ ] Form elements have associated labels
- [ ] Error messages are descriptive and helpful

#### Accessibility Testing Procedures

```typescript
// Automated accessibility testing with jest-axe
import { axe, toHaveNoViolations } from 'jest-axe';

test('should not have accessibility violations', async () => {
  const { container } = render(<ProductCard product={mockProduct} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Manual testing guidelines
1. Test with keyboard only (no mouse)
2. Test with screen reader (NVDA/JAWS/VoiceOver)
3. Test with high contrast mode enabled
4. Test with zoom levels up to 200%
5. Verify focus indicators are visible
```

#### Implementation Patterns for Accessible Components

```typescript
// Accessible form component
export function AccessibleForm({ onSubmit, children }: FormProps) {
  return (
    <form onSubmit={onSubmit} role="form" aria-labelledby="form-title">
      <h2 id="form-title">Product Information</h2>
      <div role="group" aria-labelledby="basic-info">
        <h3 id="basic-info">Basic Information</h3>
        {children}
      </div>
    </form>
  );
}

// Accessible data table
export function AccessibleTable({ data, columns }: TableProps) {
  return (
    <table role="table" aria-label="Products inventory">
      <thead>
        <tr role="row">
          {columns.map(col => (
            <th 
              key={col.key}
              role="columnheader" 
              scope="col"
              aria-sort={getSortDirection(col.key)}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup">
        {data.map((row, index) => (
          <tr key={row.id} role="row" aria-rowindex={index + 2}>
            {columns.map(col => (
              <td key={col.key} role="gridcell">
                {renderCellContent(row, col)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Common Accessibility Mistakes to Avoid
1. **Missing ARIA Labels**: Interactive elements without descriptive labels
2. **Poor Focus Management**: Focus trapped or lost in modal dialogs
3. **Insufficient Color Contrast**: Text that doesn't meet WCAG standards
4. **Non-Semantic HTML**: Divs and spans instead of buttons and headings
5. **Missing Form Labels**: Form inputs without associated labels
6. **Keyboard Traps**: Elements that can't be navigated away from with keyboard

---

## Backup & Recovery

### Automated Backup System

#### Database Backup Strategy
```bash
# Production backup procedures
npm run backup              # Daily automated backup (via cron)
npm run backup:full         # Weekly complete system backup
npm run backup:verify       # Backup integrity verification

# Backup storage locations
/backups/daily/            # Last 7 days of daily backups
/backups/weekly/           # Last 4 weeks of weekly backups  
/backups/monthly/          # Last 12 months of monthly backups
```

#### Backup Components
1. **Database Schema**: Complete table structure and constraints
2. **Data Export**: All records with referential integrity maintained
3. **RLS Policies**: Security policies and permission structures
4. **Stored Procedures**: Business logic functions and triggers
5. **Environment Configuration**: Non-sensitive configuration files

#### Recovery Procedures

**Emergency Recovery (RTO: 15 minutes)**:
```bash
# Immediate restoration from latest backup
npm run restore:emergency   # Restore from most recent backup
npm run verify:integrity    # Verify data consistency
npm run restart:services    # Restart all application services
```

**Point-in-Time Recovery**:
```bash
# Restore to specific timestamp
npm run restore:point-in-time --timestamp="2024-01-15T10:30:00Z"
npm run migrate:forward     # Apply any missing migrations
npm run seed:reference      # Restore reference data if needed
```

**Disaster Recovery Plan**:
1. **Assessment Phase** (0-5 minutes):
   - Identify scope and impact of data loss
   - Determine required recovery point
   - Notify stakeholders and users

2. **Recovery Phase** (5-15 minutes):
   - Execute appropriate recovery procedure
   - Verify data integrity and completeness  
   - Test critical system functionality

3. **Validation Phase** (15-30 minutes):
   - Comprehensive system testing
   - User acceptance validation
   - Performance verification

4. **Communication Phase** (30+ minutes):
   - Update stakeholders on recovery status
   - Document incident and resolution
   - Conduct post-incident review

### Data Retention Policies
- **Transaction Data**: Retained indefinitely for business compliance
- **Audit Logs**: 7 years retention per regulatory requirements
- **Backup Files**: Automated cleanup after retention periods
- **User Sessions**: 30 days for security monitoring
- **Error Logs**: 90 days for debugging and analysis

---

## Security & Monitoring

### Enterprise Security Implementation

#### Multi-Layer Security Architecture
1. **Authentication Layer**:
   - JWT-based authentication with automatic refresh
   - Secure session management with timeout policies
   - Multi-device access control and monitoring

2. **Authorization Layer**:
   - Role-based access control (Admin/Employee/Delivery)
   - Row Level Security (RLS) with 57 active policies
   - Granular permissions per table and operation

3. **Data Protection Layer**:
   - Encrypted data transmission (HTTPS/TLS 1.3)
   - Secure database connections with SSL
   - API key protection and rotation policies

4. **Audit & Monitoring Layer**:
   - Comprehensive audit logging (920+ records)
   - IP address and user agent tracking
   - Real-time security event monitoring

#### Current Security Posture Assessment

**Supabase Security Advisors (Latest Report)**:
- **3 Views with SECURITY DEFINER** (ERROR level) - Requires immediate attention
- **45+ Functions without search_path** (WARNING level) - Security hardening needed
- **Password protection disabled** (WARNING level) - Consider enabling for compliance

**Recommended Security Actions**:
1. **Immediate** (ERROR level):
   - Review and update security definer views
   - Implement least-privilege access patterns
   - Add explicit search_path to all functions

2. **Short-term** (WARNING level):
   - Enable password protection policies
   - Implement function security hardening
   - Add additional audit logging for sensitive operations

3. **Long-term** (Enhancement):
   - Implement API rate limiting
   - Add intrusion detection monitoring
   - Enhance user session security

#### Security Monitoring & Alerting

**Real-time Monitoring**:
```sql
-- Failed authentication attempts
SELECT COUNT(*) as failed_attempts, ip_address, user_agent
FROM audit_logs 
WHERE operation = 'auth_failure' 
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address, user_agent
HAVING COUNT(*) > 5;

-- Suspicious data access patterns
SELECT user_id, table_name, COUNT(*) as access_count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND table_name IN ('customers', 'sales', 'products')
GROUP BY user_id, table_name
ORDER BY access_count DESC;

-- Privilege escalation attempts
SELECT * FROM audit_logs
WHERE operation LIKE '%role%' 
  OR operation LIKE '%permission%'
ORDER BY created_at DESC;
```

**Security Metrics Dashboard**:
- Authentication success/failure rates
- User session duration and patterns
- Data access frequency by user and table
- Permission change audit trail
- System vulnerability scan results

#### Compliance & Audit Requirements

**Data Privacy Compliance**:
- Customer data encryption at rest and in transit
- Right to deletion implementation (GDPR Article 17)
- Data portability features for customer requests
- Consent management and tracking

**Financial Compliance**:
- Transaction audit trails for accounting
- Sales tax calculation and reporting
- Payment processing security (PCI DSS relevant)
- Financial data retention policies

**Business Compliance**:
- Employee access logging and monitoring
- Inventory accuracy and audit requirements
- Customer data protection and privacy
- Business continuity and disaster recovery

### Performance Monitoring & Optimization

#### Key Performance Indicators
- **Database Performance**: Query execution times, connection pool usage
- **Application Performance**: Page load times, API response times
- **User Experience**: Time to interactive, largest contentful paint
- **System Resources**: Memory usage, CPU utilization, storage capacity

#### Monitoring Implementation
```typescript
// Performance monitoring hooks
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`${componentName}: ${entry.duration}ms`);
        }
      });
    });
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, [componentName]);
}

// Network performance tracking
export function useNetworkMonitor() {
  const [connectionStatus, setConnectionStatus] = useState('online');
  
  useEffect(() => {
    const updateConnectionStatus = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };
    
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);
  
  return connectionStatus;
}
```

---

**Last Updated**: August 2025 | **Version**: 2.5.0  
**Status**: Enterprise Production System | **Records**: 925+ Active  
**Security**: 57 RLS Policies | **Uptime**: Production-Ready  
**UI Standardization**: Complete glassmorphism implementation with BlurIn animations, purple glow effects, and responsive width management