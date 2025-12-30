/**
 * Card de preços e margens
 * Gerencia custo, venda e margem de lucro
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { DollarSign, Percent } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { useFormContext } from 'react-hook-form';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';

interface ProductPricingCardProps {
  calculations: any;
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
  glassEffect?: boolean;
}

export const ProductPricingCard: React.FC<ProductPricingCardProps> = React.memo(({
  calculations,
  variant = 'default',
  glassEffect = true,
}) => {
  const { register, formState: { errors } } = useFormContext<ProductFormValues>();
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card className={cn(glassClasses, 'shadow-xl')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          Preços e Margens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preço de Custo */}
          <div>
            <Label htmlFor="cost_price" className="text-gray-200">Preço de Custo (R$)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                min="0"
                {...register('cost_price', { valueAsNumber: true, onChange: (e) => calculations.handleCostPriceChange(Number(e.target.value)) })}
                placeholder="0.00"
                className="pl-9 bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Margem de Lucro */}
          <div>
            <Label htmlFor="margin_percent" className="text-gray-200">Margem (%)</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="margin_percent"
                type="number"
                step="0.1"
                {...register('margin_percent', { valueAsNumber: true, onChange: (e) => calculations.handleMarginChange(Number(e.target.value)) })}
                placeholder="0%"
                className={cn(
                  "pl-9 bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
                )}
              />
            </div>
          </div>

          {/* Preço de Venda */}
          <div>
            <Label htmlFor="price" className="text-gray-200 font-bold">Preço de Venda (R$) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true, onChange: (e) => calculations.handlePriceChange(Number(e.target.value)) })}
                placeholder="0.00"
                className={cn(
                  "pl-9 bg-gray-900/80 border-emerald-500/50 text-emerald-400 font-bold text-lg focus:border-emerald-400 placeholder:text-gray-600",
                  errors.price && "border-red-500"
                )}
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});