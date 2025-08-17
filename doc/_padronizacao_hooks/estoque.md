# Documentação - Página de Estoque

## Visão Geral

A página de **Estoque** é o módulo central de gerenciamento de inventário do sistema, oferecendo funcionalidades completas para administração de produtos, controle de estoque, análise de giro e operações de movimentação. Implementa um padrão avançado **Container/Presentational** com hooks especializados.

## Arquivo Principal

**Localização**: `src/features/inventory/components/InventoryManagement.tsx`  
**Tipo**: Componente Container Principal  
**Padrão**: Container/Presentation + Feature-based Architecture

## Arquitetura de Hooks

### 1. Hook Principal - `useProductsGridLogic`
**Localização**: `src/hooks/products/useProductsGridLogic.ts`

```typescript
export const useProductsGridLogic = (config: ProductsGridConfig = {}) => {
  // Integração com múltiplos hooks especializados
  const { addItem } = useCart();
  const { searchByBarcode } = useBarcode();
  
  // Query principal de produtos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'available'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, image_url, barcode, category')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Integração com hooks de filtros, categorias e paginação
  const { filteredProducts, ... } = useProductFilters(products, initialCategory);
  const { categoryCounts, ... } = useProductCategories(products);
  const { currentProducts, ... } = usePagination(filteredProducts, {
    initialItemsPerPage: 12,
    resetOnItemsChange: true
  });

  return {
    // 25+ propriedades e métodos expostos de forma organizada
    products, currentProducts, categories, isLoading,
    searchTerm, selectedCategory, hasActiveFilters,
    currentPage, totalPages, totalItems,
    setSearchTerm, setSelectedCategory, clearFilters,
    handleBarcodeScanned, handleAddToCart
  };
};
```

**Características Principais**:
- **Coordenador Central**: Integra 6 hooks especializados
- **Query Otimizada**: Busca apenas campos necessários
- **Configurável**: Interface `ProductsGridConfig` para flexibilidade
- **Handlers Integrados**: Barcode scanning e carrinho de compras
- **25+ Propriedades**: Interface completa e organizada

### 2. Hook de Cálculos - `useInventoryCalculations`
**Localização**: `src/features/inventory/hooks/useInventoryCalculations.ts`

```typescript
export const useInventoryCalculations = (productData: Partial<ProductFormData>) => {
  const calculations = useMemo((): ProductCalculations => {
    const { price = 0, cost_price = 0, package_size = 1 } = productData;

    // Cálculos de margem por unidade
    const unitProfitAmount = price - cost_price;
    const unitMargin = cost_price > 0 ? (unitProfitAmount / cost_price) * 100 : 0;

    // Cálculos para preço por pacote
    const calculatedPackagePrice = package_price || (price * package_size);
    const packageCostPrice = cost_price * package_size;
    const packageMargin = packageCostPrice > 0 ? (packageProfitAmount / packageCostPrice) * 100 : 0;

    return {
      unitMargin: Math.round(unitMargin * 100) / 100,
      packageMargin: Math.round(packageMargin * 100) / 100,
      unitProfitAmount, packageProfitAmount,
      pricePerUnit: price, pricePerPackage: calculatedPackagePrice
    };
  }, [productData]);

  return {
    calculations,
    calculatePriceWithMargin,
    calculateRequiredMargin,
    validateProductData,
    calculateTurnoverRate
  };
};
```

**Funcionalidades**:
- **Cálculos Financeiros**: Margem, lucro, preços por unidade/pacote
- **Validação Completa**: Validação de dados do produto
- **Taxa de Giro**: Análise de turnover (fast/medium/slow)
- **Funções Utilitárias**: Cálculo de preços e margens

### 3. Hook de Estoque Baixo - `useLowStock`
**Localização**: `src/features/inventory/hooks/useLowStock.ts`

```typescript
export const useLowStock = () => {
  return useQuery<LowStockProduct[]>({
    queryKey: ['products', 'lowStock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,stock_quantity,minimum_stock');
      if (error) throw error;
      const safeData = (data ?? []) as LowStockProduct[];
      return safeData.filter(
        (p) => p.stock_quantity <= (p.minimum_stock ?? 5)
      );
    },
    staleTime: 1000 * 60, // 1 min
  });
};
```

**Características**:
- **Monitoramento Automático**: Detecta produtos com estoque baixo
- **Padrão Inteligente**: Usa 5 como mínimo padrão se não definido
- **Cache Otimizado**: 1 minuto de staleTime para dados frescos
- **Interface Simples**: Retorna array filtrado de produtos

### 4. Hook de Produto Individual - `useProduct`
**Localização**: `src/features/inventory/hooks/use-product.ts`

