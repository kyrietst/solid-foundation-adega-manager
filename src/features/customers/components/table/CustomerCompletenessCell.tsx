import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipPortal,
} from "@/shared/ui/primitives/tooltip";
import { cn } from "@/core/config/utils";
import { AlertTriangle } from "lucide-react";
import { CustomerTableRow } from "../../types/customer-table.types";
import { calculateCompleteness } from "../../utils/completeness-calculator";

interface CustomerCompletenessCellProps {
    row: CustomerTableRow;
    onEditClick?: (customerId: string) => void;
}

export const CustomerCompletenessCell = ({
    row,
    onEditClick
}: CustomerCompletenessCellProps) => {
    // Converter CustomerTableRow para CustomerData format
    const customerData = {
        id: row.id,
        name: row.cliente,
        email: row.email,
        phone: row.phone,
        address: row.cidade ? { city: row.cidade } : null,
        birthday: row.proximoAniversario ? row.proximoAniversario.toISOString() : null,
        first_purchase_date: null,
        last_purchase_date: row.ultimaCompra ? row.ultimaCompra.toISOString() : null,
        purchase_frequency: null,
        favorite_category: row.categoriaFavorita,
        favorite_product: null,
        notes: null,
        contact_permission: row.contactPermission,
        created_at: row.createdAt.toISOString()
    };

    // Usar cálculo direto em vez do hook para garantir funcionamento
    const completeness = React.useMemo(() => {
        try {
            return calculateCompleteness(customerData);
        } catch (error) {
            console.error('Erro ao calcular completude:', error);
            return null;
        }
    }, [customerData]);

    if (!completeness) {
        return (
            <div className="flex items-center gap-2 min-w-[80px] text-gray-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">N/A</span>
            </div>
        );
    }

    // Para tabela, usar versão compacta com mais informações no tooltip
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className="flex items-center gap-2 min-w-[100px] cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onEditClick?.(row.id)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onEditClick?.(row.id);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Editar perfil de ${row.cliente}, completude: ${completeness.percentage}%`}
                    >
                        <div className="flex-1">
                            <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                                <div
                                    className={cn(
                                        "h-2.5 rounded-full transition-all duration-300",
                                        completeness.level === 'excellent' ? 'bg-gradient-to-r from-primary-yellow to-yellow-400' :
                                            completeness.level === 'good' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                                completeness.level === 'fair' ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                                    'bg-gradient-to-r from-red-500 to-red-400'
                                    )}
                                    style={{ width: `${completeness.percentage}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={cn(
                                "text-xs font-medium",
                                completeness.level === 'excellent' ? 'text-primary-yellow' :
                                    completeness.level === 'good' ? 'text-green-400' :
                                        completeness.level === 'fair' ? 'text-yellow-400' :
                                            'text-red-400'
                            )}>
                                {completeness.percentage}%
                            </span>
                            {completeness.criticalMissing.length > 0 && (
                                <AlertTriangle className="h-3 w-3 text-red-400" />
                            )}
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side="left" className="max-w-sm z-[50000] bg-gray-900 border-gray-700">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Completude do Perfil</span>
                                <span className={cn(
                                    "font-bold",
                                    completeness.level === 'excellent' ? 'text-primary-yellow' :
                                        completeness.level === 'good' ? 'text-green-400' :
                                            completeness.level === 'fair' ? 'text-yellow-400' :
                                                'text-red-400'
                                )}>
                                    {completeness.percentage}%
                                </span>
                            </div>

                            <div className="text-xs text-gray-300">
                                {completeness.presentFields.length} de {completeness.presentFields.length + completeness.missingFields.length} campos preenchidos
                            </div>

                            {completeness.criticalMissing.length > 0 && (
                                <div className="text-xs text-red-400">
                                    ⚠️ {completeness.criticalMissing.length} campos críticos ausentes:
                                    <br />
                                    {completeness.criticalMissing.map(f => f.label).join(', ')}
                                </div>
                            )}

                            {completeness.recommendations.length > 0 && (
                                <div className="text-xs text-blue-400">
                                    💡 {completeness.recommendations[0]}
                                </div>
                            )}

                            <div className="text-xs text-gray-400 border-t border-gray-600 pt-1">
                                Clique para editar perfil
                            </div>
                        </div>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TooltipProvider>
    );
};
