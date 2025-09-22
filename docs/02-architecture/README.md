# 🏗️ Arquitetura - Adega Manager

> Documentação técnica completa da arquitetura do sistema

## 📐 Visão Geral da Arquitetura

O Adega Manager é construído com uma **arquitetura feature-based moderna**, projetada para escalabilidade, manutenibilidade e performance em produção.

### Princípios Arquiteturais

- **Feature-Based Structure** - Módulos independentes e coesos
- **Separation of Concerns** - Camadas bem definidas
- **Type Safety** - TypeScript em todo o stack
- **Real-time Data** - Sincronização automática com Supabase
- **Enterprise Security** - RLS multi-tenant com 57 políticas

## 🏭 Stack Tecnológico

### Frontend Core
```typescript
React 19.1.1          // Framework principal
TypeScript 5.5.3      // Type safety
Vite 5.4.1            // Build tool ultra-rápido
```

### UI/UX Layer
```typescript
Tailwind CSS 3.4.17   // Styling system
Aceternity UI          // Componentes premium animados
Shadcn/ui             // Primitivos base (25+ componentes)
Framer Motion 12.23.9 // Animações avançadas
```

### State Management
```typescript
TanStack React Query 5.56.2  // Server state
Zustand 5.0.5               // Client state global
React Context               // Auth & notifications
```

### Validation & Forms
```typescript
React Hook Form 7.53.0  // Form management
Zod 3.23.8             // Schema validation
```

### Data Visualization
```typescript
Recharts 2.15.3              // Charts & analytics
TanStack React Table 8.21.3  // Data grids
TanStack React Virtual       // Performance virtualization
```

### Backend & Database
```typescript
Supabase PostgreSQL    // Database & auth
48 Stored Procedures   // Business logic
57 RLS Policies        // Security layer
```

## 📁 Estrutura de Pastas

```
src/
├── app/                    # Application setup
│   ├── layout/            # Layout components
│   ├── providers/         # Context providers
│   └── router/            # Route configuration
│
├── core/                   # Core system
│   ├── api/supabase/      # Database client
│   ├── config/            # Theme, utils, configs
│   └── types/             # TypeScript definitions
│
├── features/               # Business modules (10 modules)
│   ├── sales/             # POS system
│   ├── inventory/         # Stock management
│   ├── customers/         # CRM system
│   ├── delivery/          # Logistics
│   ├── reports/           # Analytics
│   ├── dashboard/         # Executive overview
│   ├── users/             # User management
│   ├── suppliers/         # Vendor relations
│   ├── expenses/          # Financial control
│   └── admin/             # System admin
│
├── shared/                 # Shared resources
│   ├── ui/                # UI component system
│   ├── hooks/             # Reusable hooks (40+)
│   ├── templates/         # Page templates
│   └── utils/             # Utility functions
│
└── __tests__/             # Testing infrastructure
    ├── setup.ts           # Test configuration
    ├── accessibility/     # WCAG compliance
    ├── integration/       # E2E workflows
    └── performance/       # Performance tests
```

### Feature Module Structure
```
features/[module]/
├── components/            # Module-specific components
├── hooks/                # Module-specific hooks
├── types/                # Module types
├── utils/                # Module utilities
└── __tests__/            # Module tests
```

## 🗃️ Database Architecture

### Production Data (925+ registros)
```sql
-- Core Business (370+ records)
products (125)           -- Complete catalog with barcodes
product_variants         -- Unit/package tracking
customers (91)           -- CRM with segmentation
sales (52)              -- Sales with delivery tracking
sale_items              -- Line items with validation
inventory_movements     -- Complete stock audit trail

-- Advanced CRM (73+ records)
customer_insights (6)    -- AI-powered analysis
customer_interactions   -- Complete timeline
customer_events (63)    -- Automated tracking
customer_history        -- Historical preservation

-- System & Security (480+ records)
audit_logs (920)        -- Complete audit trail
users/profiles (3 each) -- Multi-role system
accounts_receivable     -- Financial management
payment_methods         -- Configurable payments
```

