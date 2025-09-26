/**
 * SimpleEditProductModal.tsx - Modal simplificado para edição rápida de produtos
 * Foco na usabilidade diária com 6-8 campos essenciais
 *
 * @author Adega Manager Team
 * @version 2.0.0 - Simplificação
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedBaseModal } from '@/shared/ui/composite';
import {
  Form,
  FormControl,
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
import { useToast } from '@/shared/hooks/common/use-toast';
import { cn } from '@/core/config/utils';
import { supabase } from '@/core/api/supabase/client';
import {
  Edit,
  Save,
  X,
  Package,
  DollarSign,
  Barcode,
  ScanLine,
  ChevronDown,
  ChevronUp,
  TrendingUp
} from 'lucide-react';
import type { Product } from '@/core/types/inventory.types';

// Schema simplificado - apenas campos essenciais
const simpleEditProductSchema = z.object({
  // Campos obrigatórios básicos
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),

  category: z
    .string()
    .min(1, 'Categoria é obrigatória'),

  price: z
    .number({ invalid_type_error: 'Preço de venda deve ser um número' })
    .min(0.01, 'Preço de venda deve ser maior que 0'),

  // Campos opcionais essenciais
  barcode: z
    .string()
    .optional()
    .or(z.literal('')),


  supplier: z
    .string()
    .optional()
    .or(z.literal('')),

  // Sistema de códigos inteligente
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

  // Campos para cálculo de margem (seção avançada)
  cost_price: z
    .number({ invalid_type_error: 'Preço de custo deve ser um número' })
    .min(0, 'Preço de custo deve ser maior que 0')
    .optional(),

  volume_ml: z
    .number({ invalid_type_error: 'Volume deve ser um número' })
    .min(1, 'Volume deve ser maior que 0')
    .optional(),
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);

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
      package_price: 0,
      cost_price: 0,
      volume_ml: 0,
    },
  });

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
        package_price: product.package_price ? Number(product.package_price) : 0,
        cost_price: product.cost_price ? Number(product.cost_price) : 0,
        volume_ml: product.volume_ml ? Number(product.volume_ml) : 0,
      });

      // Se tem preço de custo, mostrar seção avançada automaticamente
      if (product.cost_price && Number(product.cost_price) > 0) {
        setShowAdvanced(true);
      }

      fetchCategoriesAndSuppliers();
    }
  }, [isOpen, product, form]);

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

  // Cálculo de margem em tempo real
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

  const handleFormSubmit = (data: SimpleEditProductFormData) => {
    // Converter "none" para string vazia e campos vazios para null (exceto cost_price)
    const processedData = {
      ...data,
      supplier: data.supplier === 'none' ? '' : data.supplier,
      package_price: data.package_price === 0 ? undefined : data.package_price,
      cost_price: data.cost_price, // Permitir cost_price = 0, só converter undefined/null
      volume_ml: data.volume_ml === 0 ? undefined : data.volume_ml,
    };
    onSubmit(processedData);
  };

  const handleClose = () => {
    if (isLoading) return;
    form.reset();
    setShowAdvanced(false);
    setActiveScanner(null);
    onClose();
  };

  const handleBarcodeScanned = async (code: string, type: 'main' | 'package') => {
    try {
      // Validação básica
      const currentValues = form.getValues();
      const duplicateField =
        (type !== 'main' && currentValues.barcode === code) ? 'principal' :
        (type !== 'package' && currentValues.package_barcode === code) ? 'pacote' : null;

      if (duplicateField) {
        toast({
          title: "⚠️ Código duplicado",
          description: `Este código já está sendo usado no campo ${duplicateField}`,
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

      toast({
        title: "✅ Código escaneado!",
        description: `Código ${type === 'main' ? 'principal' : 'do pacote'} registrado: ${code}`,
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
      subtitle={`Edite rapidamente "${product.name}"`}
      customIcon={Edit}
      loading={isLoading}
      size="2xl" // Tamanho ajustado para melhor layout
      className="max-h-[90vh] overflow-y-auto"
      primaryAction={{
        label: isLoading ? "Salvando..." : "Salvar",
        icon: isLoading ? undefined : Save,
        onClick: form.handleSubmit(handleFormSubmit),
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
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Hidden submit button for form submission */}
          <button type="submit" className="hidden" />

          {/* ===== SEÇÃO PRINCIPAL - SEMPRE VISÍVEL ===== */}
          <div className="bg-gray-800/30 rounded-lg border border-gray-600/50 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-blue-400" />
              <span className="text-lg font-medium text-gray-100">Informações Essenciais</span>
            </div>

            {/* Nome do Produto */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 text-base">Nome do Produto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Cerveja Heineken 350ml"
                      {...field}
                      className="bg-gray-800/50 border-gray-600 text-white h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria e Preço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-base">Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12 text-base">
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-base">Preço de Venda *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gray-800/50 border-gray-600 text-white h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Código de Barras */}
            <div className="space-y-3">
              <FormLabel className="text-gray-300 text-base">Código de Barras</FormLabel>
              {activeScanner !== 'main' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveScanner('main')}
                  className="w-full h-12 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                  disabled={isLoading}
                >
                  <ScanLine className="h-4 w-4 mr-2" />
                  Escanear Código
                </Button>
              ) : (
                <BarcodeInput
                  onScan={(code) => handleBarcodeScanned(code, 'main')}
                  placeholder="Escaneie o código..."
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
                        placeholder="Ou digite manualmente"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                        maxLength={14}
                        className="font-mono bg-gray-800/50 border-gray-600 text-white h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fornecedor */}
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 text-base">Fornecedor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12 text-base">
                        <SelectValue placeholder="Selecione ou deixe vazio..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sem fornecedor</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Toggle para Embalagem Fechada */}
            <div className="flex items-center justify-between rounded-lg border border-yellow-400/30 p-4 bg-yellow-400/5">
              <div className="space-y-1">
                <FormLabel className="text-base text-gray-300 font-medium">
                  Este produto tem embalagem fechada?
                </FormLabel>
                <p className="text-sm text-gray-500">
                  Ative para produtos vendidos em pacotes/fardos com código separado
                </p>
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

            {/* Campos de Pacote (Condicional) */}
            {form.watch('has_package_tracking') && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-yellow-400" />
                  <span className="text-base font-medium text-gray-200">Configuração de Pacote</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Código do Pacote */}
                  <div className="space-y-3">
                    <FormLabel className="text-gray-300">Código do Pacote</FormLabel>
                    {activeScanner !== 'package' ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveScanner('package')}
                        className="w-full h-12 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                        disabled={isLoading}
                      >
                        <ScanLine className="h-4 w-4 mr-2" />
                        Escanear Código
                      </Button>
                    ) : (
                      <BarcodeInput
                        onScan={(code) => handleBarcodeScanned(code, 'package')}
                        placeholder="Escaneie o código do pacote..."
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
                              placeholder="Ou digite manualmente"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                              maxLength={14}
                              className="font-mono bg-gray-800/50 border-gray-600 text-white h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Unidades por Pacote */}
                  <FormField
                    control={form.control}
                    name="package_units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Unidades por Pacote</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="999"
                            placeholder="Ex: 24"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-gray-800/50 border-gray-600 text-white h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Preço do Pacote */}
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
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          className="bg-gray-800/50 border-gray-600 text-white h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* ===== SEÇÃO AVANÇADA - COLAPSÁVEL ===== */}
          <div className="bg-gray-800/20 rounded-lg border border-gray-600/30">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 justify-between text-gray-300 hover:bg-gray-700/30"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-base font-medium">Configurações Avançadas</span>
                {calculatedMargin && (
                  <span className="text-sm bg-green-400/20 text-green-400 px-2 py-1 rounded">
                    Margem: {calculatedMargin}%
                  </span>
                )}
              </div>
              {showAdvanced ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>

            {showAdvanced && (
              <div className="p-6 space-y-6 border-t border-gray-700/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preço de Custo */}
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
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                            className="bg-gray-800/50 border-gray-600 text-white h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Volume */}
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
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                            className="bg-gray-800/50 border-gray-600 text-white h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Análise de Rentabilidade */}
                {(calculatedMargin || calculatedPackageMargin) && (
                  <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <span className="text-base font-medium text-green-300">Análise de Rentabilidade</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {calculatedMargin && (
                        <div className="text-center p-3 bg-green-500/10 rounded border border-green-400/20">
                          <div className="text-lg font-bold text-green-400">
                            {calculatedMargin}%
                          </div>
                          <div className="text-xs text-gray-400">Margem Unitária</div>
                        </div>
                      )}

                      {calculatedPackageMargin && (
                        <div className="text-center p-3 bg-green-500/10 rounded border border-green-400/20">
                          <div className="text-lg font-bold text-green-400">
                            {calculatedPackageMargin}%
                          </div>
                          <div className="text-xs text-gray-400">Margem do Pacote</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </Form>
    </EnhancedBaseModal>
  );
};

export default SimpleEditProductModal;