# CustomerProfileHeader - SSoT Component Documentation

## 📋 Overview

O **CustomerProfileHeader** é um componente SSoT v3.0.0 que centraliza o cabeçalho do perfil do cliente com navegação, ações rápidas e métricas principais em tempo real, incluindo correções críticas implementadas para exibição correta de valores.

---

## 🏗️ Arquitetura do Componente

### **Localização**
```
/src/features/customers/components/CustomerProfileHeader.tsx
```

### **Propósito Principal**
Fornecer uma interface unificada no topo do perfil do cliente que exibe:
- **Navegação breadcrumb** responsiva
- **Botões de ação contextual** (Edit, WhatsApp, Email, Nova Venda)
- **Card principal** com avatar, informações básicas e métricas reais
- **Integração SSoT** com useCustomerOperations para validações
- **Glassmorphism effects** reutilizáveis

---

## 🎯 Funcionalidades Implementadas

### **1. Métricas Reais em Tempo Real**
```tsx
// Integração com useCustomerRealMetrics
const { data: realMetrics } = useCustomerRealMetrics(customerId);

// Exibição de métricas corretas
<StatCard
  title="Valor Total"
  value={formatCurrency(realMetrics?.lifetime_value_calculated || 0)}
  formatType="none" // ✅ CORREÇÃO CRÍTICA
/>
```

### **2. Sistema de Navegação**
```tsx
// Breadcrumb responsivo
<div className="flex items-center gap-4">
  <Button variant="ghost" onClick={onBack || handleBackDefault}>
    <ArrowLeft className="h-4 w-4" />
    Voltar
  </Button>
  <div className="text-sm text-gray-400">
    <span>Clientes</span>
    <span className="mx-2">/</span>
    <span className="text-white">{customer.cliente}</span>
  </div>
</div>
```

### **3. Ações Contextuais**
- **WhatsApp**: Integração automática com número do cliente
- **Email**: Abertura de cliente de email com template pré-preenchido
- **Nova Venda**: Redirecionamento para POS com cliente selecionado
- **Editar**: Modal de edição do perfil

---

## 🔧 Correções Críticas Implementadas

### **❌ Problema Original: Cards mostrando "—"**

**Sintomas observados**:
- Card "Valor Total" exibia "—" em vez de "R$ 188,00"
- Card "Dias Atrás" exibia "—" em vez de "0"

**Causa raiz identificada**:
```tsx
// ❌ ANTES - Conflito FormatDisplay
<StatCard
  value={formatCurrency(realMetrics?.lifetime_value_calculated || 0)}
  // formatType padrão "number" tentava processar "R$ 188,00"
/>
```

**Processo de debugging**:
1. **RPC function verificada**: `get_customer_real_metrics` funcionando corretamente
2. **Dados corretos no backend**: lifetime_value_calculated: 188, days_since_last_purchase: 0
3. **FormatDisplay analysis**: Tentativa de `Number("R$ 188,00")` = NaN → "—"

### **✅ Solução Implementada**

**Correção 1: Card "Valor Total"**
```tsx
// ✅ DEPOIS - Correção implementada
<StatCard
  layout="crm"
  variant="success"
  title="Valor Total"
  value={formatCurrency(realMetrics?.lifetime_value_calculated || 0)}
  description={`💰 LTV ${realMetrics?.data_sync_status.ltv_synced ? '✅' : '⚠️'}`}
  icon={DollarSign}
  className="h-24"
  formatType="none" // ✅ Evita reprocessamento pelo FormatDisplay
/>
```

**Correção 2: Card "Dias Atrás"**
```tsx
// ✅ DEPOIS - Correção implementada
<StatCard
  layout="crm"
  variant="warning"
  title="Dias Atrás"
  value={realMetrics?.days_since_last_purchase !== undefined ? realMetrics.days_since_last_purchase : '-'}
  description="⏱️ Última compra"
  icon={Calendar}
  className="h-24"
  formatType="none" // ✅ Evita reprocessamento pelo FormatDisplay
/>
```

**Resultado**:
- ✅ **Valor Total**: Agora exibe corretamente "R$ 188,00"
- ✅ **Dias Atrás**: Agora exibe corretamente "0"

---

## 📊 Props Interface

```tsx
export interface CustomerProfileHeaderProps {
  customer: CustomerData;
  realMetrics?: {
    lifetime_value_calculated?: number;
    total_purchases?: number;
    days_since_last_purchase?: number;
    data_sync_status: {
      ltv_synced: boolean;
      dates_synced: boolean;
      preferences_synced: boolean;
    };
  };
  onEdit: () => void;
  onBack?: () => void;
  onNewSale?: () => void;
  className?: string;
}
```

---

## 🎨 Layout e Design

### **Estrutura Visual**
```tsx
<div className="space-y-6">
  {/* Navigation Header */}
  <div className="flex items-center justify-between">
    <Breadcrumb />
    <ActionButtons />
  </div>

  {/* Customer Header Card */}
  <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <CustomerInfo />
        <MetricsGrid />
      </div>
    </CardContent>
  </Card>
</div>
```

### **Grid de Métricas (3 colunas)**
1. **Valor Total** (variant: success, icon: DollarSign)
2. **Compras** (variant: default, icon: ShoppingBag)
3. **Dias Atrás** (variant: warning, icon: Calendar)

