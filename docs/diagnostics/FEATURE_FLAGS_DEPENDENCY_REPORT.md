# Relatório de Análise de Dependências - Épico 2.5

**Data da Análise:** 20 de Setembro de 2025
**Analista:** Claude Code (Senior Frontend Engineer)
**Objetivo:** Mapear dependências críticas entre módulos ativos e inativos para implementação segura de feature flags

---

## 1. Resumo do Risco

**🔴 RISCO ALTO**

A análise identificou **3 dependências críticas** que podem causar falhas completas na aplicação se os módulos inativos forem desabilitados sem mitigação adequada. As dependências mais graves estão no módulo de **Vendas (PDV)**, que possui dependências diretas e profundas com o sistema de CRM.

---

## 2. Análise de Dependências por Módulo

### Módulo: Vendas (PDV) - **🔴 CRÍTICO**

#### **Dependência Crítica 1:** Componente `CustomerSearch`
- **Arquivo de Origem:** `src/features/sales/components/CustomerSearch.tsx`
- **Usado Em:** `src/features/sales/components/FullCart.tsx` (linha 22)
- **Depende de:**
  - Hook `useCustomers` de `@/features/customers/hooks/use-crm` (linha 17)
  - Tipo `CustomerProfile` de `@/features/customers/hooks/use-crm` (linha 17)
- **Análise de Risco:** **CRÍTICO - A página inteira de vendas quebrará**
  - O componente de busca de clientes é OBRIGATÓRIO no carrinho de vendas
  - Sem acesso aos hooks do CRM, o componente gerará erro 404/import failure
  - O POS inteiro ficará inutilizável
- **Impacto Funcional:**
  - Impossibilidade de associar vendas a clientes
  - Perda da funcionalidade de vendas identificadas vs anônimas
  - Quebra do fluxo completo de checkout

#### **Dependência Crítica 2:** Componente `CustomerForm`
- **Arquivo de Origem:** `src/features/customers/components/CustomerForm.tsx`
- **Usado Em:** `src/features/sales/components/FullCart.tsx` (linha 23)
- **Depende de:**
  - Hook `useUpsertCustomer` de `@/features/customers/hooks/use-crm` (linha 22)
- **Análise de Risco:** **CRÍTICO - Modal de cadastro de cliente quebrará**
  - Botão "Cadastrar Cliente" no POS ficará não funcional
  - Erro de importação causará crash do componente pai
- **Recomendação:** **Remoção condicional do botão baseada em feature flag**

#### **Dependência Crítica 3:** Hook `useCustomer`
- **Arquivo de Origem:** `src/features/sales/components/FullCart.tsx` (linha 9)
- **Depende de:** Hook `useCustomer` de `@/features/customers/hooks/use-crm`
- **Análise de Risco:** **CRÍTICO - Lógica de carrinho quebrará**
  - Hook usado para buscar dados do cliente selecionado (linha 45)
  - Componente não renderizará se o hook falhar
- **Recomendação:** **Implementar fallback ou mock do hook**

#### **Dependência de Hook:** `useCustomer` (linha 9)
- **Usado para:** Buscar dados do cliente selecionado no carrinho
- **Risco:** Hook falhará se módulo CRM estiver desabilitado
- **Recomendação:** Implementar fallback que retorna `null` quando CRM inativo

---

### Módulo: Estoque - **🟢 BAIXO RISCO**

#### **Análise Completa:**
- **Arquivo Principal:** `src/features/inventory/components/InventoryManagement.tsx`
- **Dependências Externas:** ✅ **NENHUMA DEPENDÊNCIA CRÍTICA ENCONTRADA**
- **Importações Analisadas:**
  - Todas as importações são de módulos compartilhados (`@/shared/`) ou internos (`@/features/inventory/`)
  - Componentes modais (NewProductModal, EditProductModal, etc.) são autônomos
  - Hooks usados (`useProductsGridLogic`, `useMutation`, etc.) são internos ou do sistema de cache

#### **Recomendação:** ✅ **SEGURO para implementação de feature flags sem modificações**

---

### Módulo: Dashboard - **🟡 RISCO MÉDIO**

#### **Dependência 1:** Hooks de KPIs de Clientes
- **Arquivo de Origem:** `src/features/dashboard/hooks/useDashboardKpis.ts`
- **Função:** `useCustomerKpis` (linhas 116-177)
- **Depende de:** Tabela `customers` via Supabase direto
- **Análise de Risco:** **MÉDIO - KPI de clientes ficará vazio**
  - Hook consulta diretamente a tabela `customers` no banco
  - Não há dependência de importação de código do módulo CRM
  - Funcionará mesmo com módulo CRM desabilitado na UI
- **Recomendação:** **Ocultar cards de clientes condicionalmente**

#### **Dependência 2:** Hooks de KPIs de Despesas
- **Arquivo de Origem:** `src/features/dashboard/hooks/useDashboardExpenses.ts`
- **Função:** `useDashboardExpenses` e `useDashboardBudgetVariance`
- **Depende de:** Stored procedures de despesas (`get_expense_summary`, `calculate_budget_variance`)
- **Análise de Risco:** **MÉDIO - Cards de despesas falharão**
  - Se módulo de despesas estiver desabilitado, stored procedures podem falhar
  - Cards de "Despesas OpEx", "Variação Orçamentária" e "Margem Líquida" ficarão em erro
