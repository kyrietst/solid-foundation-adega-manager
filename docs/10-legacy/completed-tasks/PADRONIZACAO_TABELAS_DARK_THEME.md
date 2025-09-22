# Padrão de Tabelas - Dark Theme System

## Visão Geral

Este documento define o padrão visual e estrutural para tabelas no sistema Adega Manager, seguindo o design system dark theme com glassmorphism. A implementação de referência está em `CustomerDataTable.tsx`.

## 🎨 Design System - Cores e Classes

### Paleta de Cores Principal
```css
/* Backgrounds */
bg-black/40          /* Container principal da tabela */
bg-black/20          /* Header da tabela */
bg-black/10          /* Linhas pares */
bg-black/20          /* Linhas ímpares */
bg-gray-800/60       /* Filtros e botões */
bg-gray-600          /* Barras de progresso background */

/* Textos */
text-gray-100        /* Texto principal das células */
text-gray-300        /* Headers da tabela */
text-gray-400        /* Texto secundário/contadores */

/* Bordas */
border-white/10      /* Bordas principais */
border-gray-600/50   /* Bordas de filtros */

/* Estados Hover */
hover:bg-white/5     /* Hover nas linhas */
hover:text-yellow-400 /* Hover em links e botões ordenáveis */
hover:bg-gray-700/80  /* Hover em filtros */

/* Accent Colors */
text-yellow-400      /* Links, ícones importantes, avatares */
bg-yellow-400/20     /* Background de avatares */
```

## 🏗️ Estrutura da Tabela

### 1. Container Principal
```tsx
<div className="my-6 space-y-4 overflow-x-auto">
  {/* Filtros */}
  <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
    {/* Área de filtros */}
  </div>

  {/* Tabela */}
  <div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden">
    <Table className="w-full">
      {/* Header e Body */}
    </Table>
  </div>
</div>
```

### 2. Área de Filtros
```tsx
<div className="flex flex-wrap gap-4 items-center justify-between mb-4">
  <div className="flex gap-2 flex-wrap items-center">
    {/* Barra de busca (SearchBar21st) */}
    <div className="w-64 md:w-80">
      <SearchBar21st
        placeholder="Buscar..."
        value={searchTerm}
        onChange={setSearchTerm}
        // ... outras props
      />
    </div>

    {/* Filtros dropdown */}
    <select className="px-3 py-2 border border-gray-600/50 rounded-md bg-gray-800/60 text-gray-100 text-sm hover:bg-gray-700/80 focus:ring-2 focus:ring-yellow-400/50">
      <option value="">Todos os itens</option>
      {/* Options */}
    </select>
  </div>

  {/* Área de controles */}
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-400">
      {filteredData.length} de {totalData.length} itens
    </span>
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-gray-800/60 border-gray-600 text-gray-100 hover:bg-gray-700/80"
        >
          Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-gray-800/95 border-gray-600">
        {/* Items */}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

## 📋 Header da Tabela

### Estrutura do Header
```tsx
<TableHeader>
  <TableRow className="border-b border-white/10 bg-black/20 hover:bg-black/30">
    {/* Coluna simples */}
    <TableHead className="w-[180px] text-gray-300 font-semibold">
      Nome da Coluna
    </TableHead>

    {/* Coluna ordenável */}
    <TableHead className="w-[140px] text-gray-300 font-semibold">
      <Button
        variant="ghost"
        onClick={() => handleSort('fieldName')}
        className="flex items-center gap-2 p-0 hover:bg-transparent text-gray-300 hover:text-yellow-400"
      >
        <Icon className="w-4 h-4" />
        Nome da Coluna
        {getSortIcon('fieldName')}
      </Button>
    </TableHead>

    {/* Coluna com ícone */}
    <TableHead className="w-[80px] text-gray-300 font-semibold">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        Coluna
      </div>
    </TableHead>
  </TableRow>
