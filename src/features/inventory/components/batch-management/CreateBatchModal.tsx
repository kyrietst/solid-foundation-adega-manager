/**
 * Modal para criação de novos lotes
 * Interface para recebimento de mercadorias com controle de validade
 * Design: Tactical Stitch (Standardized)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Calendar,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Factory,
  DollarSign,
  TrendingUp,
  Info
} from 'lucide-react';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Button } from '@/shared/ui/primitives/button';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { useCreateBatch } from '@/features/inventory/hooks/useBatches';
import type { Product } from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getValueClasses } from '@/core/config/theme-utils';
import { Dialog, DialogPortal, DialogOverlay } from '@/shared/ui/primitives/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toast } from "sonner"; // New import

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

interface BatchFormData {
  product_id: string;
  batch_code: string;
  supplier_batch_code: string;
  manufacturing_date: string;
  expiry_date: string;
  total_packages: number;
  total_units: number;
  supplier_name: string;
  quality_grade: 'A' | 'B' | 'C';
  cost_per_unit: number;
  notes: string;
  create_units: boolean;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const createBatchMutation = useCreateBatch();

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

  const [calculations, setCalculations] = useState({
    total_cost: 0,
    days_until_expiry: 0,
    shelf_life_days: 0,
    units_per_package: product.package_units || 1,
    is_valid_dates: false
  });

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

  const handleFieldChange = (field: keyof BatchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackagesChange = (packages: number) => {
    const unitsPerPackage = product.package_units || 1;
    handleFieldChange('total_packages', packages);
    handleFieldChange('total_units', packages * unitsPerPackage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!calculations.is_valid_dates) {
      toast.error("Erro de Validação", {
        description: "As datas de fabricação e vencimento são inválidas. Verifique se a data de vencimento é posterior à de fabricação e está no futuro.",
      });
      return;
    }

    try {
      await createBatchMutation.mutateAsync(formData);
      toast.success("Lote Criado", {
        description: `O lote ${formData.batch_code} para ${product.name} foi recebido com sucesso.`,
      });
      onClose();

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
      toast.error("Erro ao Criar Lote", {
        description: "Não foi possível registrar o recebimento do lote. Tente novamente.",
      });
    }
  };

  const valueClasses = getValueClasses('md', 'gold');

  // Using primitive Dialog for full control to match standard
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
       <DialogPortal>
          <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
          <DialogPrimitive.Content
             className={cn(
               "fixed left-[50%] top-[50%] z-50 flex flex-col w-full max-w-4xl translate-x-[-50%] translate-y-[-50%]",
               "bg-zinc-950 border border-white/5 shadow-2xl rounded-xl overflow-hidden duration-200",
               "data-[state=open]:animate-in data-[state=closed]:animate-out",
               "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
               "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
               "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
               "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
             )}
          >
             {/* HEADER */}
             <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md">
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-3">
                      <Factory className="h-6 w-6 text-amber-500" />
                      <DialogPrimitive.Title className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                         NOVO LOTE RECEBIDO
                      </DialogPrimitive.Title>
                   </div>
                   <div className="flex items-center gap-2 ml-9">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                         Inbound Processing
                      </span>
                      <span className="h-1 w-1 rounded-full bg-zinc-700" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">
                         {product.name}
                      </span>
                   </div>
                </div>
                <button
                   onClick={onClose}
                   className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                >
                   <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
                </button>
             </div>

             {/* CONTENT - SCROLLABLE */}
             <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20 max-h-[70vh]">
               <form id="create-batch-form" onSubmit={handleSubmit} className="space-y-8">

                 {/* Product Info Card */}
                 <div className="p-5 bg-zinc-900/50 rounded-xl border border-white/5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Categoria</span>
                          <span className="text-sm font-medium text-white">{product.category}</span>
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Estoque Atual</span>
                          <span className={cn(valueClasses, "text-sm")}>{product.stock_quantity} {product.unit_type}</span>
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Config. Fardo</span>
                          <span className={cn(valueClasses, "text-sm")}>{product.package_units || 1} un/pct</span>
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Custo Ref.</span>
                          <span className={cn(valueClasses, "text-sm")}>R$ {product.cost_price?.toFixed(2) || '0.00'}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">

                       {/* Identificação */}
                       <div className="space-y-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <Package className="h-3 w-3 text-amber-500" /> Identificação
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Código Lote</Label>
                                <Input
                                  value={formData.batch_code}
                                  onChange={(e) => handleFieldChange('batch_code', e.target.value)}
                                  placeholder="LOTE..."
                                  className="bg-zinc-950 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 h-10"
                                  required
                                />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Ref. Fornecedor</Label>
                                <Input
                                  value={formData.supplier_batch_code}
                                  onChange={(e) => handleFieldChange('supplier_batch_code', e.target.value)}
                                  placeholder="Opcional"
                                  className="bg-zinc-950 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 h-10"
                                />
                             </div>
                          </div>
                       </div>

                       {/* Datas */}
                       <div className="space-y-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <Calendar className="h-3 w-3 text-amber-500" /> Validade & Prazos
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Fabricação</Label>
                                <Input
                                  type="date"
                                  value={formData.manufacturing_date}
                                  onChange={(e) => handleFieldChange('manufacturing_date', e.target.value)}
                                  className="bg-zinc-950 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 h-10"
                                  required
                                />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Vencimento</Label>
                                <Input
                                  type="date"
                                  value={formData.expiry_date}
                                  onChange={(e) => handleFieldChange('expiry_date', e.target.value)}
                                  className="bg-zinc-950 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 h-10"
                                  required
                                />
                             </div>
                          </div>

                          {/* Data Validation Feedback */}
                          {formData.manufacturing_date && formData.expiry_date && (
                            <div className={cn(
                               "rounded-lg p-3 border",
                               calculations.is_valid_dates
                                  ? "bg-emerald-500/10 border-emerald-500/20"
                                  : "bg-rose-500/10 border-rose-500/20"
                            )}>
                               <div className="flex items-center gap-2 mb-1">
                                  {calculations.is_valid_dates ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                                  )}
                                  <span className={cn(
                                     "text-xs font-bold uppercase tracking-wide",
                                     calculations.is_valid_dates ? "text-emerald-500" : "text-rose-500"
                                  )}>
                                     {calculations.is_valid_dates ? "Datas Válidas" : "Datas Inválidas"}
                                  </span>
                               </div>
                               {calculations.is_valid_dates && (
                                  <p className="text-xs text-zinc-400 ml-6">
                                     Shelf Life: <span className="text-white font-mono">{calculations.shelf_life_days}d</span> •
                                     Expira em: <span className="text-white font-mono">{calculations.days_until_expiry}d</span>
                                  </p>
                               )}
                            </div>
                          )}
                       </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">

                       {/* Quantidades */}
                       <div className="space-y-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <Calculator className="h-3 w-3 text-amber-500" /> Volume
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Qtd. Fardos</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={formData.total_packages}
                                  onChange={(e) => handlePackagesChange(parseInt(e.target.value) || 1)}
                                  className="bg-zinc-950 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 h-10 font-mono"
                                  required
                                />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Total Unidades</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={formData.total_units}
                                  onChange={(e) => handleFieldChange('total_units', parseInt(e.target.value) || 1)}
                                  className="bg-zinc-950 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 h-10 font-mono"
                                  required
                                />
                             </div>
                          </div>

                          <div className="space-y-2">
                             <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Custo Unitário (R$)</Label>
                             <Input
                               type="number"
                               step="0.01"
                               value={formData.cost_per_unit === 0 ? '' : formData.cost_per_unit}
                               onChange={(e) => handleFieldChange('cost_per_unit', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                               className="bg-zinc-950 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 h-10 font-mono"
                               placeholder="0.00"
                             />
                          </div>

                          {/* Cost Summary Stub */}
                          <div className="bg-zinc-900 border border-white/5 rounded-lg p-3 flex justify-between items-center px-4">
                             <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Custo Total Previsto</span>
                             <span className="text-amber-500 font-mono font-bold">R$ {calculations.total_cost.toFixed(2)}</span>
                          </div>
                       </div>

                       {/* Extra Info */}
                       <div className="space-y-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <Package className="h-3 w-3 text-amber-500" /> Atributos
                          </h3>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Fornecedor</Label>
                                <Input
                                  value={formData.supplier_name}
                                  onChange={(e) => handleFieldChange('supplier_name', e.target.value)}
                                  className="bg-zinc-950 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 h-10"
                                />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Qualidade</Label>
                                <Select
                                  value={formData.quality_grade}
                                  onValueChange={(value) => handleFieldChange('quality_grade', value)}
                                >
                                  <SelectTrigger className="bg-zinc-950 border-white/10 text-white h-10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border-zinc-700">
                                    <SelectItem value="A">Grade A (Premium)</SelectItem>
                                    <SelectItem value="B">Grade B (Standard)</SelectItem>
                                    <SelectItem value="C">Grade C (Economy)</SelectItem>
                                  </SelectContent>
                                </Select>
                             </div>
                          </div>

                          {(product.has_unit_tracking || product.has_package_tracking) && (
                             <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/5 rounded-lg">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Gerar Rastreio Unitário</Label>
                                <SwitchAnimated
                                  checked={formData.create_units}
                                  onCheckedChange={(checked) => handleFieldChange('create_units', checked)}
                                  variant="yellow"
                                  size="sm"
                                />
                             </div>
                          )}
                       </div>

                    </div>
                 </div>

                 <div className="pt-2">
                    <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-2 block">Observações de Recebimento</Label>
                    <Textarea
                       value={formData.notes}
                       onChange={(e) => handleFieldChange('notes', e.target.value)}
                       className="bg-zinc-950 border-white/10 text-white min-h-[80px]"
                       placeholder="Condições de transporte, avarias, etc..."
                    />
                 </div>
               </form>
             </div>

             {/* FOOTER */}
             <div className="border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-8 py-6 flex justify-end gap-3 sticky bottom-0 z-50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-full px-6 text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button
                   type="submit"
                   form="create-batch-form"
                   disabled={!calculations.is_valid_dates || createBatchMutation.isPending}
                   className="rounded-full px-8 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all"
                >
                   {createBatchMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processando...
                      </>
                   ) : (
                      'CONFIRMAR RECEBIMENTO'
                   )}
                </Button>
             </div>

          </DialogPrimitive.Content>
       </DialogPortal>
    </Dialog>
  );
};