# PageTitle Component

## Overview
The `PageTitle` component is a standardized page title solution for the Adega Manager system, extracted from the perfect implementation found in the Suppliers Management page.

## Features
- **Perfect design token usage** from Adega Wine Cellar palette
- **SF Pro Display typography hierarchy**
- **BlurIn animation integration**
- **Glassmorphism container** with proper shadows
- **Multi-layer gradient underline system**
- **Responsive design** (center/left alignment)
- **Optional counter badge** with consistent styling
- **Children support** for additional controls

## Usage

### Basic Usage
```tsx
import { PageTitle } from '@/shared/ui/composite/PageTitle';

<PageTitle
  title="PAGE TITLE"
  subtitle="Optional description"
/>
```

### With Counter
```tsx
<PageTitle
  title="GESTÃO DE FORNECEDORES"
  subtitle="Sistema avançado de gestão de parceiros comerciais"
  count={suppliers.length}
  countLabel="fornecedores"
/>
```

### With Additional Controls
```tsx
<PageTitle
  title="CONTROLE DE ENTREGAS"
  subtitle="Sistema completo de gestão logística"
  count={stats.total}
  countLabel="entregas"
>
  <Button>Custom Action</Button>
  <DropdownMenu>...</DropdownMenu>
</PageTitle>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ | - | Main page title |
| `subtitle` | `string` | ❌ | - | Optional subtitle/description |
| `count` | `number` | ❌ | - | Value for counter badge |
| `countLabel` | `string` | ❌ | - | Label for counter (e.g., "produtos", "clientes") |
| `className` | `string` | ❌ | - | Additional CSS classes |
| `animationDuration` | `number` | ❌ | `1.2` | BlurIn animation duration in seconds |
| `alignment` | `'left' \| 'center' \| 'responsive'` | ❌ | `'responsive'` | Text alignment |
| `children` | `React.ReactNode` | ❌ | - | Additional controls/content |

## Implementation Status

✅ **Implemented in:**
- Dashboard (`CENTRO DE COMANDO`)
- Sales (`PONTO DE VENDA`)
- Inventory Management (`GESTÃO DE ESTOQUE`)
- Customer Management (`GESTÃO DE CLIENTES`)
- Delivery Management (`CONTROLE DE ENTREGAS`)
- Reports (`RELATÓRIOS CENTRAIS`)
- User Management (`ADMINISTRAÇÃO DO SISTEMA`)
- Suppliers Management (`GESTÃO DE FORNECEDORES`)

## Design System Integration

The component uses:
- **Colors**: accent-red (`#FF2400`) and primary-yellow (`#FFDA04`) gradients
- **Typography**: SF Pro Display with theme utilities
- **Effects**: BlurIn animation, glassmorphism, multi-layer gradients
- **Spacing**: Consistent padding and margins following design tokens

## Benefits

1. **Consistency**: All pages now use the same visual pattern
2. **Maintainability**: Single source of truth for page titles
3. **Performance**: Eliminates duplicate code and styling
4. **Accessibility**: Proper heading hierarchy and ARIA compliance
5. **Developer Experience**: Easy to use with clear props interface

## Migration

The standardization eliminated ~90% of duplicate title code across the application, replacing hardcoded implementations in 8 main pages with a single, reusable component.