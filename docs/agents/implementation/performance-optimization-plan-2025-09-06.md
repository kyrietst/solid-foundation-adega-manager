---
agent: adega-architect
date: 2025-09-06
analysis_reference: "docs/agents/analysis/performance-analysis-2025-09-06.md"
priority: critical
estimated_duration: "2 weeks"
claude_md_sections: ["Performance Characteristics", "Database Current State", "Directory Structure"]
components_modified: [useDashboardData.ts, ExecutiveDashboard.tsx, AnalyticsDashboard.tsx, DashboardLayout.tsx]
---

# 🏗️ Performance Optimization Implementation Plan - Adega Manager

## 🎯 Implementation Summary
Based on critical performance analysis identifying 4-7 second dashboard load times, this plan addresses the primary bottlenecks: COGS calculation with double INNER JOIN (2-3s delay), multiple sequential COUNT queries (1-2s delay), and aggressive refresh intervals. The implementation will create segregated executive/analytics dashboards with 70% performance improvement target.

**Critical Finding:** System handles 1,310+ records (not 925 documented), with 89% fragmentation in profiles table requiring immediate attention.

## 📋 Implementation Plan

### Phase 1: Critical Performance Fixes
**Duration:** 5 days  
**Goal:** Eliminate bottlenecks causing >2s delay

#### 1.1 Optimize COGS Calculation Query
**Based on Analysis:** `useDashboardData.ts:51-83` - Double INNER JOIN causing 2-3s delay
**Implementation:** 
- [ ] **Day 1**: Create materialized view for pre-calculated COGS per sale
- [ ] **Day 1**: Implement stored procedure `calculate_sale_cogs(sale_ids)` 
- [ ] **Day 2**: Replace double INNER JOIN with single optimized query
- [ ] **Day 2**: Add proper indexes for sale_items optimization
- [ ] **Day 3**: Test with production data (1,310+ records)

**Files Modified:**
- `src/features/dashboard/hooks/useDashboardData.ts` - Replace lines 51-83 with stored procedure call
- Database: Add materialized view `mv_sale_cogs` with refresh strategy
- Database: Add index `idx_sale_items_sales_products` for COGS calculation

**Performance Impact:** Expected 80% improvement (3000ms → 600ms)
**Estimated Effort:** 16 hours

#### 1.2 Unify Dashboard COUNT Queries
**Based on Analysis:** `useDashboardData.ts:101-106` - 4 separate COUNT queries causing 1-2s delay
**Implementation:**
- [ ] **Day 3**: Create stored procedure `get_dashboard_counters()` returning JSON
- [ ] **Day 3**: Replace 4 sequential Promise.all queries with single call
- [ ] **Day 4**: Optimize with covering indexes for COUNT operations
- [ ] **Day 4**: Implement error fallback to individual queries if SP fails

**Files Modified:**
- `src/features/dashboard/hooks/useDashboardData.ts` - Replace lines 101-106 with single SP call
- Database: New stored procedure combining all dashboard counters

**Performance Impact:** Expected 75% improvement (4 queries → 1 query, 1000-2000ms → 250-400ms)
**Estimated Effort:** 12 hours

#### 1.3 Optimize Refresh Intervals  
**Based on Analysis:** `useDashboardData.ts:374` - Aggressive 2min refresh causing unnecessary load
**Implementation:**
- [ ] **Day 4**: Implement tiered cache strategy (1min/5min/15min)
- [ ] **Day 4**: Remove auto-refresh for recent activities (on-demand only)
- [ ] **Day 5**: Add intelligent cache invalidation based on user actions
- [ ] **Day 5**: Implement cache warming for executive dashboard

**Files Modified:**
- `src/features/dashboard/hooks/useDashboardData.ts` - Update staleTime/refetchInterval
- `src/features/dashboard/hooks/useDashboardCache.ts` - New cache management hook

**Performance Impact:** Expected 60% reduction in background queries
**Estimated Effort:** 8 hours

### Phase 2: UI/UX Performance Optimization
**Duration:** 3 days
**Goal:** Remove performance-heavy UI elements causing render delays

