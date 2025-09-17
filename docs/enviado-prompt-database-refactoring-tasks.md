# Database Refactoring Tasks: Single Source of Truth (SSoT) Implementation

**Task ID:** DB-SSOT-20250916-01
**Priority:** CRITICAL - Production System
**System:** Adega Manager (925+ active records)
**Type:** Database Schema Refactoring

## Executive Summary

This document outlines the complete refactoring process to eliminate the critical architectural flaw where stock quantities are duplicated between `products` and `product_variants` tables. The refactoring will consolidate ALL stock control into `products.stock_quantity` as the single source of truth, eliminating data inconsistency and operational bugs.

**Impact:** This refactoring will affect the core inventory system, sales processing, and related stored procedures across the entire production database.

## Pre-Migration Checklist

### 1. System Backup and Safety Measures
- [ ] **Full Database Backup**: Execute complete Supabase backup before any changes
- [ ] **Application Maintenance Mode**: Consider temporary read-only mode during migration
- [ ] **Staff Notification**: Inform all users about potential temporary disruptions
- [ ] **Rollback Plan Ready**: Ensure complete rollback procedures are documented and tested

### 2. Data Integrity Verification
- [ ] **Current Stock Audit**: Document current stock levels across both tables
- [ ] **Variant-Product Relationship Mapping**: Verify all variants have valid parent products
- [ ] **Active Sales Check**: Ensure no sales are in progress during migration
- [ ] **Transaction Log Review**: Verify no pending inventory movements

### 3. Dependencies Analysis
- [ ] **RLS Policies Inventory**: List all policies referencing `product_variants`
- [ ] **Stored Procedures Audit**: Identify all procedures using `product_variants`
- [ ] **Frontend Code Review**: Confirm frontend queries that may be affected
- [ ] **External Integration Check**: Verify no external systems depend on `product_variants`

## Detailed Task Breakdown

### Phase 1: Data Consolidation and Preparation
**Estimated Duration:** 30 minutes
**Risk Level:** LOW

#### Task 1.1: Stock Quantity Consolidation
**Priority:** CRITICAL
**Dependencies:** None
**Rollback Complexity:** LOW

**Objective:** Calculate and consolidate stock quantities from variants into the parent `products` table.

**SQL Migration Code:**
```sql
-- Migration: Consolidate stock quantities into products table
BEGIN;

-- Step 1: Update products.stock_quantity with consolidated variant data
UPDATE products
SET stock_quantity = (
    SELECT COALESCE(SUM(
        CASE
            WHEN pv.variant_type = 'package' THEN pv.stock_quantity * products.package_units
            ELSE pv.stock_quantity
        END
    ), 0)
    FROM product_variants pv
    WHERE pv.product_id = products.id
)
WHERE EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = products.id
);

-- Step 2: Verification query - ensure no negative or null stock
SELECT
    id,
    name,
    stock_quantity,
    (SELECT COUNT(*) FROM product_variants WHERE product_id = products.id) as variant_count
FROM products
WHERE stock_quantity < 0 OR stock_quantity IS NULL;

COMMIT;
```

**Verification Procedure:**
```sql
-- Verify consolidation accuracy
SELECT
    p.id,
    p.name,
    p.stock_quantity as consolidated_stock,
    SUM(CASE
        WHEN pv.variant_type = 'package' THEN pv.stock_quantity * p.package_units
        ELSE pv.stock_quantity
    END) as calculated_stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.name, p.stock_quantity
HAVING p.stock_quantity != SUM(CASE
    WHEN pv.variant_type = 'package' THEN pv.stock_quantity * p.package_units
    ELSE pv.stock_quantity
END);
```

**Expected Result:** Zero rows returned (perfect consolidation)

#### Task 1.2: Create Backup of Variant Data
**Priority:** HIGH
**Dependencies:** Task 1.1
**Rollback Complexity:** LOW

**SQL Migration Code:**
```sql
-- Create backup table for rollback purposes
CREATE TABLE product_variants_backup AS
SELECT * FROM product_variants;

-- Add timestamp for audit
ALTER TABLE product_variants_backup
ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW();
```

### Phase 2: Schema Modification
**Estimated Duration:** 20 minutes
**Risk Level:** MEDIUM

#### Task 2.1: Remove Foreign Key Dependencies
**Priority:** CRITICAL
**Dependencies:** Task 1.2
**Rollback Complexity:** MEDIUM

