# Pages and Tabs Guide - SSoT Implementation

## 📋 Overview

Guia completo de todas as páginas e abas do **Adega Manager** implementadas com arquitetura **SSoT (Single Source of Truth)**, detalhando propósito, funcionalidades, componentes e integração com o sistema.

---

## 🗂️ Estrutura de Navegação

### **Routing System**
```tsx
// /src/pages/Index.tsx - Main Router
const activeTab = location.pathname.split('/')[1] || 'dashboard';

// Suported routes:
/dashboard     // Dashboard Executivo
/sales        // Sistema POS
/inventory    // Gestão de Estoque
/customers    // CRM Avançado
/delivery     // Logística
/movements    // Movimentações
/suppliers    // Fornecedores
/users        // Gestão de Usuários
/reports      // Relatórios Avançados
/crm          // CRM Dashboard
/automations  // Centro de Automações
/customer/:id // Perfil do Cliente
```

### **Permission System**
```tsx
// Role-based access control
Admin: Full access to all pages/tabs
Employee: Operations access (no cost prices)
Delivery: Only delivery module access
```

---

## 🏠 1. Dashboard - Visão Executiva

### **📍 Localização**: `/dashboard`
### **🎯 Propósito**: KPIs executivos, alertas inteligentes e visão geral operacional

### **Componentes SSoT**:
```tsx
Dashboard.tsx
├── ExecutiveKPIs.tsx       # KPIs de alto nível
├── AlertsCarousel.tsx      # Sistema de alertas
├── QuickActions.tsx        # Ações rápidas
└── OperationalOverview.tsx # Visão operacional
```

### **Hooks SSoT Utilizados**:
- `useDashboardMetrics()` - Métricas consolidadas do negócio
- `useAlertSystem()` - Sistema de alertas inteligentes
- `useExecutiveKPIs()` - Indicadores de performance executiva

### **Métricas Exibidas**:
1. **Vendas Hoje** - Total de vendas do dia atual
2. **Faturamento Mensal** - Receita acumulada do mês
3. **Produtos em Baixa** - Itens com estoque crítico
4. **Clientes Ativos** - Clientes com atividade recente
5. **Entregas Pendentes** - Delivery queue status

### **Funcionalidades**:
- **Real-time KPIs** com atualizações automáticas
- **Sistema de alertas** contextual
- **Quick actions** para operações frequentes
- **Charts responsivos** para tendências
- **Navigation shortcuts** para módulos

---

## 💰 2. Sales - Sistema POS

### **📍 Localização**: `/sales`
### **🎯 Propósito**: Sistema completo de ponto de venda com carrinho inteligente

### **Componentes SSoT**:
```tsx
SalesPage.tsx
├── ProductsGrid.tsx        # Grid de produtos com busca
├── ShoppingCart.tsx        # Carrinho inteligente
├── CustomerSearch.tsx      # Busca de clientes
├── CheckoutFlow.tsx        # Fluxo de checkout
└── PaymentMethods.tsx      # Métodos de pagamento
```

### **Hooks SSoT Utilizados**:
- `useSalesOperations()` - Operações de venda centralizadas
- `useCartManagement()` - Gestão inteligente do carrinho
- `usePaymentProcessing()` - Processamento de pagamentos
- `useProductsSearch()` - Busca e filtros de produtos

### **Abas/Seções**:
1. **Products Grid** - Catálogo com busca por nome/categoria/barcode
2. **Shopping Cart** - Carrinho com cálculos automáticos
3. **Customer Selection** - Busca e seleção de clientes
4. **Payment & Checkout** - Finalização com múltiplos métodos

### **Funcionalidades**:
- **Barcode scanning** para produtos
- **Customer integration** com histórico
- **Multi-payment support** (dinheiro, cartão, PIX)
- **Real-time validation** de estoque
- **Automatic calculations** (subtotal, desconto, total)
- **Receipt generation** automática

---

## 📦 3. Inventory - Gestão de Estoque

### **📍 Localização**: `/inventory`
### **🎯 Propósito**: Controle completo de estoque com códigos de barra e análise de giro

### **Componentes SSoT**:
```tsx
InventoryManagement.tsx
├── ProductCatalog.tsx      # Catálogo de produtos
├── StockMovements.tsx      # Movimentações de estoque
├── BarcodeSystem.tsx       # Sistema de códigos de barra
├── StockAnalytics.tsx      # Analytics de giro
└── ProductVariants.tsx     # Variantes de produtos
```

