# 📱 Sistema de Códigos de Barras - Guia Completo

> Sistema inteligente de leitura e gestão de códigos de barras para unidades e pacotes

## 🎯 Visão Geral

O sistema de códigos de barras do Adega Manager suporta **dois tipos de códigos por produto**:
- **Código da Unidade** (`barcode`) - Para venda individual
- **Código do Pacote** (`package_barcode`) - Para venda de fardos/caixas

## 🏗️ Arquitetura do Sistema

### Campos na Tabela `products`
```sql
-- Códigos de barras
barcode VARCHAR(14)         -- Código da unidade individual
package_barcode VARCHAR(14) -- Código do pacote/fardo

-- Preços correspondentes
price DECIMAL(10,2)         -- Preço da unidade individual
package_price DECIMAL(10,2) -- Preço do pacote/fardo

-- Controles de estoque
stock_units_loose INTEGER   -- Unidades soltas disponíveis
stock_packages INTEGER      -- Pacotes disponíveis

-- Configuração
has_package_tracking BOOLEAN     -- Se o produto tem rastreamento de pacotes
units_per_package INTEGER        -- Quantas unidades tem em cada pacote
```

### Exemplo Prático: Heineken 269ml
```sql
-- Produto configurado corretamente
name: "Heineken 269ml"
barcode: "7896045506590"           -- Código da unidade
package_barcode: "7896045506606"   -- Código do fardo
price: 50.00                       -- R$ 50,00 por unidade
package_price: 130.00              -- R$ 130,00 por fardo
units_per_package: 3               -- 3 unidades por fardo
stock_units_loose: 10              -- 10 unidades soltas
stock_packages: 5                  -- 5 fardos disponíveis
has_package_tracking: true         -- Rastreamento ativo
```

## ⚡ Fluxo de Leitura de Código

### 1. Hook `useBarcode` - Busca Inteligente
```typescript
const searchByBarcode = async (barcode: string) => {
  // 1️⃣ Primeiro: Busca por código principal (unidade)
  const mainProduct = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode);

  if (mainProduct) {
    return { product: mainProduct, type: 'main' };
  }

  // 2️⃣ Segundo: Busca por código de pacote
  const packageProduct = await supabase
    .from('products')
    .select('*')
    .eq('package_barcode', barcode);

  if (packageProduct) {
    return { product: packageProduct, type: 'package' };
  }

  // 3️⃣ Não encontrado
  return null;
};
```

### 2. Hook `useProductsGridLogic` - Processamento
```typescript
const handleBarcodeScanned = async (barcode: string) => {
  const result = await searchByBarcode(barcode);

  if (result && result.product) {
    const { product, type } = result;

    // 🎯 LÓGICA CRÍTICA: Determinar preço correto
    const variantType = type === 'package' ? 'package' : 'unit';
    const price = variantType === 'package'
      ? (product.package_price || product.price)  // ✅ Preço do pacote
      : product.price;                            // ✅ Preço da unidade

    // Adicionar ao carrinho com dados corretos
    await addItem({
      id: product.id,
      variant_id: `${product.id}-${variantType}`,
      variant_type: variantType,
      price: price,  // ✅ PREÇO CORRETO BASEADO NO TIPO
      quantity: 1,
      maxQuantity: variantType === 'package' ? stockPackages : stockUnitsLoose,
      units_sold: variantType === 'package' ? (product.units_per_package || 1) : 1,
      packageUnits: variantType === 'package' ? (product.units_per_package || 1) : undefined
    });
  }
};
```

## 🔄 Estados de Disponibilidade

### Lógica Ultra-Simples de Adição ao Carrinho
```typescript
const handleAddToCart = async (product: Product) => {
  const stockUnitsLoose = product.stock_units_loose || 0;
  const stockPackages = product.stock_packages || 0;

  if (stockUnitsLoose > 0 && stockPackages > 0) {
    // 🔀 TEM AMBOS: Abrir modal para usuário escolher
    openProductSelection(product);

  } else if (stockUnitsLoose > 0) {
    // 📦 SÓ TEM UNIDADES: Adicionar unidade automaticamente
    await addItem({
      variant_type: 'unit',
      price: product.price,
      maxQuantity: stockUnitsLoose,
      // ...
    });

  } else if (stockPackages > 0) {
    // 📦 SÓ TEM PACOTES: Adicionar pacote automaticamente
    await addItem({
      variant_type: 'package',
      price: product.package_price || product.price,
      maxQuantity: stockPackages,
      // ...
    });
  }
  // ❌ Se não tem nem unidades nem pacotes: não fazer nada
};
```

