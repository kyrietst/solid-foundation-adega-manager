import React from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { ProductCompleteness } from './ProductCompletenessBadge';

interface ProductOptimizationTipsProps {
    completeness: ProductCompleteness | null;
    showOptimization: boolean;
    onToggle: () => void;
    className?: string;
}

export const ProductOptimizationTips: React.FC<ProductOptimizationTipsProps> = ({
    completeness,
    showOptimization,
    onToggle,
    className
}) => {
    if (!completeness || completeness.missing.length === 0) return null;

    return (
        <div className={cn("bg-blue-500/5 border border-blue-500/20 rounded-lg overflow-hidden transition-all duration-300", className)}>
            <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto hover:bg-blue-500/10 text-blue-300"
                onClick={onToggle}
            >
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <span className="font-medium text-sm">
                        {completeness.missing.length} Dicas de Otimização
                    </span>
                </div>
                {showOptimization ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showOptimization && (
                <div className="p-3 pt-0 animate-in slide-in-from-top-2">
                    <div className="space-y-2 mt-2">
                        {completeness.missing.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-400 pl-6">
                                <div className="w-1 h-1 rounded-full bg-blue-400" />
                                <span>Adicione <b>{item}</b> para melhorar o ranking</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
