import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/primitives/card';

interface SectionFallbackProps {
    error?: Error;
    onRetry?: () => void;
    title?: string;
    className?: string; // Permitir customização de estilo
}

export const SectionFallback: React.FC<SectionFallbackProps> = ({
    error,
    onRetry,
    title = "Conteúdo Indisponível",
    className
}) => {
    return (
        <Card className={`border-red-200 bg-red-50 dark:bg-red-900/10 ${className}`}>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-200">
                        {title}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 max-w-[250px] mx-auto">
                        {error?.message || "Ocorreu um erro ao carregar esta seção."}
                    </p>
                </div>
                {onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="border-red-200 hover:bg-red-100 hover:text-red-900 dark:border-red-800 dark:hover:bg-red-900/40"
                    >
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Tentar Novamente
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
