/**
 * Card de informações básicas do produto
 * Sub-componente especializado para dados básicos
 */

import React, { useId } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Package } from 'lucide-react';
import { ProductFormData, UnitType } from '@/core/types/inventory.types';
import { DynamicMeasurementField } from './DynamicMeasurementField';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface ProductBasicInfoCardProps {
  formData: Partial<ProductFormData>;
  categories: string[];
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number | UnitType) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductBasicInfoCard: React.FC<ProductBasicInfoCardProps> = React.memo(({
  formData,
  categories,
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
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome do Produto */}
          <div>
            <Label htmlFor={`${formId}-name`} className="text-gray-200">Nome do Produto *</Label>
            <Input
              id={`${formId}-name`}
              value={formData.name || ''}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="Ex: Vinho Tinto Cabernet Sauvignon"
              required
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                fieldErrors.name && 'border-accent-red'
              )}
            />
            {fieldErrors.name && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Categoria - TESTE COM INPUT SIMPLES */}
          <div>
            <Label htmlFor={`${formId}-category`} className="text-gray-200">Categoria *</Label>
            <Input
              id={`${formId}-category`}
              value={formData.category || ''}
              onChange={(e) => onInputChange('category', e.target.value)}
              placeholder="Digite a categoria"
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                fieldErrors.category && 'border-accent-red'
              )}
            />
            {fieldErrors.category && (
              <p className="text-accent-red text-sm mt-1">{fieldErrors.category}</p>
            )}
          </div>

          {/* Campo Dinâmico Volume/Unidade baseado na categoria */}
          <DynamicMeasurementField
            formData={formData}
            fieldErrors={fieldErrors}
            onInputChange={onInputChange}
            variant={variant}
            glassEffect={glassEffect}
          />


          {/* Tipo de Unidade - TESTE COM INPUT SIMPLES */}
          <div>
            <Label htmlFor={`${formId}-unit_type`} className="text-gray-200">Venda em</Label>
            <Input
              id={`${formId}-unit_type`}
              value={formData.unit_type || 'un'}
              onChange={(e) => onInputChange('unit_type', e.target.value as UnitType)}
              placeholder="un ou pct"
              className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <Label htmlFor={`${formId}-description`} className="text-gray-200">Descrição</Label>
          <Textarea
            id={`${formId}-description`}
            value={formData.description || ''}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Descrição detalhada do produto..."
            rows={3}
            className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
          />
        </div>
      </CardContent>
    </Card>
  );
});