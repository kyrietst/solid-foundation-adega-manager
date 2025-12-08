/**
 * Card de preços e margens do produto
 * Sub-componente especializado para cálculos de preço
 * 
 * v3.7.0 - UX "Conversor de Custo": Calculadora assistida para compra em caixa/fardo
 * Single Source of Truth: cost_price SEMPRE armazena custo por UNIDADE INDIVIDUAL
 */

import React, { useId, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Badge } from '@/shared/ui/primitives/badge';
import { Separator } from '@/shared/ui/primitives/separator';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { Calculator, DollarSign, Package, HelpCircle } from 'lucide-react';
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
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
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

  // ============================================================================
  // 🧮 CALCULADORA ASSISTIDA: Estados locais (não vão para o banco)
  // ============================================================================
  const [isBulkPurchase, setIsBulkPurchase] = useState(false);
  const [bulkTotalCost, setBulkTotalCost] = useState<number | ''>('');
  const [bulkUnits, setBulkUnits] = useState<number | ''>(1);
  const [calculatedUnitCost, setCalculatedUnitCost] = useState<number | null>(null);

  // ============================================================================
  // 🔄 EFEITO: Calcula custo unitário quando inputs da calculadora mudam
  // ============================================================================
  const calculateAndApplyUnitCost = useCallback(() => {
    if (!isBulkPurchase) {
      setCalculatedUnitCost(null);
      return;
    }

    const totalCost = typeof bulkTotalCost === 'number' ? bulkTotalCost : 0;
    const units = typeof bulkUnits === 'number' ? bulkUnits : 0;

    // Proteção contra divisão por zero
    if (units <= 0 || totalCost <= 0) {
      setCalculatedUnitCost(null);
      return;
    }

    // Calcular custo unitário com 2 casas decimais
    const unitCost = Math.round((totalCost / units) * 100) / 100;
    setCalculatedUnitCost(unitCost);

    // Injetar no formulário principal
    if (onCostPriceChange) {
      onCostPriceChange(unitCost);
    } else {
      onInputChange('cost_price', unitCost);
    }
  }, [isBulkPurchase, bulkTotalCost, bulkUnits, onCostPriceChange, onInputChange]);

  useEffect(() => {
    calculateAndApplyUnitCost();
  }, [calculateAndApplyUnitCost]);

  // ============================================================================
  // 🔄 EFEITO: Limpar calculadora quando toggle é desativado
  // ============================================================================
  useEffect(() => {
    if (!isBulkPurchase) {
      setBulkTotalCost('');
      setBulkUnits(1);
      setCalculatedUnitCost(null);
    }
  }, [isBulkPurchase]);

  // ============================================================================
  // 🎨 HANDLERS
  // ============================================================================
  const handleCostPriceDirectChange = (value: number) => {
    // Só permite edição direta quando NÃO está em modo caixa/fardo
    if (isBulkPurchase) return;

    if (onCostPriceChange) {
      onCostPriceChange(value);
    } else {
      onInputChange('cost_price', value);
    }
  };

  return (
    <div className="space-y-3">

      {/* ============================================================================ */}
      {/* 🧮 CALCULADORA ASSISTIDA: Toggle + Campos Auxiliares */}
      {/* ============================================================================ */}
      <SensitiveData type="cost">
        <div className="space-y-4">
          {/* Toggle: Comprei em Caixa/Fardo? */}
          <div className="flex items-center justify-between rounded-lg border border-primary-yellow/30 p-3 bg-primary-yellow/5">
            <div>
              <Label className="text-sm text-gray-200 font-medium flex items-center gap-2">
                📦 Comprei em Caixa/Fardo?
              </Label>
              <p className="text-xs text-gray-500">Calcula custo unitário automaticamente</p>
            </div>
            <SwitchAnimated
              checked={isBulkPurchase}
              onCheckedChange={setIsBulkPurchase}
              variant="yellow"
              size="sm"
            />
          </div>

          {/* Campos da Calculadora (visíveis quando toggle ativado) */}
          {isBulkPurchase && (
            <div className="rounded-lg border border-blue-400/30 bg-blue-900/10 p-3 space-y-3">
              <div className="flex items-center gap-2 text-blue-300">
                <Calculator className="h-4 w-4" />
                <span className="text-xs font-medium">🧮 Calculadora</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Custo Total */}
                <div>
                  <Label htmlFor={`${formId}-bulk_total_cost`} className="text-gray-300 text-xs">
                    💰 Custo Total (R$)
                  </Label>
                  <Input
                    id={`${formId}-bulk_total_cost`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={bulkTotalCost === '' ? '' : bulkTotalCost}
                    onChange={(e) => setBulkTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="48.00"
                    className="bg-gray-800/50 border-blue-400/30 text-gray-200 focus:border-blue-400 placeholder:text-gray-500 h-9 text-sm"
                  />
                </div>

                {/* Unidades */}
                <div>
                  <Label htmlFor={`${formId}-bulk_units`} className="text-gray-300 text-xs">
                    📦 Quantas Unidades?
                  </Label>
                  <Input
                    id={`${formId}-bulk_units`}
                    type="number"
                    min="1"
                    step="1"
                    value={bulkUnits === '' ? '' : bulkUnits}
                    onChange={(e) => setBulkUnits(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                    placeholder="12"
                    className="bg-gray-800/50 border-blue-400/30 text-gray-200 focus:border-blue-400 placeholder:text-gray-500 h-9 text-sm"
                  />
                </div>
              </div>

              {calculatedUnitCost !== null && calculatedUnitCost > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-green-900/30 border border-green-400/40">
                  <Badge variant="default" className="bg-green-600 text-white text-xs">
                    ✓
                  </Badge>
                  <span className="text-green-300 font-medium text-sm">
                    R$ {calculatedUnitCost.toFixed(2)} /unidade
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Campo Principal: Preço de Custo */}
          <div>
            <Label htmlFor={`${formId}-cost_price`} className="text-gray-300 text-xs flex items-center gap-1">
              💲 Custo Unitário (R$)
            </Label>
            <Input
              id={`${formId}-cost_price`}
              type="number"
              step="0.01"
              value={formData.cost_price === 0 ? '' : formData.cost_price ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                handleCostPriceDirectChange(value);
              }}
              placeholder="0.00"
              readOnly={isBulkPurchase}
              className={cn(
                'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400 h-9 text-sm',
                fieldErrors.cost_price && 'border-accent-red',
                isBulkPurchase && 'bg-gray-700/30 cursor-not-allowed opacity-70'
              )}
            />
            {fieldErrors.cost_price && (
              <p className="text-accent-red text-xs mt-1">{fieldErrors.cost_price}</p>
            )}
          </div>
        </div>
      </SensitiveData>

      <Separator className="my-3" />

      {/* Preço de Venda e Margem */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${formId}-price`} className="text-gray-300 text-xs">
            💵 Preço de Venda *
          </Label>
          <Input
            id={`${formId}-price`}
            type="number"
            step="0.01"
            value={formData.price === 0 ? '' : formData.price ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : Number(e.target.value);
              if (onPriceChange) {
                onPriceChange(value);
              } else {
                onInputChange('price', value);
              }
            }}
            placeholder="0.00"
            required
            className={cn(
              'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400 h-9 text-sm',
              fieldErrors.price && 'border-accent-red'
            )}
          />
          {fieldErrors.price && (
            <p className="text-accent-red text-xs mt-1">{fieldErrors.price}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`${formId}-margin_percent`} className="text-gray-300 text-xs">📈 Margem (%)</Label>
          <Input
            id={`${formId}-margin_percent`}
            type="number"
            step="0.01"
            value={formData.margin_percent === 0 ? '' : formData.margin_percent ?? ''}
            onChange={(e) => onMarginChange(e.target.value === '' ? 0 : Number(e.target.value))}
            placeholder="0.00"
            className={cn(
              'bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400 h-9 text-sm',
              fieldErrors.margin_percent && 'border-accent-red'
            )}
          />
          {fieldErrors.margin_percent && (
            <p className="text-accent-red text-xs mt-1">{fieldErrors.margin_percent}</p>
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
          <div className="glass-subtle p-3 rounded-lg border border-primary-yellow/20">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-primary-yellow" />
              <span className="font-medium text-gray-100 text-sm">🧮 Lucro Estimado</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Por unidade:</span>
                <span className="font-medium text-primary-yellow">
                  R$ {calculations.unitProfitAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Por fardo:</span>
                <span className="font-medium text-primary-yellow">
                  R$ {calculations.packageProfitAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </SensitiveData>
      )}
    </div>
  );
};