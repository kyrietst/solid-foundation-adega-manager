/**
 * Componente principal de gerenciamento de inventário
 * Inclui listagem de produtos e funcionalidade para adicionar novos produtos
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { ProductsGridContainer } from './ProductsGridContainer';
import { ProductsTitle, ProductsHeader } from './ProductsHeader';
import { useProductsGridLogic } from '@/shared/hooks/products/useProductsGridLogic';
// Imports dos modais refatorados - Força HMR refresh para carregar logs de diagnóstico
import { NewProductModal } from './NewProductModal';
import { SimpleProductViewModal } from './SimpleProductViewModal'; // Modal simplificado v2.0
import { SimpleEditProductModal } from './SimpleEditProductModal'; // Modal simplificado v2.0
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockHistoryModal } from './StockHistoryModal';
import type { ProductFormData } from '@/core/types/inventory.types';

// Interface simplificada para edição de produtos (v2.0)
interface SimpleEditProductFormData {
  name: string;
  category: string;
  price: number;
  barcode?: string;
  supplier?: string;
  has_package_tracking?: boolean;
  package_barcode?: string;
  package_units?: number;
  package_price?: number;
  cost_price?: number;
  volume_ml?: number;
  // minimum_stock removido - coluna não existe na tabela products
}
import type { Product } from '@/core/types/inventory.types';

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
  const { handleMouseMove } = useGlassmorphismEffect();


  const handleAddProduct = () => {
    setIsAddProductOpen(true);
  };


  // Handlers para os modais de inventário
  const handleViewDetails = async (product: Product) => {
    // Buscar dados atualizados do produto específico do banco (igual ao handleEditProduct)
    try {
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();

      if (error) {
        console.error('Erro ao buscar produto atualizado para visualização:', error);
        // Fallback para produto original se houver erro
        setSelectedProduct(product);
      } else {
        // Usar dados atualizados do banco
        setSelectedProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Erro na busca do produto para visualização:', error);
      setSelectedProduct(product);
    }

    setIsDetailsModalOpen(true);
  };

  const handleEditProduct = async (product: Product) => {
    // Buscar dados atualizados do produto específico do banco
    try {
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();

      if (error) {
        console.error('Erro ao buscar produto atualizado:', error);
        // Fallback para produto original se houver erro
        setSelectedProduct(product);
      } else {
        // Usar dados atualizados do banco
        setSelectedProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Erro na busca do produto:', error);
      setSelectedProduct(product);
    }

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

  // REMOVIDO: Mutação antiga substituída pelo novo StockAdjustmentModal
  /* CÓDIGO REMOVIDO - Substituído pelo novo StockAdjustmentModal
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

        // Usar nova RPC create_inventory_movement do Single Source of Truth
        const movementType = adjustment.type === 'entrada' ? 'inventory_adjustment' :
                            adjustment.type === 'saida' ? 'inventory_adjustment' :
                            'inventory_adjustment'; // Todos são ajustes de inventário

        const quantityChange = adjustment.type === 'ajuste'
          ? (newStockQuantity - currentStock)
          : (adjustment.type === 'entrada' ? adjustment.quantity : -adjustment.quantity);

        const { data: movementData, error: movementError } = await supabase
          .rpc('create_inventory_movement', {
            p_product_id: adjustment.productId,
            p_quantity_change: quantityChange,
            p_type: movementType,
            p_reason: adjustment.reason || 'Ajuste de estoque via interface',
            p_metadata: {
              operation: 'stock_adjustment',
              adjustment_type: adjustment.type,
              interface_source: 'inventory_management',
              previous_stock: currentStock,
              new_stock: newStockQuantity,
              user_action: 'manual_adjustment'
            }
          });

        if (movementError) {
          console.error('Erro ao registrar movimentação:', movementError);
          throw movementError;
        }

        // Nossa RPC retorna o novo estoque, não precisamos buscar o produto novamente
        return {
          productData: {
            id: adjustment.productId,
            stock_quantity: movementData.new_stock,
            movement_id: movementData.movement_id
          },
          isVariant: false
        };
      }
    },
    onSuccess: (data, variables) => {
      // Invalidar múltiplos caches para garantir atualização (incluindo movimentações)
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_movements'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });

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
  */

  // Mutation simplificada para editar produto (v2.0)
  const editProductMutation = useMutation({
    mutationFn: async (productData: SimpleEditProductFormData) => {
      if (!selectedProduct) throw new Error('Nenhum produto selecionado');

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

      // Preparar dados simplificados para atualização
      const updateData = {
        name: productData.name,
        price: productData.price,
        // stock_quantity: REMOVIDO - só pode ser alterado via create_inventory_movement()
        category: productData.category,
        volume_ml: productData.volume_ml || null,
        supplier: productData.supplier || null,
        // minimum_stock removido - coluna não existe na tabela products
        cost_price: productData.cost_price !== undefined ? productData.cost_price : null,
        // Sistema de códigos simplificado
        barcode: productData.barcode || null,
        package_barcode: productData.package_barcode || null,
        package_units: productData.package_units || null,
        units_per_package: productData.package_units || 1,
        has_package_tracking: productData.has_package_tracking || false,
        has_unit_tracking: true, // Sempre ativado no sistema simplificado
        package_price: productData.package_price !== undefined ? productData.package_price : null,
        // Auto-calcular margens de forma segura (evita overflow numérico)
        margin_percent: safeCalculateMargin(productData.price, productData.cost_price),
        package_margin: safeCalculatePackageMargin(
          productData.package_price,
          productData.cost_price,
          productData.package_units
        ),
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
      // Invalidar cache para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['products'] });

      // Atualizar o selectedProduct com os dados atualizados
      setSelectedProduct(data);

      setIsEditProductOpen(false);
      toast({
        title: 'Produto atualizado',
        description: `"${data.name}" atualizado com sucesso!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Erro ao editar produto:', error);
      toast({
        title: 'Erro ao editar produto',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitEditProduct = (data: SimpleEditProductFormData) => {
    editProductMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    setIsEditProductOpen(false);
    setSelectedProduct(null);
  };

  // Função para calcular margens de forma segura, evitando overflow numérico
  const safeCalculateMargin = (salePrice: number | undefined | null, costPrice: number | undefined | null, maxMargin: number = 999): number | null => {
    // Validar inputs de forma robusta
    const validSalePrice = typeof salePrice === 'number' && salePrice > 0 ? salePrice : null;
    const validCostPrice = typeof costPrice === 'number' && costPrice > 0 ? costPrice : null;

    if (!validSalePrice || !validCostPrice) {
      return null;
    }

    const margin = ((validSalePrice - validCostPrice) / validCostPrice) * 100;

    // Limitar margem ao máximo permitido pelo banco e garantir resultado válido
    return Number.isFinite(margin) ? Math.min(Math.max(margin, 0), maxMargin) : null;
  };

  // Função para calcular margem de pacote de forma segura
  const safeCalculatePackageMargin = (packagePrice: number | undefined | null, costPrice: number | undefined | null, packageUnits: number | undefined | null, maxMargin: number = 999): number | null => {
    // Validar inputs de forma robusta
    const validPackagePrice = typeof packagePrice === 'number' && packagePrice > 0 ? packagePrice : null;
    const validCostPrice = typeof costPrice === 'number' && costPrice > 0 ? costPrice : null;
    const validPackageUnits = typeof packageUnits === 'number' && packageUnits > 0 ? packageUnits : null;

    if (!validPackagePrice || !validCostPrice || !validPackageUnits) {
      return null;
    }

    const totalCost = validCostPrice * validPackageUnits;
    const margin = ((validPackagePrice - totalCost) / totalCost) * 100;

    // Limitar margem ao máximo permitido pelo banco e garantir resultado válido
    return Number.isFinite(margin) ? Math.min(Math.max(margin, 0), maxMargin) : null;
  };

  // Hook para obter dados dos produtos usando o hook existente
  const productsGridData = useProductsGridLogic({
    showSearch: false,
    showFilters: false
  });

  return (
    <div className={`w-full h-full flex flex-col ${className || ''}`}>
      {/* Header padronizado com contador de produtos */}
      <PageHeader
        title="GESTÃO DE ESTOQUE"
        count={productsGridData.totalProducts}
        countLabel="produtos"
      />

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

      {/* Modal simplificado de visualização do produto */}
      <SimpleProductViewModal
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

      {/* Modal de ajuste de estoque - NOVO: Single Source of Truth */}
      <StockAdjustmentModal
        productId={selectedProduct?.id || ''}
        isOpen={isStockAdjustmentOpen}
        onClose={() => {
          setIsStockAdjustmentOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={(data) => {
          console.log('Ajuste realizado:', data);

          // Forçar atualização do cache manualmente
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['product-variants'] });

          // Refetch imediato se soubermos o produto
          if (selectedProduct?.id) {
            queryClient.refetchQueries({
              queryKey: ['product-variants', selectedProduct.id],
              exact: false
            });
          }

          setIsStockAdjustmentOpen(false);
          setSelectedProduct(null);
        }}
      />

      {/* Modal simplificado para editar produto (v2.0) */}
      <SimpleEditProductModal
        isOpen={isEditProductOpen}
        onClose={handleCancelEdit}
        product={selectedProduct}
        onSubmit={handleSubmitEditProduct}
        isLoading={editProductMutation.isPending}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
      />

      {/* Modal de histórico de movimentações */}
      <StockHistoryModal
        product={selectedProduct}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          // CORREÇÃO: Não limpar selectedProduct - deixar que o modal pai gerencie
        }}
      />
    </div>
  );
};

export default InventoryManagement;