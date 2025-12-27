/**
 * Campo dinâmico de medição que se adapta à categoria do produto
 * Implementa História 1.2: campos "Volume" ou "Unidade" baseados na categoria
 */

import React from 'react';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { ProductFormData } from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import {
  isBeverageCategory,
  getMeasurementLabel,
  getMeasurementPlaceholder,
  getMeasurementUnit,
  getMeasurementTypeForCategory
} from '@/features/inventory/utils/categoryUtils';

interface DynamicMeasurementFieldProps {
  formData: Partial<ProductFormData>;
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number) => void;
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
  glassEffect?: boolean;
}

export const DynamicMeasurementField: React.FC<DynamicMeasurementFieldProps> = ({
  formData,
  fieldErrors,
  onInputChange,
  variant = 'default',
  glassEffect = true,
}) => {
  const category = formData.category;
  const isBeverage = isBeverageCategory(category);

  // Remove o useEffect que causa loops infinitos
  // A atualização dos campos será feita apenas quando necessário

  if (!category) {
    return null; // Não renderiza o campo se não há categoria selecionada
  }

  const label = getMeasurementLabel(category);
  const placeholder = getMeasurementPlaceholder(category);
  const unit = getMeasurementUnit(category);

  const handleValueChange = (value: string) => {
    const numericValue = Number(value);

    // Atualiza o valor de medição
    onInputChange('measurement_value', value);

    // Se for bebida, atualiza também o campo volume_ml para compatibilidade
    if (isBeverage && !isNaN(numericValue)) {
      onInputChange('volume_ml', numericValue);
    }
  };

  const fieldValue = isBeverage
    ? formData.volume_ml || formData.measurement_value || ''
    : formData.measurement_value || '';

  return (
    <div>
      <Label htmlFor="dynamic-measurement" className="text-gray-200">
        {label} {isBeverage ? '*' : ''}
      </Label>
      <div className="relative">
        <Input
          id="dynamic-measurement"
          type="number"
          value={fieldValue}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={placeholder}
          required={isBeverage} // Volume é obrigatório para bebidas
          className={cn(
            'pr-12 bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
            (fieldErrors.volume_ml || fieldErrors.measurement_value) && 'border-accent-red'
          )}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-sm">{unit}</span>
        </div>
      </div>
      {(fieldErrors.volume_ml || fieldErrors.measurement_value) && (
        <p className="text-accent-red text-sm mt-1">
          {fieldErrors.volume_ml || fieldErrors.measurement_value}
        </p>
      )}

      {/* Campo oculto para armazenar o tipo de medição */}
      <input
        type="hidden"
        name="measurement_type"
        value={getMeasurementTypeForCategory(category)}
      />
    </div>
  );
};