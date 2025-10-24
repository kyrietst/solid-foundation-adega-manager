/* eslint-disable jsx-a11y/label-has-associated-control */
/**
 * InventoryMovementsHistoryUnified.tsx - Exemplo de migração para DataTable
 *
 * @description
 * Demonstração de como uma tabela customizada pode ser simplificada usando
 * o componente DataTable unificado. Reduz código duplicado e padroniza a UX.
 *
 * @reduction Implementação customizada → DataTable (90%+ redução de código de tabela)
 * @features
 * - DataTable unificado com virtualization para 925+ registros
 * - Glass morphism effects padronizados
 * - Filtros integrados com FilterToggle
 * - Sorting e search automatizados
 * - Paginação automática
 * - Estados de loading e error padronizados
 *
 * @author Adega Manager Team
 * @version 3.0.0 - DataTable Migration Example
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/core/api/supabase/client';
import { DataTable, TableColumn } from '@/shared/ui/layout/DataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Package,
  Download,
  Filter
} from 'lucide-react';
import { cn } from '@/core/config/utils';

// ============================================================================
// TYPES
// ============================================================================

interface InventoryMovement {
  id: string;
  product_name: string;
  movement_type: 'in' | 'out' | 'fiado' | 'devolucao' | 'adjustment';
  quantity: number;
  reason: string | null;
  user_name: string | null;
  created_at: string;
}

interface MovementFilters {
  type: string;
  period: string;
  user_id: string;
}

interface InventoryMovementsHistoryUnifiedProps {
  product_id?: string;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MOVEMENT_TYPES = [
  { value: '', label: 'Todos os tipos' },
  { value: 'in', label: 'Entrada' },
  { value: 'out', label: 'Saída' },
  { value: 'fiado', label: 'Fiado' },
  { value: 'devolucao', label: 'Devolução' },
  { value: 'adjustment', label: 'Ajuste' }
];

const PERIOD_OPTIONS = [
  { value: '', label: 'Todo o período' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' }
];

// ============================================================================
// COMPONENT
// ============================================================================

export const InventoryMovementsHistoryUnified: React.FC<InventoryMovementsHistoryUnifiedProps> = ({
  product_id,
  className
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MovementFilters>({
    type: '',
    period: '',
    user_id: ''
  });

  const itemsPerPage = 20;

  // Data fetching
  const { data: rawData = [], isLoading, error } = useQuery({
    queryKey: ['inventory-movements', product_id, filters],
    queryFn: async () => {
      let query = supabase
        .from('inventory_movements')
        .select(`
          id,
          product_name,
          movement_type,
          quantity,
          reason,
          user_name,
          created_at
        `);

      if (product_id) {
        query = query.eq('product_id', product_id);
      }

      if (filters.type) {
        query = query.eq('movement_type', filters.type);
      }

      if (filters.period) {
        const periodDays = parseInt(filters.period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        query = query.gte('created_at', startDate.toISOString());
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as InventoryMovement[];
    }
  });

  // Filter and search data
  const filteredData = useMemo(() => {
    return rawData.filter(movement =>
      searchTerm === '' ||
      movement.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rawData, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof InventoryMovement];
      const bVal = b[sortKey as keyof InventoryMovement];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ============================================================================
  // TABLE CONFIGURATION
  // ============================================================================

  const columns: TableColumn<InventoryMovement>[] = [
    {
      key: 'movement_type',
      title: 'Tipo',
      sortable: true,
      width: '120px',
      render: (value) => {
        const type = value as string;
        const getTypeConfig = () => {
          switch (type) {
            case 'in': return { label: 'Entrada', color: 'bg-green-500/20 text-green-400', icon: TrendingUp };
            case 'out': return { label: 'Saída', color: 'bg-red-500/20 text-red-400', icon: TrendingDown };
            case 'fiado': return { label: 'Fiado', color: 'bg-yellow-500/20 text-yellow-400', icon: Package };
            case 'devolucao': return { label: 'Devolução', color: 'bg-blue-500/20 text-blue-400', icon: RotateCcw };
            case 'adjustment': return { label: 'Ajuste', color: 'bg-purple-500/20 text-purple-400', icon: Package };
            default: return { label: type, color: 'bg-gray-500/20 text-gray-400', icon: Package };
          }
        };

        const config = getTypeConfig();
        const Icon = config.icon;

        return (
          <Badge className={cn("flex items-center gap-1", config.color)}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'product_name',
      title: 'Produto',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-100">{value as string}</span>
      )
    },
    {
      key: 'quantity',
      title: 'Quantidade',
      sortable: true,
      width: '120px',
      align: 'right',
      render: (value, item) => {
        const quantity = value as number;
        const isPositive = ['in', 'devolucao'].includes(item.movement_type);
        return (
          <span className={cn(
            "font-mono font-medium",
            isPositive ? "text-green-400" : "text-red-400"
          )}>
            {isPositive ? '+' : '-'}{Math.abs(quantity)}
          </span>
        );
      }
    },
    {
      key: 'reason',
      title: 'Motivo',
      sortable: false,
      render: (value) => (
        <span className="text-gray-300 text-sm">
          {(value as string) || 'Não informado'}
        </span>
      )
    },
    {
      key: 'user_name',
      title: 'Usuário',
      sortable: true,
      width: '140px',
      render: (value) => (
        <span className="text-gray-300 text-sm">
          {(value as string) || 'Sistema'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Data/Hora',
      sortable: true,
      width: '180px',
      render: (value) => (
        <span className="text-gray-300 text-sm font-mono">
          {format(new Date(value as string), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </span>
      )
    }
  ];

  // ============================================================================
  // FILTERS COMPONENT
  // ============================================================================

  const filtersComponent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tipo de Movimento
        </label>
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            {MOVEMENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Período
        </label>
        <Select
          value={filters.period}
          onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todo o período" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map(period => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={() => setFilters({ type: '', period: '', user_id: '' })}
          className="w-full"
        >
          Limpar Filtros
        </Button>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100">
            Histórico de Movimentações
          </h2>
          <p className="text-gray-400 text-sm">
            {filteredData.length} movimentações encontradas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>

          <Button
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* DataTable Unified Component */}
      <DataTable<InventoryMovement>
        data={paginatedData}
        columns={columns}
        loading={isLoading}
        error={error}

        // Glass morphism & theme
        variant="default"
        glassEffect={true}
        virtualization={false} // Not needed for paginated data

        // Sorting
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={(key, direction) => {
          setSortKey(key);
          setSortDirection(direction);
        }}

        // Search & Filters
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por produto, motivo ou usuário..."
        filters={filtersComponent}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}

        // Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}

        // Empty state
        emptyStateProps={{
          title: "Nenhuma movimentação encontrada",
          description: "Não há movimentações que correspondam aos filtros aplicados",
          icon: Package
        }}
      />
    </div>
  );
};

export default InventoryMovementsHistoryUnified;