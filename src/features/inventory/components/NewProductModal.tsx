/**
 * NewProductModal.tsx - Modal para cadastro de novos produtos
 * Layout COMPACTO: 3 colunas para evitar scroll
 * Design: Estilo FormDialog (mesmo do modal de Movimentação)
 */

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/primitives/sheet";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import { Button } from '@/shared/ui/primitives/button';
import {
  Package,
  Tag,
  DollarSign,
  ShoppingCart,
  ScanLine
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/primitives/collapsible';

import { useProductFormLogic } from '@/features/inventory/hooks/useProductFormLogic';
import { useProductOperations } from '@/features/inventory/hooks/useProductOperations';
import { useProductResources } from '@/features/inventory/hooks/useProductResources';
import { useToast } from '@/shared/hooks/common/use-toast';
import { getGlassInputClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';

import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';
import { ProductPricingCard } from '@/features/inventory/components/product-form/ProductPricingCard';
import { ProductFiscalCard } from '@/features/inventory/components/product-form/ProductFiscalCard';
import { ChevronDown, ReceiptText } from 'lucide-react';

// ---------------------------------------------------------------------------
// Component Implementation
// ---------------------------------------------------------------------------

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  // Categories and Suppliers are now handled by hooks
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);

  // Mutação de criação
  const { createProduct } = useProductOperations(() => {
    // Invalidate queries handled in hook
  });

  const { form, handleSubmit, isSubmitting, calculations } = useProductFormLogic({
    mode: 'create',
    onSubmit: async (data) => {
      // Validation logic preserved from original component
      if (data.barcode && !/^[0-9]{8,14}$/.test(data.barcode)) {
        toast({ title: '❌ Erro de validação', description: 'Código de barras inválido', variant: 'destructive' });
        throw new Error('Código de barras inválido');
      }
      if (data.package_barcode && !/^[0-9]{8,14}$/.test(data.package_barcode)) {
        toast({ title: '❌ Erro de validação', description: 'Código de barras do pacote inválido', variant: 'destructive' });
        throw new Error('Código de barras do pacote inválido');
      }
      if (data.has_package_tracking && !data.package_units) {
        toast({ title: '❌ Erro de validação', description: 'Unidades por pacote são obrigatórias', variant: 'destructive' });
        throw new Error('Unidades por pacote obrigatórias');
      }
      await createProduct(data);
    },
    onSuccess,
    onClose
  });

  // Fetch de categorias e fornecedores
  const { categories, suppliers } = useProductResources(isOpen);

  // Handlers
  const handleClose = () => {
    if (isSubmitting) return;
    form.reset();
    setActiveScanner(null);
    onClose();
  };

  // Barcode handlers
  const handleBarcodeScanned = async (code: string, type: 'main' | 'package') => {
    const current = form.getValues();
    const duplicate = type !== 'main' && current.barcode === code ? 'principal' : type !== 'package' && current.package_barcode === code ? 'pacote' : null;
    if (duplicate) {
      toast({ title: '⚠️ Código duplicado', description: `Este código já está no campo ${duplicate}`, variant: 'destructive' });
      setActiveScanner(null);
      return;
    }
    if (type === 'main') form.setValue('barcode', code);
    else form.setValue('package_barcode', code);
    setActiveScanner(null);
    toast({ title: '✅ Código escaneado', description: `Código ${type === 'main' ? 'principal' : 'do pacote'} registrado: ${code}`, variant: 'default' });
  };

  const handleMainBarcodeScanned = async (code: string) => await handleBarcodeScanned(code, 'main');
  const handlePackageBarcodeScanned = async (code: string) => await handleBarcodeScanned(code, 'package');

  const pricingFormData = {
    price: form.watch('price'),
    cost_price: form.watch('cost_price') || 0,
    margin_percent: form.watch('margin_percent') || 0,
    package_size: form.watch('package_units') || 1,
    package_price: form.watch('package_price') || 0,
  };

  const hasPackageTracking = form.watch('has_package_tracking');

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[900px] overflow-y-auto bg-black/95 backdrop-blur-md border-l border-white/10 p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-white/10 bg-black/50 sticky top-0 z-50 backdrop-blur-sm">
            <SheetTitle className="text-2xl font-bold text-primary-yellow flex items-center gap-2">
              <Package className="h-6 w-6" /> ADICIONAR PRODUTO
            </SheetTitle>
            <div className="text-gray-400 text-sm">Cadastre um novo produto no sistema</div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Layout compacto em 3 colunas para evitar scroll */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* ========================================== */}
                  {/* COLUNA 1 - Identificação */}
                  {/* ========================================== */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                      <Tag className="h-4 w-4 text-primary-yellow" />
                      Identificação
                    </h3>

                    {/* Nome */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">📦 Nome do Produto *</label>
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Ex: Cerveja Heineken 350ml" {...field} className={cn(getGlassInputClasses('form'), 'h-10 text-sm')} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">📂 Categoria *</label>
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger className={cn(getGlassInputClasses('form'), 'h-10 text-sm')}>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {categories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />
                    </div>

                    {/* Volume + Fornecedor lado a lado */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1.5 text-gray-400">🧴 Volume (ml)</label>
                        <FormField control={form.control} name="volume_ml" render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" min="0" placeholder="350" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={cn(getGlassInputClasses('form'), 'h-10 text-sm')} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5 text-gray-400">🚚 Fornecedor</label>
                        <FormField control={form.control} name="supplier" render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger className={cn(getGlassInputClasses('form'), 'h-10 text-sm')}>
                                  <SelectValue placeholder="Nenhum" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                <SelectItem value="none">Nenhum</SelectItem>
                                {suppliers.map(sup => (<SelectItem key={sup} value={sup}>{sup}</SelectItem>))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Código de Barras */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">🔖 Código de Barras</label>
                      {activeScanner !== 'main' ? (
                        <Button type="button" variant="outline" onClick={() => setActiveScanner('main')} className="w-full h-10 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10" disabled={isSubmitting}>
                          <ScanLine className="h-3 w-3 mr-1.5" /> Escanear
                        </Button>
                      ) : (
                        <BarcodeInput onScan={handleMainBarcodeScanned} placeholder="Escaneie..." className="w-full" />
                      )}
                      <FormField control={form.control} name="barcode" render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormControl>
                            <Input placeholder="Ou digite" {...field} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 14) field.onChange(v); }} maxLength={14} className={cn(getGlassInputClasses('form'), 'h-10 text-sm font-mono')} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* ========================================== */}
                  {/* COLUNA 2 - Venda (Fardo) */}
                  {/* ========================================== */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                      <ShoppingCart className="h-4 w-4 text-primary-yellow" />
                      Venda em Fardo
                    </h3>

                    {/* Toggle Venda de Fardo */}
                    <div className="flex items-center justify-between rounded-lg border border-gray-700 p-4 bg-gray-800/30">
                      <div>
                        <span className="text-sm text-gray-200 font-medium flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary-yellow" />
                          Vender em Fardo?
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">Cliente leva fardo fechado</p>
                      </div>
                      <FormField control={form.control} name="has_package_tracking" render={({ field }) => (
                        <FormControl>
                          <SwitchAnimated checked={field.value} onCheckedChange={field.onChange} variant="yellow" size="sm" />
                        </FormControl>
                      )} />
                    </div>

                    {/* Campos de Fardo (condicional) */}
                    {hasPackageTracking && (
                      <div className="space-y-4 p-4 rounded-lg bg-gray-800/20 border border-gray-700/50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium mb-1.5 text-gray-400">🔢 Unid/Fardo</label>
                            <FormField control={form.control} name="package_units" render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" min="1" max="999" placeholder="24" {...field} onChange={e => field.onChange(Number(e.target.value))} className={cn(getGlassInputClasses('form'), 'h-10 text-sm')} />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1.5 text-gray-400">💰 Preço Fardo (R$)</label>
                            <FormField control={form.control} name="package_price" render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={cn(getGlassInputClasses('form'), 'h-10 text-sm')} />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        {/* Código do Fardo */}
                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-gray-400">🔖 Código do Fardo</label>
                          {activeScanner !== 'package' ? (
                            <Button type="button" variant="outline" onClick={() => setActiveScanner('package')} className="w-full h-10 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10" disabled={isSubmitting}>
                              <ScanLine className="h-3 w-3 mr-1.5" /> Escanear Fardo
                            </Button>
                          ) : (
                            <BarcodeInput onScan={handlePackageBarcodeScanned} placeholder="Escaneie..." className="w-full" />
                          )}
                          <FormField control={form.control} name="package_barcode" render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormControl>
                                <Input placeholder="Ou digite" {...field} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 14) field.onChange(v); }} maxLength={14} className={cn(getGlassInputClasses('form'), 'h-10 text-sm font-mono')} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    )}

                  {/* Fisco / Tributação (Collapsible) */}
                    <Collapsible className="border border-gray-700 rounded-lg bg-gray-800/30 overflow-hidden">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <ReceiptText className="h-4 w-4 text-primary-yellow" />
                          Dados Fiscais (NFe/NFCe)
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform ui-open:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 pt-0 border-t border-gray-700/50 mt-4">
                          <ProductFiscalCard
                            glassEffect={false}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* ========================================== */}
                  {/* COLUNA 3 - Precificação */}
                  {/* ========================================== */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                      <DollarSign className="h-4 w-4 text-primary-yellow" />
                      Precificação
                    </h3>

                    <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                      💵 Preços e Margens
                    </h4>

                    <ProductPricingCard
                      calculations={calculations}
                      variant="subtle"
                      glassEffect={false}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-black/50 backdrop-blur-sm sticky bottom-0 z-50 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary-yellow text-primary-black hover:bg-primary-yellow/90 font-bold min-w-[150px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Cadastrando...</span>
                </div>
              ) : (
                'Adicionar Produto'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewProductModal;