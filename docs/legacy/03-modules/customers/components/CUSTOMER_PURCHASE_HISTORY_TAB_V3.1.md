# CustomerPurchaseHistoryTab v3.3.2 - Component Reference

## 📋 Overview

O **CustomerPurchaseHistoryTab** é um componente SSoT v3.3.2 que implementa uma interface completa para visualização do histórico de compras do cliente com busca direta do banco de dados, filtros server-side, display de taxa de entrega e paginação aprimorada.

**Localização**: `src/features/customers/components/CustomerPurchaseHistoryTab.tsx`
**Versão**: 3.3.2 - SSoT Server-Side + Delivery Fee + Enhanced Pagination
**Status**: ✅ **PRODUCTION READY**

---

## 🎯 Principais Features

### ✅ **SSoT Architecture**
- Busca dados diretamente via hook `useCustomerPurchaseHistory`
- Interface simplificada com apenas `customerId` prop
- Estados de loading, error e empty integrados
- Eliminação total de dependências de props de dados

### ✅ **Advanced UI/UX**
- Filtros de período com seletor dropdown
- Busca em tempo real por produtos
- StatCards com métricas resumidas
- Glassmorphism effects e animações

### ✅ **Delivery Fee Display** (v3.3.2 - NEW)
- Breakdown visual: Produtos + Entrega = Total
- Display condicional (só aparece se delivery_fee > 0)
- Formatação monetária consistente
- Clareza total para usuário final

### ✅ **Enhanced Pagination** (v3.3.2 - NEW)
- Botão "Carregar Mais" com estado visual
- Loading indicator (Loader2) durante fetch
- Visibilidade condicional (pagination.hasMore)
- UX otimizada para listas grandes

### ✅ **Performance Optimized**
- Loading states granulares
- Error handling com retry functionality
- Cache automático via React Query
- Paginação eficiente (100 items/página)

---

## 🔧 API Reference

### **Component Interface**
```typescript
export interface CustomerPurchaseHistoryTabProps {
  customerId: string;   // ID do cliente (obrigatório)
  className?: string;   // Classes CSS adicionais (opcional)
}
```

### **Usage**
```typescript
import { CustomerPurchaseHistoryTab } from '@/features/customers/components/CustomerPurchaseHistoryTab';

// Uso básico
<CustomerPurchaseHistoryTab customerId="customer-uuid-123" />

// Com classes customizadas
<CustomerPurchaseHistoryTab
  customerId="customer-uuid-123"
  className="my-custom-class"
/>
```

---

## 🏗️ Component Architecture

### **State Management**
```typescript
const CustomerPurchaseHistoryTab = ({ customerId, className = '' }) => {
  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================

  const [filters, setFilters] = useState<PurchaseFilters>({
    searchTerm: '',
    periodFilter: 'all'
  });

  // ============================================================================
  // BUSINESS LOGIC COM SSoT v3.1.0
  // ============================================================================

  const {
    purchases,           // Dados das compras
    isLoading,          // Estado de carregamento
    error,              // Erros de API
    summary,            // Métricas calculadas
    formatPurchaseDate, // Utilitários de formatação
    formatPurchaseId,
    hasData,           // Estados derivados
    isEmpty,
    isFiltered,
    refetch            // Função de retry
  } = useCustomerPurchaseHistory(customerId, filters);
};
```

### **Component Structure**
```
CustomerPurchaseHistoryTab
├── Loading State (quando isLoading=true)
├── Error State (quando error existe)
└── Main Content
    ├── Header com Filtros
    │   ├── Título + Badge contador
    │   ├── SearchInput (busca por produtos)
    │   └── Select (filtro de período)
    ├── Resumo Financeiro (StatCards)
    │   ├── Total Gasto
    │   ├── Itens Comprados
    │   ├── Ticket Médio
    │   └── Número de Compras
    ├── Lista de Compras
    │   ├── Empty State (se não há dados)
    │   └── Purchase Cards (lista de compras com delivery fee breakdown)
    ├── Botão "Carregar Mais" (v3.3.2 - NEW)
    │   └── Visível quando pagination.hasMore === true
    ├── Loading Indicator (v3.3.2 - NEW)
    │   └── Loader2 durante fetch de páginas subsequentes
    └── Análise de Comportamento (se >= 2 compras)
        ├── Frequência de Compra
        ├── Tendência de Gastos
        └── Próxima Compra Esperada
```

