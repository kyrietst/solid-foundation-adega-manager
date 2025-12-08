/**
 * NewProductModal.tsx - Modal para cadastro de novos produtos
 * Layout COMPACTO: 3 colunas para evitar scroll
 * Design: Estilo FormDialog (mesmo do modal de Movimentação)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
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
import { useToast } from '@/shared/hooks/common/use-toast';
import { supabase } from '@/core/api/supabase/client';
import { useInventoryCalculations } from '@/features/inventory/hooks/useInventoryCalculations';
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

// ---------------------------------------------------------------------------
// Schema de validação
// ---------------------------------------------------------------------------
const newProductSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(200, 'Nome deve ter no máximo 200 caracteres'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  price: z.number({ invalid_type_error: 'Preço deve ser um número' }).min(0.01, 'Preço deve ser maior que 0'),
  barcode: z.string().optional().or(z.literal('')).refine(val => !val || /^[0-9]{8,14}$/.test(val), { message: 'Código de barras deve ter entre 8 e 14 dígitos numéricos' }),
  supplier: z.string().optional().or(z.literal('')),
  volume_ml: z.number({ invalid_type_error: 'Volume deve ser um número' }).min(0, 'Volume deve ser maior ou igual a 0').default(0),
  has_package_tracking: z.boolean().default(false),
  package_barcode: z.string().optional().or(z.literal('')).refine(val => !val || /^[0-9]{8,14}$/.test(val), { message: 'Código deve ter entre 8 e 14 dígitos' }),
  package_units: z.number({ invalid_type_error: 'Quantidade deve ser um número' }).min(1, 'Mínimo 1 unidade').optional().default(1),
  package_price: z.number({ invalid_type_error: 'Preço deve ser um número' }).min(0, 'Preço deve ser maior ou igual a 0').default(0),
  cost_price: z.number({ invalid_type_error: 'Custo deve ser um número' }).min(0, 'Custo deve ser maior ou igual a 0').default(0),
  margin_percent: z.number().min(0, 'Margem deve ser maior ou igual a 0').default(0),
});

type NewProductFormData = z.infer<typeof newProductSchema>;

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

  const form = useForm<NewProductFormData>({
    resolver: zodResolver(newProductSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      barcode: '',
      supplier: 'none',
      volume_ml: 0,
      has_package_tracking: false,
      package_barcode: '',
      package_units: 1,
      package_price: 0,
      cost_price: 0,
      margin_percent: 0,
    },
  });

  // Mutação de criação
  const createProductMutation = useMutation({
    mutationFn: async (data: NewProductFormData) => {
      const productData = {
        name: data.name,
        category: data.category,
        barcode: data.barcode || null,
        package_barcode: data.package_barcode || null,
        units_per_package: data.package_units || 1,
        has_package_tracking: data.has_package_tracking || false,
        price: data.price,
        package_price: data.package_price > 0 ? data.package_price : null,
        cost_price: data.cost_price > 0 ? data.cost_price : null,
        supplier: data.supplier === 'none' ? null : data.supplier,
        volume_ml: data.volume_ml > 0 ? data.volume_ml : null,
        stock_packages: 0,
        stock_units_loose: 0,
        turnover_rate: 'medium',
        created_at: getSaoPauloTimestamp(),
      };
      const { data: result, error } = await supabase.from('products').insert([productData] as any).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: '✅ Produto adicionado!', description: 'Produto cadastrado com sucesso', variant: 'default' });
      form.reset();
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({ title: '❌ Erro ao cadastrar', description: 'Não foi possível cadastrar o produto.', variant: 'destructive' });
    },
  });

  // Fetch de categorias e fornecedores
  const fetchCategoriesAndSuppliers = useCallback(async () => {
    try {
      const { data: categoriesData, error: catErr } = await supabase.from('categories').select('name').eq('is_active', true as any).order('name');
      if (!catErr && categoriesData) setCategories(categoriesData.map((c: any) => c.name));
      const { data: suppliersData } = await supabase.from('products').select('supplier').not('supplier', 'is', null as any).neq('supplier', '' as any);
      if (suppliersData) setSuppliers([...new Set(suppliersData.map((s: any) => s.supplier))].sort());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchCategoriesAndSuppliers();
  }, [isOpen, fetchCategoriesAndSuppliers]);

  // Cálculos para ProductPricingCard
  const watchedCostPrice = form.watch('cost_price');
  const watchedPrice = form.watch('price');
  const watchedPackagePrice = form.watch('package_price');
  const watchedPackageUnits = form.watch('package_units');
  const watchedMarginPercent = form.watch('margin_percent');

  const { calculations } = useInventoryCalculations({
    price: watchedPrice,
    cost_price: watchedCostPrice,
    package_price: watchedPackagePrice,
    package_size: watchedPackageUnits,
    margin_percent: watchedMarginPercent,
  });

  // Handlers
  const handleInputChange = useCallback((field: string, value: string | number) => {
    form.setValue(field as keyof NewProductFormData, value as never);
  }, []);

  const handleMarginChange = useCallback((margin: number) => {
    form.setValue('margin_percent', margin);
    const cost = form.getValues('cost_price');
    if (cost > 0 && margin > 0) {
      const newPrice = Math.round(cost * (1 + margin / 100) * 100) / 100;
      form.setValue('price', newPrice);
    }
  }, []);

  const handleCostPriceChange = useCallback((costPrice: number) => {
    form.setValue('cost_price', costPrice);
    const margin = form.getValues('margin_percent');
    if (margin > 0) {
      const newPrice = Math.round(costPrice * (1 + margin / 100) * 100) / 100;
      form.setValue('price', newPrice);
    } else {
      const price = form.getValues('price');
      if (price > 0 && costPrice > 0) {
        const newMargin = Math.round(((price - costPrice) / costPrice) * 100 * 100) / 100;
        form.setValue('margin_percent', newMargin);
      }
    }
  }, []);

  const handlePriceChange = useCallback((price: number) => {
    form.setValue('price', price);
    const cost = form.getValues('cost_price');
    if (cost > 0 && price > 0) {
      const newMargin = Math.round(((price - cost) / cost) * 100 * 100) / 100;
      form.setValue('margin_percent', newMargin);
    }
  }, []);

  const handleFormSubmit = async () => {
    const data = form.getValues();
    if (data.barcode && !/^[0-9]{8,14}$/.test(data.barcode)) {
      toast({ title: '❌ Erro de validação', description: 'Código de barras inválido', variant: 'destructive' });
      return;
    }
    if (data.package_barcode && !/^[0-9]{8,14}$/.test(data.package_barcode)) {
      toast({ title: '❌ Erro de validação', description: 'Código de barras do pacote inválido', variant: 'destructive' });
      return;
    }
    if (data.has_package_tracking && !data.package_units) {
      toast({ title: '❌ Erro de validação', description: 'Unidades por pacote são obrigatórias', variant: 'destructive' });
      return;
    }
    const isValid = await form.trigger();
    if (!isValid) return;
    await createProductMutation.mutateAsync({
      ...data,
      supplier: data.supplier === 'none' ? '' : data.supplier,
      package_price: data.package_price > 0 ? data.package_price : 0,
      cost_price: data.cost_price > 0 ? data.cost_price : 0,
      volume_ml: data.volume_ml > 0 ? data.volume_ml : 0,
    });
  };

  const handleClose = () => {
    if (createProductMutation.isPending) return;
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
    price: watchedPrice,
    cost_price: watchedCostPrice,
    margin_percent: watchedMarginPercent,
    package_size: watchedPackageUnits,
    package_price: watchedPackagePrice,
  };

  const hasPackageTracking = form.watch('has_package_tracking');

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="ADICIONAR PRODUTO"
      description="Cadastre um novo produto no sistema"
      onSubmit={handleFormSubmit}
      submitLabel={createProductMutation.isPending ? 'Cadastrando...' : 'Adicionar Produto'}
      cancelLabel="Cancelar"
      loading={createProductMutation.isPending}
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
                <Button type="button" variant="outline" onClick={() => setActiveScanner('main')} className="w-full h-9 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10" disabled={createProductMutation.isPending}>
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
                    <Button type="button" variant="outline" onClick={() => setActiveScanner('package')} className="w-full h-9 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10" disabled={createProductMutation.isPending}>
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

            {/* Espaço vazio quando toggle desativado para manter altura */}
            {!hasPackageTracking && (
              <div className="p-3 rounded-lg bg-gray-800/10 border border-dashed border-gray-700/30 text-center">
                <p className="text-xs text-gray-500">Ative o toggle acima para configurar venda de fardo</p>
              </div>
            )}
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
              onInputChange={handleInputChange}
              onMarginChange={handleMarginChange}
              onCostPriceChange={handleCostPriceChange}
              onPriceChange={handlePriceChange}
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