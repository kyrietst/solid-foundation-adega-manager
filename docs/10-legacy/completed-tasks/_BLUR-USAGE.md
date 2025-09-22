## Guia de Blur e Glass Effect no Sistema

Este documento mapeia onde e como efeitos de blur são usados no front-end, para referência rápida do time UI/UX. Inclui: tipos (Tailwind e CSS customizado), intensidade, e componentes com seus caminhos.

### Convenções de Blur
- **Tailwind (backdrop-blur-*)**: aplica blur ao fundo (backdrop). Escalas típicas: `sm≈4px`, `lg≈16px`, `xl≈24px`.
- **Tailwind (blur-*)**: aplica blur no próprio elemento (filtro normal), usado em elementos decorativos.
- **CSS custom (glass-*) em `src/index.css`**:
  - `glass-card`: `backdrop-filter: blur(16px)`; com fallbacks e degrade. Mobile reduz para `8px`.
  - `glass-yellow`: `backdrop-filter: blur(16px)` com acento dourado.
  - `glass-premium`: `backdrop-filter: blur(16px)` + gradient escuro.
  - `glass-subtle`: `backdrop-filter: blur(8px)`.
  - `glass-strong`: `backdrop-filter: blur(24px)`.
- **Config de tema em `src/core/config/theme.ts`**:
  - `blur.card`: `backdrop-blur-xl`
  - `blur.modal`: `backdrop-blur-lg`
  - `blur.overlay`: `backdrop-blur-sm`

### Componentes Base (Primitives)
- **Dialog Overlay** — `backdrop-blur-sm`
  - Arquivo: `src/shared/ui/primitives/dialog.tsx`
  - Linha: Overlay aplica `bg-black/80 backdrop-blur-sm`.
- **Dialog Content** — `glass-card` (CSS custom, ~16px)
  - Arquivo: `src/shared/ui/primitives/dialog.tsx`
  - Observação: content usa classe `glass-card` (16px) e botão de fechar tem hover com `backdrop-blur-sm`.
- **Button (variant="ghost")** — base `backdrop-blur-sm`, hover `hover:backdrop-blur-lg`
  - Arquivo: `src/shared/ui/primitives/button.tsx`

### Inputs e Utilitários de Tema
- **Inputs (getGlassInputClasses)** — intensidades por variante
  - Arquivo: `src/core/config/theme-utils.ts`
  - `default`: `backdrop-blur-xl`
  - `search`: `backdrop-blur-xl`
  - `form`: `backdrop-blur-lg`

### Layout e Composites
- **Breadcrumb** — `backdrop-blur-sm`
  - Arquivo: `src/shared/ui/layout/Breadcrumb.tsx`
- **DataTable (thead sticky)** — `backdrop-blur-sm`
  - Arquivo: `src/shared/ui/layout/DataTable.tsx`
- **FormDialog (DialogContent wrapper)** — `backdrop-blur-xl`
  - Arquivo: `src/shared/ui/layout/FormDialog.tsx`
- **PaginationControls (SelectTrigger)** — `backdrop-blur-sm`
  - Arquivo: `src/shared/ui/composite/pagination-controls.tsx`
- **SearchInput (botão limpar hover)** — `hover:backdrop-blur-sm`
  - Arquivo: `src/shared/ui/composite/search-input.tsx`
- **Skeleton (ProductCardSkeleton container)** — `backdrop-blur-xl`
  - Arquivo: `src/shared/ui/composite/skeleton.tsx`
- **FormLoadingOverlay (overlay de formulário)** — `backdrop-blur-sm`
  - Arquivo: `src/shared/components/form-loading.tsx`
- **WavyBackground (Safari apenas, canvas)** — `filter: blur(<px>)`
  - Arquivo: `src/shared/ui/layout/wavy-background.tsx`
  - Observação: recebe `blur` em px (ex.: 10) e aplica `filter: blur(...)` apenas no Safari.

### Navegação / Layout Principal
- **Header breadcrumb wrapper (Index)** — `backdrop-blur-sm`
  - Arquivo: `src/pages/Index.tsx`
- **Sidebar (links e avatar)** — ativo `backdrop-blur-sm`; hover `hover:backdrop-blur-lg`
  - Arquivo: `src/app/layout/Sidebar.tsx`

