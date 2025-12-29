
import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { SearchInput } from '@/shared/ui/composite/search-input';
import { Store, Warehouse, Filter, AlertCircle } from 'lucide-react';

interface InventoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStore: 1 | 2;
  onStoreChange: (store: 1 | 2) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showMissingCostsOnly: boolean;
  onToggleMissingCosts: () => void;
  categories: { id: string; name: string }[]; // Using generic shape to avoid deep strict dep issues for now
  missingCostsCount: number;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedStore,
  onStoreChange,
  selectedCategory,
  onCategoryChange,
  showMissingCostsOnly,
  onToggleMissingCosts,
  categories,
  missingCostsCount
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Search Bar */}
      <div>
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Buscar por nome ou código de barras..."
          className="w-full"
        />
      </div>

      {/* Toggle Loja 1 (Active) / Loja 2 (Holding) + Filtro por Categoria */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
        {/* Botões de Loja */}
        <div className="flex gap-2">
          <Button
            variant={selectedStore === 1 ? 'default' : 'outline'}
            onClick={() => onStoreChange(1)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Store className="h-4 w-4" />
            Loja 1 (Vendas)
          </Button>

          <Button
            variant={selectedStore === 2 ? 'default' : 'outline'}
            onClick={() => onStoreChange(2)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Warehouse className="h-4 w-4" />
            Loja 2 (Depósito)
          </Button>
        </div>

        {/* Filtro por Categoria e Auditoria */}
        <div className="flex items-center gap-3">
          {/* Botão "Sem Custo" para Auditoria Rápida */}
          {missingCostsCount > 0 && (
            <button
              onClick={onToggleMissingCosts}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 border-2 hover:scale-[1.02] active:scale-[0.98] ${showMissingCostsOnly
                ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-transparent border-amber-500/50 text-amber-400/70 hover:border-amber-500 hover:text-amber-400"
                }`}
              title="Filtrar apenas produtos sem preço de custo cadastrado"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Sem Custo</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${showMissingCostsOnly
                ? "bg-amber-500 text-black"
                : "bg-amber-500/30 text-amber-400"
                }`}>
                {missingCostsCount}
              </span>
            </button>
          )}

          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-48 h-8 bg-black/40 border-white/20 text-white text-sm">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
              <SelectItem value="all" className="text-white hover:bg-white/10">
                📂 Todas as Categorias
              </SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.name}
                  className="text-white hover:bg-white/10"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};