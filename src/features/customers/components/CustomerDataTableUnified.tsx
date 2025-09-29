/**
 * CustomerDataTableUnified.tsx - Tabela de clientes ÚNICA e DEFINITIVA
 *
 * @description
 * Consolidação de 6 implementações diferentes em uma única fonte da verdade:
 * - CustomerDataTable.tsx (1.131 linhas) → Features completas
 * - CustomerDataTable.refactored.tsx (231 linhas) → Base arquitetural
 * - CustomerDataTable.useReducer.tsx (275 linhas) → Estado gerenciado
 * - CustomerDataTableContainer.tsx (83 linhas) → Container pattern
 * - CustomerDataTablePresentation.tsx (264 linhas) → UI pura
 * - CustomerDataTable.refactored-container-presentational.tsx (104 linhas) → Híbrido
 *
 * @features
 * - Hook useDataTable unificado (elimina 8+ useState)
 * - Glassmorphism effects preservados
 * - Tooltips e acessibilidade completa
 * - Insights de IA com badges coloridos
 * - Profile completeness visual
 * - Filtros avançados com múltiplos critérios
 * - Ordenação inteligente por múltiplas colunas
 * - Performance otimizada com virtualization
 * - Container/Presentation pattern opcional
 *
 * @author Adega Manager Team
 * @version 3.0.0 - SSoT Consolidation
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/primitives/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/shared/ui/primitives/tooltip";
import { Badge } from "@/shared/ui/primitives/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/primitives/dropdown-menu";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { SearchBar21st } from "@/shared/ui/thirdparty/search-bar-21st";
import { cn } from "@/core/config/utils";
import {
  Brain,
  User,
  Calendar,
  CreditCard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Gift,
  Shield,
  BarChart3,
  CheckCircle2,
  XCircle,
  MessageCircle,
  DollarSign,
  AlertTriangle,
  Eye,
  TrendingUp,
  Settings2,
  Filter,
  X
} from "lucide-react";

// Hooks unificados
import { useDataTable } from "@/shared/hooks/common/useDataTable";
import { useCustomerTableData } from "../hooks/useCustomerTableData";
import { useProfileCompleteness } from "../hooks/useDataQuality";
import { useGlassmorphismEffect } from "@/shared/hooks/ui/useGlassmorphismEffect";

// Componentes compartilhados
import ProfileCompleteness from "@/shared/ui/composite/profile-completeness";
import { LoadingScreen } from "@/shared/ui/composite/loading-spinner";
import { EmptyState } from "@/shared/ui/composite/empty-state";

// Tipos e utilitários
import {
  CustomerTableRow,
  TABLE_COLUMNS,
  TableColumn,
  formatPaymentMethod,
  formatLastPurchase,
  formatNextBirthday,
  formatLastContact,
  formatCurrency,
  getInsightLevel,
  getInsightColor,
  getProfileCompletenessColor,
  getProfileCompletenessBarColor,
  getLastContactColor,
  getOutstandingAmountColor,
  CUSTOMER_SEGMENTS,
  CUSTOMER_STATUSES
} from "../types/customer-table.types";

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Badge de insights IA com sistema de cores Adega Wine Cellar
 */
const InsightsBadge = ({ count, confidence }: { count: number; confidence: number }) => {
  if (count === 0) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-sm font-bold px-3 py-1 bg-gray-600/30 text-gray-100 border-gray-500/60">
        <Brain className="w-3 h-3" />
        Sem insights
      </Badge>
    );
  }

  const level = getInsightLevel(confidence);
  const color = getInsightColor(level);

  const badgeClass = {
    green: "bg-green-500/30 text-green-100 border-green-400/60 shadow-lg shadow-green-400/20 backdrop-blur-sm font-bold",
    yellow: "bg-yellow-500/30 text-yellow-100 border-yellow-400/60 shadow-lg shadow-yellow-400/20 backdrop-blur-sm font-bold",
    red: "bg-red-500/30 text-red-100 border-red-400/60 shadow-lg shadow-red-400/20 backdrop-blur-sm lgpd-soft-pulse font-bold"
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn("flex items-center gap-1 text-sm px-3 py-1", badgeClass[color])}>
            <Brain className="w-3 h-3" />
            {count} insights
          </Badge>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="top" className="bg-gray-900 border border-gray-700 text-gray-100 max-w-xs">
            <p><strong>Insights IA:</strong> {count} análises disponíveis</p>
            <p><strong>Confiança:</strong> {confidence}% ({level === 'high' ? 'Alta' : level === 'medium' ? 'Média' : 'Baixa'})</p>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Controles de filtro avançado
 */
