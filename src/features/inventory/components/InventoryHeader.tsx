/**
 * Componente header do inventory com estatísticas e controles
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Plus, Grid3X3, List } from 'lucide-react';
import { InventoryStats } from './InventoryStats';
import { InventoryHeaderProps } from './types';

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  totalProducts,
  lowStockCount,
  totalValue,
  turnoverStats,
  viewMode,
  onViewModeChange,
  onCreateProduct,
  canCreateProduct,
}) => {
  return (
    <div className="space-y-6">
      {/* Título e Ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-adega-yellow">Gestão de Estoque</h1>
          <p className="text-adega-platinum/70 mt-1">
            Controle completo do seu inventário com análise de giro
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Controles de Visualização */}
          <div className="flex rounded-lg border border-white/10 bg-adega-charcoal/20">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Botão Criar Produto */}
          {canCreateProduct && (
            <Button 
              onClick={onCreateProduct}
              className="bg-adega-gold hover:bg-adega-gold/90 text-adega-charcoal font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <InventoryStats
        totalProducts={totalProducts}
        lowStockCount={lowStockCount}
        totalValue={totalValue}
        turnoverStats={turnoverStats}
      />
    </div>
  );
};