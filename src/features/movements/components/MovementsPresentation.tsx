/**
 * Apresentação pura de Movimentações
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/primitives/dialog';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { BlurIn } from '@/components/ui/blur-in';
import { MovementsTable } from './MovementsTable';
import { MovementDialog } from './MovementDialog';
import { InventoryMovement } from '@/types/inventory.types';
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
            className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
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
          <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 shadow-lg">
            <span className="text-sm font-bold text-gray-100">{movements.length}</span>
            <span className="text-xs ml-1 opacity-75 text-gray-300">movimentações</span>
          </div>
          
          {canCreateMovement && (
            <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30">
                  <Plus className="h-4 w-4 mr-2" /> NOVA MOVIMENTAÇÃO
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>REGISTRAR MOVIMENTAÇÃO</DialogTitle>
                </DialogHeader>
                <MovementDialog
                  formData={formData}
                  products={products}
                  customers={customers}
                  salesList={salesList}
                  isCreating={isCreating}
                  onFormDataChange={onFormDataChange}
                  onSubmit={onFormSubmit}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Container principal com glassmorphism */}
      <section 
        className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 overflow-hidden"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <MovementsTable
              movements={movements}
              productsMap={productsMap}
              usersMap={usersMap}
              typeInfo={typeInfo}
              customers={customers}
            />
          )}
        </div>
      </section>
    </div>
  );
};