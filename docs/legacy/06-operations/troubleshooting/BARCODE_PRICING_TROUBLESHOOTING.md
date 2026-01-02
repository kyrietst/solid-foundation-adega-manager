# 🚨 Troubleshooting: Problemas de Preços em Códigos de Barras

> Guia completo para diagnosticar e resolver problemas relacionados a preços incorretos ao escanear códigos de barras

## 🎯 Visão Geral

Este guia foca especificamente em problemas onde o **código de barras funciona** (produto é encontrado), mas o **preço adicionado ao carrinho está incorreto**. Este foi um bug crítico identificado e corrigido na v2.0.1.

## 🚨 Problema Crítico Identificado

### 🔴 **Bug: Código de Pacote com Preço de Unidade**

**Sintoma**:
- Escanear código do pacote adiciona produto ao carrinho
- ✅ Produto correto é encontrado
- ✅ Toast mostra "código do fardo"
- ❌ **Preço no carrinho é da unidade, não do pacote**

**Exemplo Real**:
```
Produto: Heineken 269ml
Código Unidade: 7896045506590 (R$ 50,00)
Código Pacote: 7896045506606 (R$ 130,00)

❌ ANTES (BUG):
- Escanear 7896045506606 (pacote)
- Carrinho mostra: R$ 50,00 (preço da unidade)
- Perda: R$ 80,00 por venda

✅ DEPOIS (CORRIGIDO):
- Escanear 7896045506606 (pacote)
- Carrinho mostra: R$ 130,00 (preço correto do pacote)
```

## 🔍 Diagnóstico Rápido

### 1. **Teste Simples de Verificação**
```typescript
// Teste manual no console do navegador
console.log("Testando produto:");
console.log("Preço unidade:", product.price);
console.log("Preço pacote:", product.package_price);
console.log("Tipo detectado:", type); // 'main' ou 'package'
console.log("Preço usado:", price); // Deve ser condicional
```

### 2. **Verificação no Banco de Dados**
```sql
-- Query de verificação rápida
SELECT
  name,
  barcode,
  package_barcode,
  price as preco_unidade,
  package_price as preco_pacote,
  (package_price - price) as diferenca
FROM products
WHERE name ILIKE '%heineken%'
   OR name ILIKE '%teste%';
```

### 3. **Logs de Debug no Console**
```javascript
// Procurar por estas mensagens no console:
[DEBUG] useBarcode - Busca por package_barcode: { found: true }
[DEBUG] useProductsGridLogic - produto encontrado: { barcodeType: 'package' }
[DEBUG] useProductsGridLogic - chamando addItem com: { price: 130.00 } // ✅ Correto
```

## 🛠️ Soluções por Sintoma

### 🔴 **Sintoma 1: Preço sempre da unidade, independente do código**

**Diagnóstico**: Lógica de preços não considera o tipo de código escaneado

**Arquivo**: `src/shared/hooks/products/useProductsGridLogic.ts`

**Localização**: Função `handleBarcodeScanned` → linha ~139

**Código Problemático**:
```typescript
// ❌ ERRADO: Sempre usa preço da unidade
const itemToAdd = {
  price: product.price, // Sempre R$ 50,00
  // ...
};
```

**Correção Aplicada**:
```typescript
// ✅ CORRETO: Preço baseado no tipo do código
const itemToAdd = {
  price: variantType === 'package'
    ? (product.package_price || product.price)  // R$ 130,00 para pacote
    : product.price,                            // R$ 50,00 para unidade
  // ...
};
```

### 🔴 **Sintoma 2: Toast correto mas preço errado no carrinho**

**Diagnóstico**: Hook `useBarcode` detecta tipo correto, mas `useProductsGridLogic` ignora

**Verificação**:
```typescript
// 1. Verificar se searchByBarcode retorna tipo correto
const result = await searchByBarcode('7896045506606');
console.log(result); // Deve ser { product: {...}, type: 'package' }

// 2. Verificar se variantType é calculado corretamente
const variantType = type === 'package' ? 'package' : 'unit';
console.log('variantType:', variantType); // Deve ser 'package'

// 3. Verificar se preço é calculado corretamente
const price = variantType === 'package'
  ? (product.package_price || product.price)
  : product.price;
console.log('price calculado:', price); // Deve ser 130.00
```

