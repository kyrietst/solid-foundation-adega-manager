/**
 * CustomerTableFilters.tsx - Seção de filtros da tabela de clientes
 * Context7 Pattern: Presentation Component para filtros
 * Separação de responsabilidades conforme Bulletproof React
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives/dropdown-menu';
import { Filter, Search, Calendar, MapPin, Shield } from 'lucide-react';

interface CustomerTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  segmentFilter: string;
  onSegmentFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  lastPurchaseFilter: string;
  onLastPurchaseFilterChange: (value: string) => void;
  birthdayFilter: string;
  onBirthdayFilterChange: (value: string) => void;
}

export const CustomerTableFilters: React.FC<CustomerTableFiltersProps> = ({
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
}) => {
  const segments = ['Alto Valor', 'Regular', 'Ocasional', 'Novo'];
  const statuses = ['Ativo', 'Inativo', 'Pendente'];
  const lastPurchaseOptions = [
    { value: '7', label: 'Últimos 7 dias' },
    { value: '30', label: 'Últimos 30 dias' },
    { value: '90', label: 'Últimos 90 dias' },
    { value: '180', label: 'Últimos 6 meses' },
  ];
  const birthdayOptions = [
    { value: '7', label: 'Próximos 7 dias' },
    { value: '30', label: 'Próximos 30 dias' },
    { value: '60', label: 'Próximos 2 meses' },
  ];

  return (
    <div className="space-y-4">
      {/* Busca Principal */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar21st
            placeholder="Buscar por nome ou categoria favorita..."
            value={searchTerm}
            onChange={onSearchChange}
            className="h-10"
          />
        </div>

        {/* Filtros Rápidos */}
        <div className="flex items-center gap-2">
          {/* Filtro por Segmento */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`border-gray-600 text-gray-300 hover:bg-gray-700 ${
                  segmentFilter ? 'bg-blue-600 text-white border-blue-500' : ''
                }`}
              >
                <Shield className="h-4 w-4 mr-2" />
                Segmento
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuCheckboxItem
                checked={!segmentFilter}
                onCheckedChange={() => onSegmentFilterChange('')}
                className="text-gray-300 hover:bg-gray-700"
              >
                Todos
              </DropdownMenuCheckboxItem>
              {segments.map((segment) => (
                <DropdownMenuCheckboxItem
                  key={segment}
                  checked={segmentFilter === segment}
                  onCheckedChange={() =>
                    onSegmentFilterChange(segmentFilter === segment ? '' : segment)
                  }
                  className="text-gray-300 hover:bg-gray-700"
                >
                  {segment}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`border-gray-600 text-gray-300 hover:bg-gray-700 ${
                  statusFilter ? 'bg-green-600 text-white border-green-500' : ''
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuCheckboxItem
                checked={!statusFilter}
                onCheckedChange={() => onStatusFilterChange('')}
                className="text-gray-300 hover:bg-gray-700"
              >
                Todos
              </DropdownMenuCheckboxItem>
              {statuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter === status}
                  onCheckedChange={() =>
                    onStatusFilterChange(statusFilter === status ? '' : status)
                  }
                  className="text-gray-300 hover:bg-gray-700"
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por Última Compra */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`border-gray-600 text-gray-300 hover:bg-gray-700 ${
                  lastPurchaseFilter ? 'bg-purple-600 text-white border-purple-500' : ''
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Compras
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuCheckboxItem
                checked={!lastPurchaseFilter}
                onCheckedChange={() => onLastPurchaseFilterChange('')}
                className="text-gray-300 hover:bg-gray-700"
              >
                Todas
              </DropdownMenuCheckboxItem>
              {lastPurchaseOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={lastPurchaseFilter === option.value}
                  onCheckedChange={() =>
                    onLastPurchaseFilterChange(
                      lastPurchaseFilter === option.value ? '' : option.value
                    )
                  }
                  className="text-gray-300 hover:bg-gray-700"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro por Aniversário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`border-gray-600 text-gray-300 hover:bg-gray-700 ${
                  birthdayFilter ? 'bg-pink-600 text-white border-pink-500' : ''
                }`}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Aniversários
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuCheckboxItem
                checked={!birthdayFilter}
                onCheckedChange={() => onBirthdayFilterChange('')}
                className="text-gray-300 hover:bg-gray-700"
              >
                Todos
              </DropdownMenuCheckboxItem>
              {birthdayOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={birthdayFilter === option.value}
                  onCheckedChange={() =>
                    onBirthdayFilterChange(
                      birthdayFilter === option.value ? '' : option.value
                    )
                  }
                  className="text-gray-300 hover:bg-gray-700"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Indicadores de Filtros Ativos */}
      {(segmentFilter || statusFilter || lastPurchaseFilter || birthdayFilter) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Filtros ativos:</span>

          {segmentFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSegmentFilterChange('')}
              className="h-6 px-2 text-xs bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
            >
              Segmento: {segmentFilter} ✕
            </Button>
          )}

          {statusFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusFilterChange('')}
              className="h-6 px-2 text-xs bg-green-600 text-white border-green-500 hover:bg-green-700"
            >
              Status: {statusFilter} ✕
            </Button>
          )}

          {lastPurchaseFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLastPurchaseFilterChange('')}
              className="h-6 px-2 text-xs bg-purple-600 text-white border-purple-500 hover:bg-purple-700"
            >
              Compras: {lastPurchaseOptions.find(o => o.value === lastPurchaseFilter)?.label} ✕
            </Button>
          )}

          {birthdayFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBirthdayFilterChange('')}
              className="h-6 px-2 text-xs bg-pink-600 text-white border-pink-500 hover:bg-pink-700"
            >
              Aniversários: {birthdayOptions.find(o => o.value === birthdayFilter)?.label} ✕
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerTableFilters;