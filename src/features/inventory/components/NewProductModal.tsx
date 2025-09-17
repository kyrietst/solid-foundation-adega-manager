/**
 * NewProductModal.tsx - Modal para cadastro de novos produtos
 * Padronizado com NewCustomerModal e MovementDialog
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
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
import { useStandardForm } from '@/shared/hooks/common/useStandardForm';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import { useToast } from '@/shared/hooks/common/use-toast';
import { supabase } from '@/core/api/supabase/client';
import { 
  Package, 
  DollarSign, 
  Barcode,
  Factory,
  Save,
  X,
  Plus,
  ScanLine,
  ShoppingCart
} from 'lucide-react';

// Schema de validação com Zod
const newProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  
  category: z
    .string()
    .min(1, 'Categoria é obrigatória'),
  
  // Código de barras da unidade
  unit_barcode: z
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
    .union([
      z.string().transform(val => val === '' ? undefined : Number(val)),
      z.number()
    ])
    .optional()
    .refine(val => val === undefined || val >= 0.01, 'Preço do pacote deve ser maior que 0'),
  
  supplier: z
    .string()
    .optional()
    .or(z.literal('')),
  
  custom_supplier: z
    .string()
    .optional()
    .or(z.literal('')),
  
  cost_price: z
    .union([
      z.string().transform(val => val === '' ? undefined : Number(val)),
      z.number()
    ])
    .optional()
    .refine(val => val === undefined || val >= 0, 'Preço de custo deve ser maior ou igual a 0'),
  
  price: z
    .number({ invalid_type_error: 'Preço de venda deve ser um número' })
    .min(0.01, 'Preço de venda deve ser maior que 0'),
  
  volume_ml: z
    .union([
      z.string().transform(val => val === '' ? undefined : Number(val)),
      z.number()
    ])
    .optional()
    .refine(val => val === undefined || val >= 1, 'Volume deve ser maior que 0'),
  
  stock_quantity: z
    .number({ invalid_type_error: 'Quantidade deve ser um número' })
    .min(0, 'Quantidade não pode ser negativa')
    .default(0),
  
  minimum_stock: z
    .number({ invalid_type_error: 'Estoque mínimo deve ser um número' })
    .min(0, 'Estoque mínimo não pode ser negativo')
    .default(5),
});

type NewProductFormData = z.infer<typeof newProductSchema>;

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { handleMouseMove } = useGlassmorphismEffect();
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [showCustomSupplier, setShowCustomSupplier] = useState(false);
  const [activeScanner, setActiveScanner] = useState<'package' | 'unit' | null>(null);

  const { form, isLoading, handleSubmit } = useStandardForm<NewProductFormData>({
    schema: newProductSchema,
    onSuccess: (data) => `✅ ${data.name} foi adicionado com sucesso.`,
    onError: "❌ Erro ao cadastrar produto",
    resetOnSuccess: true,
    defaultValues: {
      name: '',
      category: '',
      unit_barcode: '',
      has_unit_tracking: true,
      has_package_tracking: false,
      package_barcode: '',
      package_units: 1,
      package_price: '',
      supplier: '',
      custom_supplier: '',
      cost_price: '',
      price: 0,
      volume_ml: '',
      stock_quantity: 0,
      minimum_stock: 5,
    },
    onSuccessCallback: () => {
      setShowCustomSupplier(false);
      onClose();
      if (onSuccess) onSuccess();
    },
    onSubmit: async (data) => {
      // Preparar dados para envio
      const finalSupplier = data.supplier === 'custom' ? data.custom_supplier : data.supplier;

      const productData = {
        name: data.name,
        category: data.category,
        // Sistema de códigos hierárquicos - mapeamento correto
        barcode: data.unit_barcode || null, // Código principal (unidade)
        unit_barcode: data.unit_barcode || null,
        package_barcode: data.package_barcode || null,
        package_units: data.package_units || null, // Campo correto
        units_per_package: data.package_units || 1, // Mantém compatibilidade
        package_size: data.package_units || 1, // Mantém compatibilidade
        is_package: data.has_package_tracking || false,
        has_package_tracking: data.has_package_tracking || false,
        has_unit_tracking: data.has_unit_tracking !== undefined ? data.has_unit_tracking : true,
        // Preços
        price: data.price,
        package_price: data.package_price || null,
        cost_price: data.cost_price || null,
        // Calcular margem de unidade
        margin_percent: data.cost_price ?
          ((data.price - data.cost_price) / data.cost_price * 100) : null,
        // Calcular margem de pacote (se houver preço de pacote)
        package_margin: (data.package_price && data.cost_price && data.package_units) ?
          (((data.package_price - (data.cost_price * data.package_units)) / (data.cost_price * data.package_units)) * 100) : null,
        // Outros campos
        supplier: finalSupplier || null,
        volume_ml: data.volume_ml || null,
        stock_quantity: data.stock_quantity,
        minimum_stock: data.minimum_stock || 5,
        // Valores padrão
        turnover_rate: 'medium',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;
    }
  });

  // Buscar categorias e fornecedores existentes
  useEffect(() => {
    if (isOpen) {
      fetchCategoriesAndSuppliers();
    }
  }, [isOpen]);

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


  const handleClose = () => {
    if (isLoading) return; // Não permitir fechar durante envio
    form.reset();
    setShowCustomSupplier(false);
    onClose();
  };

  const handleSupplierChange = (value: string) => {
    form.setValue('supplier', value);
    setShowCustomSupplier(value === 'custom');
    if (value !== 'custom') {
      form.setValue('custom_supplier', '');
    }
  };

  // Handler para scanner de código de barras
  const handleBarcodeScanned = async (code: string, type: 'package' | 'unit') => {
    if (type === 'package') {
      form.setValue('package_barcode', code);
    } else {
      form.setValue('unit_barcode', code);
    }
    setActiveScanner(null);
    
    toast({
      title: "✅ Código escaneado!",
      description: `Código ${type === 'package' ? 'do pacote' : 'da unidade'} registrado: ${code}`,
      variant: "default",
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          <Plus className="h-5 w-5 text-yellow-400" />
          Adicionar Novo Produto
        </>
      }
      description="Preencha os dados do produto. Campos com * são obrigatórios."
      size="5xl"
      className="h-content-2xl max-h-content-2xl bg-black/95 backdrop-blur-sm border border-white/10 flex flex-col hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto pr-2" onMouseMove={handleMouseMove}>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-8">
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

                {/* Código de barras da unidade - condicional */}
                {form.watch('has_unit_tracking') && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-700/50">
                      <ShoppingCart className="h-4 w-4 text-yellow-400" />
                      <FormLabel className="text-base text-gray-300 font-medium">Código da Unidade Individual</FormLabel>
                    </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                    <div className="space-y-3">
                      {activeScanner !== 'unit' ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveScanner('unit')}
                          className="w-full h-11 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 transition-all duration-200"
                          disabled={isLoading}
                        >
                          <ScanLine className="h-4 w-4 mr-2" />
                          Escanear Código da Unidade
                        </Button>
                      ) : (
                        <BarcodeInput
                          onScan={(code) => handleBarcodeScanned(code, 'unit')}
                          placeholder="Escaneie o código da unidade..."
                          autoFocus={true}
                          className="w-full"
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="unit_barcode"
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
                    <div className="hidden lg:flex items-start justify-center text-gray-500 pt-2">
                      <div className="text-center">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Código principal do produto</p>
                      </div>
                    </div>
                  </div>
                  </div>
                )}

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

              {/* Estoque */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hero-spotlight hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                  <Package className="h-5 w-5 text-yellow-400" />
                  Controle de Estoque
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Quantidade Inicial</FormLabel>
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
                        Quantidade em estoque
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
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Adicionar Produto
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

export default NewProductModal;