**SQL Migration Code:**
```sql
BEGIN;

-- Step 1: Drop foreign key constraints
ALTER TABLE sale_items
DROP CONSTRAINT IF EXISTS sale_items_variant_id_fkey;

ALTER TABLE inventory_movements
DROP CONSTRAINT IF EXISTS inventory_movements_variant_id_fkey;

-- Step 2: Create backup of constraint information
CREATE TEMP TABLE constraint_backup AS
SELECT
    'sale_items' as table_name,
    'sale_items_variant_id_fkey' as constraint_name,
    'FOREIGN KEY (variant_id) REFERENCES product_variants(id)' as definition
UNION ALL
SELECT
    'inventory_movements',
    'inventory_movements_variant_id_fkey',
    'FOREIGN KEY (variant_id) REFERENCES product_variants(id)';

COMMIT;
```

#### Task 2.2: Remove Variant ID Columns
**Priority:** HIGH
**Dependencies:** Task 2.1
**Rollback Complexity:** HIGH

**SQL Migration Code:**
```sql
BEGIN;

-- Step 1: Create backup columns for rollback
ALTER TABLE sale_items ADD COLUMN variant_id_backup INTEGER;
UPDATE sale_items SET variant_id_backup = variant_id;

ALTER TABLE inventory_movements ADD COLUMN variant_id_backup INTEGER;
UPDATE inventory_movements SET variant_id_backup = variant_id;

-- Step 2: Drop the actual variant_id columns
ALTER TABLE sale_items DROP COLUMN variant_id;
ALTER TABLE inventory_movements DROP COLUMN variant_id;

COMMIT;
```

#### Task 2.3: Drop Product Variants Table
**Priority:** CRITICAL
**Dependencies:** Task 2.2
**Rollback Complexity:** HIGH

**SQL Migration Code:**
```sql
BEGIN;

-- Final verification before dropping
SELECT COUNT(*) as remaining_references
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
ON tc.constraint_name = kcu.constraint_name
WHERE kcu.referenced_table_name = 'product_variants';

-- Drop the table (point of no return without restore)
DROP TABLE product_variants;

COMMIT;
```

### Phase 3: Stored Procedures Refactoring
**Estimated Duration:** 45 minutes
**Risk Level:** HIGH

#### Task 3.1: Deprecate Obsolete Procedures
**Priority:** HIGH
**Dependencies:** Task 2.3
**Rollback Complexity:** LOW

**SQL Migration Code:**
```sql
-- Rename to indicate deprecation
ALTER FUNCTION adjust_variant_stock(UUID, INTEGER, TEXT)
RENAME TO deprecated_adjust_variant_stock_20250916;

-- Add deprecation notice
COMMENT ON FUNCTION deprecated_adjust_variant_stock_20250916 IS
'DEPRECATED: This function is no longer used after SSoT refactoring. Use create_inventory_movement instead.';
```

#### Task 3.2: Refactor process_sale() Procedure
**Priority:** CRITICAL
**Dependencies:** Task 3.1
**Rollback Complexity:** HIGH

