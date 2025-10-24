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
import type { 
  BarcodeHierarchySectionProps, 
  PackagingType
} from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses, getValueClasses } from '@/core/config/theme-utils';

export const BarcodeHierarchySection: React.FC<BarcodeHierarchySectionProps> = ({
  formData,
  onInputChange,
  onBarcodeScanned,
  validation,
  isLoading = false
}) => {
  // Estados locais
  const [activeScanner, setActiveScanner] = useState<'package' | 'unit' | null>(null);

  // Handler para scanner de código de barras
  const handleBarcodeScanned = (code: string, type: 'package' | 'unit') => {
    if (type === 'package') {
      onInputChange('package_barcode', code);
    } else {
      onInputChange('unit_barcode', code);
    }

    onBarcodeScanned?.(code, type);
    setActiveScanner(null);
  };

  // Handler para mudanças nos campos
  const handleFieldChange = (field: string, value: any) => {
    onInputChange(field, value);
  };

  // Classes de estilo
  const glassClasses = getGlassCardClasses('default');
  const valueClasses = getValueClasses('md', 'gold');

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
            <SwitchAnimated
              checked={formData.has_package_tracking || false}
              onCheckedChange={(checked) => handleFieldChange('has_package_tracking', checked)}
              variant="yellow"
              size="md"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="unit_tracking" className="text-gray-200 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Rastrear por Unidade
            </Label>
            <SwitchAnimated
              checked={formData.has_unit_tracking || false}
              onCheckedChange={(checked) => handleFieldChange('has_unit_tracking', checked)}
              variant="yellow"
              size="md"
            />
          </div>
        </div>

        {/* Seção do Código do Fardo/Pacote */}
        {formData.has_package_tracking && (
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
                    variant="default"
                    glassEffect={true}
                  />
                )}
                
                <Input
                  value={formData.package_barcode || ''}
                  onChange={(e) => handleFieldChange('package_barcode', e.target.value.replace(/\D/g, ''))}
                  placeholder="Ou digite manualmente"
                  maxLength={14}
                  className="font-mono bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
                />
              </div>

              {/* Configurações do Fardo */}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-200">Unidades por Fardo</Label>
                  <Input
                    type="number"
                    min="1"
                    max="999"
                    value={formData.package_units || ''}
                    onChange={(e) => handleFieldChange('package_units', parseInt(e.target.value) || 1)}
                    placeholder="Ex: 24"
                    className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-200">Tipo de Embalagem</Label>
                  <Select 
                    value={formData.packaging_type || 'fardo'} 
                    onValueChange={(value) => onInputChange('packaging_type', value)}
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção do Código da Unidade */}
        {formData.has_unit_tracking && (
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
                    variant="default"
                    glassEffect={true}
                  />
                )}
                
                <Input
                  value={formData.unit_barcode || ''}
                  onChange={(e) => handleFieldChange('unit_barcode', e.target.value.replace(/\D/g, ''))}
                  placeholder="Ou digite manualmente"
                  maxLength={14}
                  className="font-mono bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
                />
              </div>

              {/* Espaço vazio para manter layout */}
              <div></div>
            </div>
          </div>
        )}



        {/* Informações de Formato */}
        {(formData.package_barcode || formData.unit_barcode) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.package_barcode && (
              <div className="p-3 bg-gray-800/20 rounded border border-primary-yellow/20">
                <p className="text-gray-200 font-medium mb-1">Código do Fardo</p>
                <Badge variant="secondary" className="bg-primary-yellow/20 text-primary-yellow font-mono">
                  {formData.package_barcode}
                </Badge>
              </div>
            )}
            
            {formData.unit_barcode && (
              <div className="p-3 bg-gray-800/20 rounded border border-primary-yellow/20">
                <p className="text-gray-200 font-medium mb-1">Código da Unidade</p>
                <Badge variant="secondary" className="bg-primary-yellow/20 text-primary-yellow font-mono">
                  {formData.unit_barcode}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};