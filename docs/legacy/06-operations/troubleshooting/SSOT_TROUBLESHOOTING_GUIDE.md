# SSoT Component Troubleshooting Guide

**Version:** v3.0.0
**Purpose:** Debug common issues with SSoT components (SuperModal, DataTable, Business Hooks)
**Audience:** Developers, AI Assistants

---

## SuperModal Issues

### Form Validation Not Working

**Symptoms:**
- Form submits even with invalid data
- Error messages not showing
- Validation schema ignored

**Debugging Steps:**
```bash
# 1. Check if validationSchema is properly imported Zod schema
console.log(validationSchema)  # Should show Zod schema object

# 2. Verify formData structure matches schema
console.log({ formData, schemaShape: validationSchema.shape })

# 3. Enable debug prop to see internal state
<SuperModal debug={true} />  # Opens debug panel in modal
```

**Common Fixes:**
- Ensure `validationSchema` is a Zod schema, not a plain object
- Match form field names to schema keys exactly
- Check browser console for Zod validation errors

---

### Submit Handler Not Triggering

**Symptoms:**
- Button click does nothing
- No network request initiated
- Form doesn't close after submit

**Debugging Steps:**
```bash
# 1. Verify onSubmit handler returns Promise
const handleSubmit = async (data) => {  # ← Must be async or return Promise
  return api.create(data);
}

# 2. Check if form fields have proper name attributes
# Each input must have correct field name

# 3. Review browser console for validation errors
# Look for "Validation failed" messages
```

**Common Fixes:**
- `onSubmit` must return a Promise
- All form inputs need `name` attributes matching schema
- Check for typos in field names

---

## DataTable Issues

### Table Not Rendering Data

**Symptoms:**
- Empty table despite having data
- "No items found" message incorrectly shown
- Columns visible but no rows

**Debugging Steps:**
```bash
# 1. Verify data prop is array, not null/undefined
console.log({ data, isArray: Array.isArray(data) })

# 2. Check columns configuration matches data keys
console.log({ dataKeys: Object.keys(data[0]), columnKeys: columns.map(c => c.key) })

# 3. Enable loading/error states explicitly
<DataTable data={data || []} loading={isLoading} error={error} />
```

**Common Fixes:**
- Pass `data || []` instead of just `data` to handle null
- Ensure column `key` values match actual data properties
- Set `loading` and `error` props correctly

---

### Virtualization Issues

**Symptoms:**
- Scroll jumpy or erratic
- Rows rendering in wrong positions
- Performance worse than expected

**Debugging Steps:**
```bash
# 1. Check virtualizationThreshold setting
# Should be 50 for most use cases

# 2. Verify container height is fixed
# Virtualization requires fixed height container

# 3. Disable virtualization for debugging
<DataTable virtualization={false} />  # Test without virtualization
```

**Common Fixes:**
- Use fixed height: `className="h-[calc(100vh-420px)]"`
- Set consistent `rowHeight` (80-120px typical)
- Ensure parent container doesn't have dynamic height

---

### Filters Not Working

**Symptoms:**
- Filter toggle button doesn't show filters
- Filters visible but don't affect data
- Search not filtering results

**Debugging Steps:**
```bash
# 1. Verify filters component returns proper JSX
console.log({ filters })  # Should be valid React element

# 2. Check showFilters state management
const [showFilters, setShowFilters] = useState(false);
<DataTable showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)} />

# 3. Ensure onToggleFilters callback is connected
# Must update showFilters state
```

**Common Fixes:**
- `filters` prop must be JSX, not a function
- Manage `showFilters` state in parent component
- Connect `onToggleFilters` to state setter

---

## Business Logic Hooks Issues

### useCustomerOperations Not Returning Data

**Symptoms:**
- Hook returns undefined/null
- Metrics calculation shows NaN
- Segmentation not working

**Debugging Steps:**
```bash
# 1. Check if customer data includes required fields
console.log({ customer, hasId: !!customer.id, hasName: !!customer.name })

# 2. Verify metrics calculations are not causing NaN
const ops = useCustomerOperations(customer);
console.log({ metrics: ops.metrics, insights: ops.insights })

# 3. Enable React DevTools to inspect hook return values
# Components tab → Select component → Hooks section
```

