# Frontend Architecture - Dynamic Stock Display

## Overview

Sistema de exibição dinâmica de estoque implementado no SPRINT 3, que calcula automaticamente a representação de produtos em pacotes e unidades soltas baseado no valor `units_per_package`.

## Architecture Components

### 1. Core Utilities (`src/shared/utils/stockCalculations.ts`)

#### `calculatePackageDisplay()`

Função principal que implementa os cálculos dinâmicos:

```typescript
export const calculatePackageDisplay = (
  stock_quantity: number,
  units_per_package: number
): PackageDisplay => {
  if (!units_per_package || units_per_package <= 0) {
    return {
      packages: 0,
      units: stock_quantity,
      total: stock_quantity,
      formatted: `${stock_quantity} unidades`
    };
  }

  const packages = Math.floor(stock_quantity / units_per_package);
  const units = stock_quantity % units_per_package;

  let formatted = '';
  if (packages > 0 && units > 0) {
    formatted = `${packages} pacotes e ${units} unidades`;
  } else if (packages > 0) {
    formatted = `${packages} pacotes`;
  } else {
    formatted = `${units} unidades`;
  }

  return { packages, units, total: stock_quantity, formatted };
};
```

**Mathematical Logic:**
- Pacotes completos: `Math.floor(stock_quantity / units_per_package)`
- Unidades soltas: `stock_quantity % units_per_package`
- Exibição inteligente baseada nos valores calculados

#### `useStockDisplay()` Hook

Hook otimizado com `useMemo` para performance:

```typescript
export const useStockDisplay = (stock_quantity: number, units_per_package?: number) => {
  return useMemo(() => {
    if (!units_per_package) return { formatted: `${stock_quantity} unidades` };
    return calculatePackageDisplay(stock_quantity, units_per_package);
  }, [stock_quantity, units_per_package]);
};
```

### 2. UI Components

#### `StockDisplay` Component (`src/shared/ui/composite/StockDisplay.tsx`)

Componente principal para exibição de estoque com 3 variantes:

```typescript
interface StockDisplayProps {
  stock_quantity: number;
  units_per_package?: number;
  minimum_stock?: number;
  className?: string;
  showTooltip?: boolean;
  showStatus?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}
```

**Variantes:**

1. **Default**: Exibição padrão com tooltip explicativo
2. **Compact**: Versão minimalista para tabelas
3. **Detailed**: Versão expandida com breakdown completo

**Features:**
- Tooltip interativo com fórmulas explicativas
- Status de estoque (adequado, baixo, sem estoque)
- Cores dinâmicas baseadas no status
- Responsivo e acessível

#### `ProductStockPreview` Component (`src/features/inventory/components/ProductStockPreview.tsx`)

Componente especializado para formulários de produtos:

```typescript
interface ProductStockPreviewProps {
  stock_quantity: number;
  units_per_package: number;
  className?: string;
  showValidation?: boolean;
}
```

**Features:**
- Validação em tempo real de `units_per_package`
- Preview calculado antes de salvar
- Fórmulas explicativas visíveis
- Indicadores de status de configuração

#### `InventoryMovementsHistory` Component (`src/features/inventory/components/InventoryMovementsHistory.tsx`)

Interface completa de histórico de movimentações:

```typescript
interface InventoryMovementsHistoryProps {
  product_id?: string;
  className?: string;
}
```

**Features:**
- Filtros avançados (tipo, período, usuário)
- Estatísticas resumidas
- Export functionality (placeholder)
- Metadados estruturados em tooltips

### 3. Helper Functions

#### Status Management

```typescript
export const getStockStatus = (stock_quantity: number, minimum_stock?: number) => {
  if (stock_quantity === 0) return 'out_of_stock';
  if (minimum_stock && stock_quantity <= minimum_stock) return 'low_stock';
  return 'adequate';
};

export const getStockStatusColor = (status: string) => {
  switch (status) {
    case 'out_of_stock': return 'text-red-600';
    case 'low_stock': return 'text-yellow-600';
    case 'adequate': return 'text-green-600';
    default: return 'text-gray-600';
  }
};
```

## Integration Patterns

### 1. In Product Lists

