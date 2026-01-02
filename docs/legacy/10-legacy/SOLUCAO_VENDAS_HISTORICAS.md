# Solução: Sistema de Vendas Históricas (Sem Afetar Estoque)

**Versão:** 1.0.0
**Data:** 18/10/2025
**Status:** Análise Completa - Aguardando Aprovação

---

## 📋 Sumário Executivo

### Problema Identificado

Durante a importação do CSV de vendas delivery (realizada semanas atrás), **apenas 2 de 4 vendas** do cliente Alessandro foram importadas para o sistema. As vendas faltantes são:

- ❌ **Pedido #147** (13/08/2025) - R$ 50,00 - 1pc Eisenbahn 350ml
- ❌ **Pedido #323** (21/09/2025) - R$ 55,00 - 1pc Brahma duplo 350ml + 2un Torcida cebola

### Restrição Crítica

**O estoque atual do sistema JÁ está correto**, pois foi realizada uma **contagem física real** após a importação parcial do CSV. Portanto:

⚠️ **QUALQUER importação de vendas históricas NÃO PODE AFETAR o estoque de produtos**

---

## 🔍 Análise Técnica do Sistema Atual

### 1. Como o Sistema Atualmente Processa Vendas

#### Fluxo Normal (Via `process_sale()`)
```
Frontend → process_sale() → INSERT sales → INSERT sale_items → create_inventory_movement() → UPDATE products.stock_*
```

**Resultado:** Estoque é SEMPRE afetado quando usa `process_sale()`

#### Triggers Automáticos em `sales` e `sale_items`

| Trigger | Tabela | Ação | Afeta Estoque? |
|---------|--------|------|----------------|
| `sales_activity_trigger` | sales | Log de auditoria | ❌ Não |
| `sales_audit_trigger` | sales | Log de auditoria | ❌ Não |
| `update_customer_after_sale_trigger` | sales | Atualiza métricas do cliente | ❌ Não |
| `detect_customer_preferences_trigger` | sales | Detecta preferências | ❌ Não |
| `sync_sale_totals_trigger` | sale_items | Sincroniza totais da venda | ❌ Não |
| `trigger_update_product_last_sale` | sale_items | Atualiza `last_sale_date` | ❌ Não |

✅ **CONCLUSÃO:** Nenhum trigger automático afeta o estoque diretamente!

### 2. Validação das Constraints

Constraints que precisam ser respeitadas:
- `sales_customer_id_fkey` - Cliente deve existir ✅
- `sale_items_product_id_fkey` - Produto deve existir ✅
- `sales_user_id_fkey` - Usuário deve existir ✅
- `sale_items_quantity_check` - Quantidade > 0 ✅
- `sale_items_unit_price_nonnegative` - Preço >= 0 ✅

### 3. Estoque NÃO É Afetado Se:

✅ Inserir diretamente em `sales` e `sale_items` (sem usar `process_sale()`)
✅ NÃO criar registros em `inventory_movements`
✅ NÃO chamar stored procedures que mexem em estoque

---

## 💡 Solução Proposta: 3 Abordagens

### 🎯 Abordagem 1: Stored Procedure Dedicada (RECOMENDADO)

**Criar função:** `create_historical_sale()`

