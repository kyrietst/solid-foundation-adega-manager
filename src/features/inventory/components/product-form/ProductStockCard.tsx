/**
 * Card de controle de estoque do produto - VERSÃO ULTRA SIMPLIFICADA
 * Apenas 2 campos: Pacotes e Unidades Soltas (conforme solicitação do cliente)
 * Sistema "burro e obediente" - o que o usuário informa é o que fica
 */

import React, { useId } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Package, Box } from 'lucide-react';
import { ProductFormData } from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface ProductStockCardProps {
  formData: Partial<ProductFormData>;
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number) => void;
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
  glassEffect?: boolean;
}

export const ProductStockCard: React.FC<ProductStockCardProps> = ({
  formData,
  fieldErrors,
  onInputChange,
  variant = 'default',
  glassEffect = true,
}) => {
  // ✅ ACCESSIBILITY FIX: Generate unique ID prefix to prevent duplicate IDs
  const formId = useId();
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card className={cn(glassClasses, 'shadow-xl')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <Package className="h-5 w-5 text-primary-yellow" />
          Controle de Estoque Simplificado
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Informe exatamente o que você tem na prateleira
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pacotes */}
          <div>
            <Label htmlFor={`${formId}-stock_packages`} className="text-gray-200 flex items-center gap-2">
              <Box className="h-4 w-4 text-blue-400" />
              Pacotes em Estoque
            </Label>
            <Input
              id={`${formId}-stock_packages`}
              type="number"
              value={formData.stock_packages === 0 ? '' : formData.stock_packages ?? ''}
              onChange={(e) => onInputChange('stock_packages', e.target.value === '' ? 0 : Number(e.target.value))}
              min="0"
              placeholder="Ex: 12"
              className={cn(
                'bg-gray-800/50 border-blue-400/30 text-gray-200 focus:border-blue-400',
                fieldErrors.stock_packages && 'border-accent-red'
              )}
            />
            <p className="text-gray-500 text-xs mt-1">Quantos pacotes fechados você tem?</p>
            {fieldErrors.stock_packages && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.stock_packages}</p>
            )}
          </div>

          {/* Unidades Soltas */}
          <div>
            <Label htmlFor={`${formId}-stock_units_loose`} className="text-gray-200 flex items-center gap-2">
              <Package className="h-4 w-4 text-green-400" />
              Unidades Soltas
            </Label>
            <Input
              id={`${formId}-stock_units_loose`}
              type="number"
              value={formData.stock_units_loose === 0 ? '' : formData.stock_units_loose ?? ''}
              onChange={(e) => onInputChange('stock_units_loose', e.target.value === '' ? 0 : Number(e.target.value))}
              min="0"
              placeholder="Ex: 300"
              className={cn(
                'bg-gray-800/50 border-green-400/30 text-gray-200 focus:border-green-400',
                fieldErrors.stock_units_loose && 'border-accent-red'
              )}
            />
            <p className="text-gray-500 text-xs mt-1">Quantas unidades avulsas você tem?</p>
            {fieldErrors.stock_units_loose && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.stock_units_loose}</p>
            )}
          </div>

          {/* Estoque Mínimo */}
          <div>
            <Label htmlFor={`${formId}-minimum_stock`} className="text-gray-200">Estoque Mínimo (Alerta)</Label>
            <Input
              id={`${formId}-minimum_stock`}
              type="number"
              value={formData.minimum_stock === 0 ? '' : formData.minimum_stock ?? ''}
              onChange={(e) => onInputChange('minimum_stock', e.target.value === '' ? 0 : Number(e.target.value))}
              min="0"
              placeholder="Ex: 5"
              className={cn(
                'bg-gray-800/50 border-yellow-400/30 text-gray-200 focus:border-yellow-400',
                fieldErrors.minimum_stock && 'border-accent-red'
              )}
            />
            <p className="text-gray-500 text-xs mt-1">Para avisos de estoque baixo</p>
            {fieldErrors.minimum_stock && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.minimum_stock}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-600">
          <p className="text-gray-300 text-sm">
            💡 <strong>Sistema Simplificado:</strong> Informe apenas o que você consegue contar fisicamente.
            O sistema não fará conversões automáticas - o que você informar é exatamente o que ficará registrado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};