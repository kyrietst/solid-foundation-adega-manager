/**
 * CustomerDataTable.tsx - Tabela de clientes refatorada
 * Context7 Pattern: Container/Presentation pattern aplicado
 * Bulletproof React: Componentes menores e responsabilidades específicas
 *
 * REFATORAÇÃO APLICADA:
 * - Dividido em 4 subcomponentes especializados
 * - Separação clara de responsabilidades
 * - Hook glassmorphism aplicado
 * - Estado isolado para melhor performance
 * - Reutilização de componentes
 */

"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/core/config/utils";
import { useCustomerTableData } from "../hooks/useCustomerTableData";
import { useGlassmorphismEffect } from "@/shared/hooks/ui/useGlassmorphismEffect";

// Componentes refatorados
import { CustomerTableFilters } from "./table-sections/CustomerTableFilters";
import { CustomerTableColumns } from "./table-sections/CustomerTableColumns";
import { CustomerTableBody } from "./table-sections/CustomerTableBody";

// Tipos e utilitários
import {
  CustomerTableRow,
  TableColumn,
  SortField,
  SortDirection,
  FilterConfig,
  TABLE_COLUMNS,
} from "./utils/table-types";

export default function CustomerDataTable() {
  const { handleMouseMove } = useGlassmorphismEffect();

  // Estado da tabela - Context7 pattern: estado isolado
  const [visibleColumns, setVisibleColumns] = useState<TableColumn[]>([...TABLE_COLUMNS]);
  const [sortField, setSortField] = useState<SortField>('ultimaCompra');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Estado dos filtros - Context7 pattern: estado específico
  const [filters, setFilters] = useState<FilterConfig>({
    searchTerm: "",
    segmentFilter: "",
    statusFilter: "",
    lastPurchaseFilter: "",
    birthdayFilter: "",
  });

  // Dados da tabela
  const { data: customers = [], isLoading, error } = useCustomerTableData();

  // Lógica de filtros e ordenação - Context7 pattern: lógica pura
  const filteredAndSortedData = useMemo(() => {
    let filtered = customers.filter((customer) => {
      const matchesSegment = !filters.segmentFilter || customer.segmento === filters.segmentFilter;
      const matchesStatus = !filters.statusFilter || customer.status === filters.statusFilter;
      const matchesSearch = !filters.searchTerm ||
        customer.cliente.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        customer.categoriaFavorita?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Filtro por última compra
      const matchesLastPurchase = (() => {
        if (!filters.lastPurchaseFilter || !customer.ultimaCompra) return true;
        const daysSinceLastPurchase = Math.floor(
          (new Date().getTime() - customer.ultimaCompra.getTime()) / (1000 * 60 * 60 * 24)
        );
        const filterDays = parseInt(filters.lastPurchaseFilter);
        return daysSinceLastPurchase <= filterDays;
      })();

      // Filtro por aniversário
      const matchesBirthday = (() => {
        if (!filters.birthdayFilter || customer.diasParaAniversario === undefined) return true;
        const filterDays = parseInt(filters.birthdayFilter);
        return customer.diasParaAniversario <= filterDays;
      })();

      return matchesSegment && matchesStatus && matchesSearch && matchesLastPurchase && matchesBirthday;
    });

    // Ordenação
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField as keyof CustomerTableRow];
        let bValue: any = b[sortField as keyof CustomerTableRow];

        // Tratamento especial para datas
        if (sortField === 'ultimaCompra') {
          aValue = aValue ? aValue.getTime() : 0;
          bValue = bValue ? bValue.getTime() : 0;
        }

        // Tratamento para valores nulos/undefined
        if (aValue === null || aValue === undefined) aValue = 0;
        if (bValue === null || bValue === undefined) bValue = 0;

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [customers, filters, sortField, sortDirection]);

  // Handlers - Context7 pattern: funções específicas
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const updateFilter = (key: keyof FilterConfig, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handlers para filtros específicos
  const handleSearchChange = (value: string) => updateFilter('searchTerm', value);
  const handleSegmentFilterChange = (value: string) => updateFilter('segmentFilter', value);
  const handleStatusFilterChange = (value: string) => updateFilter('statusFilter', value);
  const handleLastPurchaseFilterChange = (value: string) => updateFilter('lastPurchaseFilter', value);
  const handleBirthdayFilterChange = (value: string) => updateFilter('birthdayFilter', value);

  // Tratamento de erro
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <h3 className="text-red-400 font-medium">Erro ao carregar clientes</h3>
            <p className="text-red-300 text-sm mt-1">
              Não foi possível carregar os dados dos clientes. Tente recarregar a página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div
        className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300"
        onMouseMove={handleMouseMove}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Clientes</h2>
            <p className="text-gray-400 mt-1">
              {filteredAndSortedData.length} de {customers.length} clientes
              {filters.searchTerm && ` • Busca: "${filters.searchTerm}"`}
            </p>
          </div>

          {/* Configuração de colunas */}
          <CustomerTableColumns
            availableColumns={TABLE_COLUMNS}
            visibleColumns={visibleColumns}
            onVisibilityChange={setVisibleColumns}
          />
        </div>
      </div>

      {/* Filtros */}
      <div
        className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300"
        onMouseMove={handleMouseMove}
      >
        <CustomerTableFilters
          searchTerm={filters.searchTerm}
          onSearchChange={handleSearchChange}
          segmentFilter={filters.segmentFilter}
          onSegmentFilterChange={handleSegmentFilterChange}
          statusFilter={filters.statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          lastPurchaseFilter={filters.lastPurchaseFilter}
          onLastPurchaseFilterChange={handleLastPurchaseFilterChange}
          birthdayFilter={filters.birthdayFilter}
          onBirthdayFilterChange={handleBirthdayFilterChange}
        />
      </div>

      {/* Tabela de dados */}
      <CustomerTableBody
        data={filteredAndSortedData}
        visibleColumns={visibleColumns}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        isLoading={isLoading}
      />

      {/* Rodapé com informações */}
      {filteredAndSortedData.length > 0 && (
        <div
          className="bg-gray-800/20 rounded-lg p-4 border border-gray-700/30 hover:shadow-lg hover:shadow-gray-500/10 transition-all duration-300"
          onMouseMove={handleMouseMove}
        >
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span>📊 {filteredAndSortedData.length} resultados</span>
              <span>🔍 {Object.values(filters).filter(Boolean).length} filtros ativos</span>
              <span>👁️ {visibleColumns.length} colunas visíveis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">
                Ordenado por: {sortField ? TABLE_COLUMNS.find(col => col.key === sortField)?.label : 'Nenhum'}
                {sortField && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}