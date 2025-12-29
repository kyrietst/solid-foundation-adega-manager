/**
 * Componente de filtros avançados para fornecedores
 */

import React from 'react';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Switch } from '@/shared/ui/primitives/switch';
import { Button } from '@/shared/ui/primitives/button';
import { X } from 'lucide-react';
import { cn } from '@/core/config/utils';
import type { SupplierFilters as ISupplierFilters } from '../types';
import { PAYMENT_METHODS_OPTIONS } from '../types';

interface SupplierFiltersProps {
  filters: ISupplierFilters;
  onFiltersChange: (filters: ISupplierFilters) => void;
  className?: string;
}

export const SupplierFilters: React.FC<SupplierFiltersProps> = ({
  filters,
  onFiltersChange,
  className,
}) => {
  const updateFilter = (key: keyof ISupplierFilters, value: ISupplierFilters[keyof ISupplierFilters]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Filtros Avançados</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por categoria de produto */}
        <div className="space-y-2">
          <Label className="text-gray-300">Categoria de Produto</Label>
          <Input
            placeholder="Ex: Cerveja, Vinho..."
            value={filters.products_supplied || ''}
            onChange={(e) => updateFilter('products_supplied', e.target.value || undefined)}
            className="bg-black/50 border-white/30 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Filtro por forma de pagamento */}
        <div className="space-y-2">
          <Label className="text-gray-300">Forma de Pagamento</Label>
          <Select
            value={filters.payment_method || ''}
            onValueChange={(value) => updateFilter('payment_method', value || undefined)}
          >
            <SelectTrigger className="bg-black/50 border-white/30 text-white">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
              <SelectItem value="" className="text-white hover:bg-white/10">
                Todos
              </SelectItem>
              {PAYMENT_METHODS_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-white hover:bg-white/10"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por valor mínimo de pedido */}
        <div className="space-y-2">
          <Label className="text-gray-300">Valor Mín. Pedido (até R$)</Label>
          <Input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={filters.min_order_value || ''}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : undefined;
              updateFilter('min_order_value', value);
            }}
            className="bg-black/50 border-white/30 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Filtro por status ativo */}
        <div className="space-y-2">
          <Label className="text-gray-300">Status</Label>
          <div className="flex items-center space-x-2 py-2">
            <Switch
              checked={filters.is_active !== false}
              onCheckedChange={(checked) =>
                updateFilter('is_active', checked ? undefined : false)
              }
              className="data-[state=checked]:bg-primary-yellow"
            />
            <span className="text-sm text-gray-300">
              {filters.is_active === false ? 'Apenas inativos' : 'Incluir ativos'}
            </span>
          </div>
        </div>
      </div>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
          {filters.products_supplied && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
              Produto: {filters.products_supplied}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-blue-500/30"
                onClick={() => updateFilter('products_supplied', undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {filters.payment_method && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
              Pagamento: {PAYMENT_METHODS_OPTIONS.find(p => p.value === filters.payment_method)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-green-500/30"
                onClick={() => updateFilter('payment_method', undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {filters.min_order_value !== undefined && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm">
              Máx: R$ {filters.min_order_value.toFixed(2)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-yellow-500/30"
                onClick={() => updateFilter('min_order_value', undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {filters.is_active === false && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 rounded text-sm">
              Apenas inativos
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-red-500/30"
                onClick={() => updateFilter('is_active', undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};