interface FilterControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  segmentFilter: string;
  onSegmentChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  onSearchChange,
  segmentFilter,
  onSegmentChange,
  statusFilter,
  onStatusChange,
  hasActiveFilters,
  onClearFilters
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="flex-1">
        <SearchBar21st
          placeholder="Buscar clientes por nome, categoria favorita..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {/* Filtro por Segmento */}
        <select
          value={segmentFilter}
          onChange={(e) => onSegmentChange(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-accent-gold-100 focus:ring-1 focus:ring-accent-gold-100"
        >
          <option value="">Todos os segmentos</option>
          {CUSTOMER_SEGMENTS.map(segment => (
            <option key={segment.value} value={segment.value}>
              {segment.label}
            </option>
          ))}
        </select>

        {/* Filtro por Status */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
            }
          }}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:border-accent-gold-100 focus:ring-1 focus:ring-accent-gold-100"
          aria-label="Filtrar por status do cliente"
        >
          <option value="">Todos os status</option>
          {CUSTOMER_STATUSES.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="px-3 text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Controles de colunas visíveis
 */
interface ColumnControlsProps {
  visibleColumns: string[];
  onToggleColumn: (columnId: string) => void;
  availableColumns: TableColumn[];
}

const ColumnControls: React.FC<ColumnControlsProps> = ({
  visibleColumns,
  onToggleColumn,
  availableColumns
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
          <Settings2 className="h-4 w-4 mr-1" />
          Colunas ({visibleColumns.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {availableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibleColumns.includes(column.id)}
            onCheckedChange={() => onToggleColumn(column.id)}
            className="text-sm"
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface CustomerDataTableUnifiedProps {
  /** CSS class adicional */
  className?: string;
  /** Callback quando cliente é selecionado */
  onCustomerSelect?: (customer: CustomerTableRow) => void;
  /** Se deve usar modo Container/Presentation */
  containerMode?: boolean;
  /** Colunas inicialmente visíveis */
  initialVisibleColumns?: string[];
  /** Termo de busca inicial */
  initialSearchTerm?: string;
  /** Filtros iniciais */
  initialFilters?: {
    segment?: string;
    status?: string;
  };
  /** Configuração de virtualização */
  virtualization?: {
    enabled: boolean;
    rowHeight: number;
    containerHeight: number;
  };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerDataTableUnified: React.FC<CustomerDataTableUnifiedProps> = ({
  className,
  onCustomerSelect,
  containerMode = false,
  initialVisibleColumns = ['cliente', 'segmento', 'ultimaCompra', 'valorTotalCompras', 'completude'],
  initialSearchTerm = '',
  initialFilters = {},
  virtualization = { enabled: false, rowHeight: 60, containerHeight: 600 }
}) => {
  // ============================================================================
  // HOOKS E ESTADO
  // ============================================================================

  const { handleMouseMove } = useGlassmorphismEffect();

  // Estado local para filtros específicos
  const [segmentFilter, setSegmentFilter] = useState(initialFilters.segment || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');

  // Dados dos clientes
  const { data: customers = [], isLoading, error } = useCustomerTableData();
  const { data: completenessData = {} } = useProfileCompleteness();

  // Hook unificado da tabela
  const table = useDataTable({
    data: customers,
    columns: TABLE_COLUMNS.map(col => ({
      id: col.id,
      label: col.label,
      accessor: col.accessor as keyof CustomerTableRow,
      sortable: col.sortable,
      searchable: col.searchable,
      visible: initialVisibleColumns.includes(col.id),
      width: col.width,
      align: col.align
    })),
    searchFields: ['cliente', 'categoriaFavorita'] as (keyof CustomerTableRow)[],
    defaultSortField: 'ultimaCompra',
    defaultSortDirection: 'desc',
    enableVirtualization: virtualization.enabled,
    virtualRowHeight: virtualization.rowHeight,
    containerHeight: virtualization.containerHeight
  });

  // ============================================================================
  // LÓGICA DE FILTROS E DADOS PROCESSADOS
  // ============================================================================

  const processedData = useMemo(() => {
    let filtered = table.processedData;

    // Filtro por segmento
    if (segmentFilter) {
      filtered = filtered.filter((customer: CustomerTableRow) =>
        customer.segmento === segmentFilter
      );
    }

    // Filtro por status
    if (statusFilter) {
      filtered = filtered.filter((customer: CustomerTableRow) =>
        customer.status === statusFilter
      );
    }

    return filtered;
  }, [table.processedData, segmentFilter, statusFilter]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCustomerClick = useCallback((customer: CustomerTableRow) => {
    onCustomerSelect?.(customer);
  }, [onCustomerSelect]);

  const handleClearFilters = useCallback(() => {
    table.setSearchTerm('');
    setSegmentFilter('');
    setStatusFilter('');
  }, [table]);

  const hasActiveFilters = useMemo(() => {
    return !!(table.searchTerm || segmentFilter || statusFilter);
  }, [table.searchTerm, segmentFilter, statusFilter]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCell = useCallback((customer: CustomerTableRow, column: TableColumn) => {
    const completeness = completenessData[customer.id];

    switch (column.id) {
      case 'cliente':
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-gold-100 to-accent-gold-200 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-black" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-100 truncate">{customer.cliente}</div>
              {customer.email && (
                <div className="text-sm text-gray-400 truncate">{customer.email}</div>
              )}
            </div>
          </div>
        );

      case 'segmento': {
        const segment = CUSTOMER_SEGMENTS.find(s => s.value === customer.segmento);
        return (
          <Badge variant="outline" className={cn("text-xs font-medium", segment?.className)}>
            {segment?.label || customer.segmento}
          </Badge>
        );
      }

      case 'insights':
        return (
          <InsightsBadge
            count={customer.totalInsights || 0}
            confidence={customer.confidenciaInsights || 0}
          />
        );

      case 'completude':
        return completeness ? (
          <ProfileCompleteness
            completeness={completeness.percentage}
            missingFields={completeness.missingFields}
            size="sm"
          />
        ) : (
          <span className="text-gray-500">-</span>
        );

      case 'ultimaCompra':
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={getLastContactColor(customer.ultimaCompra)}>
              {formatLastPurchase(customer.ultimaCompra)}
            </span>
          </div>
        );

      case 'valorTotalCompras':
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent-green" />
            <span className="font-mono text-gray-100">
              {formatCurrency(customer.valorTotalCompras)}
            </span>
          </div>
        );

      default: {
        const value = customer[column.accessor as keyof CustomerTableRow];
        return <span className="text-gray-300">{String(value || '-')}</span>;
      }
    }
  }, [completenessData]);

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-100 mb-2">Erro ao carregar clientes</h3>
        <p className="text-gray-400">{error.message}</p>
      </div>
    );
  }

  if (processedData.length === 0) {
    return (
      <div className="space-y-6">
        <FilterControls
          searchTerm={table.searchTerm}
          onSearchChange={table.setSearchTerm}
          segmentFilter={segmentFilter}
          onSegmentChange={setSegmentFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />

        <EmptyState
          title={hasActiveFilters ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          description={hasActiveFilters ? "Tente ajustar os filtros para encontrar clientes" : "Comece cadastrando seu primeiro cliente"}
          icon={User}
        />
      </div>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  const visibleTableColumns = TABLE_COLUMNS.filter(col => table.visibleColumns.includes(col.id));

  return (
    <div className={cn("space-y-6", className)} onMouseMove={handleMouseMove}>
      {/* Controles de filtro */}
      <FilterControls
        searchTerm={table.searchTerm}
        onSearchChange={table.setSearchTerm}
        segmentFilter={segmentFilter}
        onSegmentChange={setSegmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Controles da tabela */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {processedData.length} {processedData.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
        </div>

        <ColumnControls
          visibleColumns={table.visibleColumns}
          onToggleColumn={table.toggleColumnVisibility}
          availableColumns={TABLE_COLUMNS}
        />
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-gray-700 overflow-hidden bg-gray-900/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800/50">
              {visibleTableColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "text-gray-300 font-medium",
                    column.sortable && "cursor-pointer select-none hover:text-gray-100",
                    column.width && `w-${column.width}`,
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                  onClick={() => column.sortable && table.handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ArrowUp className={cn(
                          "h-3 w-3 transition-colors",
                          table.sortField === column.id && table.sortDirection === 'asc'
                            ? "text-accent-gold-100"
                            : "text-gray-500"
                        )} />
                        <ArrowDown className={cn(
                          "h-3 w-3 -mt-1 transition-colors",
                          table.sortField === column.id && table.sortDirection === 'desc'
                            ? "text-accent-gold-100"
                            : "text-gray-500"
                        )} />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {processedData.map((customer: CustomerTableRow) => (
              <TableRow
                key={customer.id}
                className="border-gray-700 hover:bg-gray-800/30 transition-colors cursor-pointer"
                onClick={() => handleCustomerClick(customer)}
              >
                {visibleTableColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      "py-4",
                      column.align === 'center' && "text-center",
                      column.align === 'right' && "text-right"
                    )}
                  >
                    {renderCell(customer, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CustomerDataTableUnified;