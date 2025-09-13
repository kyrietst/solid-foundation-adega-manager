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
import { BaseModal } from '@/shared/ui/composite';
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
import { VariantStockDisplay } from '@/features/inventory/components/VariantStockDisplay';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useMouseTracker } from '@/hooks/ui/useMouseTracker';
import { useProductVariants } from '@/features/sales/hooks/useProductVariants';
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
  
  stock_quantity: z
    .number({ invalid_type_error: 'Quantidade deve ser um número' })
    .min(0, 'Quantidade não pode ser negativa')
    .default(0),
  
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
  const { handleMouseMove } = useMouseTracker();
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [showCustomSupplier, setShowCustomSupplier] = useState(false);
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);
  
  // Buscar dados de variantes para exibição read-only (sempre chamar o hook)
  const productId = product?.id || '';
  const { data: productWithVariants, isLoading: variantsLoading } = useProductVariants(productId);

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
      stock_quantity: 0,
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
        stock_quantity: product.stock_quantity || 0,
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
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          <Edit className="h-5 w-5 text-yellow-400" />
          Editar Produto
        </>
      }
      description={`Modifique os dados do produto "${product.name}". Apenas campos alterados serão atualizados.`}
      size="4xl"
      maxWidth="1200px"
      className="max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-sm border border-white/10 !max-w-[1200px] !w-[1200px]"
      style={{ 
        maxWidth: '1200px !important',
        width: '1200px !important' 
      }}
    >

        <div className="flex-1 overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
              {/* Informações Básicas */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                  <Package className="h-5 w-5 text-blue-400" />
                  Informações Básicas
                </h3>
                
                <div className="space-y-5">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  </div>
                </div>
              </div>

              {/* Sistema de Códigos Hierárquicos */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                  <Barcode className="h-5 w-5 text-yellow-400" />
                  Sistema de Códigos de Barras
                </h3>

                {/* Código de barras principal do produto */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-700/50">
                    <Barcode className="h-4 w-4 text-yellow-400" />
                    <FormLabel className="text-base text-gray-300 font-medium">Código de Barras Principal</FormLabel>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                    <div className="space-y-3">
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
                    <div className="text-sm text-gray-400 mt-2">
                      <p>💡 <strong>Código principal:</strong> Código da unidade do produto. Se houver fardo, pode ser o código geral.</p>
                    </div>
                  </div>
                </div>
                
                {/* Toggles para tipos de venda */}
                <div className="space-y-4 mb-6">
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

                {/* Explicação da lógica de códigos */}
                <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-medium mb-1">🔍 Como funciona a detecção automática:</p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• <strong>Código principal:</strong> Usado para busca e identificação geral</li>
                        <li>• <strong>Código de pacote:</strong> Usado apenas se o produto tem rastreamento por fardo</li>
                        <li>• <strong>Na venda:</strong> Sistema detecta automaticamente se é unidade ou fardo</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Código de barras do pacote (condicional) */}
                {form.watch('has_package_tracking') && (
                  <div className="space-y-4 border-t border-gray-700/50 pt-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-700/50">
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

              {/* Fornecedor */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                  <Factory className="h-5 w-5 text-purple-400" />
                  Fornecedor
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              </div>

              {/* Preços */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  Preços e Margem
                </h3>
                
                {/* Preços de Unidade */}
                <div className="space-y-5">
                  <h4 className="text-base font-medium text-gray-200 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-400" />
                    Preços por Unidade
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormField
                      control={form.control}
                      name="cost_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Preço de Custo (unidade)</FormLabel>
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
                            Quanto custa cada unidade para você
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
                          <FormLabel className="text-gray-300">Preço de Venda (unidade) *</FormLabel>
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
                            Preço de cada unidade para o cliente
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
                  </div>
                </div>

                {/* Preços de Pacote - Condicional */}
                {form.watch('has_package_tracking') && (
                  <div className="space-y-5 border-t border-gray-700/50 pt-5">
                    <h4 className="text-base font-medium text-gray-200 flex items-center gap-2">
                      <Package className="h-4 w-4 text-yellow-400" />
                      Preços por Pacote/Fardo
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <FormField
                        control={form.control}
                        name="package_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Preço de Venda (pacote)</FormLabel>
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

              {/* Informações de Estoque por Variantes (Read-Only) */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                  <Package className="h-5 w-5 text-yellow-400" />
                  Informações de Estoque por Variante
                </h3>
                
                <div className="space-y-6">
                  {/* Sistema de variantes atual */}
                  {productWithVariants && !variantsLoading ? (
                    <>
                      <div className="bg-blue-900/10 border border-blue-400/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-blue-300">Sistema de Variantes Ativo</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Este produto utiliza o novo sistema de variantes. O estoque é controlado separadamente por unidades e pacotes.
                          Para ajustar estoque, use a funcionalidade "Ajustar Estoque" na página de inventário.
                        </p>
                      </div>
                      
                      <VariantStockDisplay
                        product={productWithVariants}
                        showPrices={true}
                        showConversionInfo={true}
                        className="bg-black/20 border-white/10"
                      />
                    </>
                  ) : variantsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-yellow mr-3"></div>
                      <span className="text-gray-400">Carregando informações de variantes...</span>
                    </div>
                  ) : (
                    <>
                      {/* Fallback: sistema legado */}
                      <div className="bg-orange-900/10 border border-orange-400/20 rounded-lg p-4 mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="h-4 w-4 text-orange-400" />
                          <span className="text-sm font-medium text-orange-300">Sistema Legado</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Este produto ainda usa o sistema de estoque legado. Recomendamos migrar para o sistema de variantes.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="stock_quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Quantidade em Estoque (Sistema Legado)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="bg-gray-800/50 border-gray-600 text-white h-11"
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500">
                                Quantidade atual em estoque (apenas para produtos não migrados)
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
                                  placeholder="10"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  className="bg-gray-800/50 border-gray-600 text-white h-11"
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500">
                                Alerta quando estoque baixo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Controle de Validade */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  Controle de Validade
                </h3>
                
                <div className="space-y-5">
                  {/* Toggle para ativação do controle de validade */}
                  <div className="flex items-center justify-between rounded-lg border border-orange-400/30 p-4 bg-orange-400/5">
                    <div className="space-y-1">
                      <FormLabel className="text-base text-gray-300 font-medium">
                        Produto com Prazo de Validade
                      </FormLabel>
                      <FormDescription className="text-sm text-gray-500">
                        Ative para produtos perecíveis que possuem data de vencimento
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
                  {form.watch('has_expiry_tracking') && (
                    <div className="space-y-3 border-t border-gray-700/50 pt-5">
                      <FormField
                        control={form.control}
                        name="expiry_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300 flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-orange-400" />
                              Data de Validade
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="bg-gray-800/50 border-gray-600 text-white h-11"
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                              Data de vencimento deste produto (aplicável a unidades ou pacotes conforme sua venda)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Indicador visual se próximo ao vencimento */}
                      {form.watch('expiry_date') && (
                        <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-amber-300">💡 Dica do Sistema</p>
                              <p className="text-gray-300 text-xs mt-1">
                                O sistema alertará automaticamente quando produtos estiverem próximos ao vencimento no dashboard.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explicação quando controle está desabilitado */}
                  {!form.watch('has_expiry_tracking') && (
                    <div className="bg-gray-900/20 border border-gray-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="text-sm text-gray-400">
                          <p className="font-medium mb-1">Controle de Validade Desabilitado</p>
                          <p className="text-xs">
                            Para produtos duráveis (bebidas alcoólicas, produtos em conserva, etc.) 
                            que não possuem prazo de validade crítico.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-gray-700/50">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
            </form>
          </Form>
        </div>
    </BaseModal>
  );
};

export default EditProductModal;