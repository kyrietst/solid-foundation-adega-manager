
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
        <div className="flex overflow-x-auto pb-1 no-scrollbar w-full">
            <div className="inline-flex p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                <Button
                    variant="ghost"
                    onClick={() => onViewModeChange('active')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg h-auto ${viewMode === 'active' 
                        ? 'bg-[#f9cb15] text-black shadow-lg font-bold hover:bg-[#ffe04f] hover:text-black' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 font-medium'
                    } text-sm transition-all`}
                >
                    <Package className="h-4 w-4" />
                    Produtos Ativos
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold ${viewMode === 'active' 
                        ? 'bg-black/20 text-black' 
                        : 'bg-white/10 text-white'
                    }`}>
                        {activeCount}
                    </span>
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => onViewModeChange('deleted')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg h-auto ${viewMode === 'deleted' 
                        ? 'bg-[#f9cb15] text-black shadow-lg font-bold hover:bg-[#ffe04f] hover:text-black' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 font-medium'
                    } text-sm transition-all`}
                >
                    <Trash2 className="h-4 w-4" />
                    Produtos Deletados
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold ${viewMode === 'deleted' 
                        ? 'bg-black/20 text-black' 
                        : 'bg-red-500 text-white'
                    }`}>
                        {deletedCount}
                    </span>
                </Button>

                {/* Alertas de Estoque Baixo */}
                <Button
                    variant="ghost"
                    onClick={() => onViewModeChange('alerts')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg h-auto ${viewMode === 'alerts' 
                        ? 'bg-red-500 text-white shadow-lg font-bold hover:bg-red-600 hover:text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 font-medium'
                    } text-sm transition-all`}
                >
                    <AlertTriangle className="h-4 w-4" />
                    Alertas
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold ${viewMode === 'alerts'
                        ? 'bg-black/20 text-white'
                        : lowStockCount > 0 ? 'bg-red-500 text-white' : 'bg-white/10 text-white'
                    }`}>
                        {lowStockCount}
                    </span>
                </Button>

                {/* Planilha de Inventário Físico */}
                <Button
                    variant="ghost"
                    onClick={() => onViewModeChange('count-sheet')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg h-auto ${viewMode === 'count-sheet' 
                        ? 'bg-[#f9cb15] text-black shadow-lg font-bold hover:bg-[#ffe04f] hover:text-black' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 font-medium'
                    } text-sm transition-all`}
                >
                    <ClipboardList className="h-4 w-4" />
                    Planilha de Inventário
                </Button>
            </div>
        </div>
    );
};
