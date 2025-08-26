# Mapeamento CSV → Supabase - Sistema de Delivery

## Visão Geral

Este documento mapeia as colunas do CSV de delivery histórico para as tabelas do banco Supabase, considerando as transformações necessárias e regras de negócio identificadas.

## Mapeamento Principal: CSV → Tabela `sales`

### Mapeamento Direto

| Coluna CSV | Campo Supabase | Transformação | Exemplo |
|------------|----------------|---------------|---------|
| Nº Pedido | `notes` | Texto: "Pedido CSV #123" | "1" → "Pedido CSV #1" |
| Data/Hora | `created_at` | Parsing dd/MM/yyyy HH:mm → ISO | "10/7/2025 18:49" → "2025-07-10T18:49:00Z" |
| Valor Total | `total_amount` | Remove "R$ " e converte | "R$ 55.00" → 55.00 |
| Taxa de Entrega | `delivery_fee` | Remove "R$ " e converte | "R$ 7.00" → 7.00 |
| Forma Pagamento | `payment_method` | Mapeamento de valores | "Dinheiro" → "cash" |
| Status | `delivery_status` | Mapeamento fixo | "Entregue" → "delivered" |

### Campos Calculados

| Campo Supabase | Cálculo | Exemplo |
|----------------|---------|---------|
| `final_amount` | `total_amount` + `delivery_fee` | 55.00 + 7.00 = 62.00 |
| `delivery_type` | Fixo: "delivery" | Todos os registros do CSV |
| `delivery` | **OBSOLETO**: true | Campo legado |
| `status` | Baseado em `delivery_status` | "delivered" → "completed" |
| `payment_status` | Baseado em `delivery_status` | "delivered" → "paid" |

### Campos com Valores Padrão

| Campo Supabase | Valor Padrão | Justificativa |
|----------------|--------------|---------------|
| `user_id` | Admin/Sistema | Pedidos históricos importados |
| `seller_id` | Admin/Sistema | Mesmo que `user_id` |
| `discount_amount` | 0.00 | CSV não possui descontos |
| `updated_at` | `created_at` | Mesma data para registros históricos |
| `delivery_started_at` | `created_at` + 5 min | Estimativa baseada no horário |
| `delivery_completed_at` | `created_at` + 30 min | Estimativa para entregas concluídas |

## Mapeamento: CSV → Tabela `customers`

### Estratégia de Criação de Clientes

| Coluna CSV | Campo Supabase | Transformação | Exemplo |
|------------|----------------|---------------|---------|
| Nome Cliente | `name` | Trim e capitalização | "alessandro " → "Alessandro" |
| Telefone | `phone` | Limpeza e formatação | "11 94819-1219" → "11948191219" |
| Endereço | `address` | JSON estruturado | Ver seção específica |

### Estrutura do Endereço (JSON)

```json
{
  "street": "Rua José Cardoso Siqueira",
  "number": "205",
  "complement": null,
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "postal_code": null,
  "full_address": "Rua José Cardoso Siqueira 205"
}
```

### Lógica de Duplicatas

1. **Buscar por telefone**: Primeiro critério de identificação
2. **Buscar por nome**: Se telefone não encontrado
3. **Criar novo**: Se não encontrar correspondência exata
4. **Atualizar endereço**: Se endereço for diferente do cadastrado

## Mapeamento: CSV → Tabela `sale_items`

### Parsing de Produtos

O campo "Produtos" do CSV contém múltiplos itens separados por vírgula. Cada item precisa ser:

1. **Parseado** para extrair quantidade e produto
2. **Mapeado** para produtos existentes no catálogo
3. **Criado** como entrada individual na tabela

### Exemplos de Parsing

| Texto CSV | Quantidade | Produto Inferido | Observações |
|-----------|------------|------------------|-------------|
| "1pc spaten 350ml" | 1 | Spaten Lata 350ml | Pack/unidade |
| "10un Heineken 600ml" | 10 | Heineken 600ml | Unidades individuais |
| "1cx original litrão" | 24 | Original 1L | Caixa = 24 unidades |
| "1 maço rothmans azul" | 1 | Rothmans Azul | Produto de tabacaria |

### Estratégia de Mapeamento

```sql
-- Exemplo de busca de produto
SELECT id, name, sale_price 
FROM products 
WHERE LOWER(name) ILIKE '%heineken%' 
  AND LOWER(name) ILIKE '%600%'
LIMIT 1;
```

### Campos da Tabela `sale_items`

| Campo | Origem | Transformação |
|-------|--------|---------------|
| `sale_id` | FK da venda criada | UUID da venda |
| `product_id` | Busca no catálogo | UUID do produto encontrado |
| `quantity` | Parse do texto CSV | Número extraído |
| `unit_price` | Preço atual do produto | Valor do catálogo na data |

