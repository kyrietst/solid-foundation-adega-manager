/**
 * Apresentação pura de Movimentações
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MovementsTable } from './MovementsTable';
import { MovementDialog } from './MovementDialog';
import { InventoryMovement } from '@/types/inventory.types';
import { Product, Customer, Sale } from '@/hooks/movements/useMovements';
import { MovementFormData } from '@/hooks/movements/useMovementForm';

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
    <div className="space-y-6">
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Movimentações de Estoque</CardTitle>
          {canCreateMovement && (
            <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Movimentação</DialogTitle>
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
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};