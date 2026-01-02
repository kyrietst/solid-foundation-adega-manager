# 🛒 Fluxo Completo de Vendas com Códigos de Barras

> Documentação detalhada do processo de venda usando códigos de barras, desde o escaneamento até a finalização

## 🎯 Visão Geral

O sistema de vendas com códigos de barras do Adega Manager oferece um fluxo otimizado que suporta:
- **Produtos simples** (apenas unidades)
- **Produtos complexos** (unidades + pacotes)
- **Produtos apenas pacotes** (fardos/caixas)

## 📱 Fluxo Principal: Do Código ao Pagamento

### 1. **📱 Escaneamento do Código**

#### Interface do Usuário
```typescript
// Componente: BarcodeScanner
<div className="barcode-scanner-section">
  <Button onClick={handleScanClick}>
    📱 Escanear Código
  </Button>
  <Input
    placeholder="Digite o código manualmente"
    onKeyPress={handleManualCode}
  />
</div>
```

#### Fluxo de Escaneamento
```mermaid
graph TD
    A[Usuário escaneia código] --> B{Código válido?}
    B -->|Não| C[Toast: Código inválido]
    B -->|Sim| D[useBarcode.searchByBarcode()]
    D --> E{Produto encontrado?}
    E -->|Não| F[Toast: Produto não encontrado]
    E -->|Sim| G[Produto encontrado + Tipo detectado]
    G --> H[useProductsGridLogic.handleBarcodeScanned()]
```

### 2. **🔍 Busca e Identificação do Produto**

#### Hook `useBarcode` - Busca Inteligente
```typescript
const searchByBarcode = async (barcode: string) => {
  // Validação inicial
  if (!barcode || barcode.length < 8) {
    return null;
  }

  // 1️⃣ Primeira tentativa: Código principal (unidade)
  const { data: mainProducts } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode);

  if (mainProducts?.[0]) {
    return {
      product: mainProducts[0],
      type: 'main' // Código da unidade
    };
  }

  // 2️⃣ Segunda tentativa: Código de pacote
  const { data: packageProducts } = await supabase
    .from('products')
    .select('*')
    .eq('package_barcode', barcode);

  if (packageProducts?.[0]) {
    return {
      product: packageProducts[0],
      type: 'package' // Código do pacote
    };
  }

  return null; // Não encontrado
};
```

#### Tipos de Toast Informativos
```typescript
// ✅ Código da unidade encontrado
toast({
  title: "✅ Produto encontrado",
  description: `${product.name} - código da unidade`,
  variant: "default"
});

// 📦 Código do pacote encontrado
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

### 3. **⚖️ Lógica de Disponibilidade e Adição ao Carrinho**

#### Algoritmo Ultra-Simples
```typescript
const handleBarcodeScanned = async (barcode: string) => {
  const result = await searchByBarcode(barcode);

  if (result && result.product) {
    const { product, type } = result;

    // Verificar disponibilidade
    const stockUnitsLoose = product.stock_units_loose || 0;
    const stockPackages = product.stock_packages || 0;

    // Determinar variant_id e preço correto
    const variantType = type === 'package' ? 'package' : 'unit';
    const price = variantType === 'package'
      ? (product.package_price || product.price)  // ✅ Preço do pacote
      : product.price;                            // ✅ Preço da unidade

    if (stockUnitsLoose > 0 || stockPackages > 0) {
      await addItem({
        id: product.id,
        variant_id: `${product.id}-${variantType}`,
        name: product.name,
        variant_type: variantType,
        price: price, // ✅ PREÇO CORRETO
        quantity: 1,
        maxQuantity: variantType === 'package' ? stockPackages : stockUnitsLoose,
        units_sold: variantType === 'package' ? (product.units_per_package || 1) : 1,
        packageUnits: variantType === 'package' ? (product.units_per_package || 1) : undefined
      });

      onProductSelect?.(product);
    }
  }
};
```

### 4. **🛒 Adição ao Carrinho e Interface**

#### Estado do Carrinho
```typescript
interface CartItem {
  id: string;                    // ID do produto
  variant_id: string;            // Ex: "product-123-package"
  name: string;                  // Nome do produto
  variant_type: 'unit' | 'package'; // Tipo de venda
  price: number;                 // Preço correto (unidade ou pacote)
  quantity: number;              // Quantidade selecionada
  maxQuantity: number;           // Estoque disponível
  units_sold: number;            // Unidades vendidas (1 para unidade, X para pacote)
  packageUnits?: number;         // Unidades no pacote (apenas para pacotes)
}
```

#### Exibição no Carrinho
```tsx
// Componente: CartItem
<div className="cart-item">
  <h3>{item.name}</h3>
  <div className="item-details">
    <Badge variant={item.variant_type === 'package' ? 'secondary' : 'default'}>
      {item.variant_type === 'package' ? '📦 Pacote' : '📱 Unidade'}
    </Badge>
    <span className="price">R$ {item.price.toFixed(2)}</span>
    <span className="quantity">Qtd: {item.quantity}</span>
    {item.variant_type === 'package' && (
      <span className="package-info">
        ({item.packageUnits} unidades no pacote)
      </span>
    )}
  </div>
