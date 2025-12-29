
import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Package, Trash2, AlertTriangle, ClipboardList } from 'lucide-react';

export type InventoryViewMode = 'active' | 'deleted' | 'alerts' | 'count-sheet';

interface InventoryTabsProps {
    viewMode: InventoryViewMode;
    onViewModeChange: (mode: InventoryViewMode) => void;
    activeCount: number;
    deletedCount: number;
    lowStockCount: number;
}

export const InventoryTabs: React.FC<InventoryTabsProps> = ({
    viewMode,
    onViewModeChange,
    activeCount,
    deletedCount,
    lowStockCount
}) => {
    return (
        <div className="flex gap-2 mb-4 pb-4 border-b border-white/10">
            <Button
                variant={viewMode === 'active' ? 'default' : 'outline'}
                onClick={() => onViewModeChange('active')}
                className="flex items-center gap-2"
                size="sm"
            >
                <Package className="h-4 w-4" />
                Produtos Ativos
                <span className="ml-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                    {activeCount}
                </span>
            </Button>

            <Button
                variant={viewMode === 'deleted' ? 'default' : 'outline'}
                onClick={() => onViewModeChange('deleted')}
                className="flex items-center gap-2"
                size="sm"
            >
                <Trash2 className="h-4 w-4" />
                Produtos Deletados
                <span className="ml-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                    {deletedCount}
                </span>
            </Button>

            {/* Alertas de Estoque Baixo */}
            <Button
                variant={viewMode === 'alerts' ? 'default' : 'outline'}
                onClick={() => onViewModeChange('alerts')}
                className="flex items-center gap-2"
                size="sm"
            >
                <AlertTriangle className="h-4 w-4" />
                Alertas
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${lowStockCount > 0
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-green-500/20 text-green-400'
                    }`}>
                    {lowStockCount}
                </span>
            </Button>

            {/* Planilha de Inventário Físico */}
            <Button
                variant={viewMode === 'count-sheet' ? 'default' : 'outline'}
                onClick={() => onViewModeChange('count-sheet')}
                className="flex items-center gap-2"
                size="sm"
            >
                <ClipboardList className="h-4 w-4" />
                Planilha de Inventário
            </Button>
        </div>
    );
};
