import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipPortal,
} from "@/shared/ui/primitives/tooltip";
import { cn } from "@/core/config/utils";
import { AlertTriangle, CheckCircle2, Eye, TrendingUp } from "lucide-react";
import { CustomerTableRow } from "../../types/customer-table.types";

interface CustomerInfoCellProps {
    customer: CustomerTableRow;
}

// Componente interativo para nome do cliente com indicadores visuais
export const CustomerInfoCell = React.memo(({
    customer
}: CustomerInfoCellProps) => {
    const reportFields = [
        { key: 'email', label: 'Email', value: customer.email, required: true },
        { key: 'phone', label: 'Telefone', value: customer.phone, required: true },
        { key: 'birthday', label: 'Aniversário', value: customer.proximoAniversario, required: false },
        { key: 'address', label: 'Endereço', value: customer.cidade, required: false },
        { key: 'category', label: 'Categoria Favorita', value: customer.categoriaFavorita, required: false }
    ];

    const missingFields = reportFields.filter(field =>
        !field.value || field.value === 'Não informado' || field.value === 'N/A'
    );

    const criticalMissing = missingFields.filter(field => field.required);
    const importantMissing = missingFields.filter(field => !field.required);

    const hasIssues = missingFields.length > 0;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "group flex items-center gap-2 cursor-pointer transition-all duration-200",
                        hasIssues && "hover:scale-105"
                    )}>
                        {/* Nome do cliente */}
                        <span className={cn(
                            "font-medium transition-colors duration-200",
                            hasIssues ? "text-white group-hover:text-primary-yellow" : "text-gray-100"
                        )}>
                            {customer.cliente}
                        </span>

                        {/* Indicadores visuais */}
                        {criticalMissing.length > 0 && (
                            <div className="relative">
                                <AlertTriangle className="h-3 w-3 text-accent-red animate-pulse" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-red rounded-full animate-ping" />
                            </div>
                        )}

                        {importantMissing.length > 0 && criticalMissing.length === 0 && (
                            <div className="w-2 h-2 bg-accent-orange rounded-full animate-pulse" />
                        )}

                        {!hasIssues && (
                            <CheckCircle2 className="h-3 w-3 text-green-400 opacity-60" />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent className="z-[50000] bg-black/95 backdrop-blur-xl border border-primary-yellow/30 shadow-2xl max-w-sm">
                        <div className="space-y-3 p-1">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="font-semibold text-white">Perfil para Relatórios</span>
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3 text-primary-yellow" />
                                    <span className="text-primary-yellow text-xs font-medium">Clique para editar</span>
                                </div>
                            </div>

                            {/* Campos críticos faltantes */}
                            {criticalMissing.length > 0 && (
                                <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-2">
                                    <p className="text-accent-red font-medium text-xs flex items-center gap-1 mb-1">
                                        <AlertTriangle className="h-3 w-3 animate-pulse" />
                                        {criticalMissing.length} campos críticos ausentes
                                    </p>
                                    <div className="space-y-1">
                                        {criticalMissing.map((field, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                <span className="w-1 h-1 bg-accent-red rounded-full animate-pulse"></span>
                                                <span className="text-red-200">{field.label}</span>
                                                <span className="text-accent-red/70 text-[10px]">OBRIGATÓRIO</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Campos importantes faltantes */}
                            {importantMissing.length > 0 && (
                                <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-2">
                                    <p className="text-accent-orange font-medium text-xs flex items-center gap-1 mb-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {importantMissing.length} campos importantes ausentes
                                    </p>
                                    <div className="space-y-1">
                                        {importantMissing.map((field, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                <span className="w-1 h-1 bg-accent-orange rounded-full"></span>
                                                <span className="text-orange-200">{field.label}</span>
                                                <span className="text-accent-orange/70 text-[10px]">RECOMENDADO</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status completo */}
                            {!hasIssues && (
                                <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-2">
                                    <p className="text-green-400 font-medium text-xs flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Perfil completo para relatórios
                                    </p>
                                    <p className="text-green-200 text-xs mt-1">
                                        Todos os campos necessários estão preenchidos
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="text-center pt-1 border-t border-white/10">
                                <p className="text-xs text-gray-300">
                                    Campos completos melhoram a precisão dos relatórios
                                </p>
                            </div>
                        </div>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TooltipProvider>
    );
}
);