```sql
CREATE OR REPLACE FUNCTION create_historical_sale(
  p_customer_id UUID,
  p_user_id UUID,
  p_items JSONB,
  p_total_amount NUMERIC,
  p_payment_method TEXT,
  p_sale_date TIMESTAMPTZ,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_final_amount NUMERIC := 0;
BEGIN
  -- INSERIR VENDA PRINCIPAL (SEM process_sale)
  INSERT INTO sales (
    customer_id,
    user_id,
    total_amount,
    final_amount,
    payment_method,
    payment_status,
    status,
    notes,
    created_at
  ) VALUES (
    p_customer_id,
    p_user_id,
    p_total_amount,
    p_total_amount,
    p_payment_method,
    'paid',
    'completed',
    COALESCE(p_notes, 'Venda histórica - importação manual'),
    p_sale_date
  ) RETURNING id INTO v_sale_id;

  -- INSERIR ITENS DA VENDA
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price,
      sale_type
    ) VALUES (
      v_sale_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      COALESCE(v_item->>'sale_type', 'unit')
    );
  END LOOP;

  -- ATUALIZAR MÉTRICAS DO CLIENTE (triggers farão isso automaticamente)
  -- NÃO CRIAR inventory_movements = ESTOQUE INTOCADO

  RETURN jsonb_build_object(
    'success', true,
    'sale_id', v_sale_id,
    'message', 'Venda histórica criada sem afetar estoque'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Vantagens:**
- ✅ Backend-first (seguro)
- ✅ Reutilizável para múltiplas importações
- ✅ Validação centralizada
- ✅ Auditoria automática (via triggers)

**Desvantagens:**
- ⚠️ Requer migration no banco

---

### 🎨 Abordagem 2: Interface Manual no Frontend (MAIS FÁCIL PARA USUÁRIO)

**Criar nova aba:** `CustomerHistoricalSalesTab.tsx`

**Localização:** Perfil do Cliente → Nova Tab "Importar Venda Histórica"

**Funcionalidades:**
1. Formulário para adicionar produtos manualmente
2. Seletor de data/hora customizada
3. Campos para forma de pagamento, valor total, taxa de entrega
4. Preview da venda antes de salvar
5. Salva usando `create_historical_sale()` RPC

**UI/UX:**
```
┌─────────────────────────────────────────────────────────┐
│ 📦 Importar Venda Histórica                            │
│                                                         │
│ ⚠️ ATENÇÃO: Esta venda NÃO afetará o estoque          │
│                                                         │
│ 📅 Data da Venda: [13/08/2025] ⏰ Hora: [18:47]       │
│ 💳 Forma Pagamento: [Dinheiro ▼]                       │
│ 🚚 Taxa Entrega: [R$ 7,00]                            │
│                                                         │
│ ➕ Adicionar Produtos:                                 │
│ ┌─────────────────────────────────────────────────┐   │
│ │ [Buscar produto...]                             │   │
│ │                                                 │   │
│ │ • 1pc Eisenbahn 350ml - R$ 43,00    [🗑️ Remover]│   │
│ │                                                 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 💰 Total: R$ 50,00                                     │
│                                                         │
│ [Cancelar]  [✅ Salvar Venda Histórica]                │
└─────────────────────────────────────────────────────────┘
```

**Vantagens:**
- ✅ UX amigável
- ✅ Validação visual
- ✅ Fácil para importações futuras

**Desvantagens:**
- ⚠️ Requer desenvolvimento frontend

---

### ⚡ Abordagem 3: Script SQL Direto (RÁPIDO PARA CASO ATUAL)

**Para importar as 2 vendas faltantes do Alessandro:**

```sql
-- VENDA #147 - 13/08/2025 - Alessandro
DO $$
DECLARE
  v_sale_id UUID;
  v_customer_id UUID;
  v_user_id UUID;
  v_product_eisenbahn UUID;
BEGIN
  -- Buscar IDs
  SELECT id INTO v_customer_id FROM customers WHERE name = 'Alessandro' AND phone LIKE '%94819-1219%';
  SELECT id INTO v_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO v_product_eisenbahn FROM products WHERE name ILIKE '%eisenbahn%350%' LIMIT 1;

  -- Criar venda
  INSERT INTO sales (
    customer_id, user_id, total_amount, final_amount, payment_method,
    payment_status, status, notes, created_at
  ) VALUES (
    v_customer_id,
    v_user_id,
    50.00,
    50.00,
    'Dinheiro',
    'paid',
    'completed',
    'Venda histórica delivery - Pedido #147 - Taxa entrega: R$ 7,00',
    '2025-08-13 18:47:00+00'
  ) RETURNING id INTO v_sale_id;

  -- Inserir item
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, sale_type)
  VALUES (v_sale_id, v_product_eisenbahn, 1, 43.00, 'package');

  RAISE NOTICE 'Venda #147 criada com sucesso: %', v_sale_id;
END $$;

-- VENDA #323 - 21/09/2025 - Alessandro
DO $$
DECLARE
  v_sale_id UUID;
  v_customer_id UUID;
  v_user_id UUID;
  v_product_brahma UUID;
  v_product_torcida UUID;
BEGIN
  -- Buscar IDs
  SELECT id INTO v_customer_id FROM customers WHERE name = 'Alessandro' AND phone LIKE '%94819-1219%';
  SELECT id INTO v_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO v_product_brahma FROM products WHERE name ILIKE '%brahma%duplo%350%' LIMIT 1;
  SELECT id INTO v_product_torcida FROM products WHERE name ILIKE '%torcida%cebola%' LIMIT 1;

  -- Criar venda
  INSERT INTO sales (
    customer_id, user_id, total_amount, final_amount, payment_method,
    payment_status, status, notes, created_at
  ) VALUES (
    v_customer_id,
    v_user_id,
    55.00,
    55.00,
    'Dinheiro',
    'paid',
    'completed',
    'Venda histórica delivery - Pedido #323 - Taxa entrega: R$ 7,00',
    '2025-09-21 21:38:00+00'
  ) RETURNING id INTO v_sale_id;

  -- Inserir itens
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, sale_type)
  VALUES
    (v_sale_id, v_product_brahma, 1, 43.00, 'package'),
    (v_sale_id, v_product_torcida, 2, 6.00, 'unit');

  RAISE NOTICE 'Venda #323 criada com sucesso: %', v_sale_id;
