/**
 * Apresentação pura de Movimentações
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Plus } from 'lucide-react';
import { BlurIn } from '@/components/ui/blur-in';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
import { cn } from '@/core/config/utils';
import { getSFProTextClasses } from '@/core/config/theme-utils';
import { MovementsTable } from './MovementsTable';
import { MovementDialog } from './MovementDialog';
import { InventoryMovement } from '@/core/types/inventory.types';
import { Product, Customer, Sale } from '@/features/movements/hooks/useMovements';
import { MovementFormData } from '@/features/movements/hooks/useMovementForm';

export interface MovementsPresentationProps {
  // Dados processados
  movements: InventoryMovement[];
  products: Product[];
  customers: Customer[];
  salesList: Sale[];
  productsMap: Record<string, { name: string; price: number }>;
  usersMap: Record<string, string>;
  typeInfo: Record<string, { label: string; color: string }>;

  // Estados
  isLoading: boolean;
  isCreating: boolean;
  isDialogOpen: boolean;

  // Formulário
  formData: MovementFormData;

  // Configuração
  userRole: string;
  canCreateMovement: boolean;

  // Handlers
  onDialogOpenChange: (open: boolean) => void;
  onFormDataChange: (updates: Partial<MovementFormData>) => void;
  onFormSubmit: () => void;
}

export const MovementsPresentation: React.FC<MovementsPresentationProps> = ({
  movements,
  products,
  customers,
  salesList,
  productsMap,
  usersMap,
  typeInfo,
  isLoading,
  isCreating,
  isDialogOpen,
  formData,
  userRole,
  canCreateMovement,
  onDialogOpenChange,
  onFormDataChange,
  onFormSubmit,
}) => {
  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Header padronizado */}
        <div className="relative text-center sm:text-left">
          {/* Título animado */}
          <BlurIn
            word="MOVIMENTAÇÕES DE ESTOQUE"
            duration={1.2}
            variant={{
              hidden: { filter: "blur(15px)", opacity: 0 },
              visible: { filter: "blur(0px)", opacity: 1 }
            }}
            className={cn(
              getSFProTextClasses('h1', 'accent'),
              "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
            )}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
            }}
          />
          
          {/* Sublinhado elegante */}
          <div className="w-full h-2 relative">
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
          </div>
        </div>
        
        {/* Botões de ação e contador */}
        <div className="flex gap-2 items-center">
          {/* Contador de movimentações */}
          <div 
            className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 shadow-lg hover:shadow-xl hover:shadow-yellow-400/20 hover:border-yellow-400/50 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
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
              className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(200px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)`
              }}
            />
            <span className="text-sm font-bold text-gray-100 relative z-10">{movements.length}</span>
            <span className="text-xs ml-1 opacity-75 text-gray-300 relative z-10">movimentações</span>
          </div>
          
          {canCreateMovement && (
            <FormDialog
              open={isDialogOpen}
              onOpenChange={onDialogOpenChange}
              title="REGISTRAR MOVIMENTAÇÃO"
              description="Adicione uma nova movimentação de estoque ao sistema"
              onSubmit={onFormSubmit}
              submitLabel="Salvar Movimentação"
              cancelLabel="Cancelar"
              loading={isCreating}
              size="lg"
              variant="premium"
              glassEffect={true}
              trigger={
                <Button 
                  className="bg-gradient-to-r from-primary-yellow to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold shadow-lg hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" /> 
                  NOVA MOVIMENTAÇÃO
                </Button>
              }
            >
              <MovementDialog
                formData={formData}
                products={products}
                customers={customers}
                salesList={salesList}
                isCreating={false}
                onFormDataChange={onFormDataChange}
                onSubmit={() => {}}
              />
            </FormDialog>
          )}
        </div>
      </div>

      {/* Container principal com purple glow */}
      <section 
        className="flex-1 min-h-0 h-[600px] bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 relative overflow-hidden group"
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
        <div className="relative z-10 h-full">
          <MovementsTable
            movements={movements}
            productsMap={productsMap}
            usersMap={usersMap}
            typeInfo={typeInfo}
            customers={customers}
            maxRows={50}
            isLoading={isLoading}
          />
        </div>
      </section>
    </div>
  );
};