## 🎯 Formatos Suportados

### Validação de Códigos
```typescript
const validateBarcode = (barcode: string): BarcodeValidation => {
  const cleanCode = barcode.replace(/\D/g, ''); // Remove não-dígitos

  // Comprimento deve ser entre 8-14 dígitos
  if (cleanCode.length < 8 || cleanCode.length > 14) {
    return { isValid: false, error: 'Código deve ter entre 8 e 14 dígitos' };
  }

  // Determinar formato
  switch (cleanCode.length) {
    case 8:  return { isValid: true, format: 'EAN-8' };
    case 12: return { isValid: true, format: 'UPC-A' };
    case 13: return { isValid: true, format: 'EAN-13' };
    case 14: return { isValid: true, format: 'CODE-128' };
    default: return { isValid: true, format: 'CUSTOM' };
  }
};
```

### Formatos Aceitos
| Formato | Dígitos | Exemplo | Uso Comum |
|---------|---------|---------|-----------|
| **EAN-13** | 13 | `7896045506590` | Produtos brasileiros |
| **EAN-8** | 8 | `12345678` | Produtos pequenos |
| **UPC-A** | 12 | `123456789012` | Produtos americanos |
| **CODE-128** | 14 | `12345678901234` | Fardos/Pacotes |
| **CUSTOM** | 9-11 | `123123123` | Códigos internos |

## 🛒 Interface do Usuário

### Toasts Informativos
```typescript
// ✅ Produto encontrado por código da unidade
toast({
  title: "✅ Produto encontrado",
  description: `${product.name} - código da unidade`,
  variant: "default"
});

// 📦 Produto encontrado por código do pacote
toast({
  title: "📦 Produto encontrado",
  description: `${product.name} - código do fardo (${product.package_units || 1} unidades)`,
  variant: "default"
});

// ❌ Produto não encontrado
toast({
  title: "Produto não encontrado",
  description: `Nenhum produto encontrado com o código ${barcode}`,
  variant: "destructive"
});
```

### Modal de Seleção de Variante
Quando produto tem **ambos** tipos de estoque (unidades E pacotes), o sistema abre modal para usuário escolher:

```typescript
<ProductSelectionModal
  product={selectedProduct}
  onConfirm={handleProductSelectionConfirm}
  onCancel={closeProductSelection}
/>
```

## 🔧 Configuração de Produtos

### Cenário 1: Produto Somente Unidades
```typescript
const produto = {
  name: "Vinho Tinto",
  barcode: "1234567890123",     // ✅ Código da unidade
  package_barcode: null,        // ❌ Não tem pacote
  price: 35.00,                 // ✅ Preço da unidade
  package_price: null,          // ❌ Não aplicável
  has_package_tracking: false,  // ❌ Sem rastreamento
  stock_units_loose: 15,        // ✅ 15 unidades disponíveis
  stock_packages: 0             // ❌ Sem pacotes
};
```

### Cenário 2: Produto Somente Pacotes
```typescript
const produto = {
  name: "Caixa de Água",
  barcode: null,                // ❌ Não vende unidade
  package_barcode: "9876543210987", // ✅ Código do pacote
  price: 2.50,                  // 💡 Preço unitário de referência
  package_price: 30.00,         // ✅ Preço do pacote (12 unidades)
  has_package_tracking: true,   // ✅ Rastreamento ativo
  units_per_package: 12,        // ✅ 12 unidades por pacote
  stock_units_loose: 0,         // ❌ Sem unidades soltas
  stock_packages: 8             // ✅ 8 pacotes disponíveis
};
```

### Cenário 3: Produto Completo (Unidades + Pacotes)
```typescript
const produto = {
  name: "Cerveja Lager",
  barcode: "1111111111111",     // ✅ Código da unidade
  package_barcode: "2222222222222", // ✅ Código do fardo
  price: 4.50,                  // ✅ Preço da unidade
  package_price: 25.00,         // ✅ Preço do fardo (6 unidades)
  has_package_tracking: true,   // ✅ Rastreamento ativo
  units_per_package: 6,         // ✅ 6 unidades por fardo
  stock_units_loose: 3,         // ✅ 3 unidades soltas
  stock_packages: 4             // ✅ 4 fardos disponíveis
};
```

## 🚨 Problemas Comuns e Soluções

### ❌ Erro: "Preço incorreto ao escanear pacote"
**Sintoma**: Código do pacote adiciona produto com preço da unidade

**Causa**: Lógica de preços não considera o tipo de código escaneado

