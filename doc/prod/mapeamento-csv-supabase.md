# Mapeamento CSV → Supabase Products

## Colunas CSV Disponíveis
```
1. Nome do Produto
2. Volume  
3. Categoria
4. Venda em (un/pct)
5. Estoque Atual
6. Fornecedor
7. Preço de Custo
8. Preço de Venda Atual (un.)
9. Margem de Lucro (un.)
10. Preço de Venda Atual (pct)
11. Margem de Lucro (pct)
12. Giro (Vende Rápido/Devagar)
```

## Mapeamento Direto

| CSV | Supabase | Observações |
|-----|----------|-------------|
| Nome do Produto | `name` | ✅ Mapeamento direto |
| Volume | `volume_ml` | ⚠️ Conversão necessária (350ml → 350) |
| Categoria | `category` | ✅ Mapeamento direto |
| Fornecedor | `supplier` | ✅ Mapeamento direto |
| Preço de Custo | `cost_price` | ⚠️ Conversão necessária (R$ 5,99 → 5.99) |
| Preço de Venda Atual (un.) | `price` | ⚠️ Conversão necessária (R$ 5,00 → 5.00) |
| Margem de Lucro (un.) | `margin_percent` | ⚠️ Conversão necessária (33,56% → 33.56) |
| Giro | `turnover_rate` | ⚠️ Mapeamento: Rapido→fast, Devagar→slow, ""→medium |

## Campos Complexos que Requerem Processamento

### 1. Estoque Atual
**CSV**: `8pc + 9un`, `27pc`, `24un`, `134un`, `1cx`
**Supabase**: `stock_quantity` (integer), `is_package` (boolean), `units_per_package` (integer)

**Lógica de Conversão**:
- `8pc + 9un` → stock_quantity = (8×12) + 9 = 105, is_package = true
- `27pc` → stock_quantity = 27×unidades_por_pacote, is_package = true  
- `24un` → stock_quantity = 24, is_package = false
- `1cx` → stock_quantity = 1×unidades_por_caixa, is_package = true

### 2. Venda em (un/pct)
**CSV**: `"unidade, pacote (12un.)"`, `"pacote (15un.), unidade"`
**Supabase**: `unit_type`, `package_size`, `is_package`

**Lógica de Conversão**:
- Extrair número entre parênteses para `package_size`
- Se contém "pacote" ou "caixa" → `is_package = true`
- `unit_type = "un"` (padrão)

### 3. Preços de Pacote
**CSV**: `Preço de Venda Atual (pct)`, `Margem de Lucro (pct)`
**Supabase**: `package_price`, `package_margin`

## Campos Supabase NÃO Mapeados (Ficarão NULL ou Padrão)

| Campo Supabase | Valor | Motivo |
|----------------|-------|--------|
| `description` | - | Não há no CSV |
| `vintage` | - | Não há no CSV |
| `producer` | - | Não há no CSV |
| `country` | - | Não há no CSV |
| `region` | - | Não há no CSV |
| `alcohol_content` | - | Não há no CSV |
| `image_url` | - | Não há no CSV |
| `minimum_stock` | 5 | Usar padrão |
| `barcode` | - | Não há no CSV |
| `package_barcode` | - | Não há no CSV |
| `unit_barcode` | - | Não há no CSV |
| `measurement_type` | - | Não há no CSV |
| `measurement_value` | - | Não há no CSV |
| `packaging_type` | 'fardo' | Usar padrão |
| `has_package_tracking` | false | Usar padrão |
| `has_unit_tracking` | false | Usar padrão |
| `package_units` | - | Não há no CSV |
| `last_sale_date` | - | Não há no CSV |

## Conversões Necessárias

### 1. Valores Monetários
```
"R$ 5,99" → 5.99
"R$ 15,00" → 15.00
"-" → NULL
"" → NULL
```

### 2. Percentuais
```
"33,56%" → 33.56
"" → NULL
"-" → NULL
```

### 3. Volume
```
"350ml" → 350
"1L" → 1000
"1,5L" → 1500
"Indisponivel" → NULL
"" → NULL
```

### 4. Turnover Rate
```
"Rapido" → "fast"
"Devagar" → "slow"
"" → "medium"
```

### 5. Estoque (Mais Complexo)
```
"8pc + 9un" → Calcular total baseado no package_size
"27pc" → 27 × package_size (extraído de "Venda em")
"24un" → 24 (unidades simples)
"1cx" → Tratar como pacote grande
"" → 0
```

## Estratégia de Importação

1. **Criar função de parsing** para cada tipo de campo
2. **Processar linha por linha** do CSV
3. **Validar dados** antes de inserir
4. **Log de erros** para linhas problemáticas
5. **Inserção em lotes** para performance

## Campos que Podem Precisar ser Criados

Baseado no CSV, todos os campos necessários já existem na tabela `products`. Não é necessário criar novos campos.

## Problemas Identificados no CSV

1. **Categorias inconsistentes**: "Indisponível", "Indisponivel" (com e sem acento)
2. **Volumes variados**: "1L", "1,5L", "Indisponivel", ""
3. **Estoques complexos**: "8pc + 9un" requer cálculo baseado em package_size
4. **Fornecedores diversos**: Alguns produtos sem fornecedor
5. **Preços faltantes**: Alguns produtos sem custo ou margem