- **Recomendação:** **Implementar fallback para KPIs de despesas**

#### **Dependência 3:** Cards de KPIs no Dashboard
- **Arquivo de Origem:** `src/features/dashboard/components/DashboardPresentation.tsx`
- **Função:** `KpiSection` (linhas 109-220)
- **Cards Afetados:**
  - **"Clientes Ativos"** (linha 162-171) - depende de dados de vendas com customer_id
  - **"Despesas OpEx"** (linha 174-184) - depende do módulo de despesas
  - **"Variação Orçamentária"** (linha 185-197) - depende do módulo de despesas
  - **"Margem Líquida"** (linha 198-209) - depende do módulo de despesas
- **Recomendação:** **Ocultar condicionalmente os cards baseado nas feature flags ativas**

---

## 3. Análise de Dependências Indiretas

### **Shared/Common Dependencies** ✅
- Todos os módulos ativos usam extensivamente `@/shared/ui/` e `@/shared/hooks/`
- Estes componentes compartilhados são **SEGUROS** - não possuem dependências dos módulos inativos
- Sistema de hooks como `useToast`, `usePagination`, etc. são independentes

### **Supabase Direct Queries** ⚠️
- Dashboard faz consultas diretas ao banco de dados
- Mesmo com módulos UI desabilitados, dados ainda estarão disponíveis
- **Risco:** Stored procedures de módulos inativos podem falhar

---

## 4. Conclusão e Plano de Mitigação

### **Risco Geral: 🔴 ALTO**

**Pontos Críticos Identificados:**

1. **POS (Vendas) tem dependências HARD CODED com CRM** - Sistema quebrará completamente
2. **Dashboard tem dependências SOFT com vários módulos** - Cards ficarão em erro mas aplicação não quebra
3. **Estoque é completamente independente** - Seguro para implementação

### **Estratégia de Mitigação Recomendada:**

#### **FASE 1: Preparação Crítica (Pré-Feature Flags)**

1. **Refatorar CustomerSearch no POS:**
   ```typescript
   // Implementar wrapper condicional
   const CustomerSearchWrapper = () => {
     const isCrmEnabled = useFeatureFlag('crm_module');
     if (!isCrmEnabled) {
       return <AnonymousCustomerOnlyMode />;
     }
     return <CustomerSearch />;
   };
   ```

2. **Implementar Hook Fallbacks:**
   ```typescript
   // src/shared/hooks/fallbacks/useCustomerFallback.ts
   export const useCustomerFallback = (customerId: string) => {
     const isCrmEnabled = useFeatureFlag('crm_module');
     const realHook = useCustomer(customerId);

     if (!isCrmEnabled) {
       return { data: null, isLoading: false, error: null };
     }
     return realHook;
   };
   ```

3. **Condicionalizar Modal de Cadastro:**
   ```typescript
   // Ocultar botão "Cadastrar Cliente" quando CRM inativo
   {isCrmEnabled && (
     <Button onClick={() => setIsCustomerModalOpen(true)}>
       Cadastrar Cliente
     </Button>
   )}
   ```

#### **FASE 2: Dashboard Safety (Simultâneo)**

1. **Cards Condicionais:**
   ```typescript
   const items = [
     // KPIs básicos sempre visíveis
     ...basicKpis,
     // KPIs condicionais
     ...(useFeatureFlag('customers_module') ? customerKpis : []),
     ...(useFeatureFlag('expenses_module') ? expenseKpis : [])
   ];
   ```

2. **Error Boundaries por Seção:**
   ```typescript
   <ErrorBoundary fallback={<KpiCardSkeleton />}>
     <CustomerKpis />
   </ErrorBoundary>
   ```

#### **FASE 3: Validação e Testes**

1. **Testar cenários de falha:**
   - POS sem CRM ativo
   - Dashboard sem módulos opcionais
   - Transição liga/desliga feature flags

2. **Implementar logging:**
   - Monitorar tentativas de acesso a módulos inativos
   - Alertas para dependências quebradas

---

### **Cronograma Recomendado:**

- **Dia 1-2:** Implementar fallbacks críticos do POS
- **Dia 3:** Refatorar dashboard para cards condicionais
- **Dia 4:** Testes de integração completos
- **Dia 5:** Deploy e monitoramento

### **Success Criteria:**

✅ POS funciona completamente sem módulo CRM (vendas anônimas apenas)
✅ Dashboard carrega sem erros mesmo com módulos inativos
✅ Estoque permanece 100% funcional
✅ Transições liga/desliga feature flags não quebram a aplicação
✅ Nenhum erro 404 ou import failure na console

---

**⚠️ ATENÇÃO:** Sem essas mitigações, ativar as feature flags resultará em **crash completo do sistema de vendas**, tornando a aplicação inutilizável para o negócio principal.