/**
 * Componente principal de gerenciamento de inventário
 * Inclui listagem de produtos e funcionalidade para adicionar novos produtos
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useNotifications } from '@/shared/hooks/common/useNotifications';
import { useMouseTracker } from '@/hooks/ui/useMouseTracker';
import { ProductsGridContainer } from './ProductsGridContainer';
import { ProductsTitle, ProductsHeader } from './ProductsHeader';
import { useProductsGridLogic } from '@/hooks/products/useProductsGridLogic';
import { ProductForm } from './ProductForm';
import { ProductDetailsModal } from './ProductDetailsModal';
import { StockAdjustmentModal, type StockAdjustment } from './StockAdjustmentModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/primitives/dialog';
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
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  const { handleMouseMove } = useMouseTracker();

  // Mutation para adicionar produto
  const addProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock_quantity: productData.stock_quantity,
          category: productData.category,
          vintage: productData.vintage,
          producer: productData.producer,
          country: productData.country,
          region: productData.region,
          alcohol_content: productData.alcohol_content,
          volume: productData.volume,
          volume_ml: productData.volume_ml,
          image_url: productData.image_url,
          supplier: productData.supplier,
          minimum_stock: productData.minimum_stock,
          cost_price: productData.cost_price,
          margin_percent: productData.margin_percent,
          unit_type: productData.unit_type,
          package_size: productData.package_size,
          package_price: productData.package_price,
          package_margin: productData.package_margin,
          turnover_rate: productData.turnover_rate,
          barcode: productData.barcode,
        }])
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
      showSuccess(`Produto "${data.name}" adicionado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar produto:', error);
      showError('Erro ao adicionar produto. Tente novamente.');
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
    // TODO: Implementar histórico de movimentações
    console.log('View history:', product);
    showSuccess('Histórico de movimentações será implementado em breve');
  };

  // Mutation para ajuste de estoque
  const stockAdjustmentMutation = useMutation({
    mutationFn: async (adjustment: StockAdjustment) => {
      let newStockQuantity: number;
      
      if (adjustment.type === 'correction') {
        newStockQuantity = adjustment.newStock || 0;
      } else {
        const currentStock = selectedProduct?.stock_quantity || 0;
        newStockQuantity = adjustment.type === 'entry' 
          ? currentStock + adjustment.quantity
          : Math.max(0, currentStock - adjustment.quantity);
      }

      const { data, error } = await supabase
        .from('products')
        .update({ stock_quantity: newStockQuantity })
        .eq('id', adjustment.productId)
        .select()
        .single();

      if (error) throw error;

      // TODO: Registrar movimento na tabela stock_movements
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsStockAdjustmentOpen(false);
      
      const typeText = variables.type === 'entry' ? 'Entrada' : 
                      variables.type === 'exit' ? 'Saída' : 'Correção';
      showSuccess(`${typeText} de estoque realizada com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao ajustar estoque:', error);
      showError('Erro ao ajustar estoque. Tente novamente.');
    },
  });

  const handleConfirmStockAdjustment = (adjustment: StockAdjustment) => {
    stockAdjustmentMutation.mutate(adjustment);
  };

  // Mutation para editar produto
  const editProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      if (!selectedProduct) throw new Error('Nenhum produto selecionado');

      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock_quantity: productData.stock_quantity,
          category: productData.category,
          vintage: productData.vintage,
          producer: productData.producer,
          country: productData.country,
          region: productData.region,
          alcohol_content: productData.alcohol_content,
          volume: productData.volume,
          volume_ml: productData.volume_ml,
          image_url: productData.image_url,
          supplier: productData.supplier,
          minimum_stock: productData.minimum_stock,
          cost_price: productData.cost_price,
          margin_percent: productData.margin_percent,
          unit_type: productData.unit_type,
          package_size: productData.package_size,
          package_price: productData.package_price,
          package_margin: productData.package_margin,
          turnover_rate: productData.turnover_rate,
          barcode: productData.barcode,
        })
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
      showSuccess(`Produto "${data.name}" atualizado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao editar produto:', error);
      showError('Erro ao editar produto. Tente novamente.');
    },
  });

  const handleSubmitEditProduct = (data: ProductFormData) => {
    editProductMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    setIsEditProductOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className={`w-full h-full flex flex-col ${className || ''}`}>
      {/* Título e contador na mesma linha, fora do box background */}
      <div className="flex-shrink-0 flex justify-between items-center">
        <ProductsTitle />
        <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm font-bold text-gray-100">125</span>
          <span className="text-xs ml-1 opacity-75 text-gray-300">produtos</span>
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
        onEdit={handleEditProduct}
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
          </DialogHeader>
          
          <ProductForm
            onSubmit={handleSubmitEditProduct}
            onCancel={handleCancelEdit}
            isLoading={editProductMutation.isPending}
            isEdit={true}
            initialData={selectedProduct ? {
              name: selectedProduct.name,
              description: selectedProduct.description || '',
              price: selectedProduct.price,
              stock_quantity: selectedProduct.stock_quantity,
              category: selectedProduct.category,
              vintage: selectedProduct.vintage || '',
              producer: selectedProduct.producer || '',
              country: selectedProduct.country || '',
              region: selectedProduct.region || '',
              alcohol_content: selectedProduct.alcohol_content || 0,
              volume: selectedProduct.volume || '',
              volume_ml: selectedProduct.volume_ml || 0,
              image_url: selectedProduct.image_url || '',
              supplier: selectedProduct.supplier || '',
              minimum_stock: selectedProduct.minimum_stock || 0,
              cost_price: selectedProduct.cost_price || 0,
              margin_percent: selectedProduct.margin_percent || 0,
              unit_type: selectedProduct.unit_type || '',
              package_size: selectedProduct.package_size || 0,
              package_price: selectedProduct.package_price || 0,
              package_margin: selectedProduct.package_margin || 0,
              turnover_rate: selectedProduct.turnover_rate || '',
              barcode: selectedProduct.barcode || '',
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;