**SQL Migration Code:**
```sql
-- Create backup of original procedure
CREATE OR REPLACE FUNCTION process_sale_backup_20250916(
    p_customer_id UUID,
    p_items JSONB,
    p_payment_method TEXT,
    p_delivery_address TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE(sale_id UUID, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- [Original procedure code would be preserved here]
$$;

-- New SSoT-compliant process_sale procedure
CREATE OR REPLACE FUNCTION process_sale(
    p_customer_id UUID,
    p_items JSONB,
    p_payment_method TEXT,
    p_delivery_address TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE(sale_id UUID, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sale_id UUID;
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_unit_price DECIMAL(10,2);
    v_variant_type TEXT;
    v_package_units INTEGER;
    v_quantity_change INTEGER;
    v_current_stock INTEGER;
BEGIN
    -- Create the sale record
    INSERT INTO sales (customer_id, payment_method, delivery_address, user_id)
    VALUES (p_customer_id, p_payment_method, p_delivery_address, COALESCE(p_user_id, auth.uid()))
    RETURNING id INTO v_sale_id;

    -- Process each item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;
        v_unit_price := (v_item->>'unit_price')::DECIMAL(10,2);
        v_variant_type := COALESCE(v_item->>'variant_type', 'unit');

        -- Get product package units for calculation
        SELECT package_units, stock_quantity
        INTO v_package_units, v_current_stock
        FROM products
        WHERE id = v_product_id;

        -- Calculate quantity change for inventory movement
        v_quantity_change := CASE
            WHEN v_variant_type = 'package' THEN -(v_quantity * v_package_units)
            ELSE -v_quantity
        END;

        -- Check stock availability
        IF v_current_stock + v_quantity_change < 0 THEN
            RETURN QUERY SELECT v_sale_id, FALSE, 'Insufficient stock for product: ' || v_product_id::TEXT;
            ROLLBACK;
            RETURN;
        END IF;

        -- Create sale item (no variant_id needed)
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
        VALUES (v_sale_id, v_product_id, v_quantity, v_unit_price);

        -- Create inventory movement for stock tracking
        PERFORM create_inventory_movement(
            v_product_id,
            v_quantity_change,
            'venda',
            'Sale #' || v_sale_id::TEXT
        );
    END LOOP;

    -- Recalculate customer insights after sale
    PERFORM recalc_customer_insights(p_customer_id);

    RETURN QUERY SELECT v_sale_id, TRUE, 'Sale processed successfully';
END;
$$;
```

### Phase 4: Security Policies Review and Update
**Estimated Duration:** 30 minutes
**Risk Level:** MEDIUM

#### Task 4.1: RLS Policies Audit and Update
**Priority:** HIGH
**Dependencies:** Task 3.2
**Rollback Complexity:** MEDIUM

**SQL Migration Code:**
```sql
-- Audit existing policies that reference product_variants
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE qual LIKE '%product_variants%' OR with_check LIKE '%product_variants%';

-- Since product_variants table is dropped, any policies referencing it are automatically removed
-- Verify no orphaned policies remain
SELECT COUNT(*) as orphaned_policies
FROM information_schema.table_privileges
WHERE table_name = 'product_variants';
```

**Note:** With the removal of `product_variants` table, all RLS policies specific to that table are automatically dropped. No manual policy updates should be required.

### Phase 5: Data Integrity Verification
**Estimated Duration:** 20 minutes
**Risk Level:** LOW

#### Task 5.1: Stock Consistency Verification
**Priority:** CRITICAL
**Dependencies:** All previous tasks
**Rollback Complexity:** N/A

**Verification Procedures:**
```sql
-- 1. Verify no negative stock quantities
SELECT COUNT(*) as negative_stock_count
FROM products
WHERE stock_quantity < 0;

-- 2. Verify all products have valid stock quantities
SELECT COUNT(*) as null_stock_count
FROM products
WHERE stock_quantity IS NULL;

-- 3. Verify sale items no longer reference variants
SELECT COUNT(*) as variant_references
FROM information_schema.columns
WHERE table_name = 'sale_items' AND column_name = 'variant_id';

-- 4. Verify inventory movements no longer reference variants
SELECT COUNT(*) as variant_references
FROM information_schema.columns
WHERE table_name = 'inventory_movements' AND column_name = 'variant_id';

-- 5. Test process_sale function with sample data
SELECT * FROM process_sale(
    (SELECT id FROM customers LIMIT 1),
    '[{"product_id": "' || (SELECT id FROM products LIMIT 1)::TEXT || '", "quantity": 1, "unit_price": 10.00, "variant_type": "unit"}]'::JSONB,
    'dinheiro',
    NULL
);
```

#### Task 5.2: System Functionality Testing
**Priority:** HIGH
**Dependencies:** Task 5.1
**Rollback Complexity:** N/A

**Test Cases:**
1. **Sale Processing Test**: Create a test sale with multiple products
2. **Stock Movement Test**: Verify inventory movements are recorded correctly
3. **Customer Insights Test**: Confirm customer metrics recalculation works
4. **Stock Validation Test**: Attempt sale with insufficient stock (should fail gracefully)

## Rollback Procedures

### Emergency Rollback (If Migration Fails)

#### Option 1: Full Database Restore
```bash
# Restore from pre-migration backup
npm run restore
```