```typescript
export function useProduct(productId?: string | null) {
  return useQuery<Product | null>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export function useProductByBarcode(barcode?: string | null) {
  return useQuery<Product | null>({
    queryKey: ['product', 'barcode', barcode],
    queryFn: async () => {
      if (!barcode) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error?.code === 'PGRST116') return null; // Não encontrado
      if (error) throw error;
      
      return data;
    },
    enabled: !!barcode,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
```

**Funcionalidades**:
- **Busca por ID**: Query condicional habilitada apenas com ID válido
- **Busca por Barcode**: Integração com sistema de código de barras
- **Tratamento de Erros**: Handling específico para produto não encontrado
- **Cache Longo**: 5 minutos de staleTime para dados de produto

## Estrutura de Componentes

### Container Principal
```typescript
// InventoryManagement.tsx - Componente principal que coordena tudo
const InventoryManagement: React.FC<InventoryManagementProps> = ({
  showAddButton = false,
  showSearch = true,
  showFilters = true,
  onProductSelect,
  className,
}) => {
  // Estados para modais
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);

  // Mutations para operações CRUD
  const addProductMutation = useMutation({ ... });
  const editProductMutation = useMutation({ ... });
  const stockAdjustmentMutation = useMutation({ ... });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header com título e contador */}
      <ProductsTitle />
      
      {/* Container principal com glassmorphism */}
      <ProductsGridContainer
        mode="inventory"
        onViewDetails={handleViewDetails}
        onEdit={handleEditProduct}
        onAdjustStock={handleAdjustStock}
      />

      {/* Modais para operações */}
      <Dialog open={isAddProductOpen}>
        <ProductForm onSubmit={handleSubmitProduct} />
      </Dialog>
      
      <ProductDetailsModal product={selectedProduct} />
      <StockAdjustmentModal product={selectedProduct} />
      <StockHistoryModal product={selectedProduct} />
    </div>
  );
};
```

### Container/Presentation Pattern
```typescript
// ProductsGridContainer.tsx - Container que coordena lógica
export const ProductsGridContainer: React.FC<ProductsGridContainerProps> = ({ 
  mode = 'sales',
  variant = 'default',
  glassEffect = true,
  ...config 
}) => {
  // Lógica centralizada no hook
  const {
    products, currentProducts, categories,
    isLoading, searchTerm, selectedCategory,
    handleBarcodeScanned, handleAddToCart,
    // ... 25+ propriedades
  } = useProductsGridLogic(config);

  // Preparar props para apresentação
  const presentationProps = {
    products, currentProducts, categories,
    isLoading, searchTerm, selectedCategory,
    onSearchChange: setSearchTerm,
    onCategoryChange: setSelectedCategory,
    onBarcodeScanned: handleBarcodeScanned,
    // ... todos os handlers
  };

  return <ProductsGridPresentation {...presentationProps} />;
};
```

## Operações CRUD com React Query

### 1. Adição de Produto
```typescript
const addProductMutation = useMutation({
  mutationFn: async (productData: ProductFormData) => {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        price: productData.price,
        stock_quantity: productData.stock_quantity,
        // ... 20+ campos do produto
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setIsAddProductOpen(false);
    showSuccess(`Produto "${data.name}" adicionado com sucesso!`);
  },
  onError: (error: any) => {
    showError('Erro ao adicionar produto. Tente novamente.');
  },
});
```

### 2. Ajuste de Estoque
```typescript
const stockAdjustmentMutation = useMutation({
  mutationFn: async (adjustment: StockAdjustment) => {
    const currentStock = selectedProduct?.stock_quantity || 0;
    let newStockQuantity: number;
    
    if (adjustment.type === 'ajuste') {
      newStockQuantity = adjustment.newStock || 0;
    } else {
      newStockQuantity = adjustment.type === 'entrada' 
        ? currentStock + adjustment.quantity
        : Math.max(0, currentStock - adjustment.quantity);
    }

    // Usar função de registro de movimentação
    const { data: movementData, error: movementError } = await supabase
      .rpc('record_product_movement', {
        p_product_id: adjustment.productId,
        p_type: adjustment.type,
        p_quantity: adjustment.type === 'ajuste' 
          ? (newStockQuantity - currentStock)
          : adjustment.quantity,
        p_reason: adjustment.reason,
        p_source: 'manual',
        p_user_id: (await supabase.auth.getUser()).data.user?.id || null
      });

    if (movementError) throw movementError;
    return movementData;
  },
  onSuccess: (data, variables) => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    const typeText = variables.type === 'entrada' ? 'Entrada' : 
                    variables.type === 'saida' ? 'Saída' : 'Correção';
    showSuccess(`${typeText} de estoque realizada com sucesso!`);
  }
});
```

## Modais de Operação

### 1. ProductDetailsModal
- **Visualização completa**: Todos os dados do produto
- **Ações disponíveis**: Editar, Ajustar Estoque, Ver Histórico
- **Design responsivo**: Layout adaptável