### Página de Autenticação
- **Fundo ondulado (WavyBackground)** — `filter: blur(10px)` no canvas (Safari)
  - Arquivo: `src/pages/Auth.tsx` (prop `blur={10}`)
- **Card de login** — `backdrop-blur-xl`
  - Arquivo: `src/pages/Auth.tsx`
- **Linha decorativa do botão** — `blur-sm` (no próprio elemento)
  - Arquivo: `src/pages/Auth.tsx` (decorativo em `BottomGradient`)

### Dashboard
- **ChartsSection (cards)** — `backdrop-blur-xl`
  - Arquivo: `src/features/dashboard/components/ChartsSection.tsx`
- **ChartsSection (Tooltip)** — inline `backdropFilter: 'blur(16px)'`
  - Arquivo: `src/features/dashboard/components/ChartsSection.tsx`
- **AdminPanel (wrapper)** — `backdrop-blur-sm`
  - Arquivo: `src/features/dashboard/components/AdminPanel.tsx`
- **RecentActivities (item e ícone)** — `backdrop-blur-sm`
  - Arquivo: `src/features/dashboard/components/RecentActivities.tsx`

### Inventário
- **Filtros (SelectTrigger/Content)** — `backdrop-blur-xl`
  - Arquivo: `src/features/inventory/components/ProductFilters.tsx`
- **Tabela (thead sticky)** — `backdrop-blur-sm`
  - Arquivo: `src/features/inventory/components/InventoryTable.tsx`
- **TurnoverAnalysis (cards)** — `backdrop-blur-xl`
  - Arquivo: `src/features/inventory/components/TurnoverAnalysis.tsx`

### Clientes
- **CustomerStats (cards)** — `backdrop-blur-xl`
  - Arquivo: `src/features/customers/components/customer-stats.tsx`
- **CustomerTrends (cards)** — `backdrop-blur-xl`
  - Arquivo: `src/features/customers/components/customer-trends.tsx`
- **CustomerDetailModal (DialogContent)** — `backdrop-blur-xl`
  - Arquivo: `src/features/customers/components/CustomerDetailModal.tsx`
- **CustomerDetailModal (cards internos)** — `backdrop-blur-sm`
  - Arquivo: `src/features/customers/components/CustomerDetailModal.tsx`
- **CustomerTable (thead sticky)** — `backdrop-blur-sm`
  - Arquivo: `src/features/customers/components/CustomerTable.tsx`

### Relatórios
- **StockReportSummary (cards)** — `backdrop-blur-xl`
  - Arquivo: `src/features/reports/components/StockReportSummary.tsx`
- **StockReportTable (cards)** — `backdrop-blur-xl`
  - Arquivo: `src/features/reports/components/StockReportTable.tsx`

### Delivery
- **Cards de resumo e listagem** — `backdrop-blur-xl`
  - Arquivo: `src/features/delivery/components/Delivery.tsx`

### Usuários
- **UserList (card)** — `backdrop-blur-xl`
  - Arquivo: `src/features/users/components/UserList.tsx`

### Observações de Performance e Acessibilidade
- **Mobile**: classes `glass-*` reduzem para `blur(8px)` em telas ≤768px; em dispositivos muito simples (`max-resolution: 1dppx`) o blur é desativado.
- **Fallbacks**: `-webkit-backdrop-filter` habilitado para Safari; há degradês/cores base quando `backdrop-filter` não é suportado.
- **Uso recomendado**:
  - Overlays/backdrops: `backdrop-blur-sm`.
  - Modais: `backdrop-blur-lg` a `xl` (consistente com `theme.ts`).
  - Cards/painéis principais: `backdrop-blur-xl` ou `glass-card`.
  - Elementos decorativos locais (não-backdrop): `blur-sm` no próprio elemento.

### Referências de Código
- CSS glass e níveis: `src/index.css`
- Config tema (blur/card/modal/overlay): `src/core/config/theme.ts`
- Utilitários e variantes (botões/inputs/sidebar): `src/core/config/theme-utils.ts`

Caso precise padronizar intensidades diferentes (por exemplo, alinhar tudo a `sm/ lg/ xl`), a troca pode ser centralizada via utilitários de tema e classes `glass-*`.