### 🔴 **Sintoma 3: Erro "Cannot read property 'package_price' of undefined"**

**Diagnóstico**: Produto não tem campo `package_price` configurado

**Verificação no banco**:
```sql
SELECT
  name,
  package_price,
  has_package_tracking
FROM products
WHERE package_barcode = 'CODIGO_ESCANEADO';
```

**Correções necessárias**:
```sql
-- Se package_price está NULL mas deveria ter valor
UPDATE products
SET package_price = 130.00
WHERE name = 'Heineken 269ml';

-- Se has_package_tracking está false mas deveria ser true
UPDATE products
SET has_package_tracking = true
WHERE package_barcode IS NOT NULL AND package_barcode != '';
```

### 🔴 **Sintoma 4: Código de pacote não é encontrado**

**Diagnóstico**: Código está no campo errado ou produto não existe

**Debug steps**:
```sql
-- 1. Verificar se código existe em algum lugar
SELECT name, barcode, package_barcode
FROM products
WHERE barcode = 'CODIGO_AQUI'
   OR package_barcode = 'CODIGO_AQUI';

-- 2. Verificar caracteres especiais ou espaços
SELECT name, LENGTH(package_barcode), package_barcode
FROM products
WHERE package_barcode LIKE '%PARTE_DO_CODIGO%';

-- 3. Verificar produtos similares
SELECT name, package_barcode
FROM products
WHERE name ILIKE '%heineken%';
```

## 🔧 Ferramentas de Debug

### 1. **Debug Console Script**
```javascript
// Cole este script no console do navegador
function debugBarcodeSystem(barcode) {
  console.group(`🔍 Debug Barcode System: ${barcode}`);

  // Simular busca
  fetch('/api/products?barcode=' + barcode)
    .then(r => r.json())
    .then(products => {
      console.log('Produtos encontrados:', products.length);

      products.forEach(product => {
        console.log('\n📦 Produto:', product.name);
        console.log('Código unidade:', product.barcode);
        console.log('Código pacote:', product.package_barcode);
        console.log('Preço unidade:', product.price);
        console.log('Preço pacote:', product.package_price);
        console.log('Tem rastreamento:', product.has_package_tracking);

        // Simular lógica de preços
        const isPackage = product.package_barcode === barcode;
        const calculatedPrice = isPackage
          ? (product.package_price || product.price)
          : product.price;
        console.log('🎯 Preço que deveria usar:', calculatedPrice);
      });
    });

  console.groupEnd();
}

// Usar: debugBarcodeSystem('7896045506606')
```

### 2. **Query de Verificação Completa**
```sql
-- Query para verificar configuração completa de produtos com códigos de barras
SELECT
  name as produto,
  barcode as codigo_unidade,
  package_barcode as codigo_pacote,
  price as preco_unidade,
  package_price as preco_pacote,
  CASE
    WHEN package_price IS NULL THEN '❌ Preço pacote faltando'
    WHEN package_price <= price THEN '⚠️ Preço pacote menor que unidade'
    ELSE '✅ Preços OK'
  END as status_precos,
  has_package_tracking as rastreamento_ativo,
  units_per_package as unidades_por_pacote,
  stock_units_loose as estoque_unidades,
  stock_packages as estoque_pacotes
FROM products
WHERE package_barcode IS NOT NULL
  AND package_barcode != ''
ORDER BY name;
```

### 3. **Teste de Integração Simples**
```typescript
// Teste manual para validar correção
async function testBarcodeIntegration() {
  const testCases = [
    { code: '7896045506590', expectedType: 'main', expectedPrice: 50.00 },
    { code: '7896045506606', expectedType: 'package', expectedPrice: 130.00 }
  ];

  for (const test of testCases) {
    console.log(`\n🧪 Testando: ${test.code}`);

    const result = await searchByBarcode(test.code);

    if (!result) {
      console.error('❌ Produto não encontrado');
      continue;
    }

    const { product, type } = result;
    console.log('✅ Produto encontrado:', product.name);
    console.log('Tipo detectado:', type, type === test.expectedType ? '✅' : '❌');

    const calculatedPrice = type === 'package'
      ? (product.package_price || product.price)
      : product.price;

    console.log('Preço calculado:', calculatedPrice);
    console.log('Preço esperado:', test.expectedPrice);
    console.log('Status:', calculatedPrice === test.expectedPrice ? '✅ CORRETO' : '❌ INCORRETO');
  }
}
```

