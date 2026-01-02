# SSoT Migration Templates

**Version:** v3.0.0
**Purpose:** Reference templates for migrating legacy components to SSoT architecture
**Audience:** Developers, AI Assistants

---

## Modal Migration Pattern

### Legacy → SuperModal

**Before: Legacy modal implementation (100+ lines)**
```typescript
interface OldModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: FormData;
  onSubmit: (data: FormData) => void;
}

const OldProductModal: React.FC<OldModalProps> = ({
  isOpen, onClose, data, onSubmit
}) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 80+ lines of form handling, validation, submit logic...
};
```

**After: SuperModal implementation (20-30 lines)**
```typescript
const ProductModalSuperModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  productData?: ProductData;
  onSubmit: (data: ProductData) => Promise<void>;
}> = ({ isOpen, onClose, productData, onSubmit }) => (
  <SuperModal<ProductData>
    isOpen={isOpen}
    onClose={onClose}
    modalType={productData ? "edit" : "create"}
    title={productData ? "Editar Produto" : "Novo Produto"}
    formData={productData || initialProductData}
    onSubmit={onSubmit}
    validationSchema={productValidationSchema}
    debug={process.env.NODE_ENV === 'development'}
  >
    {({ data, updateField, errors }) => (
      <ProductFormFields
        data={data}
        updateField={updateField}
        errors={errors}
      />
    )}
  </SuperModal>
);
```

**Code Reduction:** 67-82% | **Time Saved:** 95%+

---

## Table Migration Pattern

### Custom Table → DataTable

**Before: Custom table implementation (200+ lines)**
```typescript
const CustomProductTable: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // 150+ lines of sorting, pagination, search, rendering logic...
};
```

**After: DataTable implementation (50-80 lines)**
```typescript
const ProductTableUnified: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const columns: TableColumn<Product>[] = [
    {
      key: 'name',
      title: 'Nome',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    // Additional columns...
  ];

  return (
    <DataTable<Product>
      data={data || []}
      columns={columns}
      loading={isLoading}
      error={error}
      variant="default"
      glassEffect={true}
      virtualization={true}
      searchPlaceholder="Buscar produtos..."
      emptyStateProps={{
        title: "Nenhum produto encontrado",
        description: "Adicione produtos para começar",
        icon: Package
      }}
    />
  );
};
```

**Code Reduction:** 90%+ | **Time Saved:** 95%+

---

## Business Logic Migration

### Scattered → Centralized Hooks

**Before: Business logic scattered across components**
```typescript
const ProductComponent: React.FC<{ product: Product }> = ({ product }) => {
  // Duplicated calculations across multiple components
  const margin = ((product.price - product.cost_price) / product.price) * 100;
  const isLowStock = product.stock_quantity < 10;
  const salesVelocity = product.totalSold / 30; // Simplified
  const performance = salesVelocity > 1 ? 'good' : 'poor';

  // Component-specific business logic...
};
```

**After: Centralized business logic with hooks**
```typescript
const ProductComponent: React.FC<{ product: Product }> = ({ product }) => {
  const {
    performance,
    insights,
    needsRestock,
    isStarPerformer,
    calculateOptimalPrice,
    getReorderRecommendation
  } = useProductOperations(product);

  // Clean component focused on rendering
  return (
    <div>
      <Badge className={performance.overallPerformance === 'star' ? 'text-accent-gold' : ''}>
        {performance.overallPerformance}
      </Badge>
      {needsRestock && (
        <Alert>
          {getReorderRecommendation().message}
        </Alert>
      )}
    </div>
  );
};
```

**Code Reduction:** 80%+ | **Maintainability:** ∞ improvement

---

## Migration Checklist

### Pre-Migration Analysis
- [ ] **Identify component type**: Modal, Table, Form, Business Logic
- [ ] **Count current lines of code** for impact measurement
- [ ] **List current features** to preserve during migration
- [ ] **Check dependencies** on legacy patterns
- [ ] **Identify reusable business logic** for hook extraction

### Migration Execution
- [ ] **Create new component** using appropriate SSoT pattern
- [ ] **Preserve all existing functionality** in new implementation
- [ ] **Add TypeScript interfaces** for type safety
- [ ] **Implement error handling** and loading states
- [ ] **Add accessibility features** (WCAG AAA compliance)
- [ ] **Test with real data** from production dataset

### Post-Migration Validation
- [ ] **Compare line count** - expect 70-95% reduction
- [ ] **Performance test** - ensure no regressions
- [ ] **User acceptance test** - verify UX improvements
- [ ] **Code review** - validate SSoT patterns implemented
- [ ] **Update imports** in consuming components
- [ ] **Remove legacy component** after full validation

### Success Metrics
- **Code Reduction**: ___% reduction in lines of code
- **Development Speed**: Time to create similar component in future
- **Type Safety**: 100% TypeScript coverage achieved
- **Accessibility**: WCAG AAA compliance verified
- **Maintainability**: Single source of truth established

---

## Migration Priority Matrix

### High Priority (Immediate Migration)
- Modals with complex form handling
- Tables with duplicate sorting/filtering logic
- Components with scattered business calculations
- Forms without proper validation

### Medium Priority (Next Sprint)
- Simple display components with minor duplication
- Utility components with basic functionality
- Legacy hooks that can be consolidated
- Components with moderate complexity

### Low Priority (Future Iterations)
- Components with minimal duplication
- Highly customized components without clear SSoT fit
- Third-party integrations requiring special handling
- Components scheduled for complete redesign

---

## References

- **SuperModal Source:** `src/shared/ui/composite/SuperModal.tsx`
- **DataTable Source:** `src/shared/ui/layout/DataTable.tsx`
- **Business Hooks:** `src/shared/hooks/business/`
- **SSoT Guide:** `docs/02-architecture/SSOT_SYSTEM_ARCHITECTURE.md`
- **Real Migration Example:** `docs/03-modules/customers/CUSTOMER_DATATABLE_SSOT_MIGRATION.md`

---

**Last Updated:** October 9, 2025
**Maintained By:** Development Team