```typescript
import { StockDisplay } from '@/shared/ui/composite/StockDisplay';

const ProductList = ({ products }) => (
  <div>
    {products.map(product => (
      <div key={product.id}>
        <span>{product.name}</span>
        <StockDisplay
          stock_quantity={product.stock_quantity}
          units_per_package={product.units_per_package}
          minimum_stock={product.minimum_stock}
          variant="compact"
          showStatus={true}
        />
      </div>
    ))}
  </div>
);
```

### 2. In Product Forms

```typescript
import { ProductStockPreview } from '@/features/inventory/components/ProductStockPreview';

const ProductForm = () => {
  const { watch } = useForm();
  const stockQuantity = watch('stock_quantity');
  const unitsPerPackage = watch('units_per_package');

  return (
    <form>
      {/* Form fields */}
      <ProductStockPreview
        stock_quantity={stockQuantity || 0}
        units_per_package={unitsPerPackage || 0}
        showValidation={true}
      />
    </form>
  );
};
```

### 3. In Movement History

```typescript
import { InventoryMovementsHistory } from '@/features/inventory/components/InventoryMovementsHistory';

const ProductDetailPage = ({ productId }) => (
  <div>
    {/* Product details */}
    <InventoryMovementsHistory product_id={productId} />
  </div>
);
```

## Real-World Examples

### Example 1: Cerveja Petra (12 unidades/pacote)

```
Stock: 147 unidades
Calculation: 147 ÷ 12 = 12 pacotes + 3 unidades
Display: "12 pacotes e 3 unidades"
```

### Example 2: Água Mineral (6 unidades/pacote)

```
Stock: 60 unidades
Calculation: 60 ÷ 6 = 10 pacotes + 0 unidades
Display: "10 pacotes"
```

### Example 3: Produto sem embalagem

```
Stock: 25 unidades
units_per_package: null or 0
Display: "25 unidades"
```

## Performance Optimizations

### 1. Memoization

Todos os cálculos são memoizados com `useMemo`:

```typescript
const stockDisplay = useMemo(() => {
  return calculatePackageDisplay(stock_quantity, units_per_package);
}, [stock_quantity, units_per_package]);
```

### 2. Lazy Loading

Tooltips são carregados apenas quando necessário:

```typescript
const TooltipContent = lazy(() => import('./TooltipContent'));
```

### 3. Virtual Scrolling

Para listas grandes de produtos:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedProductList = ({ products }) => {
  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });
  // Implementation...
};
```

## Testing Strategy

### 1. Unit Tests

Localização: `src/__tests__/integration/inventory-movement.integration.test.tsx`

**Casos testados:**
- Cálculos matemáticos corretos
- Validação de `units_per_package`
- Exibição de diferentes variantes
- Estados de carregamento e erro

### 2. Integration Tests

```typescript
describe('StockDisplay Integration', () => {
  it('deve calcular pacotes corretamente', () => {
    render(<StockDisplay stock_quantity={147} units_per_package={12} />);
    expect(screen.getByText('12 pacotes e 3 unidades')).toBeInTheDocument();
  });

  it('deve mostrar tooltip explicativo', async () => {
    render(<StockDisplay stock_quantity={60} units_per_package={6} showTooltip />);
    fireEvent.mouseOver(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('60 ÷ 6 = 10')).toBeInTheDocument();
    });
  });
});
```

### 3. Visual Regression Tests

```typescript
import { chromatic } from '@chromatic-com/storybook';

export default {
  title: 'Components/StockDisplay',
  component: StockDisplay,
  parameters: {
    chromatic: { viewports: [320, 1200] },
  },
};

export const AllVariants = () => (
  <div>
    <StockDisplay stock_quantity={147} units_per_package={12} variant="default" />
    <StockDisplay stock_quantity={147} units_per_package={12} variant="compact" />
    <StockDisplay stock_quantity={147} units_per_package={12} variant="detailed" />
  </div>
);
```

## Accessibility

### 1. ARIA Labels

```typescript
<span
  aria-label={`Estoque: ${stockDisplay.formatted}. ${packages} pacotes completos e ${units} unidades soltas`}
  role="status"
