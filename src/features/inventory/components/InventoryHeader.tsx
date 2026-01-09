/**
 * Componente header do inventory com estatísticas e controles
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Grid3X3, List, Upload } from 'lucide-react';
import { CsvImportModal } from './CsvImportModal';
import { InventoryHeaderProps } from '../types';
import { StandardPageHeader } from '@/shared/ui/composite/StandardPageHeader';
import { InventoryStats } from './InventoryStats';
import { useAuth } from '@/app/providers/AuthContext';

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onCreateProduct,
  totalProducts,
  lowStockCount,
  totalValue,
  turnoverStats,
}) => {
  const { userRole } = useAuth();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Apenas admins podem importar CSV
  const canImportCsv = userRole === 'admin';

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title="GESTÃO DE ESTOQUE"
        subtitle="Controle completo do seu inventário com análise de giro"
      >
        <div className="flex items-center gap-3">
          {/* Controles de Visualização */}
          <div className="flex rounded-lg border border-border/40 bg-muted/20">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 size={16} className={viewMode === 'grid' ? 'text-foreground' : 'text-muted-foreground'} />
            </Button>
            <div className="w-px bg-border/40 my-1" />
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8 w-8 p-0"
            >
              <List size={16} className={viewMode === 'list' ? 'text-foreground' : 'text-muted-foreground'} />
            </Button>
          </div>

          {/* Import CSV */}
          {canImportCsv && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="hidden sm:flex"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
          )}
          {/* New Product Button is rendered by parent or another slot, keeping it simpler here as per StandardPageHeader pattern */}
        </div>
      </StandardPageHeader>

      {/* Inventory Stats Component */}
      <InventoryStats
        totalProducts={totalProducts}
        lowStockCount={lowStockCount}
        totalValue={totalValue}
        turnoverStats={turnoverStats}
      />
      
      {/* Modal de Importação CSV */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};