---

## 💻 Implementation Details

### **1. Loading State**
```typescript
if (isLoading) {
  return (
    <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner text="Carregando histórico de compras..." />
      </div>
    </section>
  );
}
```

**Features**:
- Spinner dedicado com texto contextual
- Mantém layout consistent durante loading
- Design integrado com glassmorphism theme

### **2. Error State**
```typescript
if (error) {
  return (
    <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
      <Card className="bg-red-900/20 border-red-500/30">
        <CardContent className="p-6 text-center">
          <div className="text-red-400 text-lg">❌ Erro ao carregar histórico</div>
          <p className="text-gray-400 mt-2">{error.message}</p>
          <Button onClick={() => refetch()} className="mt-4 bg-red-600 hover:bg-red-700">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
```

**Features**:
- Erro visual claro com contexto
- Botão de retry que chama `refetch()`
- Design consistent com tema do sistema
- Mensagem de erro específica exibida

### **3. Filter System**
```typescript
// Filtro de período
const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 3 meses' },
  { value: '180', label: 'Últimos 6 meses' },
  { value: '365', label: 'Último ano' }
];

// Handlers otimizados
const handleSearchChange = useCallback((value: string) => {
  setFilters(prev => ({ ...prev, searchTerm: value }));
}, []);

const handlePeriodChange = useCallback((value: string) => {
  setFilters(prev => ({
    ...prev,
    periodFilter: value as PurchaseFilters['periodFilter']
  }));
}, []);
```

**Features**:
- Debounced search via SearchInput component
- Period filtering com opções predefinidas
- useCallback para otimização de re-renders
- State updates imutáveis

### **4. Summary Statistics**
```typescript
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard
    layout="crm"
    variant="success"
    title="Total Gasto"
    value={formatCurrency(summary.totalSpent)}
    description="💰 Valor total"
    icon={DollarSign}
    className="h-20"
    formatType="none"  // ✅ Evita double formatting
  />

  <StatCard
    layout="crm"
    variant="default"
    title="Itens Comprados"
    value={summary.totalItems}
    description="📦 Quantidade"
    icon={Package}
    className="h-20"
  />

  <StatCard
    layout="crm"
    variant="warning"
    title="Ticket Médio"
    value={formatCurrency(summary.averageTicket)}
    description="📊 Média por compra"
    icon={BarChart3}
    className="h-20"
    formatType="none"  // ✅ Evita double formatting
  />

  <StatCard
    layout="crm"
    variant="default"
    title="Compras"
    value={summary.purchaseCount}
    description="🛒 Total de compras"
    icon={CreditCard}
    className="h-20"
  />
</div>
```

**Features**:
- Real-time calculations via hook
- Formatação monetária consistente
- Layout responsivo (2 cols mobile, 4 desktop)
- formatType="none" para evitar conflitos

### **5. Purchase List Rendering**
```typescript
{hasData ? (
  purchases.map((purchase) => (
    <Card key={purchase.id} className="bg-gray-800/30 border-gray-700/40 hover:border-gray-600/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-white font-medium">
              {formatPurchaseId(purchase.id)}
            </div>
            <div className="text-sm text-gray-400">
              {formatPurchaseDate(purchase.date)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-400">
              {formatCurrency(purchase.total)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {purchase.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm bg-gray-900/30 rounded p-2">
              <span className="text-gray-300">{item.product_name}</span>
              <div className="flex gap-4 text-gray-400">
                <span>{item.quantity}x</span>
                <span>{formatCurrency(item.unit_price)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ))
) : (
  <EmptyStateComponent />
)}
```

**Features**:
- Hover effects para melhor UX
- Formatação consistente de dados
- Layout detalhado com produtos
- Empty state para quando não há dados

### **6. Delivery Fee Breakdown Display** (v3.3.2 - NEW)

```tsx
<div className="text-right">
  {/* Subtotal (produtos) */}
  <div className="text-sm text-gray-300">
    Produtos: {formatCurrency(purchase.subtotal)}
  </div>

  {/* Taxa de entrega (se houver) */}
  {purchase.delivery_fee > 0 && (
    <div className="text-xs text-blue-300">
      + Entrega: {formatCurrency(purchase.delivery_fee)}
    </div>
  )}

  {/* Total final */}
  <div className="text-xl font-bold text-accent-green">
    {formatCurrency(purchase.total)}
  </div>

  <div className="text-xs text-gray-300 font-medium">
    {purchase.items.length} {purchase.items.length === 1 ? 'item' : 'itens'}
  </div>
</div>
```

**Features**:
- Breakdown claro: Produtos + Entrega = Total
- Cor diferenciada para delivery (text-blue-300)
- Display condicional (só mostra se delivery_fee > 0)
- Hierarquia visual (subtotal menor, total em destaque)

### **7. Load More Pagination Button** (v3.3.2 - NEW)

```tsx
{/* Botão Carregar Mais */}
{pagination.hasMore && !isLoading && purchases.length > 0 && (
  <div className="flex justify-center">
    <Button
      onClick={loadMore}
      variant="outline"
      className="bg-black/50 border-accent-green/30 hover:bg-accent-green/10 hover:border-accent-green/60 text-white transition-all duration-300"
    >
      Carregar mais vendas
    </Button>
  </div>
)}

{/* Loading indicator para páginas subsequentes */}
{isLoading && purchases.length > 0 && (
  <div className="flex justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-accent-green" />
  </div>
)}
```

**Features**:
- Visibilidade condicional (pagination.hasMore && !isLoading && purchases.length > 0)
- Glassmorphism styling consistente com tema
- Loading indicator separado para páginas subsequentes
- Transições suaves (transition-all duration-300)

---

## 🎨 Styling & Theme

### **Glassmorphism Effects**
```typescript
const { handleMouseMove } = useGlassmorphismEffect();

<section
  className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300"
  onMouseMove={handleMouseMove}
>
```

### **Color Scheme**
- **Background**: `bg-black/80` com `backdrop-blur-sm`
- **Borders**: `border-white/10` para subtle separation
- **Text**: White primary, gray-400 secondary
- **Accents**: Green para valores monetários, blue para informações
- **Hover**: Purple shadows para interactive elements

### **Responsive Design**
- Grid responsivo: `grid-cols-2 md:grid-cols-4`
- Texto adaptativo: `hidden sm:inline`
- Flexbox para mobile-first approach
- Consistent spacing com Tailwind scale

---

## 🚀 Usage Examples

### **Basic Implementation**
```typescript
import { CustomerPurchaseHistoryTab } from '@/features/customers/components/CustomerPurchaseHistoryTab';

const CustomerProfile = ({ customerId }: { customerId: string }) => {
  return (
    <div className="space-y-6">
      <h1>Customer Profile</h1>

      <CustomerPurchaseHistoryTab customerId={customerId} />
    </div>
  );
};
```

### **Within Tabs System**
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { CustomerPurchaseHistoryTab } from '@/features/customers/components/CustomerPurchaseHistoryTab';

const CustomerTabs = ({ customerId }: { customerId: string }) => {
  return (
    <Tabs defaultValue="purchases">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="purchases">Histórico de Compras</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
      </TabsList>

      <TabsContent value="purchases">
        <CustomerPurchaseHistoryTab customerId={customerId} />
      </TabsContent>
    </Tabs>
  );
};
```

### **With Custom Styling**
```typescript
<CustomerPurchaseHistoryTab
  customerId={customerId}
  className="max-w-4xl mx-auto"