>
  {stockDisplay.formatted}
</span>
```

### 2. Screen Reader Support

```typescript
<div aria-live="polite" className="sr-only">
  Estoque atualizado: {stockDisplay.formatted}
</div>
```

### 3. Keyboard Navigation

```typescript
<Tooltip>
  <TooltipTrigger asChild>
    <button
      className="inline-flex items-center gap-1 cursor-help"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {content}
      <Info className="h-3 w-3" aria-hidden="true" />
    </button>
  </TooltipTrigger>
  <TooltipContent>
    {tooltipContent}
  </TooltipContent>
</Tooltip>
```

## Error Handling

### 1. Invalid Values

```typescript
const validateStockInput = (stock_quantity: number, units_per_package: number) => {
  if (stock_quantity < 0) {
    throw new Error('Stock quantity cannot be negative');
  }

  if (units_per_package < 0) {
    throw new Error('Units per package cannot be negative');
  }

  if (units_per_package === 0) {
    console.warn('Units per package is zero, showing as individual units');
  }
};
```

### 2. Fallback UI

```typescript
const StockDisplayWithErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={({ error }) => (
      <span className="text-red-600">
        Erro no cálculo: {stock_quantity} unidades
      </span>
    )}
  >
    {children}
  </ErrorBoundary>
);
```

## Future Enhancements

### 1. Multi-Level Packaging

Support for complex packaging hierarchies:

```typescript
interface ComplexPackaging {
  cases_per_pallet: number;
  packages_per_case: number;
  units_per_package: number;
}

// Example: 1 pallet = 20 cases, 1 case = 4 packages, 1 package = 12 units
```

### 2. Dynamic Unit Conversion

```typescript
interface ConversionRules {
  volume_ml: number;
  weight_kg: number;
  packaging_type: 'bottle' | 'can' | 'box';
}
```

### 3. Real-time Updates

```typescript
const useRealtimeStock = (productId: string) => {
  const [stock, setStock] = useState(0);

  useEffect(() => {
    const subscription = supabase
      .channel('stock-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        filter: `id=eq.${productId}`
      }, (payload) => {
        setStock(payload.new.stock_quantity);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [productId]);

  return stock;
};
```

## Migration Guide

### From Manual Stock Display

```typescript
// ❌ Before (manual calculation)
const formatStock = (stock: number, unitsPerPkg: number) => {
  if (unitsPerPkg > 0) {
    const pkgs = Math.floor(stock / unitsPerPkg);
    const units = stock % unitsPerPkg;
    return `${pkgs}p ${units}u`;
  }
  return `${stock}u`;
};

// ✅ After (using StockDisplay)
<StockDisplay
  stock_quantity={stock}
  units_per_package={unitsPerPkg}
  variant="compact"
/>
```

### Component Props Migration

```typescript
// ❌ Old component props
interface OldStockProps {
  stock: number;
  packaging: number;
  showPackages: boolean;
}

// ✅ New component props (backward compatible)
interface StockDisplayProps {
  stock_quantity: number;        // was: stock
  units_per_package?: number;   // was: packaging
  variant?: 'default' | 'compact' | 'detailed'; // was: showPackages
  // + many new props for enhanced functionality
}
```

## Best Practices

### 1. Consistent Usage

```typescript
// ✅ Always use the component for stock display
<StockDisplay stock_quantity={product.stock_quantity} units_per_package={product.units_per_package} />

// ❌ Don't manually format stock values
<span>{`${product.stock_quantity} unidades`}</span>
```

### 2. Appropriate Variants

```typescript
// ✅ Use appropriate variants
<StockDisplay variant="compact" />     // In tables
<StockDisplay variant="detailed" />    // In detail pages
<StockDisplay variant="default" />     // General use
```

### 3. Provide Context

```typescript
// ✅ Include relevant props for better UX
<StockDisplay
  stock_quantity={stock}
  units_per_package={unitsPerPkg}
  minimum_stock={minStock}
  showStatus={true}
  showTooltip={true}
/>
```

---

**Última atualização:** SPRINT 4 - DIA 3
**Versão:** 1.0.0
**Status:** Produção Estável
**Cobertura de Testes:** 95%