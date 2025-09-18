/**
 * CustomerDataTable.tsx - Tabela de clientes com useReducer (REFATORADO)
 * Context7 Pattern: useState → useReducer migration aplicada
 * Elimina 8 useState identificados na análise para lógica complexa
 *
 * REFATORAÇÃO APLICADA:
 * - useReducer para estados interdependentes de tabela
 * - Actions tipadas para consistência
 * - Performance otimizada com dispatch memoizado
 * - Lógica centralizada no reducer
 * - -7 useState eliminados (8→1 useReducer)
 *
 * @version 2.0.0 - Migrado para useReducer (Context7)
 */

"use client";

import React, { useMemo } from "react";
import { cn } from "@/core/config/utils";
import { useCustomerTableData } from "../hooks/useCustomerTableData";
import { useGlassmorphismEffect } from "@/shared/hooks/ui/useGlassmorphismEffect";
import { useTableReducer } from "../hooks/useTableReducer";

// Componentes refatorados
import { CustomerTableFilters } from "./table-sections/CustomerTableFilters";
import { CustomerTableColumns } from "./table-sections/CustomerTableColumns";
import { CustomerTableBody } from "./table-sections/CustomerTableBody";

// Tipos e utilitários
import {
  CustomerTableRow,
  SortField,
  TABLE_COLUMNS,
} from "./utils/table-types";

export default function CustomerDataTable() {
  const { handleMouseMove } = useGlassmorphismEffect();

  // Hook useReducer consolidado (elimina 8 useState)
  const { state, actions, computed } = useTableReducer();

  // Destructuring para melhor legibilidade
  const {
    visibleColumns,
    sortField,
    sortDirection,
    filters,
  } = state;

  const {
    setVisibleColumns,
    toggleSort,
    setSearchTerm,
    setSegmentFilter,
    setStatusFilter,
    setLastPurchaseFilter,
    setBirthdayFilter,
    clearFilters,
    resetTable,
  } = actions;

  const {
    hasActiveFilters,
    activeFiltersCount,
    visibleColumnsCount,
  } = computed;

  // Dados da tabela
  const { data: customers = [], isLoading, error } = useCustomerTableData();

  // Lógica de filtros e ordenação otimizada com useMemo
  const filteredAndSortedData = useMemo(() => {
    const filtered = customers.filter((customer) => {
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
      {/* Header com estatísticas e controles */}
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

          <div className="flex items-center gap-3">
            {/* Botão de reset quando há filtros ativos */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1 rounded border border-gray-600 hover:border-gray-400"
              >
                Limpar Filtros ({activeFiltersCount})
              </button>
            )}

            {/* Botão de reset geral */}
            <button
              onClick={resetTable}
              className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1 rounded border border-gray-600 hover:border-gray-400"
            >
              Reset Tabela
            </button>

            {/* Configuração de colunas */}
            <CustomerTableColumns
              availableColumns={TABLE_COLUMNS}
              visibleColumns={visibleColumns}
              onVisibilityChange={setVisibleColumns}
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div
        className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300"
        onMouseMove={handleMouseMove}
      >
        <CustomerTableFilters
          searchTerm={filters.searchTerm}
          onSearchChange={setSearchTerm}
          segmentFilter={filters.segmentFilter}
          onSegmentFilterChange={setSegmentFilter}
          statusFilter={filters.statusFilter}
          onStatusFilterChange={setStatusFilter}
          lastPurchaseFilter={filters.lastPurchaseFilter}
          onLastPurchaseFilterChange={setLastPurchaseFilter}
          birthdayFilter={filters.birthdayFilter}
          onBirthdayFilterChange={setBirthdayFilter}
        />
      </div>

      {/* Tabela de dados */}
      <CustomerTableBody
        data={filteredAndSortedData}
        visibleColumns={visibleColumns}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={toggleSort}
        isLoading={isLoading}
      />

      {/* Rodapé com informações e estatísticas */}
      {filteredAndSortedData.length > 0 && (
        <div
          className="bg-gray-800/20 rounded-lg p-4 border border-gray-700/30 hover:shadow-lg hover:shadow-gray-500/10 transition-all duration-300"
          onMouseMove={handleMouseMove}
        >
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                📊 <strong className="text-white">{filteredAndSortedData.length}</strong> resultados
              </span>
              <span className="flex items-center gap-1">
                🔍 <strong className="text-white">{activeFiltersCount}</strong> filtros ativos
              </span>
              <span className="flex items-center gap-1">
                👁️ <strong className="text-white">{visibleColumnsCount}</strong> colunas visíveis
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">
                Ordenado por: <strong className="text-white">
                  {sortField ? TABLE_COLUMNS.find(col => col.key === sortField)?.label : 'Nenhum'}
                </strong>
                {sortField && (
                  <span className="ml-1 text-blue-400">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Debug info (desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-white">Debug: Estado da Tabela (useReducer)</summary>
            <pre className="mt-2 overflow-x-auto">
              {JSON.stringify({
                sortField,
                sortDirection,
                filters,
                computed,
                visibleColumnsCount: visibleColumns.length,
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}