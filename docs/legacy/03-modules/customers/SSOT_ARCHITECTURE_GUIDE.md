# SSoT Architecture Guide - Customer Module

## 🏛️ Single Source of Truth Architecture

**SSoT (Single Source of Truth)** is the foundational architecture pattern for the Customer module, ensuring centralized business logic, eliminated code duplication, and improved maintainability.

---

## 📐 Core Principles

### 1. Centralized Business Logic
- **One source**: All customer-related calculations in dedicated hooks
- **No duplication**: Eliminate redundant logic across components
- **Reusability**: Business logic reusable across the entire application

### 2. Component Separation
- **Container components**: Handle data fetching and state management
- **Presentation components**: Pure UI rendering with props
- **Business hooks**: Isolated business logic and calculations

### 3. Type Safety
- **Consistent interfaces**: Shared TypeScript definitions
- **Strong typing**: All business operations fully typed
- **Export centralization**: Single source for types and hooks

---

## 🗂️ Architecture Structure

### Directory Organization
```
/src/shared/hooks/business/
├── useCustomerOperations.ts     # Core customer business logic
├── useCustomerPurchaseHistory.ts # Purchase data processing
├── useCustomerAnalytics.ts      # Analytics and AI insights
└── index.ts                     # Centralized exports

/src/features/customers/components/
├── CustomerProfile.tsx          # Main container (283 lines)
├── CustomerProfileHeader.tsx    # Header with metrics
├── CustomerOverviewTab.tsx      # Dashboard + timeline
├── CustomerPurchaseHistoryTab.tsx # Purchases + financial
├── CustomerInsightsTab.tsx      # Analytics + AI
├── CustomerCommunicationTab.tsx # Communication tools
└── CustomerActionsTab.tsx       # Revenue-focused actions
```

### Data Flow Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Raw Data      │───▶│  Business Hooks  │───▶│  UI Components  │
│ (API responses) │    │     (SSoT)       │    │ (Presentation)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │ Calculated Data  │
                       │ • Metrics        │
                       │ • Insights       │
                       │ • Validations    │
                       └──────────────────┘
