/**
 * Componente principal de gerenciamento de inventário
 * Inclui listagem de produtos e funcionalidade para adicionar novos produtos
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useMouseTracker } from '@/hooks/ui/useMouseTracker';
import { ProductsGridContainer } from './ProductsGridContainer';
import { ProductsTitle, ProductsHeader } from './ProductsHeader';
import { useProductsGridLogic } from '@/hooks/products/useProductsGridLogic';
import { NewProductModal } from './NewProductModal';
import { ProductDetailsModal } from './ProductDetailsModal';
import { EditProductModal } from './EditProductModal';
import { StockAdjustmentModal, type StockAdjustmentWithVariant } from './StockAdjustmentModal';
import { StockHistoryModal } from './StockHistoryModal';
import type { ProductFormData } from '@/core/types/inventory.types';

interface EditProductFormData {
  name: string;
  category: string;
  unit_barcode?: string;
  has_unit_tracking?: boolean;
  has_package_tracking?: boolean;
  package_barcode?: string;
  package_units?: number;
  package_price?: number;
  supplier?: string;
  custom_supplier?: string;
  cost_price?: number;
  price: number;
  volume_ml?: number;
  stock_quantity: number;
  minimum_stock?: number;
}
import type { Product } from '@/types/inventory.types';

interface InventoryManagementProps {
  showAddButton?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  onProductSelect?: (product: Product) => void;
  className?: string;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({
  showAddButton = false,
  showSearch = true,
  showFilters = true,
  onProductSelect,
  className,
}) => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleMouseMove } = useMouseTracker();


  const handleAddProduct = () => {
    setIsAddProductOpen(true);
  };


  // Handlers para os modais de inventário
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setIsStockAdjustmentOpen(true);
  };

  const handleViewHistory = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
  };

  // Mutation para ajuste de estoque com registro de movimentação
  const stockAdjustmentMutation = useMutation({
    mutationFn: async (adjustment: StockAdjustmentWithVariant) => {
      // Verificar se é ajuste de variante (novo sistema) ou produto legado
      if (adjustment.variantId && adjustment.variantType) {
        // NOVO SISTEMA: Usar função de variantes
        const { data: result, error: variantError } = await supabase
          .rpc('adjust_variant_stock', {
            p_variant_id: adjustment.variantId,
            p_adjustment_type: adjustment.type,
            p_quantity: adjustment.quantity,
            p_reason: adjustment.reason || `Ajuste de ${adjustment.variantType} via interface`,
            p_new_stock: adjustment.newStock // Para tipo 'ajuste'
          });

        if (variantError) {
          console.error('Erro ao ajustar variante:', variantError);
          throw new Error(`Erro no ajuste de variante: ${variantError.message}`);
        }

        return { variantResult: result, isVariant: true };
      } else {
        // SISTEMA LEGADO: Manter funcionalidade existente
        const currentStock = selectedProduct?.stock_quantity || 0;
        let newStockQuantity: number;
        
        if (adjustment.type === 'ajuste') {
          newStockQuantity = adjustment.newStock || 0;
        } else {
          newStockQuantity = adjustment.type === 'entrada' 
            ? currentStock + adjustment.quantity
            : Math.max(0, currentStock - adjustment.quantity);
        }

        const { data: movementData, error: movementError } = await supabase
          .rpc('record_product_movement', {
            p_product_id: adjustment.productId,
            p_type: adjustment.type,
            p_quantity: adjustment.type === 'ajuste' 
              ? (newStockQuantity - currentStock)
              : adjustment.quantity,
            p_reason: adjustment.reason || 'Ajuste de estoque via interface',
            p_source: 'manual',
            p_user_id: (await supabase.auth.getUser()).data.user?.id || null
          });

        if (movementError) {
          console.error('Erro ao registrar movimentação:', movementError);
          throw movementError;
        }

        // Buscar o produto atualizado
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', adjustment.productId)
          .single();

        if (error) throw error;
        
        return { productData: data, isVariant: false };
      }
    },
    onSuccess: (data, variables) => {
      // Invalidar múltiplos caches para garantir atualização
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Se foi ajuste de variante, invalidar todos os caches relacionados ao produto
      if (data.isVariant && variables.productId) {
        queryClient.invalidateQueries({ queryKey: ['product-variants', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['product-variants'] }); // Invalidar geral também
        
        // Force refetch do produto específico
        queryClient.refetchQueries({ 
          queryKey: ['product-variants', variables.productId],
          exact: false 
        });
      }
      
      // Invalidar cache geral de produtos com variantes se existir
      queryClient.invalidateQueries({ queryKey: ['products-with-variants'] });
      
      setIsStockAdjustmentOpen(false);
      
      const typeText = variables.type === 'entrada' ? 'Entrada' : 
                      variables.type === 'saida' ? 'Saída' : 'Correção';
      toast({
        title: 'Estoque atualizado',
        description: `${typeText} de estoque realizada com sucesso!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Erro ao ajustar estoque:', error);
      toast({
        title: 'Erro ao ajustar estoque',
        description: 'Erro ao ajustar estoque. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleConfirmStockAdjustment = (adjustment: StockAdjustmentWithVariant) => {
    stockAdjustmentMutation.mutate(adjustment);
  };

  // Mutation para editar produto
  const editProductMutation = useMutation({
    mutationFn: async (productData: EditProductFormData) => {
      if (!selectedProduct) throw new Error('Nenhum produto selecionado');

      // Preparar fornecedor final
      const finalSupplier = productData.supplier === 'custom' ? productData.custom_supplier : productData.supplier;

      // Validar códigos de barras se fornecidos
      if (productData.barcode && productData.barcode.trim()) {
        const barcodePattern = /^[0-9]{8,14}$/;
        if (!barcodePattern.test(productData.barcode.trim())) {
          throw new Error('Código de barras deve conter apenas números e ter entre 8 e 14 dígitos');
        }
      }
      if (productData.package_barcode && productData.package_barcode.trim()) {
        const barcodePattern = /^[0-9]{8,14}$/;
        if (!barcodePattern.test(productData.package_barcode.trim())) {
          throw new Error('Código de barras do pacote deve conter apenas números e ter entre 8 e 14 dígitos');
        }
      }

      // Preparar dados para atualização
      const updateData = {
        name: productData.name,
        price: productData.price,
        stock_quantity: productData.stock_quantity || 0,
        category: productData.category,
        volume_ml: productData.volume_ml || null,
        supplier: finalSupplier || null,
        minimum_stock: productData.minimum_stock || null,
        cost_price: productData.cost_price || null,
        // Sistema de códigos de barras - mapeamento correto
        barcode: productData.barcode || null, // Código principal (corrigido)
        package_barcode: productData.package_barcode || null,
        package_units: productData.package_units || null,
        units_per_package: productData.package_units || 1, // Mantém compatibilidade
        has_package_tracking: productData.has_package_tracking || false,
        has_unit_tracking: productData.has_unit_tracking !== undefined ? productData.has_unit_tracking : true,
        // Preços
        package_price: productData.package_price || null,
        // Calcular margens se houver preço de custo
        margin_percent: (productData.cost_price && productData.price) ? 
          ((productData.price - productData.cost_price) / productData.cost_price * 100) : null,
        // Calcular margem de pacote (se houver preço de pacote)
        package_margin: (productData.package_price && productData.cost_price && productData.package_units) ? 
          (((productData.package_price - (productData.cost_price * productData.package_units)) / (productData.cost_price * productData.package_units)) * 100) : null,
        // Controle de validade
        has_expiry_tracking: productData.has_expiry_tracking || false,
        expiry_date: productData.expiry_date || null,
        // Campos de compatibilidade
        turnover_rate: 'medium',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', selectedProduct.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditProductOpen(false);
      setSelectedProduct(null);
      toast({
        title: 'Produto atualizado',
        description: `Produto "${data.name}" atualizado com sucesso!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Erro ao editar produto:', error);
      toast({
        title: 'Erro ao editar produto',
        description: 'Erro ao editar produto. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitEditProduct = (data: EditProductFormData) => {
    // Preparar dados com o mesmo formato que o mutation espera
    const formattedData = {
      ...data,
      // Preparar dados adicionais se necessário
      barcode: data.unit_barcode || data.barcode,
    };
    editProductMutation.mutate(formattedData);
  };

  const handleCancelEdit = () => {
    setIsEditProductOpen(false);
    setSelectedProduct(null);
  };

  // Hook para obter dados dos produtos usando o hook existente
  const productsGridData = useProductsGridLogic({
    showSearch: false,
    showFilters: false
  });

  return (
    <div className={`w-full h-full flex flex-col ${className || ''}`}>
      {/* Título e contador na mesma linha, fora do box background */}
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        <ProductsTitle />
        <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-3 shadow-lg">
          <span className="text-base font-bold text-gray-100">{productsGridData.totalProducts}</span>
          <span className="text-sm ml-2 opacity-75 text-gray-300">produtos</span>
        </div>
      </div>

      {/* Container com background glass morphism - ocupa altura restante */}
      <div 
        className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hero-spotlight p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300"
        onMouseMove={handleMouseMove}
      >
        {/* Grid de produtos com controles dentro do box */}
        <ProductsGridContainer
          showSearch={showSearch}
          showFilters={showFilters}
          showAddButton={showAddButton}
          showHeader={false}
          mode="inventory"
          onAddToCart={onProductSelect}
          onAddProduct={showAddButton ? handleAddProduct : undefined}
          onViewDetails={handleViewDetails}
          onEdit={handleEditProduct}
          onAdjustStock={handleAdjustStock}
        />
      </div>

      {/* Modal para adicionar produto */}
      <NewProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSuccess={() => {
          // Invalidar queries para atualizar a lista de produtos
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
      />

      {/* Modal de detalhes do produto */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProduct(null);
        }}
        onAdjustStock={handleAdjustStock}
        onViewHistory={handleViewHistory}
      />

      {/* Modal de ajuste de estoque */}
      <StockAdjustmentModal
        product={selectedProduct}
        isOpen={isStockAdjustmentOpen}
        onClose={() => {
          setIsStockAdjustmentOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmStockAdjustment}
        isLoading={stockAdjustmentMutation.isPending}
      />

      {/* Modal para editar produto */}
      <EditProductModal
        isOpen={isEditProductOpen}
        onClose={handleCancelEdit}
        product={selectedProduct}
        onSubmit={handleSubmitEditProduct}
        isLoading={editProductMutation.isPending}
        onSuccess={() => {
          // Invalidar queries para atualizar a lista de produtos
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
      />

      {/* Modal de histórico de movimentações */}
      <StockHistoryModal
        product={selectedProduct}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default InventoryManagement;