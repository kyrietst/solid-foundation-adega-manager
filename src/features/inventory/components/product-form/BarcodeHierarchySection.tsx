/**
 * Seção de Códigos Hierárquicos - Fardo + Unidade
 * Versão simplificada para evitar infinite loops
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Button } from '@/shared/ui/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Badge } from '@/shared/ui/primitives/badge';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import {
  Package,
  ShoppingCart,
  ScanLine,
  BarChart3
} from 'lucide-react';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { useFormContext, Controller } from 'react-hook-form';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';

interface BarcodeHierarchySectionProps {
  isLoading?: boolean;
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
  glassEffect?: boolean;
}

export const BarcodeHierarchySection: React.FC<BarcodeHierarchySectionProps> = ({
  isLoading = false,
  variant = 'default',
  glassEffect = true
}) => {
  const { register, control, setValue, watch, formState: { errors } } = useFormContext<ProductFormValues>();

  // Estados locais
  const [activeScanner, setActiveScanner] = useState<'package' | 'unit' | null>(null);

  // Watch needed values for conditional rendering
  const hasPackageTracking = watch('has_package_tracking');
  const hasUnitTracking = watch('has_unit_tracking');
  const packageBarcode = watch('package_barcode');
  const unitBarcode = watch('unit_barcode');
  const packageUnits = watch('package_units');

  // Handler para scanner de código de barras
  const handleBarcodeScanned = (code: string, type: 'package' | 'unit') => {
    if (type === 'package') {
      setValue('package_barcode', code, { shouldValidate: true });
    } else {
      setValue('unit_barcode', code, { shouldValidate: true });
    }
    setActiveScanner(null);
  };

  // Classes de estilo
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card className={cn(glassClasses, 'shadow-xl')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <BarChart3 className="h-5 w-5 text-primary-yellow" />
          Sistema de Códigos Hierárquicos
          <Badge variant="outline" className="ml-auto text-primary-yellow border-primary-yellow/50">
            Fardo + Unidade
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Controles de Rastreamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800/20 rounded-lg border border-primary-yellow/20">
          <div className="flex items-center justify-between">
            <Label htmlFor="package_tracking" className="text-gray-200 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Rastrear por Fardo
            </Label>
            <Controller
              control={control}
              name="has_package_tracking"
              render={({ field }) => (
                <SwitchAnimated
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  variant="yellow"
                  size="md"
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="unit_tracking" className="text-gray-200 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Rastrear por Unidade
            </Label>
            <Controller
              control={control}
              name="has_unit_tracking"
              render={({ field }) => (
                <SwitchAnimated
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  variant="yellow"
                  size="md"
                />
              )}
            />
          </div>
        </div>

        {/* Seção do Código do Fardo/Pacote */}
        {hasPackageTracking && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary-yellow" />
              <Label className="text-gray-200 font-medium">Código do Fardo/Pacote</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scanner/Input do Fardo */}
              <div className="space-y-2">
                {activeScanner !== 'package' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveScanner('package')}
                    className="w-full border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10"
                    disabled={isLoading}
                  >
                    <ScanLine className="h-4 w-4 mr-2" />
                    Escanear Fardo
                  </Button>
                )}

                {activeScanner === 'package' && (
                  <BarcodeInput
                    onScan={(code) => handleBarcodeScanned(code, 'package')}
                    placeholder="Escaneie o código do fardo..."
                  />
                )}

                <Input
                  {...register('package_barcode', {
                    onChange: (e) => {
                      // Ensure only numbers (optional, based on requirement)
                      e.target.value = e.target.value.replace(/\D/g, '');
                    }
                  })}
                  placeholder="Ou digite manualmente"
                  maxLength={14}
                  className={cn(
                    "font-mono bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow",
                    errors.package_barcode && "border-red-500"
                  )}
                />
                {errors.package_barcode && (
                  <p className="text-red-500 text-xs">{errors.package_barcode.message}</p>
                )}
              </div>

              {/* Configurações do Fardo */}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-200">Unidades por Fardo</Label>
                  <Input
                    type="number"
                    min="1"
                    max="999"
                    {...register('package_units', { valueAsNumber: true })}
                    placeholder="Ex: 24"
                    className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
                  />
                </div>

                <div>
                  <Label className="text-gray-200">Tipo de Embalagem</Label>
                  <Controller
                    control={control}
                    name="packaging_type"
                    render={({ field }) => (
                      <Select
                        value={(field.value as string) || 'fardo'}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-primary-yellow/30">
                          <SelectItem value="fardo" className="text-gray-200">Fardo</SelectItem>
                          <SelectItem value="caixa" className="text-gray-200">Caixa</SelectItem>
                          <SelectItem value="pacote" className="text-gray-200">Pacote</SelectItem>
                          <SelectItem value="display" className="text-gray-200">Display</SelectItem>
                          <SelectItem value="pallet" className="text-gray-200">Pallet</SelectItem>
                          <SelectItem value="bandeja" className="text-gray-200">Bandeja</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção do Código da Unidade */}
        {hasUnitTracking && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary-yellow" />
              <Label className="text-gray-200 font-medium">Código da Unidade Individual</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scanner/Input da Unidade */}
              <div className="space-y-2">
                {activeScanner !== 'unit' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveScanner('unit')}
                    className="w-full border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10"
                    disabled={isLoading}
                  >
                    <ScanLine className="h-4 w-4 mr-2" />
                    Escanear Unidade
                  </Button>
                )}

                {activeScanner === 'unit' && (
                  <BarcodeInput
                    onScan={(code) => handleBarcodeScanned(code, 'unit')}
                    placeholder="Escaneie o código da unidade..."
                  />
                )}

                <Input
                  {...register('unit_barcode', {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, '');
                    }
                  })}
                  placeholder="Ou digite manualmente"
                  maxLength={14}
                  className={cn(
                    "font-mono bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow",
                    errors.unit_barcode && "border-red-500"
                  )}
                />
                {errors.unit_barcode && (
                  <p className="text-red-500 text-xs">{errors.unit_barcode.message}</p>
                )}
              </div>

              {/* Espaço vazio para manter layout */}
              <div></div>
            </div>
          </div>
        )}

        {/* Informações de Formato */}
        {(packageBarcode || unitBarcode) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packageBarcode && (
              <div className="p-3 bg-gray-800/20 rounded border border-primary-yellow/20">
                <p className="text-gray-200 font-medium mb-1">Código do Fardo</p>
                <Badge variant="secondary" className="bg-primary-yellow/20 text-primary-yellow font-mono">
                  {packageBarcode}
                </Badge>
              </div>
            )}

            {unitBarcode && (
              <div className="p-3 bg-gray-800/20 rounded border border-primary-yellow/20">
                <p className="text-gray-200 font-medium mb-1">Código da Unidade</p>
                <Badge variant="secondary" className="bg-primary-yellow/20 text-primary-yellow font-mono">
                  {String(unitBarcode)}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};