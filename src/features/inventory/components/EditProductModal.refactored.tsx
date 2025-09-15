/**
 * EditProductModal.tsx - Modal para edição de produtos (REFATORADO)
 * Context7 Pattern: Container/Presentation pattern aplicado
 * Bulletproof React: Componentes menores e responsabilidades específicas
 *
 * REFATORAÇÃO APLICADA:
 * - Dividido em 4 subcomponentes especializados
 * - Redução massiva de linhas de código
 * - Maior reutilização e manutenibilidade
 * - Separação clara de responsabilidades
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BaseModal } from '@/shared/ui/composite';
import { Form } from '@/shared/ui/primitives/form';
import { Button } from '@/shared/ui/primitives/button';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import { useProductVariants } from '@/features/sales/hooks/useProductVariants';
import { supabase } from '@/core/api/supabase/client';

// Componentes refatorados
import { ProductBasicInfoForm } from '@/features/inventory/components/form-sections/ProductBasicInfoForm';
import { ProductPricingForm } from '@/features/inventory/components/form-sections/ProductPricingForm';
import { ProductTrackingForm } from '@/features/inventory/components/form-sections/ProductTrackingForm';
import { ProductStockDisplay } from '@/features/inventory/components/form-sections/ProductStockDisplay';

import { Edit, Save, X } from 'lucide-react';

// Schemas de validação (simplificados)
const editProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  supplier: z.string().optional(),
  custom_supplier: z.string().optional(),
  cost_price: z.coerce.number().min(0, 'Preço de custo deve ser positivo').optional(),
  sale_price: z.coerce.number().min(0, 'Preço de venda deve ser positivo'),
  barcode: z.string().optional(),
  package_barcode: z.string().optional(),
  has_unit_tracking: z.boolean(),
  has_package_tracking: z.boolean(),
  units_per_package: z.coerce.number().min(1).optional(),
  volume: z.string().optional(),
  alcohol_content: z.string().optional(),
  package_cost_price: z.coerce.number().min(0).optional(),
  package_sale_price: z.coerce.number().min(0).optional(),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product: any;
  onSubmit?: (data: EditProductFormData) => Promise<void>;
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
  const { handleMouseMove } = useGlassmorphismEffect();
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [showCustomSupplier, setShowCustomSupplier] = useState(false);
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);

  // Buscar dados de variantes para exibição read-only
  const productId = product?.id || '';
  const { data: productWithVariants, isLoading: variantsLoading } = useProductVariants(productId);

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: '',
      category: '',
      supplier: '',
      has_unit_tracking: true,
      has_package_tracking: false,
      sale_price: 0,
    },
  });

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Carregar categorias e fornecedores
        const [categoriesRes, suppliersRes] = await Promise.all([
          supabase.from('products').select('category').not('category', 'is', null),
          supabase.from('products').select('supplier').not('supplier', 'is', null),
        ]);

        if (categoriesRes.data) {
          const uniqueCategories = [...new Set(categoriesRes.data.map(p => p.category))];
          setCategories(uniqueCategories);
        }

        if (suppliersRes.data) {
          const uniqueSuppliers = [...new Set(suppliersRes.data.map(p => p.supplier))];
          setSuppliers(uniqueSuppliers);
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    };

    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Preencher formulário quando produto for carregado
  useEffect(() => {
    if (isOpen && product) {
      form.reset({
        name: product.name || '',
        category: product.category || '',
        supplier: product.supplier || '',
        cost_price: product.cost_price || undefined,
        sale_price: product.sale_price || 0,
        barcode: product.barcode || '',
        package_barcode: product.package_barcode || '',
        has_unit_tracking: product.has_unit_tracking ?? true,
        has_package_tracking: product.has_package_tracking ?? false,
        units_per_package: product.units_per_package || undefined,
        volume: product.volume || '',
        alcohol_content: product.alcohol_content || '',
        package_cost_price: product.package_cost_price || undefined,
        package_sale_price: product.package_sale_price || undefined,
      });
    }
  }, [isOpen, product, form]);

  const handleFormSubmit = async (data: EditProductFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Submissão padrão para Supabase
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', product.id);

        if (error) throw error;
      }

      toast({
        title: "Produto atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setShowCustomSupplier(false);
    setActiveScanner(null);
    onClose();
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
      className="max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-sm border border-white/10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Formulário Principal (2/3 da tela) */}
        <div className="lg:col-span-2 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">

              {/* Seção 1: Informações Básicas */}
              <div
                className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300"
                onMouseMove={handleMouseMove}
              >
                <ProductBasicInfoForm
                  form={form}
                  categories={categories}
                  suppliers={suppliers}
                  showCustomSupplier={showCustomSupplier}
                  onShowCustomSupplier={setShowCustomSupplier}
                />
              </div>

              {/* Seção 2: Preços e Margens */}
              <div
                className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300"
                onMouseMove={handleMouseMove}
              >
                <ProductPricingForm form={form} />
              </div>

              {/* Seção 3: Controle e Códigos de Barras */}
              <div
                className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300"
                onMouseMove={handleMouseMove}
              >
                <ProductTrackingForm
                  form={form}
                  activeScanner={activeScanner}
                  onScannerChange={setActiveScanner}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-600">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Seção 4: Visualização do Estoque (1/3 da tela) */}
        <div className="lg:col-span-1">
          <div
            className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300 sticky top-0"
            onMouseMove={handleMouseMove}
          >
            <ProductStockDisplay
              product={productWithVariants}
              isLoading={variantsLoading}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default EditProductModal;