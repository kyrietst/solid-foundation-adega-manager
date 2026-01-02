# 🔥 Operação "Vassoura de Fogo" - Relatório de Chamadas RPC

**Data:** 2025-12-02  
**Objetivo:** Identificar e catalogar todas as chamadas `.rpc()` no código para decisão de refatoração

---

## 📊 Sumário Executivo

- **Total de arquivos escaneados:** Diretório `src/`
- **Total de chamadas RPC encontradas:** 76 ocorrências
- **Arquivos afetados:** 18 arquivos

---

## 🎯 Chamadas RPC por Categoria

### ✅ **FUNÇÕES VITAIS DO SISTEMA** (Manter)

Estas são funções críticas de negócio que devem ser mantidas como RPCs:

#### 1. **Processamento de Vendas**
| Arquivo | Linha | Função RPC | Status |
|---------|-------|------------|--------|
| `use-sales.ts` | 323 | `process_sale` | ✅ VITAL |
| `use-sales.ts` | 575 | `delete_sale_with_items` | ✅ VITAL |
| `sales-workflow.integration.test.ts` | 166 | `process_sale` | ✅ VITAL (teste) |

**Justificativa:** Funções transacionais complexas que precisam garantir atomicidade e consistência.

---

#### 2. **Movimentação de Inventário**
| Arquivo | Linha | Função RPC | Status |
|---------|-------|------------|--------|
| `useInventoryMovements.ts` | 218 | `create_inventory_movement` | ✅ VITAL |
| `InventoryManagement.tsx` | 269 | `create_inventory_movement` | ✅ VITAL |
| `useSalesErrorRecovery.ts` | 110 | `create_inventory_movement` | ✅ VITAL |
| `StockAdjustmentModal.tsx` | 193 | `set_product_stock_absolute` | ✅ VITAL |
| `InventoryManagement.tsx` | 232 | `adjust_variant_stock` | ✅ VITAL |
| `TransferToHoldingModal.tsx` | 79 | `transfer_to_store2_holding` | ✅ VITAL |

**Justificativa:** Lógica de estoque com validações e triggers automáticos.

---

#### 3. **Gestão de Lotes (Batches)**
| Arquivo | Linha | Função RPC | Status |
|---------|-------|------------|--------|
| `useBatches.ts` | 164 | `create_product_batch` | ✅ VITAL |
| `useBatches.ts` | 211 | `sell_from_batch_fifo` | ✅ VITAL |
| `useBatches.ts` | 353 | `monitor_expiry_alerts` | ✅ VITAL |

**Justificativa:** Lógica FIFO complexa e monitoramento de validade.

---

#### 4. **Customer Insights e CRM**
| Arquivo | Linha | Função RPC | Status |
|---------|-------|------------|--------|
| `QuickCustomerCreateModal.tsx` | 30 | `create_quick_customer` | ✅ VITAL |
| `sales-workflow.integration.test.ts` | 221 | `recalc_customer_insights` | ✅ VITAL |

---

### ⚠️ **FUNÇÕES DE ANÁLISE E RELATÓRIOS** (Revisão Necessária)

Estas funções podem ser refatoradas para queries diretas:

#### 5. **Dashboard Metrics**
| Arquivo | Linha | Função RPC | Avaliação |
|---------|-------|------------|-----------|
| `DashboardKpisSection.tsx` | 52 | `get_dashboard_kpis` | 🟡 **REFATORAR?** |
| `DashboardKpisSection.tsx` | 71 | `get_dashboard_kpis` (30d) | 🟡 **REFATORAR?** |
| `DashboardKpisSection.tsx` | 84 | `get_dashboard_kpis` (7d) | 🟡 **REFATORAR?** |
| `DashboardKpisSection.tsx` | 97 | `get_dashboard_kpis` (total) | 🟡 **REFATORAR?** |

**Análise:** Possível substituição por queries agregadas diretas com `useMemo`.

---

#### 6. **Estatísticas de Vendas**
| Arquivo | Linha | Função RPC | Avaliação |
|---------|-------|------------|-----------|
| `SalesChartSection.tsx` | 50 | `get_sales_chart_data` | 🟡 **REFATORAR?** |
| `TopProductsSection.tsx` | 38 | `get_top_selling_products` | 🟡 **REFATORAR?** |
| `ComparativeAnalysisSection.tsx` | 81 | `get_delivery_vs_instore_comparison` | 🟡 **REFATORAR?** |

**Análise:** Podem ser substituídas por agregações no frontend.

---

#### 7. **Análises de Estoque**
| Arquivo | Linha | Função RPC | Avaliação |
|---------|-------|------------|-----------|
| `LowStockAlertCard.tsx` | 54 | `get_low_stock_products` | 🟡 **REFATORAR?** |
| `useProductsGridLogic.ts` | 58 | `get_low_stock_products` | 🟡 **REFATORAR?** |
| `StockByStoreSection.tsx` | 32 | `get_stock_distribution` | 🟡 **REFATORAR?** |
| `useInventoryHealth.ts` | 57 | `get_total_inventory_valuation` | 🟡 **REFATORAR?** |
| `useProductAnalytics.ts` | 37 | `get_product_movement_summary` | 🟡 **REFATORAR?** |

**Análise:** `get_low_stock_products` pode ser query direta. Outras análises devem ser avaliadas.

---

