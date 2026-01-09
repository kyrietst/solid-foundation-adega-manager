# 05. Performance & Optimization Standards

This document outlines the performance protocols and "Hard Lessons" learned
during development.

## 1. List Virtualization (Product Grid)

When rendering large lists (e.g., 500+ products), we use
`@tanstack/react-virtual` to render only the visible items.

### The "Overlapping Card" Problem (Matemática Pura)

**Symptoms:** Rows overlap each other, covering content. **Cause:** The
`estimateSize` prop provided to the virtualizer is smaller than the actual
rendered height of the item. **Context:** In responsive grids (where width
changes), height also changes (due to Aspect Ratio), making static estimation
impossible.

### The Solution Protocol

1. **Safe Estimation:** Set `estimateSize` to a value **larger** than the
   average item (e.g., `500px` for cards). Better to have extra whitespace
   during scroll than collision.
2. **Dynamic Measurement (Critical):** You MUST attach the `measureElement` ref
   to the row container so the library can calculate the exact height after
   render.

   ```tsx
   // Hook
   const rowVirtualizer = useVirtualizer({
     estimateSize: () => 500, // Safe Buffer
     // ...
   });

   // Render
   <div
     key={virtualRow.index}
     data-index={virtualRow.index} // Required for measurement
     ref={rowVirtualizer.measureElement} // Dynamic Measure
     className="..."
   >
     {children}
   </div>;
   ```

3. **Items Per Row:** Match the CSS Grid columns exactly in the calculation
   logic (`const ITEMS_PER_ROW = 5` for XL screens).

## 2. Image Optimization

- **Library:** Use `OptimizedImage` (wrapper around `img` with skeleton).
- **Format:** Prefer WebP.
- **Loading:** Lazy load everything below the fold.

## 3. RPC vs Client Logic

- **Rule:** Heavy calculations (Sales totals, Inventory movements) MUST happen
  in Database (RPC) or Edge Functions.
- **Forbidden:** Fetching all sales to filter in JavaScript (`.filter()`). Use
  `.eq()` in Supabase query.
