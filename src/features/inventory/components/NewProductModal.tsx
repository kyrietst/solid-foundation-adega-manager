/**
 * NewProductModal.tsx - Modal para cadastro de novos produtos
 * Layout COMPACTO: 3 colunas para evitar scroll
 * Design: Estilo FormDialog (mesmo do modal de Movimentação)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
import type { ProductFormData } from '@/core/types/inventory.types';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';
import { ProductPricingCard } from '@/features/inventory/components/product-form/ProductPricingCard';
import { ProductFiscalCard } from '@/features/inventory/components/product-form/ProductFiscalCard';
import { useToast } from '@/shared/hooks/common/use-toast';
import { supabase } from '@/core/api/supabase/client';
import { TablesInsert } from '@/core/types/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSaoPauloTimestamp } from '@/shared/hooks/common/use-brasil-timezone';
import { getGlassInputClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';
import {
  Package,
  ScanLine,
  Tag,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';

import { sanitizeFiscalCode } from '@/features/inventory/utils/fiscal-sanitizers';
import { useProductFormLogic, ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';

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
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);

  // Mutação de criação
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const productData: TablesInsert<'products'> = {
        name: data.name,
        category: data.category,
        barcode: data.barcode || null,
        package_barcode: data.package_barcode || null,
        units_per_package: data.package_units || 1,
        has_package_tracking: data.has_package_tracking || false,
        has_unit_tracking: true, // FORCE UNIT TRACKING
        price: data.price,
        package_price: (data.package_price || 0) > 0 ? data.package_price : null,
        cost_price: (data.cost_price || 0) > 0 ? data.cost_price : null,
        supplier: data.supplier === 'none' || !data.supplier ? null : data.supplier,
        volume_ml: (data.volume_ml || 0) > 0 ? data.volume_ml : null,
        stock_packages: 0,
        stock_units_loose: 0,
        turnover_rate: 'medium',
        // Fiscal data
        ncm: data.ncm || null,
        cest: data.cest || null,
        cfop: data.cfop || null,
        origin: data.origin ? String(data.origin) : null,
        created_at: getSaoPauloTimestamp(),
      };

      // Use as any to bypass complex overload mismatch while keeping loose typing on the variable itself
      const { data: result, error } = await supabase.from('products').insert(productData as any).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
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
      await createProductMutation.mutateAsync(data);
    },
    onSuccess,
    onClose
  });

  // Fetch de categorias e fornecedores
  const fetchCategoriesAndSuppliers = useCallback(async () => {
    try {
      const { data: categoriesData, error: catErr } = await supabase.from('categories').select('name').filter('is_active', 'eq', true).order('name');
      if (!catErr && categoriesData) {
        setCategories((categoriesData as { name: string }[]).map((c) => c.name));
      }
      const { data: suppliersData } = await supabase.from('products').select('supplier').not('supplier', 'is', null).filter('supplier', 'neq', '');
      if (suppliersData) {
        const suppliersList = (suppliersData as { supplier: string }[]).map((s) => s.supplier);
        setSuppliers([...new Set(suppliersList)].sort());
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchCategoriesAndSuppliers();
  }, [isOpen, fetchCategoriesAndSuppliers]);

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
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="ADICIONAR PRODUTO"
      description="Cadastre um novo produto no sistema"
      onSubmit={handleSubmit}
      submitLabel={isSubmitting ? 'Cadastrando...' : 'Adicionar Produto'}
      cancelLabel="Cancelar"
      loading={isSubmitting}
      size="full"
      variant="premium"
      glassEffect={true}
      className="max-w-7xl"
    >
      <Form {...form}>
        {/* Layout compacto em 3 colunas para evitar scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">

          {/* ========================================== */}
          {/* COLUNA 1 - Identificação */}
          {/* ========================================== */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              <Tag className="h-4 w-4 text-primary-yellow" />
              Identificação
            </h3>

            {/* Nome */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📦 Nome do Produto *</label>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Ex: Cerveja Heineken 350ml" {...field} className={cn(getGlassInputClasses('form'), 'h-9 text-sm')} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📂 Categoria *</label>
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className={cn(getGlassInputClasses('form'), 'h-9 text-sm')}>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">🧴 Volume (ml)</label>
                <FormField control={form.control} name="volume_ml" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" min="0" placeholder="350" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={cn(getGlassInputClasses('form'), 'h-9 text-sm')} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">🚚 Fornecedor</label>
                <FormField control={form.control} name="supplier" render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger className={cn(getGlassInputClasses('form'), 'h-9 text-sm')}>
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
              <label className="block text-xs font-medium mb-1 text-gray-400">🔖 Código de Barras</label>
              {activeScanner !== 'main' ? (
                <Button type="button" variant="outline" onClick={() => setActiveScanner('main')} className="w-full h-9 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10" disabled={isSubmitting}>
                  <ScanLine className="h-3 w-3 mr-1.5" /> Escanear
                </Button>
              ) : (
                <BarcodeInput onScan={handleMainBarcodeScanned} placeholder="Escaneie..." className="w-full" />
              )}
              <FormField control={form.control} name="barcode" render={({ field }) => (
                <FormItem className="mt-1">
                  <FormControl>
                    <Input placeholder="Ou digite" {...field} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 14) field.onChange(v); }} maxLength={14} className={cn(getGlassInputClasses('form'), 'h-9 text-sm font-mono')} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>
          </div>

          {/* ========================================== */}
          {/* COLUNA 2 - Venda (Fardo) */}
          {/* ========================================== */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              <ShoppingCart className="h-4 w-4 text-primary-yellow" />
              Venda em Fardo
            </h3>

            {/* Toggle Venda de Fardo */}
            <div className="flex items-center justify-between rounded-lg border border-gray-700 p-3 bg-gray-800/30">
              <div>
                <span className="text-sm text-gray-200 font-medium flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary-yellow" />
                  Vender em Fardo?
                </span>
                <p className="text-xs text-gray-500">Cliente leva fardo fechado</p>
              </div>
              <FormField control={form.control} name="has_package_tracking" render={({ field }) => (
                <FormControl>
                  <SwitchAnimated checked={field.value} onCheckedChange={field.onChange} variant="yellow" size="sm" />
                </FormControl>
              )} />
            </div>

            {/* Campos de Fardo (condicional) */}
            {hasPackageTracking && (
              <div className="space-y-3 p-3 rounded-lg bg-gray-800/20 border border-gray-700/50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">🔢 Unid/Fardo</label>
                    <FormField control={form.control} name="package_units" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" min="1" max="999" placeholder="24" {...field} onChange={e => field.onChange(Number(e.target.value))} className={cn(getGlassInputClasses('form'), 'h-9 text-sm')} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">💰 Preço Fardo (R$)</label>
                    <FormField control={form.control} name="package_price" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={cn(getGlassInputClasses('form'), 'h-9 text-sm')} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Código do Fardo */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-400">🔖 Código do Fardo</label>
                  {activeScanner !== 'package' ? (
                    <Button type="button" variant="outline" onClick={() => setActiveScanner('package')} className="w-full h-9 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10" disabled={isSubmitting}>
                      <ScanLine className="h-3 w-3 mr-1.5" /> Escanear Fardo
                    </Button>
                  ) : (
                    <BarcodeInput onScan={handlePackageBarcodeScanned} placeholder="Escaneie..." className="w-full" />
                  )}
                  <FormField control={form.control} name="package_barcode" render={({ field }) => (
                    <FormItem className="mt-1">
                      <FormControl>
                        <Input placeholder="Ou digite" {...field} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 14) field.onChange(v); }} maxLength={14} className={cn(getGlassInputClasses('form'), 'h-9 text-sm font-mono')} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}

            {/* Fisco / Tributação */}
            <ProductFiscalCard
              formData={form.watch() as unknown as ProductFormData}
              onInputChange={(field, value) => {
                if (field === 'ncm' || field === 'cest' || field === 'cfop') {
                  form.setValue(field as any, sanitizeFiscalCode(value));
                } else {
                  form.setValue(field as any, value);
                }
              }}
              glassEffect={false}
              fieldErrors={form.formState.errors}
            />
          </div>

          {/* ========================================== */}
          {/* COLUNA 3 - Precificação */}
          {/* ========================================== */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              <DollarSign className="h-4 w-4 text-primary-yellow" />
              Precificação
            </h3>

            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              💵 Preços e Margens
            </h4>

            <ProductPricingCard
              formData={pricingFormData}
              calculations={calculations}
              fieldErrors={{}}
              onInputChange={(field, value) => form.setValue(field as any, value as any)}
              onMarginChange={calculations.handleMarginChange}
              onCostPriceChange={calculations.handleCostPriceChange}
              onPriceChange={calculations.handlePriceChange}
              variant="subtle"
              glassEffect={false}
            />
          </div>
        </div>
      </Form>
    </FormDialog>
  );
};

export default NewProductModal;