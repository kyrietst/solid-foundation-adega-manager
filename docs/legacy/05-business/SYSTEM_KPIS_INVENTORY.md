# Sistema de KPIs - Inventário Completo
**Versão:** 3.0.0 SSoT
**Data:** 10 de Outubro de 2025
**Status:** Produção (925+ registros reais)

## Índice
1. [Resumo Executivo](#resumo-executivo)
2. [Dashboard Principal](#dashboard-principal)
3. [Módulo Clientes (CRM)](#módulo-clientes-crm)
4. [Módulo Vendas (POS)](#módulo-vendas-pos)
5. [Módulo Inventário](#módulo-inventário)
6. [Módulo Relatórios](#módulo-relatórios)
7. [Módulo Entregas](#módulo-entregas)
8. [KPIs Duplicados](#kpis-duplicados)
9. [Fontes de Dados](#fontes-de-dados)

---

## Resumo Executivo

### Total de KPIs Únicos: **106 KPIs** (v3.2.0 atualizado)

| Módulo | Quantidade de KPIs | Complexidade |
|--------|-------------------|--------------|
| Dashboard Principal | 16 KPIs | Alta |
| Clientes (CRM) | 43 KPIs (+8 novas) | Muito Alta |
| Vendas (POS) | 12 KPIs | Média |
| Inventário | 8 KPIs | Média |
| Relatórios | 19 KPIs | Alta |
| Entregas | 8 KPIs | Alta |

### KPIs por Categoria

| Categoria | Quantidade |
|-----------|-----------|
| Financeiros | 28 KPIs |
| Temporais | 17 KPIs (+3 novas) |
| Comportamental | 2 KPIs (nova categoria) |
| Preditivo | 3 KPIs (nova categoria) |
| Produtos | 16 KPIs |
| Clientes | 25 KPIs |
| Performance | 15 KPIs |

---

## Dashboard Principal

### Localização
**Arquivo:** `src/features/dashboard/components/KpiCards.tsx` + `useDashboardKpis.ts`
**Hook de Dados:** `useDashboardKpis()`, `useSalesKpis()`, `useCustomerKpis()`, `useInventoryKpis()`, `useExpenseKpis()`

### KPIs Principais (Visão Geral)

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 1 | **Receita Total** | `useSalesKpis(windowDays)` | Soma de `sales.final_amount` (status='completed') | Moeda (R$) | Financeiro |
| 2 | **Receita Delta** | `useSalesKpis(windowDays)` | `((receita_atual - receita_anterior) / receita_anterior) * 100` | Percentual | Temporal |
| 3 | **Pedidos Totais** | `useSalesKpis(windowDays)` | Count de `sales` (status='completed') | Número | Vendas |
| 4 | **Pedidos Delta** | `useSalesKpis(windowDays)` | Variação percentual vs período anterior | Percentual | Temporal |
| 5 | **Ticket Médio** | `useSalesKpis(windowDays)` | `receita / orders` | Moeda (R$) | Financeiro |
| 6 | **Ticket Médio Delta** | `useSalesKpis(windowDays)` | Variação percentual vs período anterior | Percentual | Temporal |
| 7 | **Total de Clientes** | `useCustomerKpis(windowDays)` | Count de `customers` | Número | Clientes |
| 8 | **Novos Clientes** | `useCustomerKpis(windowDays)` | Count de `customers` no período | Número | Clientes |
| 9 | **Clientes Ativos** | `useCustomerKpis(windowDays)` | Count de clientes com compras no período | Número | Clientes |
| 10 | **Total de Produtos** | `useInventoryKpis()` | Count de `products` | Número | Inventário |
| 11 | **Produtos Sem Estoque** | `useInventoryKpis()` | Count de produtos com `stock_packages=0 AND stock_units_loose=0` | Número | Inventário |
| 12 | **Valor Total em Estoque** | `useInventoryKpis()` | Soma de `(stock_packages + stock_units_loose) * price` | Moeda (R$) | Financeiro |
| 13 | **Total de Despesas** | `useExpenseKpis(windowDays)` | Soma das despesas no período | Moeda (R$) | Financeiro |
| 14 | **Despesa Delta** | `useExpenseKpis(windowDays)` | Variação percentual vs período anterior | Percentual | Temporal |
| 15 | **Margem Líquida** | `useExpenseKpis(windowDays)` | `((receita - despesas) / receita) * 100` | Percentual | Financeiro |
| 16 | **Categoria Top Despesa** | `useExpenseKpis(windowDays)` | Categoria com maior soma de despesas | Texto | Despesas |

### KPIs Financeiros Sensíveis (Admin Only)
**Localização:** `src/features/dashboard/hooks/useDashboardMetrics.ts`

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 17 | **Faturamento Total** | `useDashboardData(windowDays)` | `financials.totalRevenue` | Moeda (R$) | Financeiro |
| 18 | **Lucro Bruto** | `useDashboardData(windowDays)` | `financials.grossProfit` | Moeda (R$) | Financeiro |
| 19 | **Margem Bruta** | `useDashboardData(windowDays)` | `financials.grossMargin` | Percentual | Financeiro |
| 20 | **COGS** | `useDashboardData(windowDays)` | `financials.cogs` | Moeda (R$) | Financeiro |
| 21 | **Despesas Operacionais** | `useDashboardData(windowDays)` | `financials.operationalExpenses` | Moeda (R$) | Financeiro |

### KPIs Públicos (Todos os Usuários)
**Localização:** `src/features/dashboard/hooks/useDashboardMetrics.ts`

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 22 | **Total de Clientes** | `useDashboardData(windowDays)` | `counts.totalCustomers` | Número | Clientes |
| 23 | **Clientes VIP** | `useDashboardData(windowDays)` | `counts.vipCustomers` | Número | Clientes |
| 24 | **Produtos em Estoque** | `useDashboardData(windowDays)` | `counts.productsInStock` | Número | Produtos |
| 25 | **Entregas Pendentes** | `useDashboardData(windowDays)` | `counts.pendingDeliveries` | Número | Entregas |

---

## Módulo Clientes (CRM)

### Localização Principal
**Arquivo:** `src/features/customers/components/CustomerStats.tsx`
**Hook de Dados:** `useCustomerStats(customers)`

### KPIs - Visão Geral da Lista de Clientes

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 26 | **Total de Clientes** | `useCustomerStats()` | `customers.length` | Número | Clientes |
| 27 | **Clientes VIP** | `useCustomerStats()` | Count de clientes com `segment='VIP' OR segment='Fiel - VIP'` | Número | Clientes |
| 28 | **Receita Total (LTV)** | `useCustomerStats()` | Soma de `lifetime_value` de todos os clientes | Moeda (R$) | Financeiro |
| 29 | **Ticket Médio** | `useCustomerStats()` | `totalRevenue / customers.length` | Moeda (R$) | Financeiro |
| 30 | **Clientes Ativos (30 dias)** | `useCustomerStats()` | Count de clientes com compra nos últimos 30 dias | Número | Clientes |

### KPIs - Tab "Visão Geral" do Perfil do Cliente
**Localização:** `src/features/customers/components/CustomerOverviewTab.tsx`
**Hook de Dados:** `useCustomerOverviewSSoT(customerId)`

#### Card: Resumo Financeiro

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 31 | **Valor Total (LTV)** | `realMetrics.lifetime_value_calculated` | Soma de `sales.final_amount` do cliente | Moeda (R$) | Financeiro |
| 32 | **Total de Compras** | `realMetrics.total_purchases` | Count de vendas completadas | Número | Vendas |
| 33 | **Ticket Médio** | `realMetrics.avg_purchase_value` | `LTV / total_purchases` | Moeda (R$) | Financeiro |
| 34 | **Cliente Desde** | `customer.created_at` | Data de criação do registro | Data | Temporal |

#### Card: Atividade & Engajamento

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 35 | **Última Compra** | `realMetrics.last_purchase_real` | Data da última venda completada | Data | Temporal |
| 36 | **Dias Desde Última Compra** | `realMetrics.days_since_last_purchase` | `(hoje - last_purchase) / dias` | Número | Temporal |
| 37 | **Status do Cliente** | `customerStatus.status` | Classificação baseada em dias desde última compra | Texto | Clientes |
| 38 | **Nível de Engajamento** | `customerStatus.engagementLevel` | Alto/Médio/Baixo baseado em atividade | Texto | Clientes |

#### Card: Preferências & Perfil

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 39 | **Categoria Favorita** | `realMetrics.calculated_favorite_category` | Categoria mais comprada | Texto | Produtos |
| 40 | **Produto Favorito** | `realMetrics.calculated_favorite_product` | Produto mais comprado | Texto | Produtos |
| 41 | **Insights IA** | `realMetrics.insights_count` | Count de insights gerados | Número | IA |
| 42 | **Segmento** | `customer.segment` | high_value/regular/new/occasional | Texto | Clientes |

#### Card: Contato & Comunicação

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 43 | **Telefone Cadastrado** | `customer.phone` | Boolean (✓ ou ✗) | Boolean | Perfil |
| 44 | **Email Cadastrado** | `customer.email` | Boolean (✓ ou ✗) | Boolean | Perfil |
| 45 | **Completude do Perfil** | `profileCompleteness` | Percentual de campos preenchidos | Percentual | Perfil |

#### Métricas Avançadas

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 46 | **Itens por Compra** | `realMetrics.avg_items_per_purchase` | Média de itens por transação | Número | Vendas |
| 47 | **Total de Itens Comprados** | `realMetrics.total_products_bought` | Soma de todos os itens | Número | Produtos |

### KPIs - Tab "Insights IA"
**Localização:** `src/features/customers/components/CustomerInsightsTab.tsx`
**Hook de Dados:** `useCustomerInsightsSSoT(customerId)`

#### Métricas de Performance

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 48 | **Contribuição de Receita** | `insights.revenueContribution` | `(cliente_LTV / base_total_LTV) * 100` | Percentual | Financeiro |
| 49 | **Score de Oportunidade** | `insights.opportunityScore` | Score calculado (0-100) | Número | IA |
| 50 | **Nível de Engajamento** | `insights.engagementLevel` | Alto/Médio/Baixo | Texto | Clientes |
| 51 | **Produtos Favoritos (Count)** | `insights.preferredProducts.length` | Count de produtos preferidos | Número | Produtos |
| 52 | **Nível de Risco** | `insights.riskLevel` | Alto/Médio/Baixo | Texto | IA |
| 53 | **Potencial de Crescimento** | `insights.growthPotential` | Alto/Médio/Baixo | Texto | IA |

### KPIs - Tab "Histórico de Compras"
**Localização:** `src/features/customers/components/CustomerPurchaseHistoryTab.tsx`
**Hook de Dados:** `useCustomerPurchaseHistory(customerId, filters)`

#### Resumo Financeiro

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 54 | **Total Gasto** | `summary.totalSpent` | Soma de todos os `final_amount` | Moeda (R$) | Financeiro |
| 55 | **Itens Comprados** | `summary.totalItems` | Soma de quantidades de todos os itens | Número | Produtos |
| 56 | **Ticket Médio** | `summary.averageTicket` | `totalSpent / purchaseCount` | Moeda (R$) | Financeiro |
| 57 | **Total de Compras** | `summary.purchaseCount` | Count de vendas completadas | Número | Vendas |

#### Análise de Comportamento (v3.2.0 - NEW)

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 99 | **Frequência de Compra** | `behavioralMetrics.purchaseIntervalText` | Média de dias entre compras consecutivas | Texto | Temporal |
| 100 | **Intervalo Médio (dias)** | `behavioralMetrics.avgPurchaseInterval` | `sum(intervals) / intervals.length` | Número (dias) | Temporal |
| 101 | **Tendência de Gastos** | `behavioralMetrics.spendingTrend.text` | Compara últimas 3 vs 3 anteriores: `(recent3 - previous3) / previous3 * 100` | Texto | Comportamental |
| 102 | **Direção da Tendência** | `behavioralMetrics.spendingTrend.direction` | 'up' (>10%), 'stable' (-10 a 10%), 'down' (<-10%) | Enum | Comportamental |
| 103 | **Percentual da Tendência** | `behavioralMetrics.spendingTrend.percentage` | Variação percentual de gastos | Percentual | Temporal |
| 104 | **Próxima Compra Esperada** | `behavioralMetrics.nextPurchaseExpected.text` | `avgInterval - daysSinceLastPurchase` | Texto | Preditivo |
| 105 | **Dias até Próxima Compra** | `behavioralMetrics.nextPurchaseExpected.daysUntil` | Positivo (no prazo) / Negativo (atrasada) | Número (dias) | Preditivo |
| 106 | **Status da Próxima Compra** | `behavioralMetrics.nextPurchaseExpected.status` | 'on-time' (>5d), 'soon' (1-5d), 'overdue' (<0d) | Enum | Preditivo |

### KPIs Calculados por Business Hook
**Localização:** `src/shared/hooks/business/useCustomerOperations.ts`

#### Métricas Centralizadas (SSoT)

| # | Nome do KPI | Cálculo | Tipo | Categoria |
|---|-------------|---------|------|-----------|
| 58 | **LTV (Lifetime Value)** | `valorTotalCompras` | Moeda (R$) | Financeiro |
| 59 | **Average Order Value** | `valorTotalCompras / totalCompras` | Moeda (R$) | Financeiro |
| 60 | **Purchase Frequency** | Compras por mês | Número | Temporal |
| 61 | **Days Since Last Purchase** | `(hoje - ultimaCompra) / dias` | Número | Temporal |
| 62 | **Loyalty Score** | Score calculado (0-100) baseado em compras, frequência, recência | Número | Performance |
| 63 | **Risk Score (Churn)** | Score calculado (0-100) baseado em inatividade | Número | Performance |
| 64 | **Profile Completeness** | Percentual de campos preenchidos (0-100) | Percentual | Perfil |

---

## Módulo Vendas (POS)

### Localização
**Arquivo:** `src/features/sales/components/RecentSales.tsx`
**Hook de Dados:** `useSales()`

### KPIs - Vendas Recentes

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 65 | **Total de Vendas** | `sales.length` | Count de registros de vendas | Número | Vendas |
| 66 | **Receita Total** | Soma de `final_amount` | Soma de todos os valores finais | Moeda (R$) | Financeiro |
| 67 | **Ticket Médio** | `receita / total_vendas` | Média de valor por venda | Moeda (R$) | Financeiro |

---

## Módulo Inventário

### Localização
**Arquivo:** `src/features/inventory/components/InventoryStats.tsx`
**Hook de Dados:** Propriedades passadas do componente pai

### KPIs - Estatísticas de Inventário

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 68 | **Total de Produtos** | `totalProducts` | Count de `products` | Número | Produtos |
| 69 | **Estoque Baixo** | `lowStockCount` | Count de produtos com estoque < threshold | Número | Inventário |
| 70 | **Valor Total em Estoque** | `totalValue` | Soma de `(stock * price)` | Moeda (R$) | Financeiro |
| 71 | **Produtos Giro Rápido** | `turnoverStats.fast` | Count de produtos com giro rápido | Número | Performance |
| 72 | **Produtos Giro Médio** | `turnoverStats.medium` | Count de produtos com giro médio | Número | Performance |
| 73 | **Produtos Giro Lento** | `turnoverStats.slow` | Count de produtos com giro lento | Número | Performance |

---

## Módulo Relatórios

### Relatórios de Vendas
**Localização:** `src/features/reports/components/SalesReportsSection.tsx`

#### KPIs Principais

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 74 | **Receita Total** | `get_sales_metrics()` RPC | Soma de `final_amount` no período | Moeda (R$) | Financeiro |
| 75 | **Total de Vendas** | `get_sales_metrics()` RPC | Count de vendas completadas | Número | Vendas |
| 76 | **Ticket Médio** | `get_sales_metrics()` RPC | `receita / vendas` | Moeda (R$) | Financeiro |

#### Análise de Produtos (Top 10)

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 77 | **Receita por Produto** | `get_top_products()` RPC | Soma de vendas por produto | Moeda (R$) | Produtos |
| 78 | **Quantidade Vendida** | `get_top_products()` RPC | Soma de quantidades | Número | Produtos |

#### Análise de Categorias

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 79 | **Receita por Categoria** | `get_sales_by_category()` RPC | Soma de vendas por categoria de produto | Moeda (R$) | Produtos |
| 80 | **Percentual por Categoria** | Calculado no frontend | `(receita_categoria / total) * 100` | Percentual | Produtos |

### Relatórios Financeiros
**Localização:** `src/features/reports/components/FinancialReportsSection.tsx`

#### Análise de Recebíveis

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 81 | **Total a Receber** | `get_financial_metrics()` RPC | Soma de todos os recebíveis | Moeda (R$) | Financeiro |
| 82 | **Em Atraso** | `get_financial_metrics()` RPC | Soma de recebíveis vencidos | Moeda (R$) | Financeiro |
| 83 | **% de Atraso** | Calculado | `(em_atraso / total_receber) * 100` | Percentual | Financeiro |
| 84 | **DSO (Days Sales Outstanding)** | `get_financial_metrics()` RPC | Tempo médio de recebimento | Número (dias) | Financeiro |

#### Aging Analysis

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 85 | **Recebíveis Atuais** | `financialMetrics.current_amount` | Soma de recebíveis em dia | Moeda (R$) | Financeiro |
| 86 | **0-30 dias** | `financialMetrics.d0_30` | Soma de recebíveis vencidos 0-30d | Moeda (R$) | Financeiro |
| 87 | **31-60 dias** | `financialMetrics.d31_60` | Soma de recebíveis vencidos 31-60d | Moeda (R$) | Financeiro |
| 88 | **61-90 dias** | `financialMetrics.d61_90` | Soma de recebíveis vencidos 61-90d | Moeda (R$) | Financeiro |
| 89 | **90+ dias** | `financialMetrics.d90_plus` | Soma de recebíveis vencidos 90+d | Moeda (R$) | Financeiro |

#### Análise de Métodos de Pagamento

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 90 | **Quantidade por Método** | Query de `sales` | Count por payment_method | Número | Vendas |
| 91 | **Receita por Método** | Query de `sales` | Soma de `final_amount` por método | Moeda (R$) | Financeiro |
| 92 | **Ticket Médio por Método** | Calculado | `receita / quantidade` por método | Moeda (R$) | Financeiro |

---

## Módulo Entregas

### Localização
**Arquivo:** `src/features/delivery/components/DeliveryAnalytics.tsx`

### KPIs Principais de Delivery

| # | Nome do KPI | Fonte de Dados | Fórmula/Cálculo | Tipo | Categoria |
|---|-------------|----------------|-----------------|------|-----------|
| 93 | **Total de Entregas** | `calculate_delivery_kpis()` RPC | Count de entregas | Número | Entregas |
| 94 | **Receita Total** | `calculate_delivery_kpis()` RPC | Soma de valores de entregas | Moeda (R$) | Financeiro |
| 95 | **Tempo Médio de Entrega** | `calculate_delivery_kpis()` RPC | Média de tempo em minutos | Tempo | Performance |
| 96 | **Taxa de Pontualidade** | `calculate_delivery_kpis()` RPC | `(entregas_no_prazo / total) * 100` | Percentual | Performance |
| 97 | **Satisfação do Cliente** | `calculate_delivery_kpis()` RPC | Média de ratings | Número (1-5) | Performance |
| 98 | **Ticket Médio de Entrega** | `calculate_delivery_kpis()` RPC | `receita / total_entregas` | Moeda (R$) | Financeiro |

---

## KPIs Duplicados

### Análise de Duplicação

Abaixo estão os KPIs que aparecem em múltiplas páginas/componentes:

| KPI | Localização 1 | Localização 2 | Localização 3 | Status |
|-----|---------------|---------------|---------------|--------|
| **Total de Clientes** | Dashboard | CustomerStats | useDashboardMetrics | ✅ Aceitável - Contextos diferentes |
| **Receita Total** | Dashboard (useSalesKpis) | Relatórios (SalesReportsSection) | Entregas (DeliveryAnalytics) | ✅ Aceitável - Períodos diferentes |
| **Ticket Médio** | Dashboard | CustomerStats | Relatórios | ✅ Aceitável - Escopo diferente |
| **Clientes VIP** | Dashboard | CustomerStats | - | ✅ Aceitável - Visões diferentes |
| **Total de Produtos** | Dashboard (useInventoryKpis) | InventoryStats | - | ✅ Aceitável - Contextos diferentes |
| **LTV (Lifetime Value)** | CustomerOverviewTab | CustomerPurchaseHistoryTab | useCustomerOperations | ✅ Aceitável - Cálculo centralizado |

### KPIs com Múltiplas Implementações (Atenção)

| KPI | Implementações | Observação |
|-----|----------------|------------|
| **Ticket Médio** | 6 implementações | ⚠️ Verificar consistência de cálculo |
| **Total de Vendas/Compras** | 5 implementações | ⚠️ Verificar períodos aplicados |
| **Receita Total** | 4 implementações | ⚠️ Garantir mesma fonte de dados |

---

## Fontes de Dados

### Hooks de Business Logic (SSoT)

| Hook | Localização | KPIs Gerados |
|------|-------------|--------------|
| `useDashboardKpis()` | `src/features/dashboard/hooks/useDashboardKpis.ts` | 16 KPIs principais |
| `useSalesKpis(windowDays)` | `src/features/dashboard/hooks/useDashboardKpis.ts` | Receita, Pedidos, Ticket Médio + Deltas |
| `useCustomerKpis(windowDays)` | `src/features/dashboard/hooks/useDashboardKpis.ts` | Total, Novos, Ativos |
| `useInventoryKpis()` | `src/features/dashboard/hooks/useDashboardKpis.ts` | Produtos, Valor, Sem Estoque |
| `useExpenseKpis(windowDays)` | `src/features/dashboard/hooks/useDashboardKpis.ts` | Despesas, Margem Líquida |
| `useCustomerOperations(data)` | `src/shared/hooks/business/useCustomerOperations.ts` | LTV, AOV, Loyalty, Risk, Profile |
| `useCustomerOverviewSSoT(id)` | `src/shared/hooks/business/useCustomerOverviewSSoT.ts` | 17 KPIs do perfil |
| `useCustomerInsightsSSoT(id)` | `src/shared/hooks/business/useCustomerInsightsSSoT.ts` | 6 KPIs de insights IA |
| `useCustomerPurchaseHistory(id)` | `src/shared/hooks/business/useCustomerPurchaseHistory.ts` | 4 KPIs financeiros |

### Stored Procedures (RPC)

| Procedure | Tabelas | KPIs Retornados |
|-----------|---------|-----------------|
| `get_sales_metrics(start, end)` | `sales` | total_revenue, total_sales, average_ticket |
| `get_top_products(start, end, limit, by)` | `sale_items`, `products` | revenue, quantity por produto |
| `get_sales_by_category(start, end)` | `sale_items`, `products` | revenue por categoria |
| `get_sales_by_payment_method(start, end)` | `sales` | total_sales, total_revenue, avg_ticket por método |
| `get_financial_metrics(window_days)` | `accounts_receivable` | aging, DSO |
| `calculate_delivery_kpis(start, end, person)` | `sales`, deliveries | Todos os KPIs de entrega |

### Queries Diretas

| Tabela | Campos Usados | KPIs Calculados |
|--------|---------------|-----------------|
| `customers` | `id`, `segment`, `lifetime_value`, `last_purchase_date` | Total, VIP, Receita, Ativos |
| `products` | `stock_packages`, `stock_units_loose`, `price` | Total, Valor, Sem Estoque |
| `sales` | `final_amount`, `status`, `payment_method`, `created_at` | Receita, Vendas, Ticket Médio |
| `sale_items` | `quantity`, `unit_price`, `product_id` | Análise de produtos |
| `accounts_receivable` | `amount`, `due_date`, `status` | Aging, DSO |

---

## Recomendações

### Para Evitar Duplicação Futura

1. **KPIs Financeiros** - Sempre usar hooks centralizados:
   - `useSalesKpis()` para receita e vendas
   - `useExpenseKpis()` para despesas
   - `useFinancialMetrics()` para recebíveis

2. **KPIs de Clientes** - Sempre usar business hooks:
   - `useCustomerOperations()` para cálculos individuais
   - `useCustomerStats()` para agregações de lista
   - Hooks SSoT para tabs específicas

3. **KPIs de Inventário** - Centralizar em:
   - `useInventoryKpis()` para visão geral
   - `useProductOperations()` para análise individual

4. **Documentar Novos KPIs** - Ao criar novo KPI:
   - Verificar se já existe implementação
   - Atualizar este documento
   - Adicionar testes de consistência

### Validação de Consistência

#### Checklist para Novo KPI

- [ ] Nome único e descritivo
- [ ] Fórmula documentada
- [ ] Fonte de dados definida
- [ ] Hook ou RPC centralizado
- [ ] Tipo de dado especificado
- [ ] Categoria atribuída
- [ ] Testes de cálculo adicionados
- [ ] Documento atualizado

---

## Changelog

| Data | Versão | Alterações |
|------|--------|-----------|
| 2025-10-10 | 3.0.0 | Inventário completo - 98 KPIs mapeados |
| 2025-10-10 | 3.2.0 | **+8 KPIs Comportamentais/Preditivas** - Adicionadas métricas de análise comportamental na aba "Histórico de Compras": Frequência de Compra, Tendência de Gastos, Próxima Compra Esperada (total: 106 KPIs) |

---

**Última Atualização:** 10 de Outubro de 2025 (v3.2.0)
**Próxima Revisão:** Ao adicionar novo módulo ou KPI
