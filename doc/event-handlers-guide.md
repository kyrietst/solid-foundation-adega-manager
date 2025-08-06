# Guia de Padronização: Event Handlers

## 📋 Convenções de Nomenclatura

### Padrão Básico
```typescript
// ✅ Correto - Padrão unificado
onAction: (data) => void
handleAction: () => void

// ❌ Evitar - Inconsistente
actionHandler: () => void
doAction: () => void
processAction: () => void
```

### Hierarquia de Handlers

1. **Componente Interno** (`handle*`)
   ```typescript
   const handleSubmit = (data) => {
     // Lógica interna do componente
     props.onSubmit?.(data);
   };
   ```

2. **Props do Componente** (`on*`)
   ```typescript
   interface ComponentProps {
     onSubmit?: (data: FormData) => void;
     onCancel?: () => void;
   }
   ```

3. **Context/Store Actions** (`*Action` ou métodos diretos)
   ```typescript
   const { createUser, updateUser } = useUserOperations();
   ```

## 🎯 Ações Padronizadas

### CRUD Operations
```typescript
// Padrão obrigatório para todas entidades
onCreate?: (data: Partial<T>) => void;
onEdit?: (item: T) => void;        // Abrir edição
onUpdate?: (item: T) => void;      // Salvar edição
onDelete?: (id: string) => void;
onView?: (item: T) => void;
onSelect?: (item: T) => void;
```

### Dialog/Modal Operations
```typescript
onOpen?: (data?: T) => void;
onClose?: () => void;
onConfirm?: (data?: T) => void;
onCancel?: () => void;
```

### Form Operations
```typescript
onSubmit?: (data: T) => void;
onReset?: () => void;
onFieldChange?: (field: keyof T, value: any) => void;
onValidate?: (data: T) => boolean | string[];
```

### List/Grid Operations
```typescript
onSort?: (field: keyof T, direction: 'asc' | 'desc') => void;
onFilter?: (filters: Record<string, any>) => void;
onSearch?: (term: string) => void;
onPageChange?: (page: number) => void;
```

## 📝 Exemplos por Módulo

### Products (Inventory)
```typescript
// ✅ Padronizado
interface ProductGridProps {
  products: Product[];
  onSelect?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onAddToCart?: (productId: string, quantity?: number) => void;
}

// ❌ Antes (inconsistente)
interface ProductGridProps {
  products: Product[];
  handleProductClick?: (product: Product) => void;
  editProduct?: (product: Product) => void;
  deleteHandler?: (id: string) => void;
  addToCartAction?: (productId: string) => void;
}
```

### Customers (CRM)
```typescript
// ✅ Padronizado
interface CustomerTableProps {
  customers: Customer[];
  onSelect?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (customerId: string) => void;
}
```

### Sales
```typescript
// ✅ Padronizado
interface SalesListProps {
  sales: Sale[];
  onView?: (sale: Sale) => void;
  onRefund?: (saleId: string) => void;
  onPrintReceipt?: (saleId: string) => void;
  onUpdateStatus?: (saleId: string, status: SaleStatus) => void;
}
```

## 🔧 Implementação Prática

### 1. Interface do Componente
```typescript
import { BaseEventHandlers } from '@/types/handlers.types';

interface ProductCardProps extends BaseEventHandlers<Product> {
  product: Product;
  showActions?: boolean;
}
```

### 2. Implementação do Componente
```typescript
export const ProductCard = ({ product, onEdit, onDelete, onSelect }: ProductCardProps) => {
  const handleEdit = () => onEdit?.(product);
  const handleDelete = () => onDelete?.(product.id);
  const handleSelect = () => onSelect?.(product);

  return (
    <Card onClick={handleSelect}>
      {/* UI */}
      <Button onClick={handleEdit}>Editar</Button>
      <Button onClick={handleDelete}>Excluir</Button>
    </Card>
  );
};
```

### 3. Uso no Componente Pai
```typescript
export const ProductGrid = () => {
  const { editProduct, deleteProduct } = useProductOperations();
  
  const handleEdit = (product: Product) => {
    openEditDialog(product);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Confirma exclusão?')) {
      deleteProduct(id);
    }
  };

  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
```

## 🎨 Patterns Avançados

### Conditional Handlers
```typescript
interface ActionButtonProps {
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ActionButton = ({ canEdit, canDelete, onEdit, onDelete }: ActionButtonProps) => (
  <div>
    {canEdit && <Button onClick={onEdit}>Editar</Button>}
    {canDelete && <Button onClick={onDelete}>Excluir</Button>}
  </div>
);
```

### Handler Composition
```typescript
const useEntityHandlers = <T>(operations: EntityOperations<T>) => {
  const [selected, setSelected] = useState<T | null>(null);
  
  return {
    onSelect: setSelected,
    onCreate: operations.create,
    onEdit: (item: T) => {
      setSelected(item);
      openEditDialog(item);
    },
    onDelete: operations.delete,
  };
};
```

### Error Handling Pattern
```typescript
const createSafeHandler = <T extends any[]>(
  handler: (...args: T) => void | Promise<void>,
  errorMessage = 'Erro na operação'
) => {
  return async (...args: T) => {
    try {
      await handler(...args);
    } catch (error) {
      console.error(errorMessage, error);
      toast.error(errorMessage);
    }
  };
};
```

## ✅ Checklist de Padronização

### Para Novos Componentes
- [ ] Usar interfaces `*EventHandlers` do types/handlers.types.ts
- [ ] Seguir padrão `on*` para props públicas
- [ ] Usar `handle*` para handlers internos
- [ ] Implementar error handling nos handlers críticos
- [ ] Documentar handlers específicos da entidade

### Para Refatoração
- [ ] Identificar handlers inconsistentes
- [ ] Renomear seguindo padrão `on*`
- [ ] Agrupar handlers relacionados em interfaces
- [ ] Testar todas as interações após mudança
- [ ] Atualizar testes se necessário

## 🚀 Benefícios

1. **Consistência**: Mesmo padrão em toda aplicação
2. **Predictibilidade**: Desenvolvedores sabem o que esperar
3. **Manutenibilidade**: Fácil localizar e modificar handlers
4. **Type Safety**: TypeScript pode inferir melhor os tipos
5. **Reutilização**: Interfaces podem ser compostas e estendidas

---

Esta padronização deve ser seguida rigorosamente em todo o codebase para manter a consistência e qualidade do código.