**Solução**:
```typescript
// ✅ CORRETO: Preço baseado no tipo
price: variantType === 'package'
  ? (product.package_price || product.price)
  : product.price
```

### ❌ Erro: "Produto não encontrado"
**Sintoma**: Código existe mas sistema não encontra

**Possíveis Causas**:
1. **Código mal digitado** - Verificar caracteres especiais
2. **Produto não cadastrado** - Verificar se existe no banco
3. **Campo errado** - Código pode estar em `barcode` ou `package_barcode`

**Debug**:
```sql
-- Buscar produto por código em ambos os campos
SELECT name, barcode, package_barcode
FROM products
WHERE barcode = 'CODIGO_AQUI'
   OR package_barcode = 'CODIGO_AQUI';
```

### ❌ Erro: "Estoque incorreto após cancelamento"
**Sintoma**: Venda de pacote cancelada restaura unidades em vez de pacotes

**Causa**: Stored procedure `delete_sale_with_items` sem parâmetro `p_movement_type`

**Solução**: Migration `fix_delete_sale_with_items_missing_parameter` já aplicada

## 📊 Monitoramento e Debug

### Logs de Debug Disponíveis
```typescript
// ✅ Ativar logs detalhados no console
console.log('[DEBUG] useBarcode - Iniciando busca por código:', barcode);
console.log('[DEBUG] useBarcode - Busca por barcode principal:', { found: !!mainProduct });
console.log('[DEBUG] useBarcode - Busca por package_barcode:', { found: !!packageProduct });
console.log('[DEBUG] useProductsGridLogic - produto encontrado:', { productId, barcodeType });
```

### Verificações no Banco de Dados
```sql
-- 1. Verificar configuração do produto
SELECT
  name,
  barcode,
  package_barcode,
  price,
  package_price,
  has_package_tracking,
  units_per_package,
  stock_units_loose,
  stock_packages
FROM products
WHERE name ILIKE '%produto_teste%';

-- 2. Verificar vendas recentes com códigos
SELECT
  s.id as sale_id,
  si.sale_type,
  si.quantity,
  si.price,
  p.name as product_name,
  p.barcode,
  p.package_barcode
FROM sales s
JOIN sale_items si ON s.id = si.sale_id
JOIN products p ON si.product_id = p.id
ORDER BY s.created_at DESC
LIMIT 10;

-- 3. Verificar movimentações de estoque
SELECT
  im.movement_type,
  im.quantity,
  im.reason,
  im.metadata->>'sale_type' as sale_type,
  p.name as product_name
FROM inventory_movements im
JOIN products p ON im.product_id = p.id
ORDER BY im.created_at DESC
LIMIT 10;
```

## 🎯 Melhores Práticas

### ✅ Para Configuração de Produtos
1. **Sempre definir ambos os preços** quando `has_package_tracking = true`
2. **Códigos únicos** - Nunca reutilizar códigos entre produtos
3. **Validar comprimento** - Entre 8-14 dígitos numéricos
4. **Testar ambos os códigos** após cadastro

### ✅ Para Uso no Sistema
1. **Escanear devagar** - Permitir leitura completa do código
2. **Verificar toast** - Confirmar se produto e tipo estão corretos
3. **Conferir preço** - Validar se preço no carrinho está certo
4. **Testar cancelamentos** - Verificar se estoque volta corretamente

### ✅ Para Troubleshooting
1. **Logs primeiro** - Sempre verificar console do navegador
2. **Banco segundo** - Queries de verificação no Supabase
3. **Testes manuais** - Reproduzir cenário com produto conhecido
4. **Migration history** - Verificar se correções foram aplicadas

## 📚 Arquivos Relacionados

### Hooks Principais
- `src/features/inventory/hooks/use-barcode.ts` - Busca e validação
- `src/shared/hooks/products/useProductsGridLogic.ts` - Lógica do carrinho

### Componentes de UI
- `src/features/sales/components/ProductSelectionModal.tsx` - Seleção de variante
- `src/features/inventory/components/NewProductModal.tsx` - Cadastro de produtos

### Database
- `supabase/migrations/20250927101008_fix_delete_sale_with_items_missing_parameter.sql`

### Documentação
- `docs/07-changelog/README.md` - Histórico de correções
- `docs/06-operations/troubleshooting/` - Solução de problemas

---

**📈 Sistema Testado e Aprovado**: Todas as funcionalidades foram validadas com produtos reais em ambiente de produção.

**🔄 Última Atualização**: 27 de setembro de 2025 - Correções críticas v2.0.1