## 📊 Checklist de Verificação

### ✅ **Antes de Reportar Bug**
- [ ] Produto existe no banco de dados
- [ ] Campos `barcode` e `package_barcode` estão preenchidos
- [ ] Campos `price` e `package_price` têm valores diferentes
- [ ] Campo `has_package_tracking` está `true`
- [ ] Console do navegador não mostra erros JavaScript
- [ ] Migration `fix_delete_sale_with_items_missing_parameter` foi aplicada

### ✅ **Configuração Correta do Produto**
- [ ] `name`: Nome claro do produto
- [ ] `barcode`: Código da unidade (8-14 dígitos)
- [ ] `package_barcode`: Código do pacote (8-14 dígitos, diferente do barcode)
- [ ] `price`: Preço da unidade individual
- [ ] `package_price`: Preço do pacote/fardo (maior que price)
- [ ] `has_package_tracking`: `true`
- [ ] `units_per_package`: Número de unidades no pacote
- [ ] `stock_units_loose`: Estoque de unidades soltas
- [ ] `stock_packages`: Estoque de pacotes

### ✅ **Teste de Funcionamento**
- [ ] Escanear código da unidade adiciona com preço da unidade
- [ ] Escanear código do pacote adiciona com preço do pacote
- [ ] Toast mostra tipo correto ("código da unidade" vs "código do fardo")
- [ ] Carrinho exibe preço correto imediatamente
- [ ] Venda pode ser finalizada sem erros
- [ ] Cancelamento restaura estoque corretamente

## 🚑 Soluções de Emergência

### **Solução Temporária: Correção Manual do Preço**
Se o bug ainda persiste e você precisa de uma solução imediata:

1. **Identificar vendas com preço incorreto**:
```sql
-- Vendas de pacotes com preço de unidade (suspeitas)
SELECT
  s.id as sale_id,
  si.sale_type,
  si.price as preco_vendido,
  p.package_price as preco_correto_pacote,
  (p.package_price - si.price) as diferenca_perdida,
  s.created_at
FROM sales s
JOIN sale_items si ON s.id = si.sale_id
JOIN products p ON si.product_id = p.id
WHERE si.sale_type = 'package'
  AND si.price < p.package_price
  AND s.created_at > '2025-09-27'  -- Vendas após identificação do bug
ORDER BY s.created_at DESC;
```

2. **Corrigir preços manualmente** (use com cuidado):
```sql
-- ATENÇÃO: Apenas em emergência e com backup!
UPDATE sale_items
SET price = (
  SELECT package_price
  FROM products
  WHERE id = sale_items.product_id
)
WHERE sale_type = 'package'
  AND price < (
    SELECT package_price
    FROM products
    WHERE id = sale_items.product_id
  );
```

### **Verificação de Integridade Pós-Correção**
```sql
-- Verificar se todas as vendas de pacote têm preço correto
SELECT
  COUNT(*) as vendas_pacote_suspeitas
FROM sales s
JOIN sale_items si ON s.id = si.sale_id
JOIN products p ON si.product_id = p.id
WHERE si.sale_type = 'package'
  AND si.price != p.package_price;
-- Resultado deve ser 0
```

## 📞 **Quando Escalar o Problema**

### Escalar para Desenvolvedor se:
- [ ] Código está atualizado (v2.0.1+) mas problema persiste
- [ ] Migrations foram aplicadas mas bug continua
- [ ] Console mostra erros JavaScript relacionados
- [ ] Problema afeta múltiplos produtos
- [ ] Correção manual não resolve

### Informações para Incluir no Reporte:
1. **Versão**: Sistema v2.0.1+ ou anterior?
2. **Migration Status**: `npm run migration:status`
3. **Produto específico**: Nome, códigos, preços configurados
4. **Console logs**: Copiar mensagens de debug completas
5. **Reprodução**: Passos exatos para reproduzir
6. **Impacto**: Quantas vendas foram afetadas?

---

**✅ Status da Correção**: Bug identificado e corrigido na v2.0.1 - Migration aplicada em produção

**🔄 Última Atualização**: 27 de setembro de 2025 - Guia baseado em caso real resolvido