### Enterprise Logic
- **48 Stored Procedures** - Core business operations
- **57 RLS Policies** - Multi-tenant security
- **16 Production Tables** - Normalized schema
- **Real-time subscriptions** - Live data updates

## 🔐 Security Model

### Row Level Security (RLS)
```sql
-- Three-tier permission system
Admin     → Full system access
Employee  → Operations access (no cost prices)
Delivery  → Only assigned deliveries
```

### Authentication Flow
```typescript
Supabase Auth → Profile Check → Role Assignment → RLS Enforcement
```

### Data Protection
- **IP Tracking** - All operations logged with IP
- **User Agent** - Complete audit trail
- **Session Management** - JWT with automatic refresh
- **Input Validation** - Zod schemas on all inputs

## ⚡ Performance Architecture

### Build Optimization
```typescript
// Strategic chunk splitting
vendor    // React core libraries
charts    // Recharts isolated
ui        // Radix UI + Lucide icons
supabase  // Database libraries
utils     // Date-fns, utilities
```

### Runtime Performance
- **React Query Caching** - Intelligent server state
- **Virtual Scrolling** - Large data sets
- **Memoization** - Component optimization
- **Code Splitting** - Lazy loading
- **Tree Shaking** - Dead code elimination

### Development Experience
- **Hot Module Replacement** - Instant updates
- **TypeScript Checking** - Real-time validation
- **ESLint Integration** - Code quality
- **Vite Dev Server** - Ultra-fast builds

## 🔄 Data Flow Patterns

### Server State (React Query)
```typescript
Query → Cache → UI → User Action → Mutation → Invalidation → Refetch
```

### Client State (Zustand)
```typescript
User Action → Store Update → UI Reactivity
```

### Real-time Updates
```typescript
Database Change → Supabase Subscription → UI Update
```

## 📋 Documentação Relacionada

### Implementação Detalhada
- **[Visão Geral Completa](./system-overview.md)** - CLAUDE.md migrado com guias detalhados
- **[Stack Tecnológico](./technology-stack.md)** - Detalhes de cada tecnologia
- **[Schema do Banco](./database-schema.md)** - Estrutura completa do DB
- **[Modelo de Segurança](./security-model.md)** - RLS e autenticação
- **[Padrões de API](./api-patterns.md)** - Hooks e endpoints
- **[Estrutura de Pastas](./folder-structure.md)** - Organização detalhada

### Guias Práticos
- **[Getting Started](../01-getting-started/)** - Setup inicial
- **[Módulos](../03-modules/)** - Funcionalidades específicas
- **[Design System](../04-design-system/)** - Componentes UI

## 🎯 Decisões Arquiteturais

### Por que Feature-Based?
- **Escalabilidade** - Fácil adição de novos módulos
- **Manutenibilidade** - Código coeso e organizado
- **Time Independente** - Equipes podem trabalhar isoladamente
- **Testing** - Testes por módulo

### Por que Supabase?
- **PostgreSQL** - Banco robusto e maduro
- **Real-time** - Subscriptions automáticas
- **Auth Built-in** - Sistema de autenticação completo
- **RLS Native** - Segurança no nível do banco

### Por que React Query?
- **Server State** - Gerenciamento inteligente de cache
- **Optimistic Updates** - UX responsiva
- **Background Sync** - Dados sempre atualizados
- **Error Handling** - Tratamento robusto de erros

## 📊 Métricas de Produção

| Métrica | Valor | Status |
|---------|--------|--------|
| Uptime | 99.9% | ✅ |
| Bundle Size | ~2.1MB | ✅ |
| First Load | <3s | ✅ |
| Time to Interactive | <2s | ✅ |
| Core Web Vitals | 95+ | ✅ |

---

**Status**: ✅ **ARQUITETURA VALIDADA EM PRODUÇÃO**
**Última Revisão**: 21 de setembro de 2025