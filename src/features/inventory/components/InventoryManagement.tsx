/**
 * Componente principal de gerenciamento de inventário
 * Inclui listagem de produtos e funcionalidade para adicionar novos produtos
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useNotifications } from '@/shared/hooks/common/useNotifications';
import { ProductsGridContainer } from './ProductsGridContainer';
import { ProductForm } from './ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/primitives/dialog';
import type { ProductFormData } from '@/core/types/inventory.types';

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
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

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

  return (
    <div className={className}>
      {/* Grid de produtos com botão de adicionar */}
      <ProductsGridContainer
        showSearch={showSearch}
        showFilters={showFilters}
        showAddButton={showAddButton}
        onAddToCart={onProductSelect}
        onAddProduct={showAddButton ? handleAddProduct : undefined}
      />

      {/* Modal para adicionar produto */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
          </DialogHeader>
          
          <ProductForm
            onSubmit={handleSubmitProduct}
            onCancel={handleCancel}
            isLoading={addProductMutation.isPending}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;