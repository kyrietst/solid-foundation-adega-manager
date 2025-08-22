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
import { ProductForm } from './ProductForm';
import { ProductDetailsModal } from './ProductDetailsModal';
import { StockAdjustmentModal, type StockAdjustment } from './StockAdjustmentModal';
import { StockHistoryModal } from './StockHistoryModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/primitives/dialog';
import type { ProductFormData } from '@/core/types/inventory.types';
import type { Product } from '@/types/inventory.types';

interface InventoryManagementProps {
  showAddButton?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  onProductSelect?: (product: any) => void;
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

  // Mutation para adicionar produto
  const addProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      // Validar código de barras se fornecido
      if (productData.barcode && productData.barcode.trim()) {
        const barcodePattern = /^[0-9]{8,14}$/;
        if (!barcodePattern.test(productData.barcode.trim())) {
          throw new Error('Código de barras deve conter apenas números e ter entre 8 e 14 dígitos');
        }
      }

      // Preparar dados para inserção, incluindo colunas faltantes
      const insertData = {
        name: productData.name,
        description: productData.description || null,
        price: productData.price,
        stock_quantity: productData.stock_quantity || 0,
        category: productData.category,
        vintage: productData.vintage || null,
        producer: productData.producer || null,
        country: productData.country || null,
        region: productData.region || null,
        alcohol_content: productData.alcohol_content || null,
        volume: null, // Campo legacy - mantido como null
        volume_ml: productData.volume_ml || null,
        image_url: productData.image_url || null,
        supplier: productData.supplier || null,
        minimum_stock: productData.minimum_stock || 5,
        cost_price: productData.cost_price || null,
        margin_percent: productData.margin_percent || null,
        unit_type: productData.unit_type || 'un',
        package_size: productData.package_size || 1,
        package_price: productData.package_price || null,
        package_margin: productData.package_margin || null,
        turnover_rate: productData.turnover_rate || 'medium',
        barcode: (productData.barcode && productData.barcode.trim()) ? productData.barcode.trim() : null,
        // Colunas faltantes com valores padrão
        measurement_type: null,
        measurement_value: null,
        is_package: false,
        units_per_package: 1
      };

      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalida as queries para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Fecha o modal
      setIsAddProductOpen(false);
      
