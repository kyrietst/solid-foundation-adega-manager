/**
 * Modal para criação de novos lotes
 * Interface para recebimento de mercadorias com controle de validade
 */

import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, AlertTriangle, Calculator, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/primitives/dialog';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Button } from '@/shared/ui/primitives/button';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Badge } from '@/shared/ui/primitives/badge';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { useCreateBatch } from '@/features/inventory/hooks/useBatches';
import type { Product, BatchFormData } from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getValueClasses } from '@/core/config/theme-utils';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const createBatchMutation = useCreateBatch();
  
  // Estado do formulário
  const [formData, setFormData] = useState<BatchFormData>({
    product_id: product.id,
    batch_code: '',
    supplier_batch_code: '',
    manufacturing_date: '',
    expiry_date: '',
    total_packages: 1,
    total_units: product.package_units || 1,
    supplier_name: product.supplier || '',
    quality_grade: 'A',
    cost_per_unit: product.cost_price || 0,
    notes: '',
    create_units: product.has_unit_tracking || false
  });

  // Cálculos automáticos
  const [calculations, setCalculations] = useState({
    total_cost: 0,
    days_until_expiry: 0,
    shelf_life_days: 0,
    units_per_package: product.package_units || 1,
    is_valid_dates: false
  });

  // Atualizar cálculos quando formData muda
  useEffect(() => {
    const totalCost = formData.total_units * (formData.cost_per_unit || 0);
    
    let daysUntilExpiry = 0;
    let shelfLifeDays = 0;
    let isValidDates = false;
    
    if (formData.manufacturing_date && formData.expiry_date) {
      const manufDate = new Date(formData.manufacturing_date);
      const expiryDate = new Date(formData.expiry_date);
      const today = new Date();
      
      daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      shelfLifeDays = Math.ceil((expiryDate.getTime() - manufDate.getTime()) / (1000 * 60 * 60 * 24));
      isValidDates = expiryDate > manufDate && daysUntilExpiry > 0;
    }

    setCalculations({
      total_cost: totalCost,
      days_until_expiry: daysUntilExpiry,
      shelf_life_days: shelfLifeDays,
      units_per_package: product.package_units || 1,
      is_valid_dates: isValidDates
    });
  }, [formData, product.package_units]);

  // Handler para mudanças nos campos
  const handleFieldChange = (field: keyof BatchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler para mudança de pacotes (calcular unidades automaticamente)
  const handlePackagesChange = (packages: number) => {
    const unitsPerPackage = product.package_units || 1;
    handleFieldChange('total_packages', packages);
    handleFieldChange('total_units', packages * unitsPerPackage);
  };

  // Handler para submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!calculations.is_valid_dates) {
      return;
    }

    try {
      await createBatchMutation.mutateAsync(formData);
      onClose();
      
      // Resetar formulário
      setFormData({
        product_id: product.id,
        batch_code: '',
        supplier_batch_code: '',
        manufacturing_date: '',
        expiry_date: '',
        total_packages: 1,
        total_units: product.package_units || 1,
        supplier_name: product.supplier || '',
        quality_grade: 'A',
        cost_per_unit: product.cost_price || 0,
        notes: '',
        create_units: product.has_unit_tracking || false
      });
    } catch (error) {
      console.error('Erro ao criar lote:', error);
    }
  };

  const valueClasses = getValueClasses('md', 'gold');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-primary-yellow/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-100">
            <Package className="h-5 w-5 text-primary-yellow" />
            Criar Novo Lote - {product.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Informações do Produto */}
          <div className="p-4 bg-gray-800/30 rounded-lg border border-primary-yellow/20">
            <h3 className="text-gray-200 font-medium mb-3">Produto Selecionado</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Categoria</p>
                <p className="text-gray-200">{product.category}</p>
              </div>
              <div>
                <p className="text-gray-400">Estoque Atual</p>
                <p className={cn(valueClasses)}>{product.stock_quantity} {product.unit_type}</p>
              </div>
              <div>
                <p className="text-gray-400">Unidades/Fardo</p>
                <p className={cn(valueClasses)}>{product.package_units || 1}</p>
              </div>
              <div>
                <p className="text-gray-400">Custo Padrão</p>
                <p className={cn(valueClasses)}>R$ {product.cost_price?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          {/* Identificação do Lote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batch_code" className="text-gray-200">Código do Lote *</Label>
              <Input
                id="batch_code"
                value={formData.batch_code}
                onChange={(e) => handleFieldChange('batch_code', e.target.value)}
                placeholder="Ex: LOTE2024001"
                required
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
              />
            </div>
            
            <div>
              <Label htmlFor="supplier_batch_code" className="text-gray-200">Código do Fornecedor</Label>
              <Input
                id="supplier_batch_code"
                value={formData.supplier_batch_code}
                onChange={(e) => handleFieldChange('supplier_batch_code', e.target.value)}
                placeholder="Código do fornecedor (opcional)"
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturing_date" className="text-gray-200">Data de Fabricação *</Label>
              <Input
                id="manufacturing_date"
                type="date"
                value={formData.manufacturing_date}
                onChange={(e) => handleFieldChange('manufacturing_date', e.target.value)}
                required
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
              />
            </div>
            
            <div>
              <Label htmlFor="expiry_date" className="text-gray-200">Data de Validade *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleFieldChange('expiry_date', e.target.value)}
                required
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
              />
            </div>
          </div>

          {/* Alertas de Data */}
          {formData.manufacturing_date && formData.expiry_date && (
            <Alert className={cn(
              "border",
              calculations.is_valid_dates
                ? "border-accent-green/50 bg-accent-green/10"
                : "border-accent-red/50 bg-accent-red/10"
            )}>
              <div className="flex items-center gap-2">
                {calculations.is_valid_dates ? (
                  <CheckCircle2 className="h-4 w-4 text-accent-green" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-accent-red" />
                )}
                <AlertDescription className={cn(
                  calculations.is_valid_dates ? "text-accent-green" : "text-accent-red"
                )}>
                  {calculations.is_valid_dates ? (
                    `Validade: ${calculations.shelf_life_days} dias. Vence em ${calculations.days_until_expiry} dias.`
                  ) : (
                    "Datas inválidas. A validade deve ser posterior à fabricação e futura."
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Quantidades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="total_packages" className="text-gray-200">Número de Fardos *</Label>
              <Input
                id="total_packages"
                type="number"
                min="1"
                value={formData.total_packages}
                onChange={(e) => handlePackagesChange(parseInt(e.target.value) || 1)}
                required
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
              />
            </div>
            
            <div>
              <Label htmlFor="total_units" className="text-gray-200">Total de Unidades *</Label>
              <Input
                id="total_units"
                type="number"
                min="1"
                value={formData.total_units}
                onChange={(e) => handleFieldChange('total_units', parseInt(e.target.value) || 1)}
                required
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
              />
              <p className="text-xs text-gray-400 mt-1">
                Calculado: {formData.total_packages} × {calculations.units_per_package} = {formData.total_packages * calculations.units_per_package}
              </p>
            </div>

            <div>
              <Label htmlFor="cost_per_unit" className="text-gray-200">Custo por Unidade</Label>
              <Input
                id="cost_per_unit"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_per_unit}
                onChange={(e) => handleFieldChange('cost_per_unit', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
              />
            </div>
          </div>

          {/* Resumo de Custos */}
          <div className="p-4 bg-gray-800/20 rounded-lg border border-primary-yellow/20">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-primary-yellow" />
              <h3 className="text-gray-200 font-medium">Resumo Financeiro</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className={cn(valueClasses, "text-lg font-bold")}>R$ {calculations.total_cost.toFixed(2)}</p>
                <p className="text-xs text-gray-400">Custo Total</p>
              </div>
              <div>
                <p className={cn(valueClasses, "text-lg font-bold")}>R$ {(formData.cost_per_unit || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-400">Por Unidade</p>
              </div>
              <div>
                <p className={cn(valueClasses, "text-lg font-bold")}>
                  R$ {((formData.cost_per_unit || 0) * calculations.units_per_package).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">Por Fardo</p>
              </div>
              <div>
                <p className={cn(valueClasses, "text-lg font-bold")}>{formData.total_units}</p>
                <p className="text-xs text-gray-400">Unidades</p>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier_name" className="text-gray-200">Fornecedor</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => handleFieldChange('supplier_name', e.target.value)}
                placeholder="Nome do fornecedor"
                className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
              />
            </div>
            
            <div>
              <Label htmlFor="quality_grade" className="text-gray-200">Qualidade</Label>
              <Select 
                value={formData.quality_grade} 
                onValueChange={(value) => handleFieldChange('quality_grade', value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-primary-yellow/30">
                  <SelectItem value="A" className="text-gray-200">A - Primeira (Sai primeiro)</SelectItem>
                  <SelectItem value="B" className="text-gray-200">B - Segunda</SelectItem>
                  <SelectItem value="C" className="text-gray-200">C - Terceira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rastreamento de Unidades */}
          {(product.has_unit_tracking || product.has_package_tracking) && (
            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-lg border border-primary-yellow/20">
              <div>
                <Label htmlFor="create_units" className="text-gray-200 font-medium">
                  Criar Unidades Rastreáveis
                </Label>
                <p className="text-sm text-gray-400">
                  Gerar códigos individuais para rastreamento FEFO granular
                </p>
              </div>
              <SwitchAnimated
                checked={formData.create_units}
                onCheckedChange={(checked) => handleFieldChange('create_units', checked)}
                variant="yellow"
                size="md"
              />
            </div>
          )}

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-gray-200">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Observações sobre o lote, condições de transporte, etc."
              rows={3}
              className="bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow"
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!calculations.is_valid_dates || createBatchMutation.isPending}
              className="bg-primary-yellow text-gray-900 hover:bg-primary-yellow/90 disabled:opacity-50"
            >
              {createBatchMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" variant="dark" className="mr-2" />
                  Criando Lote...
                </>
              ) : (
                'Criar Lote'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};