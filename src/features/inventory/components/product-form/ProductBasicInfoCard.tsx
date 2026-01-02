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
import { DynamicMeasurementField } from './DynamicMeasurementField';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { useFormContext } from 'react-hook-form';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';

interface ProductBasicInfoCardProps {
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
  glassEffect?: boolean;
}

export const ProductBasicInfoCard: React.FC<ProductBasicInfoCardProps> = React.memo(({
  variant = 'default',
  glassEffect = true,
}) => {
  const { register, formState: { errors } } = useFormContext<ProductFormValues>();

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
              {...register('name')}
              placeholder="Ex: Vinho Tinto Cabernet Sauvignon"
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                errors.name && 'border-accent-red'
              )}
            />
            {errors.name && (
              <p className="text-accent-red text-sm mt-1">{errors.name?.message}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor={`${formId}-category`} className="text-gray-200">Categoria *</Label>
            <Input
              id={`${formId}-category`}
              {...register('category')}
              placeholder="Digite a categoria"
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                errors.category && 'border-accent-red'
              )}
            />
            {errors.category && (
              <p className="text-accent-red text-sm mt-1">{errors.category?.message}</p>
            )}
          </div>

          {/* Campo Dinâmico Volume/Unidade baseada no contexto */}
          <DynamicMeasurementField
            variant={variant}
            glassEffect={glassEffect}
          />



        </div>

        {/* Descrição */}
        <div>
          <Label htmlFor={`${formId}-description`} className="text-gray-200">Descrição</Label>
          <Textarea
            id={`${formId}-description`}
            {...register('description')}
            placeholder="Descrição detalhada do produto..."
            rows={3}
            className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400"
          />
        </div>
      </CardContent>
    </Card>
  );
});