---

## 🔍 Sistema de Alertas

### **Profile Completeness Indicator**
```tsx
// Campos que impactam relatórios
const reportFields = [
  {
    key: 'email',
    label: 'Email',
    required: true,
    impact: 'Necessário para campanhas de email marketing'
  },
  {
    key: 'telefone',
    label: 'Telefone',
    required: true,
    impact: 'Essencial para relatórios de WhatsApp'
  },
  {
    key: 'endereco',
    label: 'Endereço',
    required: false,
    impact: 'Importante para análises geográficas'
  }
];

const missingReportFields = reportFields.filter(
  field => !field.value || field.value === 'N/A'
);
```

### **Visual Indicators**
- **🔴 Perfil Incompleto**: Campos críticos em falta (email, telefone)
- **🟡 Perfil Básico**: Campos importantes em falta (endereço)
- **🟢 Perfil Completo**: Todos os campos preenchidos

---

## 🚀 Integrações SSoT

### **useCustomerOperations Integration**
```tsx
const { insights } = useCustomerOperations(customer);
```

### **Handlers Padronizados**
```tsx
const handleWhatsApp = () => {
  if (!customer?.telefone) {
    alert('Cliente não possui telefone cadastrado');
    return;
  }
  const phone = customer.telefone.replace(/\D/g, '');
  const message = `Olá ${customer.cliente}, tudo bem? Aqui é da Adega! 🍷`;
  const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

const handleEmail = () => {
  if (!customer?.email) {
    alert('Cliente não possui email cadastrado');
    return;
  }
  const subject = `Contato - Adega Wine Store`;
  const body = `Prezado(a) ${customer.cliente},\n\nEsperamos que esteja bem!`;
  const url = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank');
};

const handleNewSaleDefault = () => {
  const salesUrl = `/sales?customer_id=${customer.id}&customer_name=${encodeURIComponent(customer?.cliente || '')}`;
  window.open(salesUrl, '_blank');
};
```

---

## 📈 Performance e Otimizações

### **Memoization Strategy**
- **Props derivadas**: Calculadas apenas quando customer muda
- **Event handlers**: Memoizados para evitar re-renders
- **Missing fields**: Calculados uma vez por render

### **Lazy Loading**
- **Tooltips**: Carregados sob demanda
- **Icons**: Importados dinamicamente
- **Glassmorphism**: Aplicado progressivamente

---

## 🧪 Testing Strategy

### **Unit Tests**
```tsx
// Testes essenciais
describe('CustomerProfileHeader', () => {
  it('should display correct metrics with formatType="none"', () => {
    const mockMetrics = {
      lifetime_value_calculated: 188,
      days_since_last_purchase: 0
    };

    render(<CustomerProfileHeader realMetrics={mockMetrics} />);

    expect(screen.getByText('R$ 188,00')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle missing phone gracefully', () => {
    const customerWithoutPhone = { ...mockCustomer, telefone: null };
    render(<CustomerProfileHeader customer={customerWithoutPhone} />);

    const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
    expect(whatsappButton).toBeDisabled();
  });
});
```

### **Integration Tests**
- **Real metrics integration**: Teste com dados reais do Supabase
- **Navigation flow**: Teste de navegação back/forward
- **Action buttons**: Teste de integração com modais e redirecionamentos

---

## 🔄 Changelog

### **v3.0.1 - Correções Críticas (2025-09-30)**
- ✅ **FIXED**: Cards "Valor Total" e "Dias Atrás" agora exibem valores corretos
- ✅ **ADDED**: `formatType="none"` para evitar conflitos FormatDisplay
- ✅ **IMPROVED**: Verificação `!== undefined` para days_since_last_purchase
- ✅ **TESTED**: Validação com dados reais do Cliente Teste Analytics

### **v3.0.0 - SSoT Implementation**
- ✅ **MIGRATED**: Para arquitetura SSoT centralizada
- ✅ **ADDED**: Integração com useCustomerOperations
- ✅ **IMPROVED**: Profile completeness indicators
- ✅ **OPTIMIZED**: Performance com memoization

---

## 📚 Referencias e Links

### **Componentes Relacionados**
- [CustomerProfile.tsx](./CUSTOMER_PROFILE.md) - Componente pai
- [CustomerOverviewTab.tsx](./CUSTOMER_OVERVIEW_TAB.md) - Tab principal
- [StatCard Component](../../../shared/ui/composite/stat-card.md) - Card de métricas

### **Hooks SSoT**
- [useCustomerRealMetrics](../hooks/CUSTOMER_REAL_METRICS_HOOK.md) - Métricas reais
- [useCustomerOperations](../../../shared/hooks/business/useCustomerOperations.md) - Operações

### **Documentação Técnica**
- [SSoT System Architecture](../../../02-architecture/SSOT_SYSTEM_ARCHITECTURE.md)
- [FormatDisplay Component](../../../shared/ui/composite/FormatDisplay.md)

---

## 👥 Suporte

**Desenvolvido por**: Adega Manager Team
**Versão**: 3.0.1 - Production Ready com correções críticas
**Status**: ✅ **TESTADO E FUNCIONANDO**
**Última atualização**: 2025-09-30

**Para issues relacionadas**: Verificar integração com useCustomerRealMetrics e props formatType