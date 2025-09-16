/**
 * Componente de Preview de Estoque para Formulários
 * Implementa SPRINT 3 - Tarefa 3.2.1-3.2.4
 * Baseado na documentação docs/limpeza/prompt.md
 */

import React from 'react';
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { AlertCircle, Package, Hash } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface ProductStockPreviewProps {
  stock_quantity: number;
  units_per_package: number;
  className?: string;
  showValidation?: boolean;
}

export const ProductStockPreview: React.FC<ProductStockPreviewProps> = ({
  stock_quantity,
  units_per_package,
  className,
  showValidation = true
}) => {
  // Validações
  const isValidUnitsPerPackage = units_per_package > 0;
  const hasStock = stock_quantity > 0;

  // Cálculos dinâmicos
  const display = calculatePackageDisplay(stock_quantity, units_per_package);

  return (
    <Card className={cn("bg-muted/50 border-dashed", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Preview do Estoque
          {showValidation && !isValidUnitsPerPackage && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Inválido
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Validação de units_per_package */}
        {showValidation && !isValidUnitsPerPackage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Campo obrigatório:</strong> "Unidades por pacote" deve ser maior que 0
            </span>
          </div>
        )}

        {/* Grid de informações */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Total</div>
            <div className="font-bold text-lg">{display.total}</div>
            <div className="text-xs text-muted-foreground">unidades</div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Pacotes</div>
            <div className="font-bold text-lg text-blue-600">{display.packages}</div>
            <div className="text-xs text-muted-foreground">completos</div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Unidades Soltas</div>
            <div className="font-bold text-lg text-green-600">{display.units}</div>
            <div className="text-xs text-muted-foreground">restantes</div>
          </div>
        </div>

        {/* Fórmula explicativa */}
        {isValidUnitsPerPackage && (
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <div className="font-medium mb-1 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Cálculo automático:
            </div>
            <div className="space-y-1 font-mono">
              <div>Pacotes = {stock_quantity} ÷ {units_per_package} = {display.packages}</div>
              <div>Unidades soltas = {stock_quantity} % {units_per_package} = {display.units}</div>
            </div>
          </div>
        )}

        {/* Exibição final */}
        <div className="border-t pt-3">
          <div className="text-sm text-muted-foreground mb-1">
            Exibição no sistema:
          </div>
          <div className="font-medium text-base p-2 bg-white border rounded-md text-center">
            {isValidUnitsPerPackage ? display.formatted : `${stock_quantity} unidades`}
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex flex-wrap gap-2">
          {hasStock ? (
            <Badge variant="default" className="text-xs">
              Com estoque
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Sem estoque
            </Badge>
          )}

          {isValidUnitsPerPackage ? (
            <Badge variant="default" className="text-xs">
              Configuração válida
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Configuração inválida
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStockPreview;