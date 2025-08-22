/**
 * Componente header do inventory com estatísticas e controles
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Plus, Grid3X3, List } from 'lucide-react';
import { BlurIn } from '@/components/ui/blur-in';
import { InventoryStats } from './InventoryStats';
import { InventoryHeaderProps } from './types';
import { getHeaderTextClasses, getSFProTextClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';

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
          <BlurIn
            word="GESTÃO DE ESTOQUE"
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
          <p className={cn(getSFProTextClasses('body', 'secondary'), "mt-1")}>
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