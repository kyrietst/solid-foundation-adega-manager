/**
 * Card de preços e margens do produto
 * Sub-componente especializado para cálculos de preço
 */

import React, { useId } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Badge } from '@/shared/ui/primitives/badge';
import { Separator } from '@/shared/ui/primitives/separator';
import { Calculator, DollarSign } from 'lucide-react';
import { ProductFormData, ProductCalculations } from '@/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { SensitiveData, useSensitiveValue } from '@/shared/ui/composite';

interface ProductPricingCardProps {
  formData: Partial<ProductFormData>;
  calculations: ProductCalculations;
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number) => void;
  onMarginChange: (margin: number) => void;
  // História 1.4: Novos handlers para cálculos em tempo real
  onCostPriceChange?: (costPrice: number) => void;
  onPriceChange?: (price: number) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductPricingCard: React.FC<ProductPricingCardProps> = ({
  formData,
  calculations,
  fieldErrors,
  onInputChange,
  onMarginChange,
  onCostPriceChange,
  onPriceChange,
  variant = 'default',
  glassEffect = true,
}) => {
  // ✅ ACCESSIBILITY FIX: Generate unique ID prefix to prevent duplicate IDs
  const formId = useId();
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';
  const { canViewCosts, canViewProfits } = useSensitiveValue();

  return (
    <Card className={cn(glassClasses, 'shadow-xl')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <DollarSign className="h-5 w-5 text-primary-yellow" />
          Preços e Margens
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure os preços de custo e venda.
          <span className="text-primary-yellow font-medium"> Os cálculos de margem são automáticos</span> - Historia 1.4
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preços por Unidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SensitiveData type="cost">
            <div>
              <Label htmlFor={`${formId}-cost_price`} className="text-gray-200">
                {formData.is_package ? 'Preço de Custo do Pacote' : 'Preço de Custo (un.)'}
              </Label>
              <Input
                id={`${formId}-cost_price`}
                type="number"
                step="0.01"
                value={formData.cost_price === 0 ? '' : formData.cost_price ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  // História 1.4: Usar handler especializado se disponível, senão fallback para onInputChange
                  if (onCostPriceChange) {
                    onCostPriceChange(value);
                  } else {
                    onInputChange('cost_price', value);
                  }
                }}
                placeholder="0.00"
                className={cn(
                  'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                  fieldErrors.cost_price && 'border-accent-red'
                )}
              />
              {fieldErrors.cost_price && (
                <p className="text-accent-red text-sm mt-1">{fieldErrors.cost_price}</p>
              )}
            </div>
          </SensitiveData>

          <div>
            <Label htmlFor={`${formId}-price`} className="text-gray-200">
              {formData.is_package ? 'Preço de Venda do Pacote *' : 'Preço de Venda (un.) *'}
            </Label>
            <Input
              id={`${formId}-price`}
              type="number"
              step="0.01"
              value={formData.price === 0 ? '' : formData.price ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                // História 1.4: Usar handler especializado se disponível, senão fallback para onInputChange
                if (onPriceChange) {
                  onPriceChange(value);
                } else {
                  onInputChange('price', value);
                }
              }}
              placeholder="0.00"
              required
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                fieldErrors.price && 'border-accent-red'
              )}
            />
            {fieldErrors.price && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.price}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`${formId}-margin_percent`} className="text-gray-200">Margem (%) ou</Label>
            <Input
              id={`${formId}-margin_percent`}
              type="number"
              step="0.01"
              value={formData.margin_percent === 0 ? '' : formData.margin_percent ?? ''}
              onChange={(e) => onMarginChange(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0.00"
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                fieldErrors.margin_percent && 'border-accent-red'
              )}
            />
            {fieldErrors.margin_percent && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.margin_percent}</p>
            )}
          </div>
        </div>

        {/* Informações de Pacote - Apenas se is_package for true */}
        {formData.is_package && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary-yellow" />
                Cálculos de Pacote
              </h4>
              <p className="text-xs text-gray-400 mb-4">
                {formData.units_per_package
                  ? `Pacote com ${formData.units_per_package} unidades`
                  : 'Configure as unidades por pacote primeiro'
                }
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`${formId}-package_size`} className="text-gray-200">Unidades por Pacote</Label>
                <Input
                  id={`${formId}-package_size`}
                  type="number"
                  value={formData.package_size === 0 ? '' : formData.package_size ?? ''}
                  onChange={(e) => onInputChange('package_size', e.target.value === '' ? 0 : Number(e.target.value))}
                  min="1"
                  className={fieldErrors.package_size ? 'border-red-500' : ''}
                />
                {fieldErrors.package_size && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.package_size}</p>
                )}
              </div>

              <div>
                <Label htmlFor={`${formId}-package_price`} className="text-gray-200">Preço de Venda (pct)</Label>
                <Input
                  id={`${formId}-package_price`}
                  type="number"
                  step="0.01"
                  value={formData.package_price === 0 ? '' : formData.package_price ?? ''}
                  onChange={(e) => onInputChange('package_price', e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder={`${calculations.pricePerPackage?.toFixed(2) || '0.00'} (automático)`}
                />
              </div>

              <SensitiveData type="profit">
                <div>
                  <Label className="text-gray-200">Margem (pct)</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                    <Badge variant="secondary">
                      {calculations.packageMargin?.toFixed(2) || '0.00'}%
                    </Badge>
                  </div>
                </div>
              </SensitiveData>
            </div>
          </>
        )}

        {/* Cálculos Automáticos */}
        {(calculations.unitMargin !== undefined || calculations.packageMargin !== undefined) && (
          <SensitiveData type="profit">
            <div className="glass-subtle p-4 rounded-lg border border-primary-yellow/20">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-primary-yellow" />
                <span className="font-medium text-gray-100">Cálculos Automáticos</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Lucro por unidade:</span>
                  <span className="ml-2 font-medium text-primary-yellow">
                    R$ {calculations.unitProfitAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300">Lucro por pacote:</span>
                  <span className="ml-2 font-medium text-primary-yellow">
                    R$ {calculations.packageProfitAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </SensitiveData>
        )}
      </CardContent>
    </Card>
  );
};