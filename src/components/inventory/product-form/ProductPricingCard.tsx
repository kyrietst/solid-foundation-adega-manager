/**
 * Card de preços e margens do produto
 * Sub-componente especializado para cálculos de preço
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign } from 'lucide-react';
import { ProductFormData } from '@/types/inventory.types';

interface ProductPricingCardProps {
  formData: Partial<ProductFormData>;
  calculations: any;
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number) => void;
  onMarginChange: (margin: number) => void;
}

export const ProductPricingCard: React.FC<ProductPricingCardProps> = ({
  formData,
  calculations,
  fieldErrors,
  onInputChange,
  onMarginChange,
}) => {
  return (
    <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <DollarSign className="h-5 w-5" />
          Preços e Margens
        </CardTitle>
        <CardDescription className="text-adega-silver">
          Configure os preços de custo e venda. Os cálculos de margem são automáticos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preços por Unidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cost_price" className="text-adega-platinum">Preço de Custo (un.)</Label>
            <Input
              id="cost_price"
              type="number"
              step="0.01"
              value={formData.cost_price || ''}
              onChange={(e) => onInputChange('cost_price', Number(e.target.value))}
              placeholder="0.00"
              className={fieldErrors.cost_price ? 'border-red-500' : ''}
            />
            {fieldErrors.cost_price && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.cost_price}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price" className="text-adega-platinum">Preço de Venda (un.) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => onInputChange('price', Number(e.target.value))}
              placeholder="0.00"
              required
              className={fieldErrors.price ? 'border-red-500' : ''}
            />
            {fieldErrors.price && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.price}</p>
            )}
          </div>

          <div>
            <Label htmlFor="margin_percent" className="text-adega-platinum">Margem (%) ou</Label>
            <Input
              id="margin_percent"
              type="number"
              step="0.01"
              value={formData.margin_percent || ''}
              onChange={(e) => onMarginChange(Number(e.target.value))}
              placeholder="0.00"
              className={fieldErrors.margin_percent ? 'border-red-500' : ''}
            />
            {fieldErrors.margin_percent && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.margin_percent}</p>
            )}
          </div>
        </div>

        {/* Separador */}
        <Separator />

        {/* Informações de Pacote */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="package_size" className="text-adega-platinum">Unidades por Pacote</Label>
            <Input
              id="package_size"
              type="number"
              value={formData.package_size || 1}
              onChange={(e) => onInputChange('package_size', Number(e.target.value))}
              min="1"
              className={fieldErrors.package_size ? 'border-red-500' : ''}
            />
            {fieldErrors.package_size && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.package_size}</p>
            )}
          </div>

          <div>
            <Label htmlFor="package_price" className="text-adega-platinum">Preço de Venda (pct)</Label>
            <Input
              id="package_price"
              type="number"
              step="0.01"
              value={formData.package_price || ''}
              onChange={(e) => onInputChange('package_price', Number(e.target.value))}
              placeholder={`${calculations.pricePerPackage?.toFixed(2) || '0.00'} (automático)`}
            />
          </div>

          <div>
            <Label className="text-adega-platinum">Margem (pct)</Label>
            <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
              <Badge variant="secondary">
                {calculations.packageMargin?.toFixed(2) || '0.00'}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Cálculos Automáticos */}
        {(calculations.unitMargin !== undefined || calculations.packageMargin !== undefined) && (
          <div className="bg-adega-graphite/50 p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-adega-gold" />
              <span className="font-medium text-white">Cálculos Automáticos</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-adega-silver">Lucro por unidade:</span>
                <span className="ml-2 font-medium text-adega-gold">
                  R$ {calculations.unitProfitAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div>
                <span className="text-adega-silver">Lucro por pacote:</span>
                <span className="ml-2 font-medium text-adega-gold">
                  R$ {calculations.packageProfitAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};