### **Hooks SSoT Utilizados**:
- `useInventoryOperations()` - Operações de estoque centralizadas
- `useBarcodeSystem()` - Sistema de códigos de barra
- `useStockAnalytics()` - Analytics de estoque e giro
- `useProductVariants()` - Gestão de variantes

### **Abas/Seções**:
1. **Product Catalog** - Lista completa com filtros
2. **Stock Movements** - Histórico de movimentações
3. **Low Stock Alerts** - Produtos em baixa
4. **Barcode Management** - Gestão de códigos
5. **Analytics** - Giro e performance

### **Funcionalidades**:
- **Complete product catalog** com 12+ campos
- **Barcode support** (unit/package tracking)
- **Turnover analysis** (Fast/Medium/Slow classification)
- **Stock conversion** entre unidades e pacotes
- **Automated alerts** para reposição
- **Movement tracking** completo
- **Expandable modals** (1200px width) para melhor UX

---

## 👥 4. Customers - CRM Avançado ⭐ **SSoT v3.0.0**

### **📍 Localização**: `/customers` + `/customer/:id`
### **🎯 Propósito**: CRM completo com IA, analytics e timeline de atividades

### **Estrutura Principal**:
```tsx
// Lista de Clientes
CustomersLite.tsx
├── CustomersTable.tsx      # Tabela com paginação
├── CustomerFilters.tsx     # Filtros avançados
└── CustomerActions.tsx     # Ações em massa

// Perfil Individual
CustomerProfile.tsx (283 linhas - 80% redução)
├── CustomerProfileHeader.tsx   # Header com métricas reais
├── CustomerOverviewTab.tsx     # Dashboard + timeline
├── CustomerPurchaseHistoryTab.tsx # Histórico de compras
├── CustomerInsightsTab.tsx     # Analytics + IA
├── CustomerCommunicationTab.tsx # Central de comunicação
└── CustomerActionsTab.tsx      # Ações focadas em receita
```

### **Hooks SSoT Utilizados**:
- `useCustomerOperations()` - Operações centrais de clientes
- `useCustomerRealMetrics()` - Métricas reais em tempo real
- `useCustomerTimeline()` - Timeline consolidada de atividades
- `useCustomerAnalytics()` - Analytics e insights IA
- `useCustomerPurchaseHistory()` - Histórico de compras

### **Abas do Perfil (5 Tabs)**:

#### **4.1 Visão Geral** 📊
- **Dashboard de métricas** com dados reais
- **Timeline de atividades** consolidada (sales + interactions + events)
- **Métricas avançadas** (ticket médio, categoria favorita)
- **Purchase analytics** com charts

#### **4.2 Histórico de Compras** 🛒
- **Lista de compras** com filtros
- **Detalhes financeiros** e métodos de pagamento
- **Items purchased** por transação
- **Purchase patterns** e análises

#### **4.3 Insights & Analytics** 🧠
- **AI-powered insights** com confidence scores
- **Customer segmentation** automática
- **Behavioral analysis** e padrões
- **Recommendations** para ações

#### **4.4 Comunicação** 💬
- **Interaction history** completo
- **Communication tools** (WhatsApp, Email)
- **Message templates** e automações
- **Follow-up tracking**

#### **4.5 Ações Rápidas** ⚡ **NOVA**
- **Revenue-focused tools** para vendas
- **Quick actions** contextuais
- **Sales shortcuts** e templates
- **Marketing campaigns** direcionadas

### **Funcionalidades Avançadas**:
- **Automated segmentation** (High Value, Regular, Occasional, New)
- **Real-time metrics** com useCustomerRealMetrics
- **Timeline consolidada** de todas as atividades
- **AI insights** com machine learning
- **Profile completeness** indicators
- **Quick communication** (WhatsApp/Email integration)

---

## 🚚 5. Delivery - Logística

### **📍 Localização**: `/delivery`
### **🎯 Propósito**: Gestão completa de entregas com rastreamento em tempo real

### **Componentes SSoT**:
```tsx
Delivery.tsx
├── DeliveryQueue.tsx       # Fila de entregas
├── RouteManagement.tsx     # Gestão de rotas
├── DriverAssignment.tsx    # Atribuição de entregadores
├── TrackingSystem.tsx      # Sistema de rastreamento
└── DeliveryMetrics.tsx     # Métricas de performance
```

### **Hooks SSoT Utilizados**:
- `useDeliveryOperations()` - Operações de entrega centralizadas
- `useRouteOptimization()` - Otimização de rotas
- `useDeliveryTracking()` - Rastreamento em tempo real
- `useDriverManagement()` - Gestão de entregadores

