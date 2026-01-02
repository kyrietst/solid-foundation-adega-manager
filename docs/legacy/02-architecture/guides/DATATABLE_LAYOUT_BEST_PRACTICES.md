# DataTable Layout Best Practices

**Version:** v3.1.0
**Component:** `src/shared/ui/layout/DataTable.tsx`
**Status:** ✅ Production-Ready

---

## Quick Reference

### Common Layout Issues & Solutions

| Issue | Root Cause | Solution | File Location |
|-------|------------|----------|---------------|
| First row hidden by header | Header covers Y=0 | Offset rows by header height | DataTable.tsx:346 |
| Table too short | Fixed height (`h-96`) | Dynamic height `calc(100vh-420px)` | DataTable.tsx:237 |
| Badges misaligned | No flex container | Wrap with `flex justify-center items-center w-full` | Component-specific |
| Headers inconsistent size | Mixed font sizes | Standardize with `text-xs` | DataTable.tsx:290,294,452,456 |
| Long headers overflow | Single-line text | Use `\n` + `whitespace-pre-line` | Column config + CSS |

---

## Header Positioning Pattern

### Problem: Sticky Header Covering First Row

**Cause:** Virtual rows start at Y=0, but sticky header at `top: 0` overlaps.

**Solution (2-step fix):**

```tsx
// Step 1: Remove container paddingTop
style={{
  height: rowVirtualizer.getTotalSize(),
  width: '100%',
  position: 'relative',
  // NO paddingTop here
}}

// Step 2: Offset each virtualized row
transform: `translateY(${virtualRow.start + HEADER_HEIGHT}px)`
```

**Why this works:** Rows start below header, header stays fixed at top.

---

## Responsive Height Pattern

### Problem: Wasted Vertical Space

**Bad:**
```tsx
className="h-96 overflow-auto"  // Fixed 384px
```

**Good:**
```tsx
className="h-[calc(100vh-420px)] overflow-auto"
```

**Calculation:**
- `100vh` = Full viewport
- `-420px` = Header (60) + Filters (80) + Margins (280)
- **Result:** Adapts to any screen size

---

## Badge Centering Pattern

### Problem: Left-Aligned Badges in Centered Columns

**Bad:**
```tsx
render: (value) => <Badge>{value}</Badge>
```

**Good:**
```tsx
render: (value) => (
  <div className="flex justify-center items-center w-full">
    <Badge>{value}</Badge>
  </div>
)
```

---

## 2-Line Header Pattern

### Problem: Long Headers Overflow Adjacent Columns

**Step 1 - Column title with `\n`:**
```tsx
{
  key: 'fieldName',
  title: 'FIRST LINE\nSECOND LINE', // ← Use \n for line break
  sortable: true,
  width: '150px',
  align: 'center',
}
```

**Step 2 - CSS support for line breaks:**
```tsx
<span className="whitespace-pre-line text-xs">
  {column.title}
</span>
```

**Classes:**
- `whitespace-pre-line` - Enables `\n` line breaks
- `text-xs` - Smaller font for compact headers

---

## Font Size Standardization

### Problem: Inconsistent Header Sizes

**Apply to ALL header spans:**

```tsx
// Sortable headers
<span className="whitespace-pre-line text-xs">{column.title}</span>

// Non-sortable headers
<span className="text-gray-300 font-medium whitespace-pre-line text-xs">
  {column.title}
</span>

// Sort icons (proportional to text)
<ArrowUpDown className="w-3 h-3 text-gray-400" />
```

**Result:** Uniform, professional appearance.

---

## Virtualization Best Practices

### Configuration

```tsx
<DataTable
  data={data}
  columns={columns}
  virtualization={true}           // Enable for 50+ rows
  virtualizationThreshold={50}    // Auto-enable threshold
  rowHeight={100}                 // Fixed height for consistency
  overscan={5}                    // Render 5 extra rows for smooth scroll
/>
```

### Performance Notes

- **DOM elements:** Always 15-20 regardless of dataset size
- **Memory:** Constant, does not grow with data
- **Scroll:** Native browser scroll with GPU acceleration
- **Safe for:** Weak computers, large datasets (925+ records tested)

---

## Column Width Best Practices

### Explicit Widths

**Always specify width for important columns:**

```tsx
{
  key: 'name',
  title: 'Nome',
  width: '200px',  // ← Explicit width
  sortable: true,
}
```

### Inline Styles (Recommended)

```tsx
style={column.width ? {
  width: column.width,
  minWidth: column.width,
  maxWidth: column.width,  // Prevent flex growing
} : undefined}
```

**Why:** Prevents browser rounding issues, ensures pixel-perfect layout.

---

## Accessibility Checklist

- [ ] All headers have proper `<TableHead>` elements
- [ ] Sortable columns have `aria-sort` attributes
- [ ] Empty states provide meaningful messages
- [ ] Loading states announce to screen readers
- [ ] Keyboard navigation works for all interactive elements
- [ ] Color contrast meets WCAG AAA standards

---

## Common Pitfalls

### ❌ Don't: Use padding on virtualized container
```tsx
// This breaks header positioning
style={{ paddingTop: '60px' }}
```

### ✅ Do: Offset rows instead
```tsx
transform: `translateY(${virtualRow.start + 60}px)`
```

---

### ❌ Don't: Fixed heights for table containers
```tsx
className="h-96"  // Not responsive
```

### ✅ Do: Use viewport-based calculations
```tsx
className="h-[calc(100vh-420px)]"
```

---

### ❌ Don't: Nest badges without containers
```tsx
<Badge>...</Badge>  // Left-aligned
```

### ✅ Do: Wrap with flex container
```tsx
<div className="flex justify-center items-center w-full">
  <Badge>...</Badge>
</div>
```

---

## Migration Checklist

When migrating existing tables to DataTable:

1. **Column Configuration**
   - [ ] Define `TableColumn[]` array with all columns
   - [ ] Specify widths for important columns
   - [ ] Configure sorting on relevant columns
   - [ ] Add custom `render` functions for complex cells

2. **Layout Setup**
   - [ ] Enable virtualization for datasets > 50 rows
   - [ ] Set appropriate `rowHeight` (80-120px typical)
   - [ ] Configure responsive height with `calc()`
   - [ ] Test on different screen sizes

3. **Styling**
   - [ ] Apply glass morphism if needed (`glassEffect={true}`)
   - [ ] Set variant (`default`, `premium`, `success`, etc.)
   - [ ] Enable striping/hovering as needed
   - [ ] Center badges/icons in cells

4. **Testing**
   - [ ] Verify first row visible (no header overlap)
   - [ ] Test with production dataset (925+ records)
   - [ ] Validate on weak computers
   - [ ] Check mobile responsiveness

---

## References

- **Component Source:** `src/shared/ui/layout/DataTable.tsx`
- **Migration Guide:** `docs/03-modules/customers/CUSTOMER_DATATABLE_SSOT_MIGRATION.md`
- **SSoT Architecture:** `docs/02-architecture/SSOT_SYSTEM_ARCHITECTURE.md`
- **TanStack Virtual Docs:** https://tanstack.com/virtual/latest

---

**Last Updated:** October 9, 2025
**Reviewed By:** Development Team
**Status:** Production-Ready ✅
