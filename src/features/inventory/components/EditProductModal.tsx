/**
 * EditProductModal.tsx - Modal para edição de produtos existentes
 * Baseado no NewProductModal com dados pré-preenchidos
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedBaseModal, ModalSection } from '@/shared/ui/composite';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { ProductBasicInfoForm } from '@/features/inventory/components/form-sections/ProductBasicInfoForm';
import { ProductPricingForm } from '@/features/inventory/components/form-sections/ProductPricingForm';
import { ProductTrackingForm } from '@/features/inventory/components/form-sections/ProductTrackingForm';
import { ProductStockDisplay } from '@/features/inventory/components/form-sections/ProductStockDisplay';
import { useToast } from '@/shared/hooks/common/use-toast';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';
import { supabase } from '@/core/api/supabase/client';
import { 
  Package, 
  DollarSign, 
  Barcode,
  Factory,
  Save,
  X,
  Edit,
  ScanLine,
  ShoppingCart,
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import type { Product } from '@/types/inventory.types';

// Schema de validação com Zod - igual ao NewProductModal
const editProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  
  category: z
    .string()
    .min(1, 'Categoria é obrigatória'),
  
  // Código de barras principal do produto
  barcode: z
    .string()
    .optional()
    .or(z.literal('')),
  
  
  // Sistema de códigos hierárquicos
  has_unit_tracking: z.boolean().default(true),
  has_package_tracking: z.boolean().default(false),
  package_barcode: z
    .string()
    .optional()
    .or(z.literal('')),
  package_units: z
    .number({ invalid_type_error: 'Quantidade deve ser um número' })
    .min(1, 'Deve ter pelo menos 1 unidade por pacote')
    .optional()
    .default(1),
  package_price: z
    .number({ invalid_type_error: 'Preço do pacote deve ser um número' })
    .min(0.01, 'Preço do pacote deve ser maior que 0')
    .optional(),
  
  supplier: z
    .string()
    .optional()
    .or(z.literal('')),
  
  custom_supplier: z
    .string()
    .optional()
    .or(z.literal('')),
  
  cost_price: z
    .number({ invalid_type_error: 'Preço de custo deve ser um número' })
    .min(0, 'Preço de custo deve ser maior que 0')
    .optional(),
  
  price: z
    .number({ invalid_type_error: 'Preço de venda deve ser um número' })
    .min(0.01, 'Preço de venda deve ser maior que 0'),
  
  volume_ml: z
    .number({ invalid_type_error: 'Volume deve ser um número' })
    .min(1, 'Volume deve ser maior que 0')
    .optional(),

  minimum_stock: z
    .number({ invalid_type_error: 'Estoque mínimo deve ser um número' })
    .min(0, 'Estoque mínimo não pode ser negativo')
    .optional(),

  // Campos de controle de validade
  has_expiry_tracking: z.boolean().default(false),
  expiry_date: z
    .string()
    .optional()
    .or(z.literal('')),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product: Product | null;
  onSubmit: (data: EditProductFormData) => void;
  isLoading?: boolean;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
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
  const [showCustomSupplier, setShowCustomSupplier] = useState(false);
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);
  
  // SSoT: Calcular dados de estoque diretamente do produto
  const stockDisplay = product ? calculatePackageDisplay(product.stock_quantity, product.package_units) : null;

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: '',
      category: '',
      barcode: '',
      has_unit_tracking: true,
      has_package_tracking: false,
      package_barcode: '',
      package_units: 1,
      package_price: undefined,
      supplier: '',
      custom_supplier: '',
      cost_price: undefined,
      price: 0,
      volume_ml: undefined,
      minimum_stock: undefined,
      has_expiry_tracking: false,
      expiry_date: '',
    },
  });

  // Preencher formulário quando produto for carregado
  useEffect(() => {
    if (isOpen && product) {
      // Reset form e preencher com dados do produto
      form.reset({
        name: product.name || '',
        category: product.category || '',
        barcode: product.barcode || '',
        has_unit_tracking: product.has_unit_tracking !== undefined ? product.has_unit_tracking : true,
        has_package_tracking: product.has_package_tracking || false,
        package_barcode: product.package_barcode || '',
        package_units: product.package_units || product.units_per_package || 1,
        package_price: product.package_price ? Number(product.package_price) : undefined,
        supplier: product.supplier || '',
        custom_supplier: '',
        cost_price: product.cost_price ? Number(product.cost_price) : undefined,
        price: Number(product.price) || 0,
        volume_ml: product.volume_ml ? Number(product.volume_ml) : undefined,
        minimum_stock: product.minimum_stock || undefined,
        has_expiry_tracking: product.has_expiry_tracking || false,
        expiry_date: product.expiry_date || '',
      });

      fetchCategoriesAndSuppliers();
    }
  }, [isOpen, product, form]);

  // Effect separado para configurar fornecedor customizado após suppliers serem carregados
  useEffect(() => {
    if (isOpen && product && suppliers.length > 0) {
      // Verificar se usa fornecedor customizado
      if (product.supplier && !suppliers.includes(product.supplier)) {
        setShowCustomSupplier(true);
        form.setValue('supplier', 'custom');
        form.setValue('custom_supplier', product.supplier);
      }
    }
  }, [isOpen, product, suppliers, form]);

  const fetchCategoriesAndSuppliers = async () => {
    try {
      // Buscar categorias
      const { data: categoriesData } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
      
      if (categoriesData) {
        const uniqueCategories = [...new Set(categoriesData.map(item => item.category))].sort();
        setCategories(uniqueCategories);
      }

      // Buscar fornecedores
      const { data: suppliersData } = await supabase
        .from('products')
        .select('supplier')
        .not('supplier', 'is', null)
        .neq('supplier', '');
      
      if (suppliersData) {
        const uniqueSuppliers = [...new Set(suppliersData.map(item => item.supplier))].sort();
        setSuppliers(uniqueSuppliers);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  // Calcular margens automaticamente
  const watchedCostPrice = form.watch('cost_price');
  const watchedPrice = form.watch('price');
  const watchedPackagePrice = form.watch('package_price');
  const watchedPackageUnits = form.watch('package_units');

  const calculatedMargin = React.useMemo(() => {
    if (watchedCostPrice && watchedPrice && watchedCostPrice > 0) {
      return ((watchedPrice - watchedCostPrice) / watchedCostPrice * 100).toFixed(1);
    }
    return null;
  }, [watchedCostPrice, watchedPrice]);

  const calculatedPackageMargin = React.useMemo(() => {
    if (watchedPackagePrice && watchedCostPrice && watchedPackageUnits && watchedCostPrice > 0) {
      const packageCost = watchedCostPrice * watchedPackageUnits;
      return ((watchedPackagePrice - packageCost) / packageCost * 100).toFixed(1);
    }
    return null;
  }, [watchedPackagePrice, watchedCostPrice, watchedPackageUnits]);

  const packageSavings = React.useMemo(() => {
    if (watchedPackagePrice && watchedPrice && watchedPackageUnits) {
      const individualTotal = watchedPrice * watchedPackageUnits;
      const savings = individualTotal - watchedPackagePrice;
      const savingsPercent = (savings / individualTotal * 100).toFixed(1);
      return { amount: savings, percent: savingsPercent };
    }
    return null;
  }, [watchedPackagePrice, watchedPrice, watchedPackageUnits]);

  const handleFormSubmit = (data: EditProductFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    if (isLoading) return; // Não permitir fechar durante envio
    form.reset();
    setShowCustomSupplier(false);
    setActiveScanner(null);
    onClose();
  };

  const handleSupplierChange = (value: string) => {
    form.setValue('supplier', value);
    setShowCustomSupplier(value === 'custom');
    if (value !== 'custom') {
      form.setValue('custom_supplier', '');
    }
  };

  // Handler para scanner de código de barras com validação avançada
  const handleBarcodeScanned = async (code: string, type: 'main' | 'package') => {
    try {
      // Verificar se o código não está sendo usado em outro campo do mesmo produto
      const currentValues = form.getValues();
      const duplicateField = 
        (type !== 'main' && currentValues.barcode === code) ? 'principal' :
        (type !== 'package' && currentValues.package_barcode === code) ? 'pacote' : null;
      
      if (duplicateField) {
        toast({
          title: "⚠️ Código duplicado",
          description: `Este código já está sendo usado no campo ${duplicateField} do mesmo produto`,
          variant: "destructive",
        });
        setActiveScanner(null);
        return;
      }

      // Definir valor no formulário
      if (type === 'main') {
        form.setValue('barcode', code);
      } else if (type === 'package') {
        form.setValue('package_barcode', code);
      }
      
      setActiveScanner(null);
      
      const typeLabels = {
        main: 'principal',
        package: 'do pacote'
      };
      
      toast({
        title: "✅ Código escaneado!",
        description: `Código ${typeLabels[type]} registrado: ${code}`,
        variant: "default",
      });

    } catch (error) {
      console.error('Erro ao processar código escaneado:', error);
      setActiveScanner(null);
      
      toast({
        title: "❌ Erro ao processar",
        description: "Ocorreu um erro ao processar o código. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!product) return null;

  return (
    <EnhancedBaseModal
      isOpen={isOpen}
      onClose={handleClose}
      modalType="edit"
      title="Editar Produto"
      subtitle={`Modifique os dados do produto "${product.name}"`}
      customIcon={Edit}
      loading={isLoading}
      size="5xl"
      primaryAction={{
        label: isLoading ? "Salvando..." : "Salvar Alterações",
        icon: isLoading ? undefined : Save,
        onClick: () => form.handleSubmit(handleFormSubmit)(),
        disabled: isLoading,
        loading: isLoading
      }}
      secondaryAction={{
        label: "Cancelar",
        icon: X,
        onClick: handleClose,
        disabled: isLoading
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Hidden submit button for form submission */}
          <button type="submit" className="hidden" />
        </form>
      </Form>

      {/* Informações Básicas */}
      <ModalSection
        title="Informações Básicas"
        subtitle="Dados fundamentais do produto"
      >
                <div className={cn(
                  "p-5 rounded-lg border space-y-4",
                  getGlassCardClasses('premium')
                )}>
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="h-5 w-5 text-blue-400" />
                    <span className="text-lg font-medium text-gray-100">Dados do Produto</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Nome do Produto *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Cerveja Heineken 350ml"
                            {...field}
                            className="bg-gray-800/50 border-gray-600 text-white h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Categoria *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-11">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="volume_ml"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Volume (ml)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="350"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              className="bg-gray-800/50 border-gray-600 text-white h-11"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Volume em mililitros (ex: 350, 500, 1000)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minimum_stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Estoque Mínimo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Ex: 10"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              className="bg-gray-800/50 border-gray-600 text-white h-11"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Sistema alertará quando abaixo desta quantidade
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
      </ModalSection>

      {/* Sistema de Códigos Hierárquicos */}
      <ModalSection
        title="Sistema de Códigos de Barras"
        subtitle="Configuração de códigos para unidade e pacote"
      >
                <div className={cn(
                  "p-5 rounded-lg border",
                  getGlassCardClasses('premium')
                )}>
                  <div className="flex items-center gap-3 mb-6">
                    <Barcode className="h-5 w-5 text-yellow-400" />
                    <span className="text-lg font-medium text-gray-100">Códigos de Barras</span>
                  </div>

                  {/* Código de barras principal do produto */}
                  <div className="space-y-5 mb-6">
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-700/30">
                      <Barcode className="h-4 w-4 text-yellow-400" />
                      <FormLabel className="text-base text-gray-300 font-medium">Código de Barras Principal</FormLabel>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                      <div className="lg:col-span-2 space-y-3">
                      {activeScanner !== 'main' ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveScanner('main')}
                          className="w-full h-11 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 transition-all duration-200"
                          disabled={isLoading}
                        >
                          <ScanLine className="h-4 w-4 mr-2" />
                          Escanear Código Principal
                        </Button>
                      ) : (
                        <BarcodeInput
                          onScan={(code) => handleBarcodeScanned(code, 'main')}
                          placeholder="Escaneie o código principal..."
                          autoFocus={true}
                          className="w-full"
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Ou digite manualmente (apenas números)"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                maxLength={14}
                                className="font-mono bg-gray-800/50 border-gray-600 text-white h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                      <div className="text-sm text-gray-400 bg-blue-900/10 border border-blue-400/20 rounded-lg p-3">
                        <p>💡 <strong>Código principal:</strong> Código da unidade do produto. Se houver fardo, pode ser o código geral.</p>
                      </div>
                    </div>
                  </div>

                  {/* Toggles para tipos de venda */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between rounded-lg border border-blue-400/30 p-4 bg-blue-400/5">
                        <div className="space-y-1">
                          <FormLabel className="text-base text-gray-300 font-medium">
                            Venda por Unidade
                          </FormLabel>
                          <FormDescription className="text-sm text-gray-500">
                            Permite venda de itens individuais
                          </FormDescription>
                        </div>
                        <FormField
                          control={form.control}
                          name="has_unit_tracking"
                          render={({ field }) => (
                            <FormControl>
                              <SwitchAnimated
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                variant="yellow"
                                size="md"
                              />
                            </FormControl>
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-yellow-400/30 p-4 bg-yellow-400/5">
                        <div className="space-y-1">
                          <FormLabel className="text-base text-gray-300 font-medium">
                            Venda por Pacote/Fardo
                          </FormLabel>
                          <FormDescription className="text-sm text-gray-500">
                            Ative para produtos vendidos em embalagens com vários itens
                          </FormDescription>
                        </div>
                        <FormField
                          control={form.control}
                          name="has_package_tracking"
                          render={({ field }) => (
                            <FormControl>
                              <SwitchAnimated
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                variant="yellow"
                                size="md"
                              />
                            </FormControl>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Explicação da lógica de códigos */}
                  <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div className="text-sm text-gray-300">
                        <p className="font-medium mb-2">🔍 Como funciona a detecção automática:</p>
                        <ul className="text-xs text-gray-400 space-y-1 ml-2">
                          <li>• <strong>Código principal:</strong> Usado para busca e identificação geral</li>
                          <li>• <strong>Código de pacote:</strong> Usado apenas se o produto tem rastreamento por fardo</li>
                          <li>• <strong>Na venda:</strong> Sistema detecta automaticamente se é unidade ou fardo</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Código de barras do pacote (condicional) */}
                  {form.watch('has_package_tracking') && (
                    <div className="space-y-5 border-t border-gray-700/30 pt-6">
                      <div className="flex items-center gap-2 pb-3 border-b border-gray-700/30">
                        <Package className="h-4 w-4 text-yellow-400" />
                        <FormLabel className="text-base text-gray-300 font-medium">Código do Pacote/Fardo</FormLabel>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {/* Scanner e input do pacote */}
                      <div className="lg:col-span-2 space-y-3">
                        {activeScanner !== 'package' ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveScanner('package')}
                            className="w-full h-11 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 transition-all duration-200"
                            disabled={isLoading}
                          >
                            <ScanLine className="h-4 w-4 mr-2" />
                            Escanear Código do Pacote
                          </Button>
                        ) : (
                          <BarcodeInput
                            onScan={(code) => handleBarcodeScanned(code, 'package')}
                            placeholder="Escaneie o código do pacote..."
                            autoFocus={true}
                            className="w-full"
                          />
                        )}
                        
                        <FormField
                          control={form.control}
                          name="package_barcode"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Ou digite manualmente (apenas números)"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                  maxLength={14}
                                  className="font-mono bg-gray-800/50 border-gray-600 text-white h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Unidades por pacote */}
                      <div className="flex flex-col">
                        <FormField
                          control={form.control}
                          name="package_units"
                          render={({ field }) => (
                            <FormItem className="mt-0.5">
                              <FormLabel className="text-gray-300">Unidades por Pacote</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="999"
                                  placeholder="Ex: 24"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="bg-gray-800/50 border-gray-600 text-white h-11 mt-2"
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500 mt-1">
                                Quantas unidades há em cada pacote/fardo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="hidden lg:flex items-center justify-center text-gray-500 pt-4 mt-auto">
                          <div className="text-center">
                            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Sistema de pacotes</p>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  )}
                </div>
      </ModalSection>

      {/* Fornecedor */}
      <ModalSection
        title="Fornecedor"
        subtitle="Selecione ou adicione um novo fornecedor"
      >
                <div className={cn(
                  "p-5 rounded-lg border",
                  getGlassCardClasses('premium')
                )}>
                  <div className="flex items-center gap-3 mb-6">
                    <Factory className="h-5 w-5 text-purple-400" />
                    <span className="text-lg font-medium text-gray-100">Informações do Fornecedor</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Fornecedor</FormLabel>
                            <Select onValueChange={handleSupplierChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-11">
                                  <SelectValue placeholder="Selecione ou adicione novo..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {suppliers.map((supplier) => (
                                  <SelectItem key={supplier} value={supplier}>
                                    {supplier}
                                  </SelectItem>
                                ))}
                                {suppliers.length > 0 && (
                                  <SelectItem value="custom">+ Novo fornecedor</SelectItem>
                                )}
                                {suppliers.length === 0 && (
                                  <SelectItem value="custom">+ Adicionar primeiro fornecedor</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {showCustomSupplier && (
                        <FormField
                          control={form.control}
                          name="custom_supplier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Nome do Novo Fornecedor</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Distribuidora ABC"
                                  {...field}
                                  className="bg-gray-800/50 border-gray-600 text-white h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Factory className="h-16 w-16 mx-auto mb-3 opacity-30" />
                        <p className="text-sm opacity-75">Gestão de Fornecedores</p>
                      </div>
                    </div>
                  </div>
                </div>
      </ModalSection>

      {/* Preços */}
      <ModalSection
        title="Preços e Margem"
        subtitle="Definição de preços de custo e venda com cálculo automático de margem"
      >
        <div className={cn(
          "p-5 rounded-lg border",
          getGlassCardClasses('premium')
        )}>
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span className="text-lg font-medium text-gray-100">Gestão de Preços</span>
          </div>

          {/* Preços de Unidade */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-700/30">
              <ShoppingCart className="h-4 w-4 text-blue-400" />
              <h4 className="text-base font-medium text-gray-200">Preços por Unidade</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                    <FormField
                      control={form.control}
                      name="cost_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Preço de Custo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              className="bg-gray-800/50 border-gray-600 text-white h-11"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Custo por unidade
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Preço de Venda *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="bg-gray-800/50 border-gray-600 text-white h-11"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Preço por unidade
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel className="text-gray-300">Margem Unitária</FormLabel>
                      <div className="h-11 bg-gray-800/30 border border-gray-600 rounded-md px-3 flex items-center mt-2">
                        {calculatedMargin ? (
                          <span className="text-green-400 font-medium">
                            {calculatedMargin}%
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            🔄 Auto-calculada
                          </span>
                        )}
                      </div>
                      <FormDescription className="text-xs text-gray-500 mt-1">
                        Margem por unidade
                      </FormDescription>
                    </div>

                    {form.watch('has_package_tracking') && (
                      <FormField
                        control={form.control}
                        name="package_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Preço do Pacote</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                className="bg-gray-800/50 border-gray-600 text-white h-11"
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                              Preço do pacote completo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                    {/* Métricas do Pacote - Condicional */}
                    {form.watch('has_package_tracking') && (
                      <div className="space-y-4 border-t border-gray-700/30 pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          <div>
                            <FormLabel className="text-gray-300">Margem do Pacote</FormLabel>
                            <div className="h-11 bg-gray-800/30 border border-gray-600 rounded-md px-3 flex items-center mt-2">
                              {calculatedPackageMargin ? (
                                <span className="text-green-400 font-medium">
                                  {calculatedPackageMargin}%
                                </span>
                              ) : (
                                <span className="text-gray-500">
                                  🔄 Auto-calculada
                                </span>
                              )}
                            </div>
                            <FormDescription className="text-xs text-gray-500 mt-1">
                              Margem do pacote completo
                            </FormDescription>
                          </div>

                          <div>
                            <FormLabel className="text-gray-300">Economia do Cliente</FormLabel>
                            <div className="h-11 bg-gray-800/30 border border-green-600/50 rounded-md px-3 flex items-center mt-2">
                              {packageSavings ? (
                                <span className="text-green-400 font-medium">
                                  R$ {packageSavings.amount.toFixed(2)} ({packageSavings.percent}%)
                                </span>
                              ) : (
                                <span className="text-gray-500">
                                  💰 Calculando...
                                </span>
                              )}
                            </div>
                            <FormDescription className="text-xs text-gray-500 mt-1">
                              Quanto o cliente economiza
                            </FormDescription>
                          </div>
                        </div>
                      </div>
                    )}
            </div>
          </div>
        </div>
      </ModalSection>

      {/* Informações de Estoque (Read-Only) */}
      <ModalSection
        title="Estoque e Validade"
        subtitle="Visualização do estoque atual e configuração de validade"
      >
                <div className={cn(
                  "p-5 rounded-lg border",
                  getGlassCardClasses('premium')
                )}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Coluna Esquerda - Estoque */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-100">Estoque Atual (SSoT)</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                        <span className="text-sm text-gray-300">Total em unidades:</span>
                        <span className="text-xl font-bold text-yellow-400">{product.stock_quantity || 0}</span>
                      </div>

                      {product.has_package_tracking && stockDisplay && stockDisplay.packages > 0 && (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-400/20">
                            <div className="text-blue-400 font-semibold">{stockDisplay.packages}</div>
                            <div className="text-xs text-gray-400">pacotes</div>
                          </div>
                          <div className="text-center p-2 bg-green-500/10 rounded border border-green-400/20">
                            <div className="text-green-400 font-semibold">{stockDisplay.units}</div>
                            <div className="text-xs text-gray-400">unidades</div>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-400 bg-blue-900/10 border border-blue-400/20 rounded p-2">
                        💡 Para ajustar estoque, use "Ajustar Estoque" na página de inventário.
                      </div>
                    </div>

                    {/* Coluna Direita - Validade */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-gray-100">Controle de Validade</span>
                      </div>

                      {/* Toggle para ativação do controle de validade */}
                      <div className="flex items-center justify-between rounded-lg border border-orange-400/30 p-3 bg-orange-400/5">
                        <div className="space-y-1">
                          <FormLabel className="text-sm text-gray-300 font-medium">
                            Produto com Validade
                          </FormLabel>
                          <FormDescription className="text-xs text-gray-500">
                            Ative para produtos perecíveis
                          </FormDescription>
                        </div>
                        <FormField
                          control={form.control}
                          name="has_expiry_tracking"
                          render={({ field }) => (
                            <FormControl>
                              <SwitchAnimated
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                variant="orange"
                                size="md"
                              />
                            </FormControl>
                          )}
                        />
                      </div>

                      {/* Campo de data de validade (condicional) */}
                      {form.watch('has_expiry_tracking') ? (
                        <FormField
                          control={form.control}
                          name="expiry_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300 text-sm">Data de Validade</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  className="bg-gray-800/50 border-gray-600 text-white h-11"
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500">
                                Data de vencimento deste produto
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div className="text-xs text-gray-400 bg-gray-900/30 border border-gray-500/30 rounded p-2">
                          📦 Produto durável - sem controle de validade
                        </div>
                      )}
                    </div>
                  </div>
                </div>
      </ModalSection>
    </EnhancedBaseModal>
  );
};

export default EditProductModal;
// TODO: Fix modal structure - currently has parsing errors due to improper JSX nesting