/**
 * Componente principal de gerenciamento de inventário
 * Inclui listagem de produtos e funcionalidade para adicionar novos produtos
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { ProductsGridContainer } from './ProductsGridContainer';
import { ProductsTitle, ProductsHeader } from './ProductsHeader';
import { useProductsGridLogic } from '@/shared/hooks/products/useProductsGridLogic';
import { Button } from '@/shared/ui/primitives/button';
import { Trash2, Package, Store, AlertTriangle, Loader2, ClipboardList, Warehouse } from 'lucide-react';
// Imports dos modais refatorados - Força HMR refresh para carregar logs de diagnóstico
import { NewProductModal } from './NewProductModal';
import { SimpleProductViewModal } from './SimpleProductViewModal'; // Modal simplificado v2.0
import { SimpleEditProductModal } from './SimpleEditProductModal'; // Modal simplificado v2.0
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockHistoryModal } from './StockHistoryModal';
import { TransferToHoldingModal } from './TransferToHoldingModal'; // v3.6.1 - Transfer Loja 1 → Loja 2
import { DeletedProductsGrid } from './DeletedProductsGrid';
import { InventoryGrid } from './InventoryGrid';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { EmptySearchResults } from '@/shared/ui/composite/empty-state';
import { useDeletedProducts } from '../hooks/useDeletedProducts';
import useProductDelete from '../hooks/useProductDelete';
import { useAuth } from '@/app/providers/AuthContext';
import { useLowStockProducts } from '../hooks/useLowStockProducts';
import { InventoryCountSheet } from './InventoryCountSheet';
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
  // 📦 Ler tab da URL (ex: /inventory?tab=alerts)
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  // 📦 viewMode agora inclui 'alerts' e 'count-sheet' para inventário físico
  const [viewMode, setViewMode] = useState<'active' | 'deleted' | 'alerts' | 'count-sheet'>(
    urlTab === 'alerts' ? 'alerts' : urlTab === 'count-sheet' ? 'count-sheet' : 'active'
  );
  const [restoringProductId, setRestoringProductId] = useState<string | null>(null);

  // 🏪 v3.6.1 - Active vs Holding Stock: Estado para controlar qual loja está sendo visualizada
  const [selectedStore, setSelectedStore] = useState<1 | 2>(1);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [productToTransfer, setProductToTransfer] = useState<Product | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleMouseMove } = useGlassmorphismEffect();
  const { user, userRole, loading } = useAuth();

  // Hook para produtos deletados
  const { data: deletedProducts = [], isLoading: isLoadingDeleted } = useDeletedProducts();
  const { restore } = useProductDelete();

  // Verificar se usuário é admin - aguardar carregamento do profile
  const isAdmin = !loading && userRole === 'admin';


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
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Erro ao buscar produto atualizado para visualização:', error);
        // PGRST116 = produto deletado ou não encontrado
        if (error.code === 'PGRST116') {
          toast({
            title: 'Produto não disponível',
            description: 'Este produto foi deletado ou não está mais disponível.',
            variant: 'destructive',
          });
          return;
        }
        // Para outros erros, mostrar mensagem genérica
        toast({
          title: 'Erro ao carregar produto',
          description: 'Não foi possível carregar os dados do produto.',
          variant: 'destructive',
        });
        return;
      }

      // Usar dados atualizados do banco
      setSelectedProduct(updatedProduct);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Erro na busca do produto para visualização:', error);
      toast({
        title: 'Erro ao carregar produto',
        description: 'Ocorreu um erro inesperado ao carregar o produto.',
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = async (product: Product) => {
    // Buscar dados atualizados do produto específico do banco
    try {
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Erro ao buscar produto atualizado:', error);
        // PGRST116 = produto deletado ou não encontrado
        if (error.code === 'PGRST116') {
          toast({
            title: 'Produto não disponível',
            description: 'Este produto foi deletado ou não está mais disponível para edição.',
            variant: 'destructive',
          });
          return;
        }
        // Para outros erros, mostrar mensagem genérica
        toast({
          title: 'Erro ao carregar produto',
          description: 'Não foi possível carregar os dados do produto.',
          variant: 'destructive',
        });
        return;
      }

      // Usar dados atualizados do banco
      setSelectedProduct(updatedProduct);
      setIsEditProductOpen(true);
    } catch (error) {
      console.error('Erro na busca do produto:', error);
      toast({
        title: 'Erro ao carregar produto',
        description: 'Ocorreu um erro inesperado ao carregar o produto.',
        variant: 'destructive',
      });
    }
  };

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setIsStockAdjustmentOpen(true);
  };

  const handleViewHistory = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
  };

  // 🏪 v3.6.1 - Handler para abrir modal de transferência Loja 1 → Loja 2
  const handleTransferToHolding = (product: Product) => {
    setProductToTransfer(product);
    setIsTransferModalOpen(true);
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
        // ✅ CORREÇÃO: Só incluir cost_price se foi fornecido (evita trigger com NULL)
        ...(productData.cost_price !== undefined && { cost_price: productData.cost_price }),
        // Sistema de códigos simplificado
        barcode: productData.barcode || null,
        package_barcode: productData.package_barcode || null,
        package_units: productData.package_units || null,
        units_per_package: productData.package_units || 1,
        has_package_tracking: productData.has_package_tracking || false,
        has_unit_tracking: true, // Sempre ativado no sistema simplificado
        // ✅ CORREÇÃO: Só incluir package_price se foi fornecido
        ...(productData.package_price !== undefined && { package_price: productData.package_price }),
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

  // Handler para restaurar produto deletado
  const handleRestoreProduct = async (product: any) => {
    setRestoringProductId(product.id);
    try {
      // ✅ Passar objeto completo para nova arquitetura (nunca fetch após restaurar)
      await restore({ productId: product.id, productName: product.name });
      // Invalidar queries para atualizar listas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'deleted'] });
    } catch (error) {
      console.error('Erro ao restaurar produto:', error);
    } finally {
      setRestoringProductId(null);
    }
  };

  // Hook para obter dados dos produtos usando o hook existente
  const productsGridData = useProductsGridLogic({
    showSearch: false,
    showFilters: false
  });

  // 📦 SSoT v3.5.5: Usar hook dedicado com useInfiniteQuery para alertas
  // Permite carregamento progressivo ("Load More") de 100+ produtos
  const lowStockQuery = useLowStockProducts();
  const lowStockCount = lowStockQuery.totalLoaded;

  // 🏪 v3.6.1 - Query para produtos (usado no toggle Loja 1/Loja 2)
  const { data: allProducts = [], isLoading: isLoadingAllProducts } = useQuery({
    queryKey: ['products', 'for-store-toggle'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, image_url, barcode, unit_barcode, package_barcode, category, package_units, package_price, has_package_tracking, units_per_package, stock_packages, stock_units_loose, store2_holding_packages, store2_holding_units_loose, minimum_stock, expiry_date, has_expiry_tracking')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products for store toggle:', error);
        throw error;
      }

      return data || [];
    },
    enabled: viewMode === 'active', // Só buscar quando na aba "active"
  });

  // 🏪 v3.6.1 - Mapear produtos baseado na loja selecionada (Active vs Holding)
  const displayProducts = React.useMemo(() => {
    if (selectedStore === 1) {
      // Loja 1 (Active Stock): Mostrar TODOS os produtos (catálogo mestre)
      return allProducts;
    } else {
      // Loja 2 (Holding Stock): Filtrar apenas produtos com estoque > 0 + mapear campos
      return allProducts
        .filter(product =>
          (product.store2_holding_packages || 0) > 0 ||
          (product.store2_holding_units_loose || 0) > 0
        )
        .map(product => ({
          ...product,
          stock_packages: product.store2_holding_packages || 0,
          stock_units_loose: product.store2_holding_units_loose || 0,
        }));
    }
  }, [allProducts, selectedStore]);

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
        {/* Tab Switcher Active/Deleted/Alerts/Planilha - Apenas para admins */}
        {isAdmin && (
          <div className="flex gap-2 mb-4 pb-4 border-b border-white/10">
            <Button
              variant={viewMode === 'active' ? 'default' : 'outline'}
              onClick={() => setViewMode('active')}
              className="flex items-center gap-2"
              size="sm"
            >
              <Package className="h-4 w-4" />
              Produtos Ativos
              <span className="ml-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                {productsGridData.totalProducts}
              </span>
            </Button>

            <Button
              variant={viewMode === 'deleted' ? 'default' : 'outline'}
              onClick={() => setViewMode('deleted')}
              className="flex items-center gap-2"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
              Produtos Deletados
              <span className="ml-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                {deletedProducts.length}
              </span>
            </Button>

            {/* 📦 Nova sub-aba: Alertas de Estoque Baixo */}
            <Button
              variant={viewMode === 'alerts' ? 'default' : 'outline'}
              onClick={() => setViewMode('alerts')}
              className="flex items-center gap-2"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4" />
              Alertas
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                lowStockCount > 0
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {lowStockCount}
              </span>
            </Button>

            {/* ✅ NOVO: Planilha de Inventário Físico */}
            <Button
              variant={viewMode === 'count-sheet' ? 'default' : 'outline'}
              onClick={() => setViewMode('count-sheet')}
              className="flex items-center gap-2"
              size="sm"
            >
              <ClipboardList className="h-4 w-4" />
              Planilha de Inventário
            </Button>
          </div>
        )}

        {/* Renderização condicional baseada no modo de visualização */}
        {viewMode === 'active' ? (
          /* 🏪 v3.6.1 - Grid de produtos com toggle Loja 1/Loja 2 */
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Toggle Loja 1 (Active) / Loja 2 (Holding) */}
            <div className="flex gap-2 mb-4 pb-4 border-b border-white/10">
              <Button
                variant={selectedStore === 1 ? 'default' : 'outline'}
                onClick={() => setSelectedStore(1)}
                className="flex items-center gap-2"
                size="sm"
              >
                <Store className="h-4 w-4" />
                Loja 1 (Vendas)
              </Button>

              <Button
                variant={selectedStore === 2 ? 'default' : 'outline'}
                onClick={() => setSelectedStore(2)}
                className="flex items-center gap-2"
                size="sm"
              >
                <Warehouse className="h-4 w-4" />
                Loja 2 (Depósito)
              </Button>
            </div>

            {/* Grid de produtos com estoque da loja selecionada */}
            {isLoadingAllProducts ? (
              <LoadingScreen text={`Carregando produtos da Loja ${selectedStore}...`} />
            ) : displayProducts.length === 0 ? (
              <EmptySearchResults
                searchTerm="produtos"
                onClearSearch={() => {}}
              />
            ) : (
              <div className="flex-1 overflow-y-auto">
                <InventoryGrid
                  products={displayProducts}
                  gridColumns={{ mobile: 1, tablet: 2, desktop: 3 }}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEditProduct}
                  onAdjustStock={handleAdjustStock}
                  onTransfer={selectedStore === 1 ? handleTransferToHolding : undefined}
                  variant="default"
                  glassEffect={true}
                />
              </div>
            )}
          </div>
        ) : viewMode === 'deleted' ? (
          /* Grid de produtos deletados (admin only) */
          <DeletedProductsGrid
            products={deletedProducts}
            isLoading={isLoadingDeleted}
            onRestore={handleRestoreProduct}
            restoringProductId={restoringProductId}
          />
        ) : viewMode === 'alerts' ? (
          /* 📦 v3.5.5: Grid de produtos com estoque baixo (Alertas) com Load More */
          <div className="flex-1 min-h-0 flex flex-col">
            {lowStockQuery.isLoading ? (
              <LoadingScreen text="Carregando alertas de estoque..." />
            ) : lowStockQuery.error ? (
              <div className="text-red-400 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                ❌ Erro ao carregar alertas: {lowStockQuery.error.message}
              </div>
            ) : lowStockQuery.products.length === 0 ? (
              <EmptySearchResults
                searchTerm="produtos com estoque baixo"
                onClearSearch={() => setViewMode('active')}
              />
            ) : (
              <>
                {/* Grid de produtos com scroll */}
                <div className="flex-1 overflow-y-auto">
                  <InventoryGrid
                    products={lowStockQuery.products}
                    gridColumns={{ mobile: 1, tablet: 2, desktop: 3 }}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditProduct}
                    onAdjustStock={handleAdjustStock}
                    variant="warning"
                    glassEffect={true}
                  />
                </div>

                {/* Botão "Carregar Mais" */}
                {lowStockQuery.hasMore && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => lowStockQuery.loadMore()}
                      disabled={lowStockQuery.isLoadingMore}
                      variant="outline"
                      size="lg"
                      className="w-64 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 hover:text-amber-200"
                    >
                      {lowStockQuery.isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          Carregar Mais ({lowStockQuery.totalLoaded} carregados)
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Info footer */}
                {!lowStockQuery.hasMore && (
                  <div className="mt-4 text-center text-sm text-white/50">
                    ✅ Todos os {lowStockQuery.totalLoaded} produtos com estoque baixo foram carregados
                  </div>
                )}
              </>
            )}
          </div>
        ) : viewMode === 'count-sheet' ? (
          /* ✅ Planilha de Inventário Físico */
          <InventoryCountSheet />
        ) : null}
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

      {/* 🏪 v3.6.1 - Modal de transferência Loja 1 → Loja 2 */}
      <TransferToHoldingModal
        product={productToTransfer}
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setProductToTransfer(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['products', 'for-store-toggle'] });
        }}
      />
    </div>
  );
};

export default InventoryManagement;