END $$;
```

**Vantagens:**
- ✅ Rápido (resolve o problema imediato)
- ✅ Não requer código novo

**Desvantagens:**
- ⚠️ Manual (cada venda precisa de script)
- ⚠️ Propenso a erros de digitação

---

## 🎯 Recomendação Final

### Para o Problema Atual (Alessandro)
**Use Abordagem 3** - Script SQL direto, pois são apenas 2 vendas.

### Para Importações Futuras
**Implemente Abordagem 1 + 2**:
1. Criar `create_historical_sale()` stored procedure
2. Desenvolver interface visual no perfil do cliente

---

## 📊 Impacto nas Métricas do Cliente

### O Que SERÁ Afetado (Corretamente)
✅ `customers.last_purchase_date` (via trigger `update_customer_after_sale_trigger`)
✅ `customers.lifetime_value` (soma das vendas)
✅ `customers.segment` (reclassificação: Primeira Compra → Recente → Fiel)
✅ `customers.favorite_category` (categoria mais comprada)
✅ Histórico de compras no CRM
✅ Análise de comportamento (frequência, ticket médio)

### O Que NÃO SERÁ Afetado (Como Desejado)
❌ `products.stock_packages`
❌ `products.stock_units_loose`
❌ `products.stock_quantity`
❌ Tabela `inventory_movements`

---

## 🔒 Testes de Validação Necessários

Antes de aplicar em produção, testar em DEV:

### 1. Teste de Estoque Intocado
```sql
-- Capturar estoque antes
SELECT id, name, stock_packages, stock_units_loose, stock_quantity
FROM products WHERE id IN (SELECT DISTINCT product_id FROM sale_items WHERE sale_id = 'NOVO_ID_VENDA');

-- Executar importação histórica
-- ...

-- Capturar estoque depois
SELECT id, name, stock_packages, stock_units_loose, stock_quantity
FROM products WHERE id IN (SELECT DISTINCT product_id FROM sale_items WHERE sale_id = 'NOVO_ID_VENDA');

-- VALIDAÇÃO: Os valores devem ser IDÊNTICOS
```

### 2. Teste de Métricas do Cliente
```sql
-- Verificar se lifetime_value foi atualizado
SELECT name, lifetime_value, last_purchase_date, segment
FROM customers WHERE id = 'CUSTOMER_ID';
```

### 3. Teste de Auditoria
```sql
-- Verificar se activity_logs registrou a venda
SELECT * FROM activity_logs
WHERE entity_type = 'sales'
AND entity_id = 'NOVO_ID_VENDA';
```

---

## 📝 Checklist de Implementação

### Fase 1: Teste em DEV
- [ ] Executar análise do banco de dados DEV
- [ ] Criar stored procedure `create_historical_sale()`
- [ ] Testar importação de 1 venda teste
- [ ] Validar que estoque NÃO mudou
- [ ] Validar que métricas do cliente MUDARAM corretamente
- [ ] Validar auditoria (activity_logs)

### Fase 2: Implementação PROD
- [ ] Backup completo do banco de produção
- [ ] Aplicar migration com `create_historical_sale()`
- [ ] Importar venda #147 do Alessandro
- [ ] Validar resultado
- [ ] Importar venda #323 do Alessandro
- [ ] Validar resultado final

### Fase 3: UI (Opcional - Futuro)
- [ ] Desenvolver `CustomerHistoricalSalesTab.tsx`
- [ ] Integrar com `CustomerProfile.tsx`
- [ ] Testes E2E
- [ ] Deploy

---

## 🚨 Avisos Importantes

1. **NUNCA use `process_sale()`** para vendas históricas - ele SEMPRE afeta estoque
2. **SEMPRE teste em DEV primeiro** - validar que estoque permanece intacado
3. **Documente cada importação** - manter registro de quais vendas foram importadas manualmente
4. **Valide produtos antes** - garantir que os produtos existem no catálogo

---

## 📞 Próximos Passos

**Aguardando aprovação do usuário para:**
1. Testar solução em DEV
2. Aplicar em PROD após validação

**Pergunta para o usuário:**
Deseja que eu prossiga com qual abordagem?
- [ ] Abordagem 1 + 2 (Completa - stored procedure + UI)
- [ ] Abordagem 3 (Rápida - apenas SQL script para Alessandro)