</div>
```

### 5. **💰 Cálculos e Finalização**

#### Cálculo do Subtotal
```typescript
const calculateSubtotal = (cartItems: CartItem[]) => {
  return cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Exemplo:
// Item 1: Heineken unidade - R$ 50,00 x 2 = R$ 100,00
// Item 2: Heineken pacote - R$ 130,00 x 1 = R$ 130,00
// Subtotal: R$ 230,00
```

#### Aplicação de Desconto
```typescript
const calculateTotal = (subtotal: number, discountPercentage: number) => {
  const discountAmount = (subtotal * discountPercentage) / 100;
  return {
    subtotal,
    discountAmount,
    total: subtotal - discountAmount
  };
};
```

#### Estrutura de Dados da Venda
```typescript
interface SaleData {
  customer_id?: string;          // Cliente selecionado (opcional)
  items: SaleItem[];             // Itens do carrinho
  payment_method: string;        // Método de pagamento
  total_amount: number;          // Subtotal SEM desconto
  discount_amount: number;       // Valor do desconto aplicado
  delivery_address?: string;     // Endereço de entrega (se aplicável)
  delivery_fee?: number;         // Taxa de entrega
  delivery_person_id?: string;   // ID do entregador
}

interface SaleItem {
  product_id: string;
  quantity: number;
  price: number;                 // Preço unitário (unidade ou pacote)
  sale_type: 'unit' | 'package'; // ✅ CRÍTICO: Tipo da venda
  package_units?: number;        // Para tracking de pacotes
}
```

## 🔄 Cenários de Uso Detalhados

### **Cenário 1: Produto Simples (Apenas Unidades)**
```typescript
// Configuração do produto
const produto = {
  name: "Vinho Tinto Premium",
  barcode: "1234567890123",
  package_barcode: null,
  price: 45.00,
  package_price: null,
  has_package_tracking: false,
  stock_units_loose: 8,
  stock_packages: 0
};

// Fluxo de venda
// 1. Escanear: 1234567890123
// 2. Sistema detecta: type = 'main'
// 3. Toast: "✅ Produto encontrado - código da unidade"
// 4. Adiciona ao carrinho: R$ 45,00
// 5. Sale_item criado: sale_type = 'unit'
```

### **Cenário 2: Produto Complexo (Unidades + Pacotes)**
```typescript
// Configuração do produto
const produto = {
  name: "Cerveja Artesanal",
  barcode: "1111111111111",       // Código da unidade
  package_barcode: "2222222222222", // Código do pack 6
  price: 8.50,                    // Preço da unidade
  package_price: 45.00,           // Preço do pack (6 unidades)
  has_package_tracking: true,
  units_per_package: 6,
  stock_units_loose: 12,          // 12 unidades soltas
  stock_packages: 3               // 3 packs disponíveis
};

// Fluxo A: Escanear código da unidade
// 1. Escanear: 1111111111111
// 2. Sistema detecta: type = 'main'
// 3. Toast: "✅ Produto encontrado - código da unidade"
// 4. Adiciona ao carrinho: R$ 8,50
// 5. Sale_item: { sale_type: 'unit', price: 8.50, units_sold: 1 }

// Fluxo B: Escanear código do pack
// 1. Escanear: 2222222222222
// 2. Sistema detecta: type = 'package'
// 3. Toast: "📦 Produto encontrado - código do fardo (6 unidades)"
// 4. Adiciona ao carrinho: R$ 45,00
// 5. Sale_item: { sale_type: 'package', price: 45.00, units_sold: 6 }
```

### **Cenário 3: Produto Apenas Pacotes**
```typescript
// Configuração do produto
const produto = {
  name: "Caixa de Água Mineral",
  barcode: null,                  // Não vende unidade
  package_barcode: "9876543210987",
  price: 1.50,                    // Preço unitário de referência
  package_price: 18.00,           // Preço da caixa (12 unidades)
  has_package_tracking: true,
  units_per_package: 12,
  stock_units_loose: 0,           // Sem unidades soltas
  stock_packages: 15              // 15 caixas disponíveis
};

// Fluxo de venda
// 1. Escanear: 9876543210987
// 2. Sistema detecta: type = 'package' (só encontra por package_barcode)
// 3. Toast: "📦 Produto encontrado - código do fardo (12 unidades)"
// 4. Adiciona ao carrinho: R$ 18,00
// 5. Sale_item: { sale_type: 'package', price: 18.00, units_sold: 12 }
```

## 🔄 Processo de Finalização da Venda

### **1. Validação Pré-Venda**
```typescript
const validateSale = (cartItems: CartItem[], paymentMethod: string) => {
  const validations = [
    {
      condition: cartItems.length > 0,
      message: "Carrinho não pode estar vazio"
    },
    {
      condition: paymentMethod && paymentMethod !== '',
      message: "Método de pagamento deve ser selecionado"
    },
    {
      condition: cartItems.every(item => item.quantity <= item.maxQuantity),
      message: "Quantidade não pode exceder estoque disponível"
    }
  ];

  return validations.filter(v => !v.condition);
};
```

### **2. Criação da Venda no Banco**
```sql
-- Stored procedure: process_sale
-- Parâmetros de entrada
{
  customer_id: uuid | null,
  items: [
    {
      product_id: uuid,
      quantity: integer,
      price: decimal,
      sale_type: 'unit' | 'package',
      package_units: integer | null
    }
  ],
  payment_method: string,
  discount_amount: decimal,
  delivery_data: {
    address: string | null,
    fee: decimal | null,
    person_id: uuid | null
  }
}
```

### **3. Movimentação de Estoque Automática**
```sql
-- Para cada item vendido, criar movimento de estoque
INSERT INTO inventory_movements (
  product_id,
  quantity,           -- Quantidade vendida (negativo)
  movement_type,      -- 'sale'
  reason,            -- 'Venda processada'
  metadata,          -- Dados da venda
  sale_type          -- ✅ CRÍTICO: 'unit' ou 'package'
);

-- Atualização do estoque do produto
UPDATE products SET
  stock_units_loose = CASE
    WHEN sale_type = 'unit' THEN stock_units_loose - quantity
    ELSE stock_units_loose
  END,
  stock_packages = CASE
    WHEN sale_type = 'package' THEN stock_packages - quantity
    ELSE stock_packages
  END
WHERE id = product_id;
```

### **4. Geração do Comprovante**
```typescript
interface SaleReceipt {
  sale_id: string;
  order_number: number;          // Numeração sequencial
  customer_name?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  created_at: string;
  delivery_info?: {
    address: string;
    fee: number;
    estimated_time: string;
  };
}

interface ReceiptItem {
  name: string;
  variant_type: 'unit' | 'package';
  quantity: number;
  unit_price: number;
  total_price: number;
  package_info?: string;         // Ex: "Pack com 6 unidades"
}
```

## 🚨 Cancelamento de Vendas e Restauração de Estoque

### **Processo de Cancelamento**
```typescript
// Função: cancelSale
const cancelSale = async (saleId: string) => {
  // 1. Chamar stored procedure corrigido
  const result = await supabase.rpc('delete_sale_with_items', {
    p_sale_id: saleId
  });

  // 2. Stored procedure automaticamente:
  //    - Remove sale_items
  //    - Remove sale
  //    - Restaura estoque CORRETAMENTE (pacotes como pacotes, unidades como unidades)
  //    - Cria audit log

  return result;
};
```

### **Stored Procedure Corrigido** (v2.0.1)
```sql
-- Correção crítica aplicada
FOR v_item IN SELECT sale_type, quantity FROM sale_items WHERE sale_id = p_sale_id
LOOP
  -- ✅ RESTAURAÇÃO CORRETA DO ESTOQUE
  SELECT create_inventory_movement(
    v_item.product_id,
    v_quantity_to_restore,
    'inventory_adjustment'::movement_type,
    'Restauração automática - exclusão de venda (CORRIGIDO)',
    jsonb_build_object(...),
    v_item.sale_type  -- ✅ PARÂMETRO CRÍTICO ADICIONADO
  ) INTO v_movement_result;
END LOOP;
```

## 📊 Métricas e Monitoramento

### **KPIs do Sistema de Códigos de Barras**
```sql
-- 1. Taxa de sucesso de escaneamento
SELECT
  COUNT(*) as total_scans,
  COUNT(CASE WHEN result = 'success' THEN 1 END) as successful_scans,
  ROUND(
    COUNT(CASE WHEN result = 'success' THEN 1 END) * 100.0 / COUNT(*), 2
  ) as success_rate
FROM barcode_scan_logs
WHERE DATE(created_at) = CURRENT_DATE;

-- 2. Produtos mais vendidos por tipo
SELECT
  p.name,
  si.sale_type,
  COUNT(*) as vendas,
  SUM(si.quantity) as quantidade_total,
  AVG(si.price) as preco_medio
FROM sale_items si
JOIN products p ON si.product_id = p.id
WHERE DATE(si.created_at) >= DATE('now', '-30 days')
GROUP BY p.name, si.sale_type
ORDER BY vendas DESC;

-- 3. Análise de preços por tipo
SELECT
  si.sale_type,
  COUNT(*) as vendas,
  AVG(si.price) as preco_medio,
  SUM(si.price * si.quantity) as receita_total
FROM sale_items si
WHERE DATE(si.created_at) >= DATE('now', '-7 days')
GROUP BY si.sale_type;
```

### **Alertas de Qualidade**
```sql
-- Vendas suspeitas (pacotes com preço muito baixo)
SELECT
  s.id as sale_id,
  p.name,
  si.sale_type,
  si.price as preco_vendido,
  p.package_price as preco_esperado,
  (p.package_price - si.price) as possivel_perda
FROM sales s
JOIN sale_items si ON s.id = si.sale_id
JOIN products p ON si.product_id = p.id
WHERE si.sale_type = 'package'
  AND si.price < (p.package_price * 0.8)  -- 20% abaixo do esperado
  AND DATE(s.created_at) = CURRENT_DATE;
```

## 🎓 Melhores Práticas

### **Para Usuários Finais**
1. **Escaneamento**: Posicione o código de barras próximo ao scanner
2. **Verificação**: Sempre conferir o preço exibido no toast
3. **Carrinho**: Verificar se tipo (Unidade/Pacote) está correto
4. **Estoque**: Observar se quantidade disponível faz sentido
5. **Finalização**: Confirmar totais antes de processar pagamento

### **Para Administradores**
1. **Cadastro**: Sempre configurar ambos os códigos quando aplicável
2. **Preços**: Verificar se preço do pacote > preço da unidade
3. **Testes**: Testar ambos os códigos após cadastro
4. **Monitoramento**: Verificar vendas suspeitas diariamente
5. **Treinamento**: Orientar equipe sobre diferentes tipos de produtos

### **Para Desenvolvedores**
1. **Logs**: Manter logs detalhados para debug
2. **Validação**: Sempre validar tipo de código antes de usar preço
3. **Testes**: Implementar testes automatizados para cenários críticos
4. **Monitoramento**: Alertas para vendas com preços inconsistentes
5. **Documentação**: Manter esta documentação atualizada

---

**✅ Sistema Testado e Validado**: Fluxo completo testado com produtos reais em ambiente de produção

**🔄 Última Atualização**: 27 de setembro de 2025 - Correções críticas v2.0.1 aplicadas