#### 2.1 Remove Fluid Blob Animations
**Based on Analysis:** Background animations consuming CPU/GPU resources
**Locations:** Dashboard background components, loading states
**Approach:** 
- [ ] **Day 6**: Audit all components using fluid blob animations
- [ ] **Day 6**: Replace with lightweight CSS gradients or static backgrounds
- [ ] **Day 7**: Implement subtle fade transitions as alternative
- [ ] **Day 7**: A/B test visual appeal vs performance impact

**Alternative Solution:** Static gradient backgrounds with CSS `background-attachment: fixed` for depth

**Files Modified:**
- `src/components/ui/backgrounds/` - Remove FluidBlobBackground components
- `src/features/dashboard/components/` - Replace blob animations with optimized alternatives
- Theme CSS - Add optimized gradient patterns

**Performance Impact:** Expected 30% improvement in render performance
**Estimated Effort:** 10 hours

#### 2.2 Standardize High-Performance UI Components
**Approach:**
- [ ] **Day 7**: Audit current Aceternity UI usage for heavy components
- [ ] **Day 8**: Replace performance-heavy Aceternity components with Shadcn alternatives
- [ ] **Day 8**: Implement optimized StatCard variations for different metrics
- [ ] **Day 8**: Create lightweight LoadingSpinner without complex animations

**Files Modified:**
- `src/shared/ui/composite/StatCard.tsx` - Optimize for dashboard metrics
- `src/shared/ui/composite/LoadingSpinner.tsx` - Lightweight variant
- Dashboard components - Replace heavy UI elements

**Performance Impact:** Expected 25% improvement in component render times
**Estimated Effort:** 12 hours

### Phase 3: Dashboard Segregation  
**Duration:** 5 days
**Goal:** Create role-specific optimized dashboards

#### 3.1 Executive Dashboard
**Target Audience:** Business owners (role: admin)
**Performance Target:** <2s load time
**Components to Create:**
- [ ] **Day 9**: `ExecutiveDashboard.tsx` - Minimal container with 4 KPI cards
- [ ] **Day 9**: `ExecutiveKPICard.tsx` - Simplified metric display (no charts)
- [ ] **Day 10**: `ExecutiveAlerts.tsx` - Critical notifications only (low stock, pending deliveries)
- [ ] **Day 10**: `useExecutiveDashboard.ts` - Optimized queries with 5min cache

**KPIs Included (Based on Analysis):**
- Total Revenue: R$ 147,842 (last 30 days) - from optimized COGS calculation
- Sales Count: 52 completed sales - from unified counter
- Active Customers: 97 total, 8 VIP segment - from customer insights
- Critical Alerts: 3 pending deliveries, 15 low stock items - real-time

**Files Created:**
- `src/features/dashboard/components/executive/ExecutiveDashboard.tsx`
- `src/features/dashboard/components/executive/ExecutiveKPICard.tsx`
- `src/features/dashboard/components/executive/ExecutiveAlerts.tsx`
- `src/features/dashboard/hooks/useExecutiveDashboard.ts`

**Performance Target:** <2s load time with 4 optimized queries
**Estimated Effort:** 16 hours

#### 3.2 Analytics Dashboard
**Target Audience:** Marketing/Sales teams (role: employee)
**Performance Target:** <5s load time
**Components to Create:**
- [ ] **Day 11**: `AnalyticsDashboard.tsx` - Advanced metrics container
- [ ] **Day 11**: `CustomerAnalytics.tsx` - RFM segmentation + LTV analysis
- [ ] **Day 12**: `SalesAnalytics.tsx` - Turnover analysis, category performance  
- [ ] **Day 12**: `MarketingMetrics.tsx` - Acquisition cost, cohort analysis
- [ ] **Day 13**: `useAnalyticsDashboard.ts` - Complex calculations with 15min cache

**Advanced Metrics (Based on Analysis):**
- Customer Lifetime Value by segment: High Value (8), Regular, Occasional, New
- Product Turnover Analysis: Fast/Medium/Slow classification from 435 products
- Cohort Analysis: Monthly retention from 97 customers historical data
- Category Performance: Analysis from real product categories (not payment methods)
- Churn Prediction: Based on purchase frequency patterns

