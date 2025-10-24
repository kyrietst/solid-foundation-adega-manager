/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/**
 * Workflow de Recebimento de Mercadorias
 * Interface guiada para cadastro rápido de lotes com scanner
 */

import React, { useState, useCallback } from 'react';
import { 
  Package, 
  ScanLine, 
  CheckCircle2, 
  ArrowRight, 
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  Truck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Separator } from '@/shared/ui/primitives/separator';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { SearchInput } from '@/shared/ui/composite/search-input';
import { EmptyState } from '@/shared/ui/composite/empty-state';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';
import { CreateBatchModal } from './CreateBatchModal';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { useEntityList } from '@/shared/hooks/common/use-entity';
import type { Product } from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getValueClasses } from '@/core/config/theme-utils';

type WorkflowStep = 'scan_product' | 'product_found' | 'create_batch' | 'batch_created';

interface ScannedProduct {
  product: Product;
  scanned_barcode: string;
  scan_timestamp: Date;
}

export const ReceivingWorkflow: React.FC = () => {
  // Estados do workflow
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('scan_product');
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeScanner, setActiveScanner] = useState(false);

  // Hooks
  const { validateBarcode } = useBarcode();
  const { 
    data: products = [], 
    isLoading: productsLoading 
  } = useEntityList({
    table: 'products',
    search: { columns: ['name', 'category', 'barcode'], term: searchTerm }
  });

  // Handler para scanner de produtos
  const handleProductScanned = useCallback(async (barcode: string) => {
    const validation = validateBarcode(barcode);
    
    if (!validation.isValid) {
      console.error('Código inválido:', validation.error);
      return;
    }

    // Buscar produto pelo código escaneado
    const foundProduct = products.find(p => 
      p.barcode === barcode || 
      p.package_barcode === barcode || 
      p.unit_barcode === barcode
    );

    if (foundProduct) {
      const scannedProduct: ScannedProduct = {
        product: foundProduct,
        scanned_barcode: barcode,
        scan_timestamp: new Date()
      };

      setScannedProducts(prev => [scannedProduct, ...prev]);
      setSelectedProduct(foundProduct);
      setCurrentStep('product_found');
    } else {
      console.error('Produto não encontrado para código:', barcode);
    }

    setActiveScanner(false);
  }, [products, validateBarcode]);

  // Handler para selecionar produto da busca
  const handleSelectProduct = (product: Product) => {
    const scannedProduct: ScannedProduct = {
      product,
      scanned_barcode: 'manual_selection',
      scan_timestamp: new Date()
    };

    setScannedProducts(prev => [scannedProduct, ...prev]);
    setSelectedProduct(product);
    setCurrentStep('product_found');
  };

  // Handler para criar lote
  const handleCreateBatch = () => {
    if (selectedProduct) {
      setIsCreateBatchModalOpen(true);
      setCurrentStep('create_batch');
    }
  };

  // Handler para finalizar workflow de um produto
  const handleBatchCreated = () => {
    setCurrentStep('batch_created');
    setSelectedProduct(null);
    
    // Resetar para próximo produto após 2 segundos
    setTimeout(() => {
      setCurrentStep('scan_product');
    }, 2000);
  };

  // Handler para novo recebimento
  const handleNewReceiving = () => {
    setCurrentStep('scan_product');
    setSelectedProduct(null);
    setSearchTerm('');
  };

  const valueClasses = getValueClasses('sm', 'gold');

  return (
    <div className="space-y-6">
      
      {/* Header do Workflow */}
      <Card className="bg-gray-800/50 border-primary-yellow/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <Truck className="h-5 w-5 text-primary-yellow" />
            Recebimento de Mercadorias
            <Badge variant="outline" className="ml-auto text-primary-yellow border-primary-yellow/50">
              {currentStep === 'scan_product' ? 'Aguardando Produto' :
               currentStep === 'product_found' ? 'Produto Encontrado' :
               currentStep === 'create_batch' ? 'Criando Lote' :
               'Lote Criado'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          
          {/* Indicador de Progresso */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                currentStep === 'scan_product' ? "bg-primary-yellow" : "bg-accent-green"
              )} />
              <span className="text-gray-300 text-sm">Escanear Produto</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                currentStep === 'product_found' || currentStep === 'create_batch' || currentStep === 'batch_created' 
                  ? "bg-accent-green" : "bg-gray-600"
              )} />
              <span className="text-gray-300 text-sm">Criar Lote</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                currentStep === 'batch_created' ? "bg-accent-green" : "bg-gray-600"
              )} />
              <span className="text-gray-300 text-sm">Finalizado</span>
            </div>
          </div>

          {/* Conteúdo por Etapa */}
          {currentStep === 'scan_product' && (
            <div className="space-y-4">
              <div className="text-center">
                <Package className="h-12 w-12 text-primary-yellow mx-auto mb-4" />
                <h3 className="text-gray-200 text-lg font-medium mb-2">
                  Escaneie ou Busque o Produto
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Use o scanner ou busque manualmente pelo produto que está recebendo
                </p>
              </div>

              {/* Scanner */}
              <div className="space-y-4">
                {!activeScanner && (
                  <Button
                    onClick={() => setActiveScanner(true)}
                    className="w-full bg-primary-yellow text-gray-900 hover:bg-primary-yellow/90 py-8"
                  >
                    <ScanLine className="h-6 w-6 mr-3" />
                    Ativar Scanner
                  </Button>
                )}

                {activeScanner && (
                  <div className="border border-primary-yellow/50 rounded-lg p-4">
                    <BarcodeInput
                      onScan={handleProductScanned}
                      placeholder="Escaneie o código do produto..."
                      variant="default"
                      glassEffect={true}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setActiveScanner(false)}
                      className="w-full mt-2 border-gray-600 text-gray-400"
                    >
                      Cancelar Scanner
                    </Button>
                  </div>
                )}

                <div className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-700" />
                    <span className="text-gray-400 text-sm">OU</span>
                    <div className="flex-1 h-px bg-gray-700" />
                  </div>
                </div>

                {/* Busca Manual */}
                <div className="space-y-3">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar produto por nome ou código..."
                  />

                  {searchTerm && products.length > 0 && (
                    <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-lg">
                      {products.slice(0, 10).map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className="p-3 hover:bg-gray-800/50 cursor-pointer border-b border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-200 font-medium">{product.name}</p>
                              <p className="text-xs text-gray-400">{product.category}</p>
                            </div>
                            <div className="text-right">
                              <p className={cn(valueClasses)}>{product.stock_quantity} {product.unit_type}</p>
                              {product.barcode && (
                                <p className="text-xs text-gray-400 font-mono">{product.barcode}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'product_found' && selectedProduct && (
            <div className="space-y-4">
              <Alert className="border-accent-green/50 bg-accent-green/10">
                <CheckCircle2 className="h-4 w-4 text-accent-green" />
                <AlertDescription className="text-accent-green">
                  Produto identificado com sucesso!
                </AlertDescription>
              </Alert>

              {/* Detalhes do Produto */}
              <div className="p-4 bg-gray-800/20 rounded-lg border border-primary-yellow/20">
                <h3 className="text-gray-200 font-medium mb-3">Produto Selecionado</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Nome</p>
                    <p className="text-gray-200 font-medium">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Categoria</p>
                    <p className="text-gray-200">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Estoque Atual</p>
                    <p className={cn(valueClasses)}>{selectedProduct.stock_quantity} {selectedProduct.unit_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rastreamento</p>
                    <div className="flex gap-1">
                      {selectedProduct.has_package_tracking && (
                        <Badge variant="secondary" className="text-xs">Fardo</Badge>
                      )}
                      {selectedProduct.has_unit_tracking && (
                        <Badge variant="secondary" className="text-xs">Unidade</Badge>
                      )}
                      {!selectedProduct.has_package_tracking && !selectedProduct.has_unit_tracking && (
                        <Badge variant="outline" className="text-xs">Básico</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateBatch}
                  className="flex-1 bg-primary-yellow text-gray-900 hover:bg-primary-yellow/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Lote para Este Produto
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNewReceiving}
                  className="border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Outro Produto
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'batch_created' && (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-accent-green mx-auto" />
              <div>
                <h3 className="text-gray-200 text-lg font-medium">Lote Criado com Sucesso!</h3>
                <p className="text-gray-400 text-sm mt-2">
                  O produto foi adicionado ao estoque e está disponível para vendas FEFO
                </p>
              </div>
              <Button
                onClick={handleNewReceiving}
                className="bg-primary-yellow text-gray-900 hover:bg-primary-yellow/90"
              >
                Receber Próximo Produto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Produtos Escaneados */}
      {scannedProducts.length > 0 && (
        <Card className="bg-gray-800/50 border-primary-yellow/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-100">
              <Calendar className="h-5 w-5 text-primary-yellow" />
              Produtos Processados Hoje
              <Badge variant="outline" className="ml-auto text-primary-yellow border-primary-yellow/50">
                {scannedProducts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scannedProducts.map((scanned, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent-green rounded-full" />
                    <div>
                      <p className="text-gray-200 font-medium">{scanned.product.name}</p>
                      <p className="text-xs text-gray-400">
                        {scanned.scanned_barcode === 'manual_selection' ? 'Seleção manual' : scanned.scanned_barcode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {format(scanned.scan_timestamp, 'HH:mm:ss', { locale: ptBR })}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {scanned.product.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação de Lote */}
      {selectedProduct && (
        <CreateBatchModal
          isOpen={isCreateBatchModalOpen}
          onClose={() => {
            setIsCreateBatchModalOpen(false);
            handleBatchCreated();
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
};