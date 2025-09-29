/**
 * SalesTableUnified.tsx - Exemplo de tabela de vendas usando DataTable
 *
 * @description
 * Demonstração de como uma tabela simples de vendas pode usar o DataTable
 * unificado para obter funcionalidades avançadas instantaneamente.
 *
 * @features
 * - DataTable com glass morphism
 * - Filtros por status e período
 * - Search integrado
 * - Sorting automático
 * - Formatação de valores monetários
 * - Status badges coloridos
 * - Virtualization automática para 925+ registros
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
import { CurrencyDisplay } from '@/shared/ui/composite/FormatDisplay';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Download,
  Filter
} from 'lucide-react';
import { cn } from '@/core/config/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Sale {
  id: number;
  cliente_nome: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  payment_method: string;
  created_at: string;
  delivery_date?: string | null;
  items_count?: number;
}

interface SalesFilters {
  status: string;
  payment_method: string;
  period: string;
}

interface SalesTableUnifiedProps {
  className?: string;
  limit?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'out_for_delivery', label: 'Saiu para Entrega' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelada' }
];

const PAYMENT_OPTIONS = [
  { value: '', label: 'Todos os métodos' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'fiado', label: 'Fiado' }
];

const PERIOD_OPTIONS = [
  { value: '', label: 'Todo o período' },
  { value: '1', label: 'Hoje' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' }
];

// ============================================================================
// COMPONENT
// ============================================================================

export const SalesTableUnified: React.FC<SalesTableUnifiedProps> = ({
  className,
  limit = 50
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SalesFilters>({
    status: '',
    payment_method: '',
    period: ''
  });

  const itemsPerPage = 20;

  // Data fetching
  const { data: rawData = [], isLoading, error } = useQuery({
    queryKey: ['sales-table', filters, limit],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          id,
          cliente_nome,
          status,
          total,
          payment_method,
          created_at,
          delivery_date,
          sale_items(count)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.payment_method) {
        query = query.eq('payment_method', filters.payment_method);
      }

      if (filters.period) {
        const periodDays = parseInt(filters.period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as any[]).map(sale => ({
        ...sale,
        items_count: sale.sale_items?.[0]?.count || 0
      })) as Sale[];
    }
  });

  // Filter and search data
  const filteredData = useMemo(() => {
    return rawData.filter(sale =>
      searchTerm === '' ||
      sale.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toString().includes(searchTerm) ||
      sale.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rawData, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof Sale];
      const bVal = b[sortKey as keyof Sale];

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

  const columns: TableColumn<Sale>[] = [
    {
      key: 'id',
      title: 'Venda #',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className="font-mono font-medium text-accent-gold">
          #{value}
        </span>
      )
    },
    {
      key: 'cliente_nome',
      title: 'Cliente',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-100">{value as string}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '140px',
      render: (value) => {
        const status = value as string;
        const getStatusConfig = () => {
          switch (status) {
            case 'pending': return { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock };
            case 'confirmed': return { label: 'Confirmada', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle };
            case 'preparing': return { label: 'Preparando', color: 'bg-orange-500/20 text-orange-400', icon: ShoppingBag };
            case 'out_for_delivery': return { label: 'Saiu p/ Entrega', color: 'bg-purple-500/20 text-purple-400', icon: Truck };
            case 'delivered': return { label: 'Entregue', color: 'bg-green-500/20 text-green-400', icon: CheckCircle };
            case 'cancelled': return { label: 'Cancelada', color: 'bg-red-500/20 text-red-400', icon: XCircle };
            default: return { label: status, color: 'bg-gray-500/20 text-gray-400', icon: Clock };
          }
        };

        const config = getStatusConfig();
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
      key: 'total',
      title: 'Valor Total',
      sortable: true,
      width: '120px',
      align: 'right',
      render: (value) => (
        <CurrencyDisplay
          value={value as number}
          className="font-mono text-green-400"
        />
      )
    },
    {
      key: 'payment_method',
      title: 'Pagamento',
      sortable: true,
      width: '120px',
      render: (value) => {
        const method = value as string;
        const getMethodLabel = () => {
          switch (method) {
            case 'pix': return 'PIX';
            case 'cartao_credito': return 'Cartão Créd.';
            case 'cartao_debito': return 'Cartão Déb.';
            case 'dinheiro': return 'Dinheiro';
            case 'fiado': return 'Fiado';
            default: return method;
          }
        };

        return (
          <span className="text-gray-300 text-sm">{getMethodLabel()}</span>
        );
      }
    },
    {
      key: 'items_count',
      title: 'Itens',
      sortable: true,
      width: '80px',
      align: 'center',
      render: (value) => (
        <span className="text-gray-300 font-mono">{value}</span>
      )
    },
    {
      key: 'created_at',
      title: 'Data/Hora',
      sortable: true,
      width: '160px',
      render: (value) => (
        <span className="text-gray-300 text-sm font-mono">
          {format(new Date(value as string), "dd/MM/yy HH:mm", { locale: ptBR })}
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
          Status da Venda
        </label>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Método de Pagamento
        </label>
        <Select
          value={filters.payment_method}
          onValueChange={(value) => setFilters(prev => ({ ...prev, payment_method: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os métodos" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_OPTIONS.map(payment => (
              <SelectItem key={payment.value} value={payment.value}>
                {payment.label}
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
    </div>
  );

  // Statistics
  const statistics = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = filteredData.length;
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    return { totalRevenue, totalSales, averageTicket };
  }, [filteredData]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Vendas Recentes</h2>
          <div className="flex items-center gap-6 mt-2">
            <div className="text-sm text-gray-400">
              <span className="text-green-400 font-medium">
                <CurrencyDisplay value={statistics.totalRevenue} />
              </span>{' '}
              em {statistics.totalSales} vendas
            </div>
            <div className="text-sm text-gray-400">
              Ticket médio:{' '}
              <span className="text-blue-400 font-medium">
                <CurrencyDisplay value={statistics.averageTicket} />
              </span>
            </div>
          </div>
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

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* DataTable Unified Component */}
      <DataTable<Sale>
        data={paginatedData}
        columns={columns}
        loading={isLoading}
        error={error}

        // Glass morphism & theme
        variant="default"
        glassEffect={true}
        virtualization={true}
        virtualizationThreshold={100}

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
        searchPlaceholder="Buscar por cliente, venda # ou método de pagamento..."
        filters={filtersComponent}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}

        // Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}

        // Row actions
        onRowClick={(sale) => {
          // Navigate to sale detail or open modal
          console.log('Clicked sale:', sale.id);
        }}

        // Empty state
        emptyStateProps={{
          title: "Nenhuma venda encontrada",
          description: "Não há vendas que correspondam aos filtros aplicados",
          icon: ShoppingBag
        }}
      />
    </div>
  );
};

export default SalesTableUnified;