/>
```

---

## ⚡ Performance Optimizations

### **React Optimizations**
- `useCallback` para handlers de filtros
- Memoization automática via React Query no hook
- Key props corretas para list rendering
- Conditional rendering para estados

### **Loading Strategy**
- Loading state imediato para feedback
- Skeleton screens preparados para future versions
- Progressive enhancement approach
- Error boundaries recommended para parent components

### **Memory Management**
- Cleanup automático via React Query
- No memory leaks com proper effect cleanup
- Optimized re-rendering com dependency arrays corretas

---

## 🐛 Troubleshooting

### **Issue 1: Component Not Rendering**
```typescript
// Debug checklist:
1. Verificar se customerId prop está sendo passado
2. Verificar se customerId não é string vazia
3. Verificar console para erros do hook
4. Verificar permissões do usuário para dados do cliente
```

### **Issue 2: Filters Not Working**
```typescript
// Verificações:
1. Confirmar que filter state está sendo atualizado
2. Verificar se hook está recebendo filters corretos
3. Testar cada filtro individualmente
4. Verificar network tab para queries corretas
```

### **Issue 3: Styling Issues**
```typescript
// Soluções:
1. Verificar se Tailwind classes estão sendo aplicadas
2. Confirmar que glassmorphism hook está funcionando
3. Verificar responsive breakpoints
4. Testar em diferentes browsers/devices
```

### **Issue 4: Performance Issues**
```typescript
// Otimizações:
1. Verificar se hook está com cache configurado corretamente
2. Monitorar re-renders desnecessários
3. Considerar React.memo se necessário
4. Verificar se filters estão causando loops
```

---

## 🔮 Future Enhancements

### **v3.3 Completed** ✅
1. ~~**Delivery Fee Display**: Breakdown visual de taxas~~ ✅ Implementado (v3.3.2)
2. ~~**Enhanced Pagination**: Botão "Carregar Mais"~~ ✅ Implementado (v3.3.2)
3. ~~**Loading Indicators**: Visual feedback durante paginação~~ ✅ Implementado (v3.3.2)

### **v3.4 Planned Features**
1. **Export Functionality**: Download de dados filtrados
2. **Advanced Filters**: Filtros por valor, categoria, status
3. **Bulk Actions**: Operações em múltiplas compras
4. **Print Support**: Versão printable da lista

### **v3.5 Advanced Features**
1. **Real-time Updates**: Live updates com Supabase subscriptions
2. **Charts Integration**: Gráficos de tendências
3. **Mobile Optimizations**: Swipe gestures, mobile-specific UX
4. **Accessibility**: WCAG 2.1 AA compliance completa

---

## 📚 Related Documentation

- [useCustomerPurchaseHistory Hook v3.1.0](../hooks/CUSTOMER_PURCHASE_HISTORY_HOOK_V3.1.md)
- [Customer Profile Component](./CUSTOMER_PROFILE_HEADER.md)
- [SSoT Migration Guide v3.1.0](../../../06-operations/guides/SSOT_MIGRATION_GUIDE_V3.1.md)
- [StatCard Component Reference](../../../shared/ui/composite/stat-card.md)

---

## 👥 Support and Contributing

**Maintainer**: Adega Manager Team
**Architecture**: SSoT (Single Source of Truth) v3.3.2
**Created**: 2025-09-30
**Last Updated**: 2025-10-23 (v3.3.2 - Delivery Fee + Pagination)

**For technical support**: Verificar React DevTools e network tab para debugging
**For UI issues**: Verificar Tailwind classes e glassmorphism effects
**For data issues**: Verificar hook documentation e Supabase logs

---

## 📝 Changelog

### v3.3.2 (2025-10-23)
- ✅ Added delivery fee breakdown display (Produtos + Entrega = Total)
- ✅ Implemented "Carregar Mais" button with pagination
- ✅ Added Loader2 loading indicator for subsequent pages
- ✅ Enhanced purchase card layout with delivery fee support
- ✅ Imported Loader2 from lucide-react
- ✅ Destructured pagination and loadMore from hook

### v3.2.0 (2025-10-10)
- ✅ Behavioral metrics display
- ✅ Spending trend analysis
- ✅ Next purchase prediction

### v3.1.0 (2025-09-30)
- ✅ Initial SSoT implementation
- ✅ Server-side filters
- ✅ Real-time summary cards
- ✅ Glassmorphism design