      // Mostra mensagem de sucesso
      toast({
        title: 'Produto adicionado',
        description: `Produto "${data.name}" adicionado com sucesso!`,
        variant: 'default',
      });
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: 'Erro ao adicionar produto',
        description: 'Erro ao adicionar produto. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleAddProduct = () => {
    setIsAddProductOpen(true);
  };

  const handleSubmitProduct = (data: ProductFormData) => {
    addProductMutation.mutate(data);
  };

  const handleCancel = () => {
    setIsAddProductOpen(false);
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
    mutationFn: async (adjustment: StockAdjustment) => {
      const currentStock = selectedProduct?.stock_quantity || 0;
      let newStockQuantity: number;
      
      if (adjustment.type === 'ajuste') {
        newStockQuantity = adjustment.newStock || 0;
      } else {
        newStockQuantity = adjustment.type === 'entrada' 
          ? currentStock + adjustment.quantity
          : Math.max(0, currentStock - adjustment.quantity);
      }

      // Usar nossa função de registro de movimentação
      const { data: movementData, error: movementError } = await supabase
        .rpc('record_product_movement', {
          p_product_id: adjustment.productId,
          p_type: adjustment.type,
          p_quantity: adjustment.type === 'ajuste' 
            ? (newStockQuantity - currentStock) // Diferença para ajustes
            : adjustment.quantity,
          p_reason: adjustment.reason,
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
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsStockAdjustmentOpen(false);
      
      const typeText = variables.type === 'entrada' ? 'Entrada' : 
                      variables.type === 'saida' ? 'Saída' : 'Correção';
      toast({
        title: 'Estoque atualizado',
        description: `${typeText} de estoque realizada com sucesso!`,
        variant: 'default',
      });
    },
    onError: (error: any) => {
      console.error('Erro ao ajustar estoque:', error);
      toast({
        title: 'Erro ao ajustar estoque',
        description: 'Erro ao ajustar estoque. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleConfirmStockAdjustment = (adjustment: StockAdjustment) => {
    stockAdjustmentMutation.mutate(adjustment);
  };

  // Mutation para editar produto
  const editProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      if (!selectedProduct) throw new Error('Nenhum produto selecionado');

      // Validar código de barras se fornecido
      if (productData.barcode && productData.barcode.trim()) {
        const barcodePattern = /^[0-9]{8,14}$/;
        if (!barcodePattern.test(productData.barcode.trim())) {
          throw new Error('Código de barras deve conter apenas números e ter entre 8 e 14 dígitos');
        }
      }

      // Preparar dados para atualização
      const updateData = {
        name: productData.name,
        description: productData.description || null,
        price: productData.price,
        stock_quantity: productData.stock_quantity || 0,
        category: productData.category,
        vintage: productData.vintage || null,
        producer: productData.producer || null,
        country: productData.country || null,
        region: productData.region || null,
        alcohol_content: productData.alcohol_content || null,
        volume: null, // Campo legacy - mantido como null
        volume_ml: productData.volume_ml || null,
        image_url: productData.image_url || null,
        supplier: productData.supplier || null,
        minimum_stock: productData.minimum_stock || 5,
        cost_price: productData.cost_price || null,
        margin_percent: productData.margin_percent || null,
        unit_type: productData.unit_type || 'un',
        package_size: productData.package_size || 1,
        package_price: productData.package_price || null,
        package_margin: productData.package_margin || null,
        turnover_rate: productData.turnover_rate || 'medium',
        barcode: (productData.barcode && productData.barcode.trim()) ? productData.barcode.trim() : null,
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
    onError: (error: any) => {
      console.error('Erro ao editar produto:', error);
      toast({
        title: 'Erro ao editar produto',
        description: 'Erro ao editar produto. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitEditProduct = (data: ProductFormData) => {
    editProductMutation.mutate(data);
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
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ADICIONAR NOVO PRODUTO</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar um novo produto ao seu inventário.
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm
            onSubmit={handleSubmitProduct}
            onCancel={handleCancel}
            isLoading={addProductMutation.isPending}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

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
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>EDITAR PRODUTO</DialogTitle>
            <DialogDescription>
              Modifique as informações do produto. Apenas os campos alterados serão atualizados.
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm
            onSubmit={handleSubmitEditProduct}
            onCancel={handleCancelEdit}
            isLoading={editProductMutation.isPending}
            isEdit={true}
            initialData={selectedProduct ? {
              name: selectedProduct.name,
              description: selectedProduct.description || '',
              price: Number(selectedProduct.price) || 0,
              stock_quantity: selectedProduct.stock_quantity || 0,
              category: selectedProduct.category || '',
              vintage: selectedProduct.vintage ? Number(selectedProduct.vintage) : undefined,
              producer: selectedProduct.producer || '',
              country: selectedProduct.country || '',
              region: selectedProduct.region || '',
              alcohol_content: selectedProduct.alcohol_content ? Number(selectedProduct.alcohol_content) : undefined,
              volume_ml: selectedProduct.volume_ml ? Number(selectedProduct.volume_ml) : undefined,
              image_url: selectedProduct.image_url || '',
              supplier: selectedProduct.supplier || '',
              minimum_stock: selectedProduct.minimum_stock || 5,
              cost_price: Number(selectedProduct.cost_price) || 0,
              margin_percent: Number(selectedProduct.margin_percent) || 0,
              unit_type: selectedProduct.unit_type || 'un',
              package_size: selectedProduct.package_size ? Number(selectedProduct.package_size) : 1,
              package_price: selectedProduct.package_price ? Number(selectedProduct.package_price) : undefined,
              package_margin: selectedProduct.package_margin ? Number(selectedProduct.package_margin) : undefined,
              turnover_rate: selectedProduct.turnover_rate || 'medium',
              barcode: selectedProduct.barcode || '',
              // Incluir campos adicionais se existirem
              measurement_type: selectedProduct.measurement_type || undefined,
              measurement_value: selectedProduct.measurement_value || undefined,
              is_package: selectedProduct.is_package || false,
              units_per_package: selectedProduct.units_per_package ? Number(selectedProduct.units_per_package) : 1,
            } : undefined}
          />
        </DialogContent>
      </Dialog>

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