```

---

## 🔧 Implementation Patterns

### Business Hook Pattern
```tsx
// Template for SSoT business hooks
export const useCustomerOperations = (customerData: Partial<CustomerData> = {}) => {

  // ============================================================================
  // CALCULATED METRICS
  // ============================================================================
  const metrics = useMemo((): CustomerMetrics => {
    // All business calculations here
    // LTV, segmentation, loyalty scores, etc.
    return calculatedMetrics;
  }, [customerData]);

  // ============================================================================
  // BUSINESS INSIGHTS
  // ============================================================================
  const insights = useMemo((): CustomerInsights => {
    // Derived insights from metrics
    // Risk factors, opportunities, profile completeness
    return calculatedInsights;
  }, [customerData, metrics]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  const validateCustomerData = useCallback((data: Partial<CustomerData>) => {
    // Validation logic
  }, []);

  const formatCustomerData = useCallback((data: Partial<CustomerData>) => {
    // Formatting logic
  }, []);

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================
  return {
    // Calculated data
    metrics,
    insights,

    // Utility functions
    validateCustomerData,
    formatCustomerData,

    // Derived state
    isHighValue: metrics.segment === 'High Value',
    isAtRisk: metrics.riskScore > 60,
    needsProfileUpdate: insights.profileCompleteness < 60
  };
};
```

### Component Integration Pattern
```tsx
// How components consume SSoT hooks
export const CustomerOverviewTab = ({ customer }: CustomerOverviewTabProps) => {
  // ============================================================================
  // BUSINESS LOGIC - SSoT Integration
  // ============================================================================
  const { insights, metrics } = useCustomerOperations(customer);

  // ============================================================================
  // PURE UI RENDERING
  // ============================================================================
  return (
    <section>
      {/* UI components using calculated data */}
      <StatCard
        title="Loyalty Score"
        value={`${metrics.loyaltyScore}%`}
        variant={insights.isHighValue ? 'success' : 'default'}
      />
    </section>
  );
};
```

---

## 📊 Type System Architecture

### Core Interface Hierarchy
```tsx
// Base customer data structure
export interface CustomerData {
  id?: number;
  cliente: string;
  telefone?: string | null;
  email?: string | null;
  // ... other fields

  // Calculated fields (from CRM)
  totalCompras?: number;
  valorTotalCompras?: number;
  ultimaCompra?: string | null;
  segmento?: 'High Value' | 'Regular' | 'Occasional' | 'New';
}

// Business metrics interface
export interface CustomerMetrics {
  ltv: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  daysSinceLastPurchase: number;
  totalOrders: number;
  segment: 'High Value' | 'Regular' | 'Occasional' | 'New';
  loyaltyScore: number; // 0-100
  riskScore: number; // 0-100
}

// Business insights interface
export interface CustomerInsights {
  hasEmail: boolean;
  hasPhone: boolean;
  hasCompleteAddress: boolean;
  profileCompleteness: number; // 0-100
  marketingReachable: boolean;
  deliveryReady: boolean;
  preferredContactMethod: 'email' | 'phone' | 'none';
  riskFactors: string[];
  opportunities: string[];
}
```

### Export Strategy
```tsx
// /src/shared/hooks/business/index.ts
// Centralized exports to avoid circular dependencies

// Customer Business Logic
export {
  useCustomerOperations,
  type CustomerData,
  type CustomerMetrics,
  type CustomerInsights,
  type CustomerValidation
} from './useCustomerOperations';

// Customer Purchase History
export {
  useCustomerPurchaseHistory,
  type Purchase,
  type PurchaseFilters,
  type PurchaseSummary
} from './useCustomerPurchaseHistory';

// Customer Analytics & AI
export {
  useCustomerAnalytics,
  type SalesChartData,
  type ProductChartData,
  type CustomerAIInsights
} from './useCustomerAnalytics';
```

---

## 🎯 Business Logic Categories

### 1. Customer Segmentation
```tsx
// Automatic classification logic
const calculateSegment = (totalCompras: number, ltv: number) => {
  if (totalCompras >= 10 && ltv >= 500) return 'High Value';
  if (totalCompras >= 5 && ltv >= 200) return 'Regular';
  if (totalCompras > 0) return 'Occasional';
  return 'New';
};
```

### 2. Financial Calculations
```tsx
// LTV and performance metrics
const calculateFinancialMetrics = (customerData) => ({
  ltv: customerData.valorTotalCompras || 0,
  averageOrderValue: customerData.totalCompras > 0
    ? (customerData.valorTotalCompras || 0) / customerData.totalCompras
    : 0,
  // ... other calculations
});
```

### 3. Risk Assessment
```tsx
// Churn prediction and risk scoring
const calculateRiskScore = (daysSinceLastPurchase, purchaseFrequency, averageOrderValue) => {
  return Math.min(100,
    daysSinceLastPurchase * 2 + // Recency factor
    (purchaseFrequency < 1 ? 30 : 0) + // Frequency factor
    (averageOrderValue < 50 ? 20 : 0) // Value factor
  );
};
```

### 4. AI-Powered Insights
```tsx
// Machine learning derived insights
const calculateAIInsights = (metrics, customerData) => ({
  segmentRecommendation: generateSegmentRecommendation(metrics),
  nextBestAction: calculateNextBestAction(metrics),
  opportunityScore: calculateOpportunityScore(metrics),
  preferredProducts: extractPreferredProducts(customerData)
});
```

---

## 🚀 Performance Optimization

### 1. Memoization Strategy
```tsx
// Proper useMemo dependencies
const expensiveCalculation = useMemo(() => {
  // Heavy computation
  return result;
}, [primitive_dependencies]); // Use primitives, not objects
```

### 2. Callback Optimization
```tsx
// Stable event handlers
const handleChange = useCallback((value: string) => {
  setState(prev => ({ ...prev, field: value }));
}, []); // Empty dependency array for stable handlers
```

### 3. Dependency Management
```tsx
// Extract primitives from objects
const { searchTerm, periodFilter } = filters;

const filteredData = useMemo(() => {
  // Filtering logic
}, [data, searchTerm, periodFilter]); // Not [data, filters]
```

---

## 🔍 Testing Strategy

### 1. Business Logic Testing
```tsx
// Test hooks in isolation
describe('useCustomerOperations', () => {
  it('should calculate correct LTV', () => {
    const { result } = renderHook(() =>
      useCustomerOperations(mockCustomerData)
    );

    expect(result.current.metrics.ltv).toBe(expectedLTV);
  });
});
```

### 2. Component Integration Testing
```tsx
// Test component with business logic
describe('CustomerOverviewTab', () => {
  it('should display correct metrics', () => {
    render(<CustomerOverviewTab customer={mockCustomer} />);

    expect(screen.getByText('High Value')).toBeInTheDocument();
  });
});
```

### 3. Performance Testing
```tsx
// Test for render cycles
describe('Performance', () => {
  it('should not cause infinite renders', () => {
    const renderSpy = jest.fn();
    render(<CustomerComponent onRender={renderSpy} />);

    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📋 Implementation Checklist

### Business Hook Creation
- [ ] Define clear interface types
- [ ] Implement memoized calculations
- [ ] Add utility functions
- [ ] Export from centralized index
- [ ] Write comprehensive tests

### Component Integration
- [ ] Import hooks directly (not from barrel)
- [ ] Use calculated data for UI rendering
- [ ] Implement proper error boundaries
- [ ] Add loading states
- [ ] Ensure accessibility compliance

### Performance Validation
- [ ] Verify no infinite loops
- [ ] Check bundle size impact
- [ ] Test with large datasets
- [ ] Validate memory usage
- [ ] Confirm fast initial load

---

## 🛠️ Migration Guidelines

### From Legacy to SSoT
1. **Identify scattered logic** - Find duplicate calculations
2. **Extract to hooks** - Create centralized business logic
3. **Update components** - Replace local logic with hook consumption
4. **Fix imports** - Use direct imports to avoid circular dependencies
5. **Optimize performance** - Add proper memoization
6. **Test thoroughly** - Ensure functionality maintained

### Best Practices
- **Start small** - Migrate one component at a time
- **Maintain compatibility** - Keep existing APIs during transition
- **Document changes** - Update documentation immediately
- **Monitor performance** - Watch for regressions
- **Get feedback** - Test with actual users

---

## 📚 References

- **React Performance**: [React Optimization Guide](https://react.dev/learn/render-and-commit)
- **Hook Patterns**: [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- **TypeScript**: [Advanced Type Patterns](https://www.typescriptlang.org/docs/handbook/advanced-types.html)
- **Testing**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Architecture Status**: ✅ **Established and Production-Ready**
**Performance Impact**: 🚀 **Significant Improvement**
**Developer Experience**: 📈 **Greatly Enhanced**