**Files Created:**
- `src/features/dashboard/components/analytics/AnalyticsDashboard.tsx`
- `src/features/dashboard/components/analytics/CustomerAnalytics.tsx`
- `src/features/dashboard/components/analytics/SalesAnalytics.tsx`
- `src/features/dashboard/components/analytics/MarketingMetrics.tsx`
- `src/features/dashboard/hooks/useAnalyticsDashboard.ts`

**Performance Target:** <5s load time with complex calculations
**Estimated Effort:** 20 hours

## 🚀 Technical Implementation Details

### Cache Implementation Strategy
```typescript
// Multi-tier cache configuration optimized for data volatility
const cacheConfig = {
  // Tier 1: Frequently changing data (activities, alerts)
  realTime: {
    staleTime: 1 * 60 * 1000,     // 1 minute
    cacheTime: 2 * 60 * 1000,     // 2 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false         // On-demand only
  },
  
  // Tier 2: Business metrics (sales, customers)  
  businessMetrics: {
    staleTime: 5 * 60 * 1000,     // 5 minutes
    cacheTime: 10 * 60 * 1000,    // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false
  },
  
  // Tier 3: Historical analytics (trends, analysis)
  analytics: {
    staleTime: 15 * 60 * 1000,    // 15 minutes
    cacheTime: 30 * 60 * 1000,    // 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false
  }
}
```

### Database Optimizations (Stored Procedures)
```sql
-- Critical: Unified dashboard counters (replaces 4 COUNT queries)
CREATE OR REPLACE FUNCTION get_dashboard_counters()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_customers', (SELECT COUNT(*) FROM customers),
        'vip_customers', (SELECT COUNT(*) FROM customers WHERE segment = 'High Value'),
        'products_in_stock', (SELECT COUNT(*) FROM products WHERE stock_quantity > 0),
        'pending_deliveries', (SELECT COUNT(*) FROM sales WHERE status = 'pending' AND delivery = true)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Critical: Pre-calculated COGS with materialized view support
CREATE OR REPLACE FUNCTION calculate_sales_cogs(sale_ids UUID[])
RETURNS NUMERIC AS $$
DECLARE
    total_cogs NUMERIC := 0;
BEGIN
    -- Optimized single query replacing double INNER JOIN
    SELECT COALESCE(SUM(si.quantity * p.cost_price), 0)
    INTO total_cogs
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.sale_id = ANY(sale_ids);
    
    RETURN total_cogs;
END;
$$ LANGUAGE plpgsql;

-- Executive dashboard optimized query
CREATE OR REPLACE FUNCTION get_executive_dashboard_data(period_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date TIMESTAMP;
BEGIN
    start_date := NOW() - INTERVAL '1 day' * period_days;
    
    SELECT json_build_object(
        'total_revenue', COALESCE(SUM(s.final_amount), 0),
        'total_sales', COUNT(s.id),
        'active_customers', COUNT(DISTINCT s.customer_id),
        'cogs', calculate_sales_cogs(ARRAY_AGG(s.id))
    ) INTO result
    FROM sales s
    WHERE s.status = 'completed' 
      AND s.created_at >= start_date
      AND s.final_amount IS NOT NULL;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### Required Database Indexes
```sql
-- Critical: COGS calculation optimization
CREATE INDEX CONCURRENTLY idx_sale_items_sales_products 
ON sale_items(sale_id) 
INCLUDE (quantity, product_id);

CREATE INDEX CONCURRENTLY idx_products_cost_price 
ON products(id) 
INCLUDE (cost_price);

-- Dashboard counters optimization
CREATE INDEX CONCURRENTLY idx_sales_status_delivery_date
ON sales(status, delivery, created_at) 
WHERE status IN ('completed', 'pending');

