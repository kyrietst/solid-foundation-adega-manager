# Customer Profile System Troubleshooting Guide

**Versão:** 2.0.4
**Última Atualização:** 10 de Outubro, 2025
**Audience:** Desenvolvedores, DevOps, Support Team

---

## 📋 **Índice**

1. [Problemas Comuns](#problemas-comuns)
2. [Diagnóstico Rápido](#diagnóstico-rápido)
3. [React Error #31](#react-error-31)
4. [Database Schema Issues](#database-schema-issues)
5. [RPC/Stored Procedure Errors](#rpcstored-procedure-errors)
6. [Hook Destructuring Errors](#hook-destructuring-errors)
7. [Hardcoded Insights Issue](#hardcoded-insights-issue) ✨ **NEW v2.0.4**
8. [Completeness Calculation Inconsistency](#completeness-calculation-inconsistency) ✨ **NEW v2.0.4**
9. [Performance Issues](#performance-issues)
10. [Prevention Best Practices](#prevention-best-practices)

---

## 🚨 **Problemas Comuns**

### **❌ Sintomas Frequentes:**
- Cliente não consegue abrir perfil de customer
- React Error #31 no console
- 400 Bad Request errors
- 404 RPC errors
- TypeError: function is not a function

### **🔍 Como Identificar:**
```bash
# 1. Verificar console do navegador
F12 → Console → Buscar por:
- "React error #31"
- "400 Bad Request"
- "404 Not Found"
- "TypeError"

# 2. Verificar logs do Supabase
Dashboard → Logs → API Logs
```

---

## 🎯 **Diagnóstico Rápido**

### **Quick Health Check:**
```sql
-- 1. Verificar se tabela customers existe
SELECT COUNT(*) FROM customers LIMIT 1;

-- 2. Verificar estrutura de endereços JSONB
SELECT address FROM customers WHERE address IS NOT NULL LIMIT 3;

-- 3. Verificar colunas sales
SELECT column_name FROM information_schema.columns
WHERE table_name = 'sales' AND column_name LIKE '%total%';
```

### **React Component Health Check:**
```javascript
// 1. Verificar se hooks estão retornando dados corretos
console.log('Hook return:', useCustomerOverviewSSoT(customerId));

// 2. Verificar se customer.address é objeto
console.log('Address type:', typeof customer.address, customer.address);
```

---

## 🔴 **React Error #31**

### **Descrição:**
```
Minified React error #31; visit https://react.dev/errors/31?args[]=object%20with%20keys%20%7Braw%2C%20city%2C%20state%2C%20street%2C%20country%7D
```

### **Causa Raiz:**
Tentativa de renderizar objeto JSONB diretamente como texto React.

### **Como Identificar:**
```javascript
// ❌ ERRO: Renderizar objeto diretamente
<span>{customer.address}</span> // address é objeto JSONB

// ✅ CORRETO: Usar função de formatação
<span>{formatAddress(customer.address)}</span>
```

### **Solução:**

#### **1. Implementar formatAddress utility:**
```typescript
// src/core/config/utils.ts
export interface AddressData {
  raw?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}

export function formatAddress(address: any): string {
  if (!address) return '';
  if (typeof address === 'string') return address;

  if (typeof address === 'object') {
    const addr = address as AddressData;
    if (addr.raw) return addr.raw;

    const parts = [addr.street, addr.city, addr.state, addr.country].filter(Boolean);
    return parts.join(', ') || '';
  }

  return '';
}
```

#### **2. Atualizar componentes:**
```typescript
// Import the utility
import { formatAddress } from '@/core/config/utils';

// Use in JSX
<span>{formatAddress(customer.address)}</span>
```

### **Componentes Afetados:**
- `CustomerProfileHeader.tsx`
- `CustomerCard.tsx`
- Qualquer componente que renderize `customer.address`

---

## 🗄️ **Database Schema Issues**

### **Erro Comum:**
```
400 Bad Request: column "sales.total" does not exist
```

### **Diagnóstico:**
```sql
-- Verificar colunas existentes na tabela sales
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sales'
ORDER BY ordinal_position;
```

### **Soluções:**

#### **Sales Table Column Mapping:**
```typescript
// ❌ INCORRETO
.select('id, total, created_at')

// ✅ CORRETO
.select('id, total_amount, created_at')
```

#### **Customers Table Column Mapping:**
```typescript
// ✅ CAMPOS EXISTENTES CONFIRMADOS
.select(`
  id,
  name,
  email,
  phone,
  segment,
  lifetime_value,
  last_purchase_date,
  created_at
`)
```

### **Prevention:**
```sql
-- Sempre verificar schema antes de usar
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'target_table'
ORDER BY ordinal_position;
```

---

## 🔧 **RPC/Stored Procedure Errors**

### **Erro Comum:**
```
404 Not Found: /rest/v1/rpc/get_customer_metrics
```

### **Causa:**
Stored procedure não existe no banco de dados.

### **Diagnóstico:**
```sql
-- Verificar RPCs existentes
SELECT proname
FROM pg_proc
WHERE proname LIKE '%customer%';
```

### **Solução:**

#### **Implementar Manual Fallback:**
```typescript
// ❌ DEPENDÊNCIA DE RPC
const { data } = await supabase.rpc('get_customer_metrics', { customer_id });

// ✅ CÁLCULO MANUAL
const { data: sales } = await supabase
  .from('sales')
  .select(`
    id,
    total_amount,
    created_at,
    sale_items (quantity, unit_price)
  `)
  .eq('customer_id', customerId);

const metrics = {
  total_purchases: sales?.length || 0,
  total_spent: sales?.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0) || 0,
  avg_purchase_value: sales?.length ? totalSpent / sales.length : 0
};
```

### **Prevention:**
- Sempre implementar fallbacks para RPCs
- Não depender de stored procedures para lógica crítica
- Usar queries diretas quando possível

---

## ⚡ **Hook Destructuring Errors**

### **Erro Comum:**
```
TypeError: getCustomerStatusData is not a function
```

### **Causa:**
Hook retorna propriedades mas componente espera funções.

### **Diagnóstico:**
```typescript
// Verificar retorno real do hook
const hookReturn = useCustomerOverviewSSoT(customerId);
console.log('Hook return keys:', Object.keys(hookReturn));
```

### **Solução:**

#### **Verificar Interface de Retorno:**
```typescript
// Hook interface
export interface CustomerOverviewOperations {
  customer: CustomerData | null;
  metrics: CustomerMetrics | null;
  customerStatus: CustomerStatus;
  // ... outras propriedades, NÃO funções
}
```

#### **Corrigir Destructuring:**
```typescript
// ❌ INCORRETO - Esperando função que não existe
const { getCustomerStatusData } = useCustomerOverviewSSoT(customerId);

// ✅ CORRETO - Usar propriedades existentes
const {
  customer,
  metrics,
  customerStatus,
  profileCompleteness
} = useCustomerOverviewSSoT(customerId);
```

### **Prevention:**
- Sempre verificar interfaces dos hooks
- Usar TypeScript para catch errors em tempo de compilação
- Fazer console.log para verificar estruturas de retorno

---

## 🔢 **Hardcoded Insights Issue** ✨ **NEW v2.0.4**

### **Erro Comum:**
```
Customer profile showing "0 insights" despite having real insights in database
```

### **Sintomas:**
- Card "Preferência & Perfil" mostra "0 insights"
- Database query confirms insights exist (e.g., 4 insights)
- Insights confidence also showing 0%

### **Causa Raiz:**
Hardcoded values em `useCustomerOverviewSSoT.ts`:
```typescript
// ❌ PROBLEMA - Linha 356 (antes do fix)
insights_count: 0, // TODO: Buscar de customer_insights
insights_confidence: 0,
```

### **Diagnóstico:**
```sql
-- Verificar insights reais no banco
SELECT
  COUNT(*) as insights_count,
  AVG(confidence) as avg_confidence
FROM customer_insights
WHERE customer_id = 'SEU_CUSTOMER_ID'
  AND is_active = true;
```

### **Solução Aplicada (v2.0.4):**

#### **Passo 1: Adicionar Query de Insights**
```typescript
// src/shared/hooks/business/useCustomerOverviewSSoT.ts (linhas 293-307)
// Buscar insights do cliente
const { data: insightsData, error: insightsError } = await supabase
  .from('customer_insights')
  .select('confidence')
  .eq('customer_id', customerId)
  .eq('is_active', true);

if (insightsError) {
  console.error('⚠️ Erro ao buscar insights (não crítico):', insightsError);
}

const insightsCount = insightsData?.length || 0;
const avgConfidence = insightsData && insightsData.length > 0
  ? insightsData.reduce((sum, insight) => sum + (insight.confidence || 0), 0) / insightsData.length
  : 0;
```

#### **Passo 2: Usar Valores Calculados**
```typescript
// Linhas 372-373
return {
  // ... outros campos
  insights_count: insightsCount,        // ✅ Valor real do banco
  insights_confidence: avgConfidence,   // ✅ Confiança média calculada
  // ... outros campos
};
```

### **Validação:**
```typescript
// Console do navegador
const { metrics } = useCustomerOverviewSSoT(customerId);
console.log('Insights:', metrics?.insights_count); // Deve mostrar 4 (não 0)
console.log('Confidence:', metrics?.insights_confidence); // Deve mostrar 0.89 (não 0)
```

### **Prevention:**
- ✅ Evitar hardcoding de valores que existem no banco
- ✅ Sempre buscar dados reais mesmo para campos "opcionais"
- ✅ Usar queries não-críticas (não fazer throw em error)
- ✅ Documentar TODOs claramente quando temporário

---

## 📊 **Completeness Calculation Inconsistency** ✨ **NEW v2.0.4**

### **Erro Comum:**
```
Different completeness percentages shown in table (78%) vs profile (90%)
```

### **Sintomas:**
- Customer table shows completeness: 78%
- Customer profile shows completeness: 90%
- Same customer data, different calculations

### **Causa Raiz:**
Dois sistemas de cálculo diferentes:

1. **Table Calculation** (completeness-calculator.ts):
```typescript
const weights = {
  email: 20,
  phone: 20,
  birthday: 15,
  address: 15,
  purchase_frequency: 15,
  favorite_category: 8,
  favorite_product: 7
};
// Total: 100 pontos
```

2. **Profile Calculation** (useCustomerOverviewSSoT.ts - ANTES DO FIX):
```typescript
const weights = {
  email: 25,
  phone: 25,
  address: 20,
  hasRealPurchases: 20,
  hasInsights: 10
};
// Total: 100 pontos, mas pesos diferentes!
```

### **Diagnóstico:**
```typescript
// 1. Verificar cálculo na tabela
import { calculateCompleteness } from '@/features/customers/utils/completeness-calculator';
const tableResult = calculateCompleteness(customerData);
console.log('Table completeness:', tableResult.percentage); // 78%

// 2. Verificar cálculo no perfil (antes do fix)
const { profileCompleteness } = useCustomerOverviewSSoT(customerId);
console.log('Profile completeness:', profileCompleteness); // 90%
```

### **Solução Aplicada (v2.0.4):**

#### **Passo 1: Importar Função Unificada**
```typescript
// src/shared/hooks/business/useCustomerOverviewSSoT.ts (linha 23)
import { calculateCompleteness } from '@/features/customers/utils/completeness-calculator';
```

#### **Passo 2: Adicionar Campo Birthday**
```typescript
// Interface (linha 35)
export interface CustomerOverviewData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  birthday?: string; // ✅ Adicionado
  // ... outros campos
}

// Query (linha 228)
const { data, error } = await supabase
  .from('customers')
  .select(`
    id,
    name,
    email,
    phone,
    address,
    birthday,  // ✅ Adicionado à query
    // ... outros campos
  `)
```

#### **Passo 3: Usar Cálculo Unificado**
```typescript
// Linhas 613-637
const profileCompleteness = useMemo((): number => {
  if (!customer) return 0;

  // ✅ Usar o cálculo unificado do completeness-calculator.ts
  const customerData = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    birthday: customer.birthday, // ✅ Dados reais
    last_purchase_date: metrics?.last_purchase_real,
    favorite_category: metrics?.calculated_favorite_category,
    favorite_product: metrics?.calculated_favorite_product,
    notes: customer.notes,
    contact_permission: customer.contact_permission,
    created_at: customer.created_at,
  };

  const result = calculateCompleteness(customerData);
  return result.percentage; // ✅ Mesma lógica que a tabela
}, [customer, metrics]);
```

### **Resultado:**
- ✅ **Table**: 78% (usando completeness-calculator.ts)
- ✅ **Profile**: 78% (usando completeness-calculator.ts)
- ✅ **Single Source of Truth** mantida

### **Validação:**
```typescript
// Verificar consistência
const { data: customers } = await supabase
  .from('customers')
  .select('*')
  .eq('id', customerId)
  .single();

const tableCalc = calculateCompleteness(customers);
const { profileCompleteness } = useCustomerOverviewSSoT(customerId);

console.log('Match:', tableCalc.percentage === profileCompleteness); // true ✅
```

### **Prevention:**
- ✅ **Single Source of Truth**: Uma função para todos os cálculos
- ✅ **Shared Utilities**: Centralizar lógicas complexas em utils
- ✅ **Import Reutilização**: Importar ao invés de duplicar código
- ✅ **Unit Tests**: Testar cálculos com dados conhecidos

---

## 🚀 **Performance Issues**

### **Sintomas:**
- Customer profile demora para carregar
- UI freeze durante carregamento
- Memory leaks

### **Diagnóstico:**
```typescript
// 1. Verificar React Query cache
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log('Cache data:', queryClient.getQueryData(['customer-insights-data', customerId]));

// 2. Verificar re-renders desnecessários
console.log('Component re-render:', { customerId, timestamp: Date.now() });
```

### **Soluções:**

#### **Otimizar React Query:**
```typescript
const { data } = useQuery({
  queryKey: ['customer-data', customerId],
  queryFn: fetchCustomerData,
  staleTime: 5 * 60 * 1000, // 5 min cache
  refetchInterval: false, // Disable auto-refresh
  refetchOnWindowFocus: false, // Avoid unnecessary refetches
});
```

#### **Implementar useMemo para Cálculos:**
```typescript
const expensiveCalculation = useMemo(() => {
  return rawPurchases.reduce((acc, purchase) => {
    // Complex calculations here
    return acc;
  }, {});
}, [rawPurchases]);
```

---

## 🛡️ **Prevention Best Practices**

### **1. Database Schema Validation**
```typescript
// Sempre verificar schema antes de queries
const validateSchema = async (tableName: string, columns: string[]) => {
  const { data } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', tableName);

  const existingColumns = data?.map(col => col.column_name) || [];
  const missingColumns = columns.filter(col => !existingColumns.includes(col));

  if (missingColumns.length > 0) {
    console.error('Missing columns:', missingColumns);
  }
};
```

### **2. Type-Safe JSONB Handling**
```typescript
// Sempre verificar tipo antes de renderizar
const renderSafeValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
```

### **3. Error Boundary Implementation**
```typescript
// Componente ErrorBoundary para customer profile
class CustomerProfileErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Customer Profile Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Erro ao carregar perfil do cliente. Tente novamente.</div>;
    }

    return this.props.children;
  }
}
```

### **4. Development vs Production Differences**
```typescript
// Environment-aware error handling
const isDevelopment = process.env.NODE_ENV === 'development';

const handleError = (error: Error) => {
  if (isDevelopment) {
    console.error('Full error details:', error);
  } else {
    // Log to external service in production
    console.error('Customer profile error:', error.message);
  }
};
```

---

## 📞 **Support Contact**

### **Escalation Path:**
1. **Level 1:** Verificar este troubleshooting guide
2. **Level 2:** Consultar logs de Supabase e React
3. **Level 3:** Verificar database schema changes
4. **Level 4:** Contatar desenvolvimento para análise de código

### **Information to Gather:**
- Customer ID que está falhando
- Browser e versão
- Console errors exatos
- Steps to reproduce
- Production vs development behavior

### **Quick Fix Commands:**
```bash
# Clear build cache
rm -rf node_modules/.vite .vite dist
npm install
npm run build

# Database health check
npm run db:status

# Rebuild with fresh dependencies
npm run dev
```

---

**📚 Related Documentation:**
- `CUSTOMER_PROFILE_FIXES_v2.0.2.md`
- `CUSTOMER_PROFILE_FIXES_v2.0.4.md` ✨ **NEW**
- `SSOT_ARCHITECTURE_GUIDE.md`
- `DATABASE_SCHEMA_COMPLIANCE.md`

**🔄 Last Updated:** October 10, 2025 - v2.0.4 fixes applied (Hardcoded Insights + Completeness Unification)