### **Abas/Seções**:
1. **Delivery Queue** - Fila de entregas pendentes
2. **Active Deliveries** - Entregas em andamento
3. **Route Planning** - Planejamento de rotas
4. **Driver Management** - Gestão de entregadores
5. **Delivery History** - Histórico completo

### **Status Workflow**:
```
pending → preparing → out_for_delivery → delivered
```

### **Funcionalidades**:
- **Real-time tracking** com updates automáticos
- **Driver assignment** baseado em disponibilidade
- **Route optimization** para eficiência
- **Status notifications** para clientes
- **Performance metrics** para entregadores
- **Delivery history** completo

---

## 📋 6. Movements - Movimentações

### **📍 Localização**: `/movements`
### **🎯 Propósito**: Controle completo de movimentações de estoque e auditoria

### **Componentes SSoT**:
```tsx
Movements.tsx
├── MovementsList.tsx       # Lista de movimentações
├── MovementFilters.tsx     # Filtros por tipo/período
├── MovementDetails.tsx     # Detalhes da movimentação
└── AuditTrail.tsx         # Trilha de auditoria
```

### **Hooks SSoT Utilizados**:
- `useMovementsOperations()` - Operações de movimentação
- `useAuditTrail()` - Trilha de auditoria
- `useMovementFilters()` - Filtros e busca

### **Tipos de Movimento**:
1. **Entrada** - Recebimento de produtos
2. **Saída** - Venda ou transferência
3. **Ajuste** - Correções de estoque
4. **Fiado** - Vendas a prazo
5. **Devolução** - Produtos devolvidos

### **Funcionalidades**:
- **Complete audit trail** de todas as movimentações
- **Advanced filtering** por período, tipo, produto
- **Movement details** com histórico completo
- **Stock reconciliation** automática
- **User tracking** para todas as operações

---

## 🏢 7. Suppliers - Fornecedores

### **📍 Localização**: `/suppliers`
### **🎯 Propósito**: Gestão completa de fornecedores e relacionamento comercial

### **Componentes SSoT**:
```tsx
SuppliersManagement.tsx
├── SuppliersList.tsx       # Lista de fornecedores
├── SupplierProfile.tsx     # Perfil detalhado
├── PurchaseOrders.tsx      # Pedidos de compra
└── SupplierMetrics.tsx     # Métricas de performance
```

### **Hooks SSoT Utilizados**:
- `useSupplierOperations()` - Operações com fornecedores
- `usePurchaseOrders()` - Gestão de pedidos
- `useSupplierMetrics()` - Métricas de performance

### **Funcionalidades**:
- **Complete supplier profiles** com dados de contato
- **Purchase order management** e tracking
- **Performance analytics** e rating
- **Payment terms** e condições comerciais
- **Supplier evaluation** baseada em entregas

---

## 👤 8. Users - Gestão de Usuários

### **📍 Localização**: `/users`
### **🎯 Propósito**: Gestão completa de usuários e permissões

### **Componentes SSoT**:
```tsx
UserManagement.tsx
├── UsersList.tsx          # Lista de usuários
├── UserProfile.tsx        # Perfil e permissões
├── RoleManagement.tsx     # Gestão de papéis
└── UserActivity.tsx       # Atividade dos usuários
```

### **Roles System**:
1. **Admin** - Acesso completo ao sistema
2. **Employee** - Operações (sem preços de custo)
3. **Delivery** - Apenas módulo de entregas

### **Funcionalidades**:
- **Role-based access control** granular
- **User activity tracking** completo
- **Permission management** por módulo
- **User profile** com preferências
- **Security audit** para acessos

---

## 📊 9. Reports - Relatórios Avançados

### **📍 Localização**: `/reports`
### **🎯 Propósito**: Analytics avançados e relatórios personalizados

### **Componentes SSoT**:
```tsx
AdvancedReports.tsx
├── SalesReports.tsx        # Relatórios de vendas
├── InventoryReports.tsx    # Relatórios de estoque
├── CustomerReports.tsx     # Relatórios de clientes
└── FinancialReports.tsx    # Relatórios financeiros
```

### **Hooks SSoT Utilizados**:
- `useReportGeneration()` - Geração de relatórios
- `useReportData()` - Consolidação de dados
- `useReportExport()` - Exportação em múltiplos formatos

### **Tipos de Relatório**:
1. **Sales Analytics** - Top produtos, categorias, períodos
2. **Financial Reports** - Métodos de pagamento, DSO, aging
3. **Inventory Analysis** - Giro, baixa, performance
4. **Customer Insights** - Segmentação, LTV, comportamento