## Mapeamento: CSV → Tabela `delivery_tracking`

### Criação de Timeline

Para cada venda, criar registros de tracking simulando o fluxo:

| Status | Timestamp | Notas | Criado Por |
|--------|-----------|-------|------------|
| `pending` | `created_at` | "Pedido recebido via importação CSV" | Sistema |
| `preparing` | `created_at` + 2 min | "Pedido em preparação" | Sistema |
| `out_for_delivery` | `delivery_started_at` | "Saiu para entrega com [Entregador]" | Sistema |
| `delivered` | `delivery_completed_at` | "Entrega realizada com sucesso" | Sistema |

### Campos da Tabela

| Campo | Valor | Origem |
|-------|-------|--------|
| `sale_id` | FK da venda | UUID da venda criada |
| `status` | Status do momento | Ver tabela acima |
| `notes` | Descrição | Texto explicativo |
| `created_by` | ID do sistema | UUID do usuário admin |
| `created_at` | Timestamp calculado | Baseado na coluna Data/Hora |

## Mapeamento de Valores: Enums e Constantes

### Forma de Pagamento

| Valor CSV | Valor Supabase | Enum |
|-----------|----------------|------|
| "Dinheiro" | "cash" | payment_method |
| "Cartão" | "credit_card" | payment_method |
| "PIX" | "pix" | payment_method |

### Status de Delivery

| Valor CSV | Valor Supabase | Descrição |
|-----------|----------------|-----------|
| "Entregue" | "delivered" | Entrega concluída |
| "" (vazio) | "delivered" | Assumir entregue para CSV histórico |

### Status Geral da Venda

| Delivery Status | Sale Status | Payment Status |
|-----------------|-------------|----------------|
| "delivered" | "completed" | "paid" |

## Tratamento de Entregadores

### Mapeamento de Entregadores

| Nome CSV | Estratégia | Campo Supabase |
|----------|------------|----------------|
| "Victor" | Buscar/criar usuário | `delivery_person_id` |
| "" (vazio) | NULL | `delivery_person_id` |

### Criação de Usuário Entregador

```sql
-- Buscar ou criar entregador Victor
INSERT INTO auth.users (email, role) 
VALUES ('victor.delivery@adega.com', 'delivery')
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (id, name, role)
VALUES ((SELECT id FROM auth.users WHERE email = 'victor.delivery@adega.com'), 'Victor', 'delivery')
ON CONFLICT (id) DO UPDATE SET name = 'Victor';
```

## Script de Importação: Estrutura Recomendada

### 1. Preparação
```sql
-- Criar usuário sistema se não existir
-- Criar entregadores necessários
-- Validar produtos no catálogo
```

### 2. Processamento por Linha
```javascript
for (const row of csvData) {
  // 1. Processar/criar cliente
  const customer = await upsertCustomer(row);
  
  // 2. Criar venda
  const sale = await createSale(row, customer.id);
  
  // 3. Processar itens
  const items = parseProducts(row.Produtos);
  for (const item of items) {
    await createSaleItem(sale.id, item);
  }
  
  // 4. Criar tracking timeline
  await createDeliveryTracking(sale.id, row);
}
```

### 3. Pós-processamento
```sql
-- Atualizar estatísticas
-- Recalcular métricas de clientes
-- Validar integridade referencial
```

## Validações Recomendadas

### Pré-importação
- [ ] Verificar formato de datas
- [ ] Validar valores monetários
- [ ] Confirmar existência de produtos
- [ ] Verificar telefones únicos

### Durante Importação
- [ ] Log de produtos não encontrados
- [ ] Log de clientes duplicados
- [ ] Verificar integridade de valores
- [ ] Validar somas (total + taxa = final)

### Pós-importação
- [ ] Conferir total de registros
- [ ] Validar somas financeiras
- [ ] Verificar criação de clientes
- [ ] Confirmar timeline de tracking

## Considerações Especiais

### Tratamento de Erros
1. **Produtos não encontrados**: Log e continuar
2. **Clientes duplicados**: Usar telefone como chave
3. **Valores inválidos**: Log e usar valor padrão
4. **Datas inválidas**: Log e usar data atual

### Performance
1. **Batch processing**: Processar em lotes de 50-100 registros
2. **Prepared statements**: Para inserções repetitivas
3. **Índices**: Garantir índices nos campos de busca
4. **Transações**: Usar transações por lote

### Reversibilidade
1. **Flag de importação**: Marcar registros importados
2. **Backup**: Fazer backup antes da importação
3. **Log completo**: Registrar todas as operações
4. **Script de rollback**: Para desfazer se necessário

## Exemplo de Implementação

Ver arquivo: `scripts/import-delivery-csv.js` (a ser criado)