CREATE INDEX CONCURRENTLY idx_customers_segment
ON customers(segment) 
WHERE segment IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_products_stock
ON products(stock_quantity) 
WHERE stock_quantity > 0;
```

### Component Architecture Structure
```
New Optimized Architecture:
src/features/dashboard/
├── components/
│   ├── executive/                    # <2s load time
│   │   ├── ExecutiveDashboard.tsx   # Main container (4 KPIs only)
│   │   ├── ExecutiveKPICard.tsx     # Optimized metric display
│   │   └── ExecutiveAlerts.tsx      # Critical notifications
│   ├── analytics/                   # <5s load time
│   │   ├── AnalyticsDashboard.tsx   # Advanced metrics container
│   │   ├── CustomerAnalytics.tsx    # RFM + LTV analysis
│   │   ├── SalesAnalytics.tsx       # Turnover + category performance
│   │   └── MarketingMetrics.tsx     # Acquisition + cohort analysis
│   └── shared/
│       ├── DashboardLayout.tsx      # Common layout pattern
│       └── PerformanceMonitor.tsx   # Real-time performance tracking
├── hooks/
│   ├── useExecutiveDashboard.ts     # Optimized for speed (5min cache)
│   ├── useAnalyticsDashboard.ts     # Complex calculations (15min cache)
│   ├── useDashboardCache.ts         # Multi-tier cache management
│   └── useDashboardPerformance.ts   # Performance monitoring
└── types/
    ├── executive.types.ts           # Executive dashboard interfaces
    └── analytics.types.ts           # Analytics dashboard interfaces