### **Funcionalidades**:
- **Real-time data** com fallback manual
- **Export options** (PDF, Excel, CSV)
- **Custom date ranges** e filtros
- **Scheduled reports** automáticos
- **Data visualization** com charts responsivos

---

## 🤖 10. Automations - Centro de Automações

### **📍 Localização**: `/automations`
### **🎯 Propósito**: Automações de marketing e operações

### **Componentes SSoT**:
```tsx
AutomationCenter.tsx
├── CampaignManager.tsx     # Gestão de campanhas
├── WorkflowBuilder.tsx     # Construtor de workflows
├── TriggerSystem.tsx       # Sistema de gatilhos
└── AutomationMetrics.tsx   # Métricas de automação
```

### **Tipos de Automação**:
1. **Marketing Campaigns** - Email e WhatsApp
2. **Customer Journeys** - Onboarding e retenção
3. **Inventory Alerts** - Reposição automática
4. **Sales Follow-ups** - Acompanhamento pós-venda

---

## 🎯 11. CRM Dashboard

### **📍 Localização**: `/crm`
### **🎯 Propósito**: Dashboard especializado para operações de CRM

### **Componentes SSoT**:
```tsx
CrmDashboard.tsx
├── CustomerOverview.tsx    # Visão geral de clientes
├── SalesPipeline.tsx      # Pipeline de vendas
├── ActivityFeed.tsx        # Feed de atividades
└── CrmMetrics.tsx         # Métricas de CRM
```

### **Funcionalidades**:
- **Customer segments** visualization
- **Sales pipeline** management
- **Activity tracking** em tempo real
- **Performance metrics** focadas em receita

---

## 📈 Performance & Optimization

### **SSoT Benefits Across All Pages**:
1. **Code Reduction**: 78% menos linhas de código
2. **Zero Duplication**: Lógica centralizada em hooks
3. **Performance**: Cache inteligente com React Query
4. **Maintainability**: Single source of truth
5. **Type Safety**: 100% cobertura TypeScript

### **Common Patterns**:
```tsx
// 1. Data Fetching Pattern
const { data, isLoading, error } = useEntityData(id);

// 2. Business Logic Pattern
const operations = useEntityOperations(data);

// 3. UI Rendering Pattern
return (
  <PageContainer>
    <EntityHeader {...operations} />
    <EntityTabs activeTab={tab} onTabChange={setTab}>
      {/* Tab content */}
    </EntityTabs>
  </PageContainer>
);
```

### **Shared Components**:
- `StatCard` - Métricas padronizadas com `formatType="none"`
- `LoadingSpinner` - Estados de carregamento
- `EmptyState` - Estados vazios
- `PaginationControls` - Paginação padronizada
- `SearchInput` - Busca com debounce

---

## 🔧 Development Guidelines

### **Adding New Pages/Tabs**:
1. **Follow SSoT pattern** - Centralize business logic in hooks
2. **Use shared components** - StatCard, LoadingSpinner, etc.
3. **Implement proper loading states** - Skeleton screens
4. **Add error boundaries** - Graceful error handling
5. **Test responsiveness** - Mobile-first approach

### **Best Practices**:
```tsx
// ✅ Correct SSoT implementation
const MyPage: React.FC = () => {
  const { data } = useEntityData(id);
  const operations = useEntityOperations(data);

  return (
    <PageContainer>
      <StatCard
        title="Metric"
        value={formatCurrency(operations.metric)}
        formatType="none" // ✅ Prevent FormatDisplay conflicts
      />
    </PageContainer>
  );
};
```

---

## 📚 Documentation Links

### **Architecture**:
- [SSoT System Architecture](./SSOT_SYSTEM_ARCHITECTURE.md)
- [Component Patterns](./CONTAINER_PRESENTATION_PATTERN.md)
- [Testing Standards](./TESTING_STANDARDS.md)

### **Specific Modules**:
- [Customer Module](../03-modules/customers/README.md)
- [Dashboard Module](../03-modules/dashboard/)
- [Sales Module](../03-modules/sales/)
- [Inventory Module](../03-modules/inventory/)

---

## 👥 Support

**Desenvolvido por**: Adega Manager Team
**Arquitetura**: SSoT (Single Source of Truth) v3.0.0
**Status**: ✅ **PRODUCTION READY** com todas as páginas funcionais
**Última atualização**: 2025-09-30

**Para adicionar novas páginas/abas**: Seguir padrões SSoT documentados e usar componentes compartilhados