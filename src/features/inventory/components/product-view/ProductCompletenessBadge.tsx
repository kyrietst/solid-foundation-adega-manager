import React from 'react';
import { cn } from '@/core/config/utils';

export interface ProductCompleteness {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    missing: string[];
}

interface ProductCompletenessBadgeProps {
    completeness: ProductCompleteness | null;
    className?: string;
}

export const ProductCompletenessBadge: React.FC<ProductCompletenessBadgeProps> = ({
    completeness,
    className
}) => {
    if (!completeness) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all",
                completeness.status === 'excellent' ? "bg-green-500/10 border-green-400/40 text-green-400" :
                    completeness.status === 'good' ? "bg-blue-500/10 border-blue-400/40 text-blue-400" :
                        completeness.status === 'fair' ? "bg-yellow-500/10 border-yellow-400/40 text-yellow-400" :
                            "bg-red-500/10 border-red-400/40 text-red-400",
                className
            )}
            title={completeness.missing.length > 0 ? `Faltando: ${completeness.missing.join(', ')}` : 'Cadastro Completo'}
        >
            <span className="font-bold">{completeness.score}%</span>
            <span className="opacity-80 hidden sm:inline">
                {completeness.status === 'excellent' ? 'Excelente' :
                    completeness.status === 'good' ? 'Bom' :
                        completeness.status === 'fair' ? 'Regular' : 'Incompleto'}
            </span>
        </div>
    );
};
