/**
 * Apresentação pura de Movimentações
 * Componente sem lógica de negócio, apenas renderização
 * Inclui PAGINAÇÃO e scroll otimizado
 * MODO AUDITORIA: Read-Only (Criação removida)
 */

import React, { useMemo } from 'react';
import { DateRange } from "react-day-picker";
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { DatePickerWithRange } from '@/shared/ui/composite/date-range-picker';
import { MovementsTable } from './MovementsTable';
import { InventoryMovement } from '@/core/types/inventory.types';
import { Product, Customer, Sale } from '@/features/movements/hooks/useMovements';

export interface MovementsPresentationProps {
  // Dados processados
  movements: InventoryMovement[];
  customers: Customer[];
  salesList: Sale[];
  productsMap: Record<string, { name: string; price: number }>;
  usersMap: Record<string, string>;
  typeInfo: Record<string, { label: string; color: string }>;

  // Paginação
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // Filtros
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;

  // Estados
  isLoading: boolean;

  // Configuração
  userRole: string;
}

export const MovementsPresentation: React.FC<MovementsPresentationProps> = ({
  movements,
  customers,
  salesList,
  productsMap,
  usersMap,
  typeInfo,
  // Paginação
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  // Filtros
  dateRange,
  setDateRange,
  // Estados
  isLoading,
}) => {
  // Criar mapa de vendas para lookup rápido de delivery_type
  const salesMap = useMemo(() => {
    return salesList.reduce((acc, sale) => {
      acc[sale.id] = sale;
      return acc;
    }, {} as Record<string, Sale>);
  }, [salesList]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-white overflow-hidden">
      {/* Header Fixo */}
      <div className="flex-none p-6 border-b border-white/10 bg-[#09090b]/95 backdrop-blur z-20">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <PageHeader
            title="Movimentações de Estoque"
            description="Histórico completo de auditoria de estoque."
            className="flex-1"
          />

          {/* Filtros */}
          <div className="flex items-center gap-3">
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
              className="w-full sm:w-[300px]"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo com Scroll */}
      <section
        className="flex-1 flex flex-col min-h-0 m-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        {/* Purple glow effect */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(800px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)`
          }}
        />

        {/* Tabela com scroll interno */}
        <div className="relative z-10 flex-1 min-h-0 overflow-auto p-4">
          <MovementsTable
            movements={movements}
            productsMap={productsMap}
            usersMap={usersMap}
            typeInfo={typeInfo}
            customers={customers}
            salesMap={salesMap}
            maxRows={pageSize}
            isLoading={isLoading}
          />
        </div>

        {/* Controles de Paginação */}
        <div className="relative z-10 border-t border-white/10 p-4 bg-black/40">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={pageSize}
            onPageChange={onPageChange}
            onItemsPerPageChange={onPageSizeChange}
            itemsPerPageOptions={[25, 50, 100]}
            showItemsPerPage={true}
            showItemsCount={true}
            itemLabel="movimentação"
            itemsLabel="movimentações"
            variant="premium"
            glassEffect={true}
          />
        </div>
      </section>
    </div>
  );
};