</TableHeader>
```

### Padrões de Largura
```css
w-[80px]   /* Colunas muito pequenas (ícones, status simples) */
w-[120px]  /* Colunas pequenas (status, badges) */
w-[140px]  /* Colunas médias (datas, valores) */
w-[160px]  /* Colunas grandes (textos longos) */
w-[200px]  /* Colunas principais (nomes, títulos) */
```

## 🗂️ Corpo da Tabela

### Estrutura das Linhas
```tsx
<TableBody>
  {filteredData.map((item, index) => (
    <TableRow 
      key={item.id} 
      className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
        index % 2 === 0 ? 'bg-black/10' : 'bg-black/20'
      }`}
    >
      {/* Células */}
    </TableRow>
  ))}
</TableBody>
```

### Tipos de Células

#### 1. Célula com Avatar e Link
```tsx
<TableCell className="font-medium whitespace-nowrap text-gray-100">
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
      <span className="text-sm font-semibold text-yellow-400">
        {item.name.charAt(0).toUpperCase()}
      </span>
    </div>
    <Link 
      to={`/item/${item.id}`} 
      className="hover:underline hover:text-yellow-400 transition-colors text-gray-100"
      title={`Ver detalhes de ${item.name}`}
    >
      {item.name}
    </Link>
  </div>
</TableCell>
```

#### 2. Célula de Texto Simples
```tsx
<TableCell className="whitespace-nowrap text-gray-100">
  {item.value || "Não informado"}
</TableCell>
```

#### 3. Célula com Badge
```tsx
<TableCell className="whitespace-nowrap">
  <Badge variant="outline" className="bg-gray-700/50 text-gray-100 border-gray-600/50">
    {item.status}
  </Badge>
</TableCell>
```

#### 4. Célula com Badge Colorido
```tsx
<TableCell className="whitespace-nowrap">
  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
    {item.status}
  </Badge>
</TableCell>
```

## 🎯 Componentes Especializados

### 1. Badges de Status
```tsx
const StatusBadge = ({ status, color }) => {
  const statusColors = {
    gold: "bg-yellow-500 text-white",
    green: "bg-green-500 text-white", 
    yellow: "bg-yellow-400 text-gray-800",
    red: "bg-red-500 text-white",
    gray: "bg-gray-400 text-white",
    orange: "bg-orange-500 text-white"
  };
  
  return (
    <Badge className={cn("whitespace-nowrap", statusColors[color])}>
      {status}
    </Badge>
  );
};
```

### 2. Barra de Progresso
```tsx
const ProgressBar = ({ percentage }) => (
  <div className="flex items-center gap-2 min-w-[80px]">
    <div className="flex-1">
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300 bg-green-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
    <span className="text-xs font-medium text-gray-100">
      {percentage}%
    </span>
  </div>
);
```

### 3. Badge com Tooltip
```tsx
const TooltipBadge = ({ icon: Icon, text, tooltip, color = "gray" }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-1 text-${color}-400`}>
          <Icon className="w-3 h-3" />
          {text}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
```

## 📱 Estados da Tabela

### Loading State
```tsx
if (isLoading) {
  return (
    <div className="my-6 space-y-4 p-4">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Carregando dados...</p>
        </div>
      </div>
    </div>
  );
}
```

### Error State
```tsx
if (error) {
  return (
    <div className="my-6 space-y-4 p-4">
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-red-400">
          <p>Erro ao carregar dados</p>
          <p className="text-sm text-gray-400 mt-1">{error.message}</p>
        </div>
      </div>
    </div>
  );
}
```

### Empty State
```tsx
<TableRow className="border-b border-white/10">
  <TableCell colSpan={visibleColumns.length} className="text-center py-6">
    <div className="flex flex-col items-center gap-2">
      <Icon className="w-8 h-8 text-gray-400" />
      <p className="text-gray-300">Nenhum item encontrado.</p>
      {hasFilters && (
        <p className="text-sm text-gray-400">
          Tente ajustar os filtros de busca.
        </p>
      )}
    </div>
  </TableCell>
</TableRow>
```

## 🔍 Funcionalidades Obrigatórias

### 1. Sistema de Ordenação
```tsx
const handleSort = (field) => {
  if (sortField === field) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortField(field);
    setSortDirection('desc');
  }
};

const getSortIcon = (field) => {
  if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
  return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
};
```

### 2. Sistema de Filtros
```tsx
const filteredData = useMemo(() => {
  return data.filter((item) => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filter || item.category === filter;
    
    return matchesSearch && matchesFilter;
  });
}, [data, searchTerm, filter]);
```

### 3. Controle de Colunas Visíveis
```tsx
const [visibleColumns, setVisibleColumns] = useState([...ALL_COLUMNS]);

const toggleColumn = (column) => {
  setVisibleColumns((prev) =>
    prev.includes(column) 
      ? prev.filter((c) => c !== column) 
      : [...prev, column]
  );
};
```

## 📏 Responsividade

### Breakpoints
```tsx
// Mobile First
className="w-64 md:w-80"                    // Busca responsiva
className="flex flex-col sm:flex-row"       // Layout adaptativo
className="gap-2 sm:gap-4"                  // Espaçamentos
className="text-sm sm:text-base"            // Tamanhos de fonte
```

### Scroll Horizontal
```tsx
<div className="overflow-x-auto">
  <Table className="w-full min-w-[800px]">
    {/* Tabela com largura mínima */}
  </Table>
</div>
```

## ✅ Checklist de Implementação

### Estrutura Básica
- [ ] Container principal com `bg-black/40` e `border-white/10`
- [ ] Área de filtros com `bg-gray-800/60`
- [ ] Header com `bg-black/20` e `text-gray-300`
- [ ] Linhas alternadas `bg-black/10` e `bg-black/20`
- [ ] Hover states em todas as interações

### Funcionalidades
- [ ] Sistema de busca (SearchBar21st)
- [ ] Filtros dropdown com tema dark
- [ ] Ordenação por colunas
- [ ] Controle de colunas visíveis
- [ ] Estados de loading, error e empty
- [ ] Responsividade mobile

### Componentes
- [ ] Avatares com `bg-yellow-400/20`
- [ ] Links com hover `text-yellow-400`
- [ ] Badges com cores apropriadas
- [ ] Tooltips informativos
- [ ] Ícones consistentes (Lucide)

### Performance
- [ ] useMemo para filtros e ordenação
- [ ] Paginação quando necessário
- [ ] Lazy loading para tabelas grandes
- [ ] Debounce na busca

## 🚀 Exemplo de Implementação

Veja o arquivo `src/features/customers/components/CustomerDataTable.tsx` como referência completa desta padronização.

## 📚 Dependências Necessárias

```typescript
// UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/primitives/table";
import { Badge } from "@/shared/ui/primitives/badge";
import { Button } from "@/shared/ui/primitives/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/shared/ui/primitives/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/primitives/tooltip";

// Search
import { SearchBar21st } from "@/shared/ui/thirdparty/search-bar-21st";

// Icons
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

// Utils
import { cn } from "@/core/config/utils";
```

---

**Autor**: Sistema Adega Manager  
**Versão**: 1.0  
**Data**: Agosto 2025  
**Baseado em**: CustomerDataTable.tsx v2.0.0