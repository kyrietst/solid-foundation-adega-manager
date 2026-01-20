/**
 * Apresentação pura de Movimentações
 * Componente sem lógica de negócio, apenas renderização
 * Inclui PAGINAÇÃO e scroll otimizado
 * MODO AUDITORIA: Read-Only (Criação removida)
 */

import React, { useMemo } from 'react';
import { DateRange } from "react-day-picker";

import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { DatePickerWithRange } from '@/shared/ui/composite/date-range-picker';
import { MovementsTable } from './MovementsTable';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';
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
    <>
      {/* Background Fixed Layer */}
      <PremiumBackground className="fixed inset-0 z-0 pointer-events-none" />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col h-screen overflow-hidden bg-transparent">
        
        {/* Header Section */}
        <header className="flex-none px-8 py-6 pt-8 pb-6 z-10 w-full">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
             <div className="flex flex-col gap-1">
               <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Módulo de Auditoria</p>
               <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">MOVIMENTAÇÕES DE ESTOQUE</h2>
             </div>
             
             {/* Filtros no Header (Date Range) */}
             <div className="flex gap-3">
               <DatePickerWithRange
                  date={dateRange}
                  setDate={setDateRange}
                  className="w-full sm:w-[300px]"
                />
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar flex flex-col gap-8">
            
            {/* Table Container in Flex-1 */}
            <div className="flex-1 min-h-[500px] flex flex-col gap-4">
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

                 {/* Controles de Paginação */}
                 <div className="rounded-xl border border-white/10 p-4 bg-black/40 backdrop-blur-sm">
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
                      glassEffect={false} // Container already has glass
                    />
                 </div>
            </div>
        </main>
      </div>
    </>
  );
};
