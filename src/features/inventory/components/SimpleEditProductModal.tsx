/**
 * SimpleEditProductModal.tsx - Modal para edição de produtos
 * Refatorado para espelhar NewProductModal: Layout 3 colunas, FormDialog, ProductPricingCard
 *
 * @author Adega Manager Team
 * @version 3.0.0 - Layout widescreen espelhando NewProductModal
 */

import React, { useState, useEffect } from 'react';
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
import { cn } from '@/core/config/utils';
import { getGlassInputClasses } from '@/core/config/theme-utils';
import { supabase } from '@/core/api/supabase/client';
import { useInventoryCalculations } from '@/features/inventory/hooks/useInventoryCalculations';
import {
  Package,
  Tag,
  ShoppingCart,
  DollarSign,
  ScanLine,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import type { Product } from '@/core/types/inventory.types';
import { DeleteProductModal } from './DeleteProductModal';

// Schema simplificado - apenas campos essenciais
const simpleEditProductSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200, 'Nome deve ter no máximo 200 caracteres'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  price: z.number({ invalid_type_error: 'Preço de venda deve ser um número' }).min(0.01, 'Preço de venda deve ser maior que 0'),
  barcode: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true;
    return /^[0-9]{8,14}$/.test(val);
  }, { message: 'Código de barras deve ter entre 8 e 14 dígitos numéricos' }),
  supplier: z.string().optional().or(z.literal('')),
  has_package_tracking: z.boolean().default(false),
  package_barcode: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true;
    return /^[0-9]{8,14}$/.test(val);
  }, { message: 'Código de barras do pacote deve ter entre 8 e 14 dígitos numéricos' }),
  package_units: z.number({ invalid_type_error: 'Quantidade deve ser um número' }).min(1, 'Deve ter pelo menos 1 unidade por pacote').optional().default(1),
  package_price: z.number({ invalid_type_error: 'Preço do pacote deve ser um número' }).min(0.01, 'Preço do pacote deve ser maior que 0').optional().or(z.literal(0)).or(z.literal(undefined)),
  cost_price: z.number({ invalid_type_error: 'Preço de custo deve ser um número' }).min(0, 'Preço de custo deve ser maior ou igual a 0').optional().or(z.literal(0)).or(z.literal(undefined)),
  volume_ml: z.number({ invalid_type_error: 'Volume deve ser um número' }).min(1, 'Volume deve ser maior que 0').optional().or(z.literal(0)).or(z.literal(undefined)),
  margin_percent: z.number().optional(),
});

type SimpleEditProductFormData = z.infer<typeof simpleEditProductSchema>;

interface SimpleEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product: Product | null;
  onSubmit: (data: SimpleEditProductFormData) => void;
  isLoading?: boolean;
}