#### 8. **CRM e Customer Analytics**
| Arquivo | Linha | Função RPC | Avaliação |
|---------|-------|------------|-----------|
| `CrmReportsSection.tsx` | 27 | `get_customer_summary` | 🟡 **REFATORAR?** |
| `CrmReportsSection.tsx` | 42 | `get_customer_retention` | 🟡 **REFATORAR?** |
| `CrmReportsSection.tsx` | 57 | `get_top_customers` | 🟡 **REFATORAR?** |
| `CrmOverviewSection.tsx` | 101 | `get_customer_base_growth` | 🟡 **REFATORAR?** |
| `CrmOverviewSection.tsx` | 119 | `get_customer_base_growth` | 🟡 **REFATORAR?** |
| `CrmOverviewSection.tsx` | 139 | `get_customer_rfm_segments` | 🟡 **REFATORAR?** |

**Análise:** Alta redundância. Avaliar se os dados podem vir de queries diretas.

---

#### 9. **Relatórios Financeiros**
| Arquivo | Linha | Função RPC | Avaliação |
|---------|-------|------------|-----------|
| `FinancialCashFlowDashboard.tsx` | 53 | `get_daily_cash_flow` | 🟡 **REFATORAR?** |
| `useRevenueAnalytics.ts` | 39 | `get_revenue_summary` | 🟡 **REFATORAR?** |
| `ExpenseReportsSection.tsx` | 38 | `get_expense_summary` | 🟡 **REFATORAR?** |

**Análise:** `get_expense_summary` é exatamente o tipo de função que você mencionou!

---

#### 10. **Delivery Analytics**
| Arquivo | Linha | Função RPC | Avaliação |
|---------|-------|------------|-----------|
| `DeliveryPerformanceDashboard.tsx` | 108 | `get_delivery_trends` | 🟡 **REFATORAR?** |
| `DeliveryOptionsModal.tsx` | 117 | `calculate_delivery_fee` | ⚠️ **AVALIAR** |

**Análise:** `calculate_delivery_fee` pode ter lógica de negócio importante.

---

### 🧪 **TESTES DE INTEGRAÇÃO** (Manter para validação)

| Arquivo | Total de chamadas | Status |
|---------|-------------------|--------|
| `rpc-backend-simple.integration.test.ts` | 12 | ✅ Testes |
| `rpc-backend.integration.test.ts` | 14 | ✅ Testes |
| `sales-workflow.integration.test.ts` | 2 | ✅ Testes |

**Total:** 28 chamadas em arquivos de teste (manter).

---

## 🎯 Recomendações de Ação

### 🔴 **Prioridade ALTA - Deletar/Refatorar**

1. **`get_expense_summary`** → Substituir por query direta
2. **`get_dashboard_kpis`** → Consolidar em uma query única
3. **`get_sales_chart_data`** → Agregação no frontend

### 🟡 **Prioridade MÉDIA - Avaliar**

4. **`get_customer_summary`** → Verificar se existe no banco
5. **`get_customer_retention`** → Verificar se existe no banco
6. **`get_top_customers`** → Possível query direta
7. **`get_low_stock_products`** → Pode ser query simples

### 🟢 **Prioridade BAIXA - Manter**

- Todas as funções de **processamento transacional**
- Funções de **movimentação de inventário**
- Funções de **gestão de lotes**

---

## 📋 Lista Completa de Funções RPC Encontradas

### Funções Únicas (sem duplicatas):

1. ✅ `adjust_variant_stock`
2. ⚠️ `calculate_delivery_fee`
3. ✅ `create_inventory_movement`
4. ✅ `create_product_batch`
5. ✅ `create_quick_customer`
6. ✅ `delete_sale_with_items`
7. 🟡 `get_customer_base_growth`
8. 🟡 `get_customer_retention`
9. 🟡 `get_customer_rfm_segments`
10. 🟡 `get_customer_summary`
11. 🟡 `get_daily_cash_flow`
12. 🟡 `get_dashboard_kpis`
13. 🟡 `get_delivery_trends`
14. 🟡 `get_delivery_vs_instore_comparison`
15. 🟡 `get_expense_summary`
16. 🟡 `get_low_stock_products`
17. 🟡 `get_product_movement_summary`
18. 🟡 `get_revenue_summary`
19. 🟡 `get_sales_chart_data`
20. 🟡 `get_stock_distribution`
21. 🟡 `get_top_customers`
22. 🟡 `get_top_selling_products`
23. 🟡 `get_total_inventory_valuation`
24. ✅ `monitor_expiry_alerts`
25. ✅ `process_sale`
26. ✅ `recalc_customer_insights`
27. ✅ `sell_from_batch_fifo`
28. ✅ `set_product_stock_absolute`
29. ✅ `transfer_to_store2_holding`

---

## 🔍 Próximos Passos

1. **Validar existência no banco:** Executar query para verificar quais dessas funções RPC existem de fato
2. **Testar refatoração:** Começar pelas funções marcadas como 🔴 (prioridade alta)
3. **Medir performance:** Comparar tempo de execução RPC vs query direta
4. **Atualizar testes:** Garantir que os testes de integração continuem passando

---

## 📝 Notas Finais

- **Arquivos de teste:** Não deletar chamadas RPC dos testes (28 ocorrências)
- **Funções transacionais:** Manter como RPC por questões de atomicidade
- **Funções analíticas:** Principal alvo de refatoração

---

**Relatório gerado em:** 2025-12-02T15:12:34-03:00  
**Comando executado:** `grep_search` para `.rpc(` no diretório `src/`
