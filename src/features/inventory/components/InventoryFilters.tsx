
import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { SearchInput } from '@/shared/ui/composite/search-input';
import { Store, Warehouse, Filter, AlertCircle, Search as SearchIcon } from 'lucide-react';

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
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      {/* Search - Glass Input */}
      <div className="relative flex-1 min-w-[240px]">
        {/* Usando input direto para garantir fidelidade visual ao tema Stitch */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
             <SearchIcon className="h-5 w-5" />
        </div>
        <input 
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, SKU ou código de barras..."
            className="w-full h-12 pl-12 pr-4 bg-[#09090b] border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#f9cb15]/50 focus:ring-1 focus:ring-[#f9cb15]/50 transition-all text-sm"
        />
      </div>

      {/* Category Filter - Glass Select */}
      <div className="relative w-full md:w-64">
         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 z-10 pointer-events-none">
            <Filter className="h-5 w-5" />
         </div>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full h-12 pl-12 bg-[#09090b] border-white/10 rounded-xl text-white text-sm hover:bg-white/5 focus:ring-[#f9cb15]/50 placeholder:text-zinc-500">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent className="bg-[#09090b] border-white/10 text-white">
              <SelectItem value="all" className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">📂 Todas as Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.name}
                  className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>

      {/* Store Toggle - Tab Style */}
      <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm shrink-0">
          <button 
            onClick={() => onStoreChange(1)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${selectedStore === 1 
                ? 'bg-[#f9cb15] text-black shadow-lg hover:bg-[#ffe04f]' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5 font-medium'}`}
          >
             <Store className="h-4 w-4" />
             Loja 1
          </button>
          <button 
            onClick={() => onStoreChange(2)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${selectedStore === 2 
                ? 'bg-[#f9cb15] text-black shadow-lg hover:bg-[#ffe04f]' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5 font-medium'}`}
          >
             <Warehouse className="h-4 w-4" />
             Loja 2
          </button>
      </div>
      
      {/* Botão Extra de Missing Costs (Auditoria) */}
      {missingCostsCount > 0 && (
            <button
              onClick={onToggleMissingCosts}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${showMissingCostsOnly
                ? "bg-amber-500/10 border-amber-500 text-amber-500"
                : "bg-transparent border-white/10 text-zinc-500 hover:text-amber-500 hover:border-amber-500/50"
                }`}
              title="Produtos sem custo"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="font-bold text-sm">{missingCostsCount}</span>
            </button>
      )}
    </div>
  );
};