```

## 🎨 UI/UX Performance Improvements

### Animation Optimization Strategy
**Removed (Performance Heavy):**
- Fluid blob background animations (CPU-intensive)
- Complex CSS transforms on hover
- Gradient animations with JavaScript
- Heavy SVG animations in loading states

**Replaced With (Lightweight):**
- Static CSS gradients with `filter` property
- Simple `opacity` and `scale` transforms  
- CSS `transition` properties (GPU-accelerated)
- Simplified loading spinners using CSS animations

### Visual Standardization (Adega Wine Cellar Theme)
```css
/* Optimized theme variables for performance */
:root {
  --adega-primary: #722F37;      /* Wine red - primary actions */
  --adega-secondary: #8B4513;    /* Saddle brown - secondary */
  --adega-accent: #DAA520;       /* Goldenrod - highlights */
  --adega-neutral: #2F2F2F;      /* Dark gray - backgrounds */
  
  /* Performance-optimized gradients */
  --adega-gradient-primary: linear-gradient(135deg, var(--adega-primary), var(--adega-secondary));
  --adega-gradient-accent: linear-gradient(135deg, var(--adega-accent), #CD853F);
}

/* Lightweight component base styles */
.executive-kpi-card {
  transition: box-shadow 0.2s ease;  /* GPU-accelerated only */
  will-change: auto;                 /* Avoid layer creation */
}

.executive-kpi-card:hover {
  box-shadow: 0 4px 12px rgba(114, 47, 55, 0.15);
}
```

### Component Performance Patterns
```typescript
// Optimized StatCard for executive dashboard
import React, { memo } from 'react';
import { cn } from '@/core/config/utils';

interface ExecutiveKPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const ExecutiveKPICard = memo<ExecutiveKPICardProps>(({ 
  title, 
  value, 
  change, 
  trend, 
  className 
}) => {
  return (
    <div className={cn(
      'executive-kpi-card bg-white p-6 rounded-lg shadow-sm',
      'border border-gray-200 hover:shadow-md transition-shadow duration-200',
      className
    )}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {change && (
        <p className={cn(
          'text-sm font-medium',
          trend === 'up' && 'text-green-600',
          trend === 'down' && 'text-red-600',
          trend === 'neutral' && 'text-gray-500'
        )}>
          {change}
        </p>
      )}
    </div>
  );
});

ExecutiveKPICard.displayName = 'ExecutiveKPICard';
```

## 🧪 Testing Strategy

### Performance Testing Protocol
- [ ] **Baseline Measurement**: Record current dashboard load times with production data
- [ ] **Load Testing**: Test with full 1,310+ records dataset
- [ ] **Cache Effectiveness**: Measure cache hit rates and invalidation timing
- [ ] **Memory Profiling**: Monitor memory usage during extended dashboard usage
- [ ] **Network Monitoring**: Track database query counts and response times

### Testing Environment Setup
```bash
# Performance testing commands
npm run test:performance     # Automated performance regression tests
npm run test:load           # Load testing with production data volume
npm run test:cache          # Cache effectiveness testing
npm run benchmark:dashboard # Dashboard-specific benchmarking
```

### User Acceptance Testing Scenarios
- [ ] **Executive Scenario**: Business owner checks KPIs in under 2 seconds
- [ ] **Analytics Scenario**: Marketing team analyzes customer segments in under 5 seconds
- [ ] **Error Handling**: Graceful degradation when stored procedures fail
- [ ] **Mobile Performance**: Dashboard responsiveness on tablet devices
- [ ] **Role-Based Access**: Proper component visibility per user role

## 📈 Performance Improvements (Target Metrics)

### Measured Baselines (From Analysis)
**Before Optimization:**
- Dashboard Load Time: 4-7 seconds (unacceptable for business use)
- COGS Calculation: 2,000-3,000ms (primary bottleneck)
- COUNT Queries: 1,000-2,000ms (4 sequential queries)
- Bundle Size: ~2.3MB initial load
- Memory Usage: Growing due to aggressive refresh

**After Optimization (Targets):**
- Executive Dashboard: <2 seconds (70% improvement)
- Analytics Dashboard: <5 seconds (50% improvement)  
- COGS Calculation: 200-600ms (80% improvement)
- Unified Queries: 200-400ms (75% improvement)
- Bundle Size: ~1.8MB (20% reduction through code splitting)

### Key Performance Optimizations
1. **COGS Calculation**: 80% faster through stored procedure + materialized view
2. **Dashboard Queries**: 75% reduction through unified stored procedure
3. **UI Rendering**: 30% faster through animation removal + component optimization
4. **Cache Efficiency**: 60% reduction in database queries through tiered caching
5. **Bundle Size**: 20% smaller through role-based code splitting

## 🔄 CLAUDE.md Updates Required

### Sections to Update
- **Performance Characteristics** → Update from "React Query caching" to "Multi-tier cache strategy (1min/5min/15min)"
- **Database Current State** → Update from "925+ records" to "1,310+ records with severe fragmentation (89% in profiles)"
- **Directory Structure** → Add executive/analytics dashboard architecture
- **Development Guidelines** → Add performance budgets and cache strategies

### Key Documentation Updates
```markdown
### Performance Characteristics (Updated v2.1.0)
- **Dashboard Load Time**: Executive <2s, Analytics <5s (70% improvement from baseline 4-7s)
- **Cache Strategy**: Multi-tier (browser 1-5min / query 5-15min / database materialized views)
- **Database Optimization**: 8 stored procedures for dashboard queries, strategic indexes
- **Bundle Optimization**: Role-based code splitting, animation removal
- **Query Efficiency**: 75% reduction in database round trips (4 queries → 1 optimized SP)

### Database Current State (Updated)
**Production Volume (Real Data)**: 1,310+ activity logs, 435 products, 97 customers, 58 sales
**Critical Issues**: 89% fragmentation in profiles table, heavy update activity (159 dead tuples)
**Performance Impact**: Double INNER JOIN queries causing 2-3s delays in financial calculations
```

## 🔄 Deployment & Rollback Strategy

### Phased Deployment Plan
1. **Phase 1 (Week 1)**: Database optimizations + stored procedures
   - Deploy stored procedures to production
   - Add performance indexes with CONCURRENTLY
   - Verify no impact on existing functionality

2. **Phase 2 (Week 1)**: Backend hook optimizations
   - Deploy optimized dashboard hooks with feature flags
   - A/B test 50% traffic to new hooks
   - Monitor performance improvements

3. **Phase 3 (Week 2)**: Frontend dashboard separation  
   - Deploy executive dashboard to admin users only
   - Deploy analytics dashboard to employee users
   - Gradual rollout with user feedback collection

### Rollback Plan
- [ ] **Feature Flags**: Instant rollback to original dashboard components
- [ ] **Database Compatibility**: All stored procedures handle graceful failures
- [ ] **Monitoring Alerts**: Automated alerts for performance regression >20%
- [ ] **User Communication**: Clear rollback process communicated to stakeholders

### Monitoring & Alerting
```typescript
// Performance monitoring implementation
const performanceMonitor = {
  dashboardLoadTime: (loadTime: number, dashboardType: 'executive' | 'analytics') => {
    const threshold = dashboardType === 'executive' ? 2000 : 5000;
    if (loadTime > threshold) {
      // Alert system administrators
      console.warn(`Dashboard load time exceeded: ${loadTime}ms > ${threshold}ms`);
    }
  },
  
  queryPerformance: (queryName: string, duration: number) => {
    const queryThresholds = {
      'cogs-calculation': 600,
      'dashboard-counters': 400,
      'executive-data': 1000,
      'analytics-data': 3000
    };
    
    const threshold = queryThresholds[queryName] || 1000;
    if (duration > threshold) {
      console.warn(`Query ${queryName} exceeded threshold: ${duration}ms > ${threshold}ms`);
    }
  }
};
```

## 📋 Post-Implementation Tasks

### Week 1 (Immediate Monitoring)
- [ ] **Performance Metrics**: Monitor dashboard load times hourly
- [ ] **User Feedback**: Collect feedback from 3 active business users
- [ ] **Error Tracking**: Monitor stored procedure failure rates
- [ ] **Cache Effectiveness**: Verify cache hit rates >80% for executive dashboard

### Month 1 (Optimization Iteration)
- [ ] **Usage Pattern Analysis**: Identify most-used analytics features
- [ ] **Performance Tuning**: Fine-tune cache intervals based on real usage
- [ ] **Database Maintenance**: Schedule vacuum operations for fragmentation
- [ ] **User Training**: Create documentation for new dashboard features

### Quarter 1 (Long-term Enhancement)
- [ ] **Advanced Analytics**: Implement predictive customer analytics
- [ ] **Real-time Updates**: WebSocket integration for live dashboard updates
- [ ] **Mobile Optimization**: Native mobile dashboard experience
- [ ] **Performance Automation**: Automated performance testing in CI/CD

## 📊 Risk Assessment & Mitigation

### High Risk Items
1. **Database Stored Procedure Failures**
   - *Risk*: New stored procedures causing data inconsistencies
   - *Mitigation*: Comprehensive testing with production data copy, graceful fallback to original queries
   - *Probability*: Medium | *Impact*: High

2. **Cache Invalidation Issues**  
   - *Risk*: Stale data displayed to business users
   - *Mitigation*: Conservative cache timing, manual invalidation triggers, real-time validation
   - *Probability*: Medium | *Impact*: Medium

### Medium Risk Items
1. **User Adoption Resistance**
   - *Risk*: Business users prefer familiar dashboard layout
   - *Mitigation*: Gradual rollout, user training, feedback incorporation
   - *Probability*: High | *Impact*: Low

2. **Performance Regression**
   - *Risk*: New optimizations causing unexpected slowdowns
   - *Mitigation*: Continuous monitoring, feature flags, immediate rollback capability
   - *Probability*: Low | *Impact*: High

## ✅ Success Criteria & Validation

### Performance Metrics (Quantitative)
- [ ] **Executive Dashboard**: <2 seconds load time (vs current 4-7s)
- [ ] **Analytics Dashboard**: <5 seconds load time (vs current 4-7s)  
- [ ] **COGS Calculation**: <600ms (vs current 2000-3000ms)
- [ ] **Database Queries**: 75% reduction in query count (4→1 for counters)
- [ ] **User Complaints**: 90% reduction in "system feels slow" reports

### Business Impact (Qualitative)
- [ ] **Daily Usage**: Business owners check executive dashboard daily
- [ ] **Decision Making**: Marketing team uses analytics for weekly planning
- [ ] **Productivity**: 30% faster business intelligence gathering
- [ ] **User Satisfaction**: >4.5/5 rating on system responsiveness survey

### Technical Quality (Maintainability)
- [ ] **Code Quality**: Maintained TypeScript strict mode compliance
- [ ] **Test Coverage**: >80% coverage for new dashboard components
- [ ] **Documentation**: Complete API documentation for new hooks/components
- [ ] **Performance Monitoring**: Automated performance regression detection

---

**Generated by:** Adega Architect Agent  
**Based on Analysis:** docs/agents/analysis/performance-analysis-2025-09-06.md  
**Review Status:** [ ] Pending Review [ ] Approved [ ] Implementation Started  
**Performance Target:** 70% improvement (4-7s → 1-2s executive, 3-5s analytics)