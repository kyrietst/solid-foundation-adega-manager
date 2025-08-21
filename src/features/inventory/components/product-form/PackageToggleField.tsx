/**
 * Campo toggle para "Cadastrar como pacote?" 
 * Implementa História 1.3: Lógica de Pacote vs. Unidade
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { Package, Box } from 'lucide-react';
import { ProductFormData } from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface PackageToggleFieldProps {
  formData: Partial<ProductFormData>;
  fieldErrors: Record<string, string>;
  onInputChange: (field: keyof ProductFormData, value: string | number | boolean) => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const PackageToggleField: React.FC<PackageToggleFieldProps> = ({
  formData,
  fieldErrors,
  onInputChange,
  variant = 'default',
  glassEffect = true,
}) => {
  const isPackage = formData.is_package || false;

  const handlePackageToggle = (checked: boolean) => {
    onInputChange('is_package', checked);
    
    // Se desmarcar "pacote", resetar campo units_per_package para 1
    if (!checked) {
      onInputChange('units_per_package', 1);
    } else {
      // Se marcar "pacote", definir um valor padrão se não existe
      if (!formData.units_per_package || formData.units_per_package <= 1) {
        onInputChange('units_per_package', 6); // Valor padrão comum para pacotes
      }
    }
  };

  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card className={cn(glassClasses, 'shadow-xl')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <Package className="h-5 w-5 text-primary-yellow" />
          Tipo de Produto
        </CardTitle>
        <CardDescription className="text-gray-400">
          Defina se este produto será vendido como unidade individual ou pacote com múltiplas unidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle Principal */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-200 font-medium">
              Cadastrar como pacote?
            </Label>
            <p className="text-sm text-gray-400">
              {isPackage 
                ? 'Produto será vendido em pacotes com múltiplas unidades' 
                : 'Produto será vendido individualmente (por unidade)'
              }
            </p>
          </div>
          <SwitchAnimated
            checked={isPackage}
            onCheckedChange={handlePackageToggle}
            variant="yellow"
            size="md"
          />
        </div>

        {/* Campo Condicional: Unidades por Pacote */}
        {isPackage && (
          <div className="border-t border-primary-yellow/20 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Box className="h-4 w-4 text-primary-yellow" />
              <span className="text-sm font-medium text-gray-200">
                Configuração do Pacote
              </span>
            </div>
            
            <div>
              <Label htmlFor="units_per_package" className="text-gray-200">
                Unidades por Pacote *
              </Label>
              <Input
                id="units_per_package"
                type="number"
                value={formData.units_per_package ?? ''}
                onChange={(e) => onInputChange('units_per_package', Number(e.target.value))}
                placeholder="Ex: 6, 12, 24"
                min="2"
                required={isPackage}
                className={cn(
                  'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
                  fieldErrors.units_per_package && 'border-accent-red'
                )}
              />
              {fieldErrors.units_per_package && (
                <p className="text-accent-red text-sm mt-1">{fieldErrors.units_per_package}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Quantas unidades individuais compõem este pacote
              </p>
            </div>
          </div>
        )}

        {/* Indicador Visual do Tipo Selecionado */}
        <div className={cn(
          'p-3 rounded-lg border',
          isPackage 
            ? 'glass-subtle border-accent-blue/30 text-accent-blue' 
            : 'glass-subtle border-accent-green/30 text-accent-green'
        )}>
          <div className="flex items-center gap-2">
            {isPackage ? (
              <>
                <Package className="h-4 w-4" />
                <span className="font-medium">Pacote</span>
                {formData.units_per_package && formData.units_per_package > 1 && (
                  <span className="text-sm opacity-80">
                    ({formData.units_per_package} unidades)
                  </span>
                )}
              </>
            ) : (
              <>
                <Box className="h-4 w-4" />
                <span className="font-medium">Unidade Individual</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};