#### Option 2: Partial Rollback (If caught early)
```sql
-- Recreate product_variants table from backup
CREATE TABLE product_variants AS
SELECT * FROM product_variants_backup;

-- Restore foreign key constraints
ALTER TABLE sale_items
ADD CONSTRAINT sale_items_variant_id_fkey
FOREIGN KEY (variant_id_backup) REFERENCES product_variants(id);

-- Restore columns
ALTER TABLE sale_items ADD COLUMN variant_id INTEGER;
UPDATE sale_items SET variant_id = variant_id_backup;
ALTER TABLE sale_items DROP COLUMN variant_id_backup;

-- Repeat for inventory_movements
ALTER TABLE inventory_movements ADD COLUMN variant_id INTEGER;
UPDATE inventory_movements SET variant_id = variant_id_backup;
ALTER TABLE inventory_movements DROP COLUMN variant_id_backup;

-- Restore original stored procedures
DROP FUNCTION process_sale;
ALTER FUNCTION process_sale_backup_20250916 RENAME TO process_sale;
```

## Post-Migration Validation

### 1. System Health Checks
- [ ] **Database Connectivity**: Verify application can connect and query
- [ ] **Sales Processing**: Test complete sale workflow
- [ ] **Stock Management**: Verify stock updates work correctly
- [ ] **Reporting**: Confirm dashboards and reports display correct data
- [ ] **User Permissions**: Test all user roles can access appropriate data

### 2. Performance Monitoring
- [ ] **Query Performance**: Monitor query execution times
- [ ] **Database Size**: Verify expected reduction in database size
- [ ] **Index Usage**: Confirm indexes are being used efficiently
- [ ] **Connection Pool**: Monitor database connection usage

### 3. Audit Trail Verification
- [ ] **Inventory Movements**: Verify all stock changes are properly logged
- [ ] **Audit Logs**: Confirm system audit logging continues to work
- [ ] **Customer Insights**: Verify automated recalculation functions
- [ ] **Data Integrity**: Run comprehensive data consistency checks

## Timeline Estimates

| Phase | Tasks | Estimated Duration | Dependencies | Risk Level |
|-------|-------|-------------------|--------------|------------|
| Phase 1 | Data Consolidation | 30 minutes | None | LOW |
| Phase 2 | Schema Modification | 20 minutes | Phase 1 | MEDIUM |
| Phase 3 | Stored Procedures | 45 minutes | Phase 2 | HIGH |
| Phase 4 | Security Review | 30 minutes | Phase 3 | MEDIUM |
| Phase 5 | Verification | 20 minutes | Phase 4 | LOW |
| **TOTAL** | **All Phases** | **~2.5 hours** | Sequential | **HIGH** |

## Risk Assessment and Mitigation

### High-Risk Activities
1. **Table Dropping**: Point of no return - requires full backup strategy
2. **Stored Procedure Changes**: Affects core business logic - requires thorough testing
3. **Foreign Key Removal**: May impact referential integrity - needs careful validation

### Mitigation Strategies
1. **Comprehensive Backup**: Full database backup before any changes
2. **Atomic Transactions**: Each phase wrapped in transactions for rollback capability
3. **Step-by-Step Validation**: Verification after each major step
4. **Maintenance Window**: Execute during low-activity period
5. **Staged Approach**: Can pause between phases if issues arise

## Success Criteria

### Technical Success Indicators
- [ ] Zero duplicate stock tracking across system
- [ ] All sales process correctly through new SSoT architecture
- [ ] No data loss or corruption detected
- [ ] All existing functionality maintained
- [ ] Performance equal to or better than before migration

### Business Success Indicators
- [ ] Daily operations continue without interruption
- [ ] Stock levels remain accurate and consistent
- [ ] Reports and dashboards show correct data
- [ ] No user-reported issues or errors
- [ ] System audit logs show normal activity patterns

## Post-Migration Monitoring

### Week 1: Intensive Monitoring
- Daily data integrity checks
- Performance monitoring
- User feedback collection
- Error log analysis

### Month 1: Standard Monitoring
- Weekly data consistency verification
- Monthly performance review
- Quarterly audit of system health

### Long-term: Maintenance
- Remove backup tables after 90 days of stable operation
- Archive old procedures after 6 months
- Document lessons learned for future migrations

---

**Document Version:** 1.0
**Created:** 2025-09-16
**Last Updated:** 2025-09-16
**Review Required:** Before execution
**Approval Required:** System Administrator

**CRITICAL REMINDER:** This refactoring affects a production system with 925+ active records. Execute only during planned maintenance windows with full backup procedures in place.