**Common Fixes:**
- Ensure customer object has `id`, `name`, and required fields
- Check for division by zero in LTV calculations
- Provide default values for optional fields

---

### useProductOperations Performance Issues

**Symptoms:**
- Page slow to render
- Excessive re-renders
- Hook recalculating unnecessarily

**Debugging Steps:**
```bash
# 1. Wrap in useMemo for expensive calculations
const productOps = useMemo(() => useProductOperations(product), [product]);

# 2. Check if product data changes trigger unnecessary recalculations
# Use React DevTools Profiler

# 3. Verify inventory calculations dependency chain
# Ensure memo dependencies are minimal
```

**Common Fixes:**
- Memoize hook results when used multiple times
- Ensure product object reference stability
- Use `React.memo()` on components using the hook

---

## SSoT Migration Issues

### Component Not Using SSoT Pattern

**Symptoms:**
- Custom implementation instead of SSoT component
- Duplicate code across components
- Inconsistent styling/behavior

**Resolution Steps:**
```bash
# 1. Check if legacy component can be replaced with SuperModal
# Any modal with form → Use SuperModal

# 2. Verify table components use DataTable instead of custom tables
# Any list/table → Use DataTable

# 3. Move business logic to centralized hooks
# Calculations in components → Extract to useCustomerOperations/useProductOperations

# 4. Reference migration templates
# See: docs/02-architecture/SSOT_MIGRATION_TEMPLATES.md
```

---

### Props Mismatch After SSoT Migration

**Symptoms:**
- TypeScript errors about missing/wrong props
- Component crashes at runtime
- Features not working after migration

**Resolution Steps:**
```bash
# 1. Check component signature changes in SuperModal/DataTable
# SuperModal: isOpen, onClose, modalType, title, formData, onSubmit, validationSchema
# DataTable: data, columns, loading, error, variant, glassEffect, virtualization

# 2. Update prop names to match SSoT component APIs
# Old: open → New: isOpen
# Old: handleClose → New: onClose

# 3. Verify form data structure matches new validation schemas
# Zod schema keys must match formData object keys

# 4. Test with TypeScript strict mode for prop validation
# Run: npx tsc --noEmit --strict
```

---

## Common Build/Cache Issues

### Vite Cache Problems

**Symptoms:**
- Changes not reflecting in browser
- Old component versions showing
- Styles not updating

**Solution:**
```bash
# Clear Vite cache completely
pkill -f "vite"
rm -rf node_modules/.vite .vite dist
npm run dev

# Browser cache: Hard refresh
# Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

---

### Hot Module Replacement (HMR) Issues

**Symptoms:**
- Component props not updating
- Styles cached incorrectly
- Need full page refresh to see changes

**Solution:**
```bash
# 1. Stop dev server
# 2. Clear caches
rm -rf node_modules/.vite .vite
# 3. Restart dev server
npm run dev
# 4. Hard refresh browser
```

---

## Getting Help

### Debug Checklist

Before asking for help, verify:

- [ ] Latest code pulled from repository
- [ ] `npm install` run recently
- [ ] Caches cleared (`rm -rf node_modules/.vite .vite`)
- [ ] TypeScript compilation passes (`npm run build`)
- [ ] ESLint warnings addressed (`npm run lint`)
- [ ] Browser console checked for errors
- [ ] React DevTools used to inspect component state
- [ ] Network tab checked for failed API calls

### Information to Provide

When reporting an issue, include:

1. **Component name** and file location
2. **Error message** (full stack trace)
3. **Browser console output**
4. **Code snippet** showing the problem
5. **Steps to reproduce**
6. **Expected vs actual behavior**

### Related Documentation

- **SSoT Architecture:** `docs/02-architecture/SSOT_SYSTEM_ARCHITECTURE.md`
- **Migration Templates:** `docs/02-architecture/SSOT_MIGRATION_TEMPLATES.md`
- **DataTable Best Practices:** `docs/02-architecture/guides/DATATABLE_LAYOUT_BEST_PRACTICES.md`
- **Real Migration Example:** `docs/03-modules/customers/CUSTOMER_DATATABLE_SSOT_MIGRATION.md`

---

**Last Updated:** October 9, 2025
**Maintained By:** Development Team
**Status:** Production-Ready ✅
