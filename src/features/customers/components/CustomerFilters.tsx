import React from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { CustomerFiltersProps } from './types';

// Components for the filter bar
const FilterSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { label: string; value: string }[]; 
  placeholder: string;
  icon?: React.ElementType;
}) => (
  <div className="relative group">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-[#09090b]/40 border border-white/10 text-zinc-300 text-sm rounded-full pl-4 pr-10 py-2 focus:ring-1 focus:ring-[#f9cb15]/50 focus:border-[#f9cb15]/50 cursor-pointer hover:border-white/20 hover:bg-[#09090b]/60 transition-all outline-none"
    >
      <option value="" className="bg-[#09090b]">{placeholder}: Todos</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#09090b]">
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 pointer-events-none group-hover:text-zinc-400 transition-colors" />
  </div>
);

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  segmentFilter,
  onSegmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  lastPurchaseFilter,
  onLastPurchaseFilterChange,
  birthdayFilter,
  onBirthdayFilterChange,
  uniqueSegments,
  isOpen, 
  onToggle,
}) => {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 backdrop-blur-sm">
      <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96 group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 group-focus-within:text-[#f9cb15] transition-colors">
            <Search className="w-5 h-5" />
          </span>
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#09090b]/40 border border-white/10 text-white rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#f9cb15]/50 focus:border-[#f9cb15]/50 placeholder-zinc-600 transition-all outline-none hover:bg-[#09090b]/60"
            placeholder="Buscar por nome, email ou telefone..."
            type="text"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {/* Status Filter */}
            <FilterSelect
                value={statusFilter}
                onChange={onStatusFilterChange}
                placeholder="Status"
                options={[
                    { label: 'Ativo', value: 'Ativo' },
                    { label: 'Inativo', value: 'Inativo' },
                    { label: 'VIP', value: 'VIP' },
                    { label: 'Novo', value: 'Novo' },
                    { label: 'Recorrente', value: 'Recorrente' },
                    { label: 'Churn', value: 'Churn' }
                ]}
            />

            {/* Segment Filter */}
            <FilterSelect
                value={segmentFilter === 'all' ? '' : segmentFilter}
                onChange={(val) => onSegmentFilterChange(val || 'all')}
                placeholder="Segmento"
                options={uniqueSegments.map(s => ({ label: s, value: s }))}
            />

            {/* Birthday Filter */}
            <FilterSelect
                value={birthdayFilter}
                onChange={onBirthdayFilterChange}
                placeholder="Aniversariantes"
                options={[
                    { label: 'Hoje 🎉', value: 'today' },
                    { label: 'Próximos 7 dias 🎂', value: 'week' },
                    { label: 'Próximos 30 dias 🎈', value: 'month' },
                    { label: 'Próximos 90 dias', value: 'quarter' }
                ]}
            />

            {/* Last Purchase Filter */}
            <FilterSelect
                 value={lastPurchaseFilter}
                 onChange={onLastPurchaseFilterChange}
                 placeholder="Última Compra"
                 options={[
                     { label: 'Últimos 7 dias', value: '7days' },
                     { label: 'Últimos 30 dias', value: '30days' },
                     { label: 'Últimos 90 dias', value: '90days' },
                     { label: 'Últimos 180 dias', value: '180days' },
                     { label: 'Mais de 180 dias', value: 'over180' }
                 ]}
            />
        </div>
      </div>
    </div>
  );
};