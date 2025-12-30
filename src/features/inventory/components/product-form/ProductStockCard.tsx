/**
 * Card de controle de estoque
 * Gerencia unidades de pacote e estoque
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Package } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { useFormContext } from 'react-hook-form';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';

interface ProductStockCardProps {
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
  glassEffect?: boolean;
}

export const ProductStockCard: React.FC<ProductStockCardProps> = React.memo(({
  variant = 'default',
  glassEffect = true,
}) => {
  const { register } = useFormContext<ProductFormValues>();
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card className={cn(glassClasses, 'shadow-xl')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <Package className="h-5 w-5 text-blue-400" />
          Estoque e Pacotes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Unidades por Pacote */}
          <div>
            <Label htmlFor="package_units" className="text-gray-200">Itens por Pacote/Caixa</Label>
            <div className="relative">
              <Package className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="package_units"
                type="number"
                min="1"
                {...register('package_units', { valueAsNumber: true })}
                placeholder="1"
                className="pl-9 bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Ex: 12 para caixa com 12 unidades</p>
          </div>

          {/* Preço do Pacote (Opcional/Calculado) */}
          <div>
            <Label htmlFor="package_price" className="text-gray-200">Preço do Pacote (Opcional)</Label>
            <div className="relative">
              <Input
                id="package_price"
                type="number"
                step="0.01"
                {...register('package_price', { valueAsNumber: true })}
                placeholder="Automático"
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Se vazio, será Unidades x Preço Unitário</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});