export const SimpleEditProductModal: React.FC<SimpleEditProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  onSubmit,
  isLoading = false,
}) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const form = useForm<SimpleEditProductFormData>({
    resolver: zodResolver(simpleEditProductSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      barcode: '',
      supplier: 'none',
      has_package_tracking: false,
      package_barcode: '',
      package_units: 1,
      package_price: undefined,
      cost_price: undefined,
      volume_ml: undefined,
      margin_percent: undefined,
    },
  });

  // Watched values para cálculos
  const watchedPrice = form.watch('price');
  const watchedCostPrice = form.watch('cost_price');
  const watchedPackagePrice = form.watch('package_price');
  const watchedPackageUnits = form.watch('package_units');
  const watchedMarginPercent = form.watch('margin_percent');
  const hasPackageTracking = form.watch('has_package_tracking');

  // Hook de cálculos
  const { calculations } = useInventoryCalculations({
    price: watchedPrice,
    cost_price: watchedCostPrice,
    package_price: watchedPackagePrice,
    package_size: watchedPackageUnits,
    margin_percent: watchedMarginPercent,
  });

  const fetchCategoriesAndSuppliers = React.useCallback(async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true as any)
        .order('name');

      if (categoriesData) {
        setCategories((categoriesData as any[]).map(item => item.name));
      }

      const { data: suppliersData } = await supabase
        .from('products')
        .select('supplier')
        .not('supplier', 'is', null)
        .neq('supplier', '' as any);

      if (suppliersData) {
        const uniqueSuppliers = [...new Set((suppliersData as any[]).map(item => item.supplier))].sort();
        setSuppliers(uniqueSuppliers);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }, []);

  // Preencher formulário quando produto for carregado
  useEffect(() => {
    if (isOpen && product) {
      form.reset({
        name: product.name || '',
        category: product.category || '',
        price: Number(product.price) || 0,
        barcode: product.barcode || '',
        supplier: product.supplier || 'none',
        has_package_tracking: product.has_package_tracking || false,
        package_barcode: product.package_barcode || '',
        package_units: product.package_units || product.units_per_package || 1,
        package_price: product.package_price ? Number(product.package_price) : undefined,
        cost_price: product.cost_price ? Number(product.cost_price) : undefined,
        volume_ml: product.volume_ml ? Number(product.volume_ml) : undefined,
        margin_percent: product.margin_percent ? Number(product.margin_percent) : undefined,
      });
      fetchCategoriesAndSuppliers();
    }
  }, [isOpen, product, form, fetchCategoriesAndSuppliers]);

  // Handlers para ProductPricingCard
  const handleInputChange = (field: string, value: number | string) => {
    form.setValue(field as keyof SimpleEditProductFormData, value);
  };

  const handleMarginChange = (newMargin: number) => {
    const costPrice = watchedCostPrice || 0;
    if (costPrice > 0) {
      const newPrice = Math.round(costPrice * (1 + newMargin / 100) * 100) / 100;
      form.setValue('margin_percent', newMargin);
      form.setValue('price', newPrice);
    }
  };

  const handleCostPriceChange = (newCostPrice: number) => {
    form.setValue('cost_price', newCostPrice);
    const price = watchedPrice || 0;
    if (newCostPrice > 0 && price > 0) {
      const newMargin = Math.round(((price - newCostPrice) / newCostPrice) * 100 * 100) / 100;
      form.setValue('margin_percent', newMargin);
    }
  };

  const handlePriceChange = (newPrice: number) => {
    form.setValue('price', newPrice);
    const costPrice = watchedCostPrice || 0;
    if (costPrice > 0 && newPrice > 0) {
      const newMargin = Math.round(((newPrice - costPrice) / costPrice) * 100 * 100) / 100;
      form.setValue('margin_percent', newMargin);
    }
  };

  const pricingFormData = {
    price: watchedPrice,
    cost_price: watchedCostPrice,
    margin_percent: watchedMarginPercent,
    package_size: watchedPackageUnits,
    package_price: watchedPackagePrice,
  };

  const handleFormSubmit = async (data: SimpleEditProductFormData) => {
    try {
      if (data.barcode && !/^[0-9]{8,14}$/.test(data.barcode)) {
        toast({ title: "❌ Erro de validação", description: "Código de barras deve ter entre 8 e 14 dígitos", variant: "destructive" });
        return;
      }
      if (data.package_barcode && !/^[0-9]{8,14}$/.test(data.package_barcode)) {
        toast({ title: "❌ Erro de validação", description: "Código de barras do pacote deve ter entre 8 e 14 dígitos", variant: "destructive" });
        return;
      }
      if (data.has_package_tracking && !data.package_units) {
        toast({ title: "❌ Erro de validação", description: "Unidades por pacote é obrigatório quando embalagem está ativa", variant: "destructive" });
        return;
      }

      const processedData = {
        ...data,
        supplier: data.supplier === 'none' ? '' : data.supplier,
        package_price: data.package_price === 0 ? undefined : data.package_price,
        cost_price: data.cost_price,
        volume_ml: data.volume_ml === 0 ? undefined : data.volume_ml,
      };

      await onSubmit(processedData);
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      toast({ title: "❌ Erro ao salvar", description: "Ocorreu um erro inesperado. Verifique os dados e tente novamente.", variant: "destructive" });
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    form.reset();
    setActiveScanner(null);
    onClose();
  };

  const handleBarcodeScanned = async (code: string, type: 'main' | 'package') => {
    const currentValues = form.getValues();
    const duplicateField = (type !== 'main' && currentValues.barcode === code) ? 'principal' :
      (type !== 'package' && currentValues.package_barcode === code) ? 'pacote' : null;
    if (duplicateField) {
      toast({ title: "⚠️ Código duplicado", description: `Este código já está sendo usado no campo ${duplicateField}`, variant: "destructive" });
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

  if (!product) return null;

  const inputClasses = cn(getGlassInputClasses('form'), 'h-9 text-sm');

  return (
    <>
      <FormDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleClose()}
        title="EDITAR PRODUTO"
        description={`Editando "${product.name}"`}
        onSubmit={form.handleSubmit(handleFormSubmit)}
        submitLabel={isLoading ? 'Salvando...' : 'Salvar Alterações'}
        cancelLabel="Cancelar"
        loading={isLoading}
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
                      <Input placeholder="Ex: Cerveja Heineken 350ml" {...field} className={inputClasses} />
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
                        <SelectTrigger className={inputClasses}>
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
                        <Input type="number" min="0" placeholder="350" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={inputClasses} />
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
                          <SelectTrigger className={inputClasses}>
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
                  <Button type="button" variant="outline" onClick={() => setActiveScanner('main')} className="w-full h-9 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10" disabled={isLoading}>
                    <ScanLine className="h-3 w-3 mr-1.5" /> Escanear
                  </Button>
                ) : (
                  <BarcodeInput onScan={handleMainBarcodeScanned} placeholder="Escaneie..." className="w-full" />
                )}
                <FormField control={form.control} name="barcode" render={({ field }) => (
                  <FormItem className="mt-1">
                    <FormControl>
                      <Input placeholder="Ou digite" {...field} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 14) field.onChange(v); }} maxLength={14} className={cn(inputClasses, 'font-mono')} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* ========================================== */}
            {/* COLUNA 2 - Venda (Fardo) + Zona de Perigo */}
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
                            <Input type="number" min="1" max="999" placeholder="24" {...field} onChange={e => field.onChange(Number(e.target.value))} className={inputClasses} />
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
                            <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={inputClasses} />
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
                      <Button type="button" variant="outline" onClick={() => setActiveScanner('package')} className="w-full h-9 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10" disabled={isLoading}>
                        <ScanLine className="h-3 w-3 mr-1.5" /> Escanear Fardo
                      </Button>
                    ) : (
                      <BarcodeInput onScan={handlePackageBarcodeScanned} placeholder="Escaneie..." className="w-full" />
                    )}
                    <FormField control={form.control} name="package_barcode" render={({ field }) => (
                      <FormItem className="mt-1">
                        <FormControl>
                          <Input placeholder="Ou digite" {...field} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 14) field.onChange(v); }} maxLength={14} className={cn(inputClasses, 'font-mono')} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              {/* Espaço vazio quando toggle desativado */}
              {!hasPackageTracking && (
                <div className="p-3 rounded-lg bg-gray-800/10 border border-dashed border-gray-700/30 text-center">
                  <p className="text-xs text-gray-500">Ative o toggle acima para configurar venda de fardo</p>
                </div>
              )}

              {/* ZONA DE PERIGO - Movida para cá */}
              <div className="mt-6 pt-4 border-t border-red-900/30">
                <div className="bg-red-950/10 border border-red-900/30 rounded-lg p-3">
                  <h4 className="text-red-400 font-semibold flex items-center gap-2 mb-2 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    ⚠️ Zona de Perigo
                  </h4>
                  <p className="text-xs text-red-300/70 mb-3">
                    O produto será movido para a lixeira.
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={isLoading}
                    size="sm"
                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Excluir Produto
                  </Button>
                </div>
              </div>
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

      {/* Modal de Confirmação de Exclusão */}
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        productId={product.id}
        productName={product.name}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
          handleClose();
          onSuccess?.();
        }}
      />
    </>
  );
};

export default SimpleEditProductModal;