### 2. StockAdjustmentModal
- **Tipos de movimento**: Entrada, Saída, Ajuste
- **Integração com RPC**: Função `record_product_movement`
- **Validação**: Quantidade e motivo obrigatórios

### 3. StockHistoryModal
- **Histórico completo**: Todas as movimentações do produto
- **Filtros por tipo**: Entrada, saída, ajuste, devolução
- **Auditoria**: Usuário e timestamp de cada movimento

## Integração com Sistema

### 1. Integração com Vendas
```typescript
// No modo 'sales', produtos podem ser adicionados ao carrinho
const handleAddToCart = (product: Product) => {
  addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    maxQuantity: product.stock_quantity
  });
  onProductSelect?.(product);
};
```

### 2. Integração com Barcode
```typescript
// Scanner de código de barras integrado
const handleBarcodeScanned = async (barcode: string) => {
  const product = await searchByBarcode(barcode);
  if (product && product.stock_quantity > 0) {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      maxQuantity: product.stock_quantity
    });
    onProductSelect?.(product);
  }
};
```

### 3. Alertas de Estoque Baixo
```typescript
// Monitoramento automático no dashboard
const { data: lowStockProducts } = useLowStock();
// Produtos com stock_quantity <= minimum_stock são alertados
```

## Funcionalidades Avançadas

### 1. Análise de Giro (Turnover)
```typescript
const calculateTurnoverRate = (salesLast30Days: number, averageStock: number): TurnoverRate => {
  if (averageStock <= 0) return 'slow';
  
  const turnoverRatio = salesLast30Days / averageStock;
  
  if (turnoverRatio >= 2) return 'fast';    // Giro rápido
  if (turnoverRatio >= 0.5) return 'medium'; // Giro médio
  return 'slow';                             // Giro lento
};
```

### 2. Cálculos Financeiros
```typescript
// Cálculos automáticos de margem e lucro
const calculations = {
  unitMargin: (price - cost_price) / cost_price * 100,
  packageMargin: (package_price - package_cost) / package_cost * 100,
  unitProfitAmount: price - cost_price,
  packageProfitAmount: package_price - package_cost
};
```

### 3. Validação Completa
```typescript
const validateProductData = (data: Partial<ProductFormData>) => {
  const errors: string[] = [];
  
  if (!data.name?.trim()) errors.push('Nome do produto é obrigatório');
  if (!data.category?.trim()) errors.push('Categoria é obrigatória');
  if (typeof data.price !== 'number' || data.price < 0) 
    errors.push('Preço deve ser um valor positivo');
  
  return { isValid: errors.length === 0, errors };
};
```

## Design System

### 1. Glassmorphism
```typescript
<div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hero-spotlight p-4 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300">
```

### 2. Responsividade
```typescript
gridColumns = { mobile: 1, tablet: 2, desktop: 3 }
```

### 3. Animations
```typescript
// Hero spotlight effect
onMouseMove={handleMouseMove}
// Transições suaves em hover e estados
transition-all duration-300
```

## Padrões de Desenvolvimento

### 1. Container/Presentation
- **Container**: Lógica, estado, data fetching
- **Presentation**: UI pura, props tipadas, sem side effects

### 2. Feature-based Architecture
- **Hooks especializados**: Cada funcionalidade tem seu hook
- **Composição**: Hooks são combinados no container principal
- **Separação de responsabilidades**: Cálculos, validação, queries separados

### 3. TypeScript Rigoroso
- **Interfaces completas**: Todos os tipos definidos
- **Branded types**: IDs tipados para segurança
- **Utility types**: Partial, Pick, Omit para flexibilidade

## Performance

### 1. React Query Optimization
```typescript
queryKey: ['products', 'available']        // Cache por categoria
staleTime: 1000 * 60 * 5                  // 5 min para produtos
select: 'id, name, price, stock_quantity'  // Campos mínimos
```

### 2. Pagination
```typescript
const { currentProducts } = usePagination(filteredProducts, {
  initialItemsPerPage: 12,
  resetOnItemsChange: true
});
```

### 3. Memoization
```typescript
const calculations = useMemo(() => {
  // Cálculos complexos apenas quando dados mudam
}, [productData]);
```

## Conclusão

A página de **Estoque** representa a implementação mais avançada do sistema, com:

- **Architecture Pattern**: Container/Presentation + Feature-based
- **6 Hooks Especializados**: Cada um com responsabilidade específica
- **Performance Otimizada**: React Query + Memoization + Pagination
- **UX Avançada**: Glassmorphism + Animations + Responsive Design
- **Funcionalidades Completas**: CRUD + Análise + Alertas + Integração

É um exemplo perfeito de como implementar um módulo complexo mantendo código limpo, performance e extensibilidade.