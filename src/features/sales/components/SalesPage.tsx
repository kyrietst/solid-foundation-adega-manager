import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/primitives/sheet";
import { Button } from "@/shared/ui/primitives/button";
import { ProductsGrid } from "./ProductsGrid";
import { Cart } from "./Cart";
import { RecentSales } from "./RecentSales";
import { ReceiptModal } from "./ReceiptModal";
import React, { useState, useRef } from "react";
import { ShoppingCart, Store, Truck, Package, Printer, Clock, CreditCard } from "lucide-react";
import { useCart, useCartItemCount } from "@/features/sales/hooks/use-cart";
import { cn } from '@/core/config/utils';
import { getGlassCardClasses, getSFProTextClasses } from '@/core/config/theme-utils';
import { text, shadows } from "@/core/config/theme";
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { useGlobalBarcodeScanner } from '@/shared/hooks/common/useGlobalBarcodeScanner';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';

export type SaleType = 'presencial' | 'delivery' | 'pickup';

interface SalesPageProps {
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

function SalesPage({
  variant = 'premium',
  glassEffect = true
}: SalesPageProps = {}) {

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('new-sale');
  const [saleType, setSaleType] = useState<SaleType>('presencial');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [completedSaleId, setCompletedSaleId] = useState<string | null>(null);
  const { items, addItem } = useCart();
  const totalQuantity = useCartItemCount();

  // 🎯 SCANNER GLOBAL: Hook para buscar produtos por código de barras
  const { searchByBarcode } = useBarcode();

  // 🎯 SCANNER GLOBAL: Detecta código de barras em qualquer lugar da página
  // 🎯 SCANNER GLOBAL: Detecta código de barras em qualquer lugar da página
  const handleGlobalScan = React.useCallback(async (barcode: string) => {
    console.log('[SalesPage] Global barcode detected:', barcode);

    // Busca o produto pelo código de barras
    const result = await searchByBarcode(barcode);

    if (result && result.product) {
      const { product, type } = result;
      const stockUnitsLoose = product.stock_units_loose || 0;
      const stockPackages = product.stock_packages || 0;

      if (stockUnitsLoose > 0 || stockPackages > 0) {
        const variantType = type === 'package' ? 'package' : 'unit';
        const variantId = type === 'package' ? `${product.id}-package` : `${product.id}-unit`;

        await addItem({
          id: product.id,
          variant_id: variantId,
          name: product.name,
          variant_type: variantType,
          price: variantType === 'package' ? (product.package_price || product.price) : product.price,
          quantity: 1,
          maxQuantity: variantType === 'package' ? stockPackages : stockUnitsLoose,
          units_sold: variantType === 'package' ? (product.units_per_package || 1) : 1,
          packageUnits: variantType === 'package' ? (product.units_per_package || 1) : undefined,
          conversion_required: false, // Não requer conversão automática
        });
      }
    }
  }, [searchByBarcode, addItem]);

  useGlobalBarcodeScanner({
    onScan: handleGlobalScan,
    enabled: activeTab === 'new-sale', // Só ativo na aba de nova venda
  });

  // Handler para quando uma venda é completada
  const handleSaleComplete = (saleId: string) => {
    setCompletedSaleId(saleId);
    setReceiptModalOpen(true);
  };

  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header padronizado - limpo como página de clientes */}
      <PageHeader
        title="PONTO DE VENDA"
      />

      {/* Container com background glass morphism - ocupa altura restante */}
      <div className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-400/30 transition-all duration-300 mt-4">

        {/* Seção de controles dentro do container */}
        <div className="flex-shrink-0 mb-4 space-y-4">

          {/* Linha 1: Abas de navegação e botão carrinho mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* Abas de navegação */}
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-black/70 backdrop-blur-xl border border-yellow-400/20 p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('new-sale')}
                className={cn(
                  getSFProTextClasses('action', activeTab === 'new-sale' ? 'accent' : 'secondary'),
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 transition-all",
                  activeTab === 'new-sale'
                    ? "bg-yellow-400/20 text-yellow-400 shadow-sm"
                    : "text-gray-300 hover:text-yellow-300"
                )}
              >
                NOVA VENDA
              </button>
              <button
                onClick={() => setActiveTab('recent-sales')}
                className={cn(
                  getSFProTextClasses('action', activeTab === 'recent-sales' ? 'accent' : 'secondary'),
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 transition-all",
                  activeTab === 'recent-sales'
                    ? "bg-yellow-400/20 text-yellow-400 shadow-sm"
                    : "text-gray-300 hover:text-yellow-300"
                )}
              >
                VENDAS RECENTES
              </button>
              <button
                onClick={() => setActiveTab('charges')}
                className={cn(
                  getSFProTextClasses('action', activeTab === 'charges' ? 'accent' : 'secondary'),
                  "inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-sm px-3 py-1.5 transition-all",
                  activeTab === 'charges'
                    ? "bg-yellow-400/20 text-yellow-400 shadow-sm"
                    : "text-gray-300 hover:text-yellow-300"
                )}
              >
                <CreditCard className="h-3 w-3" />
                COBRANÇAS
              </button>
            </div>

            {/* Botão do carrinho para mobile */}
            <div className="lg:hidden w-full sm:w-auto">
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" className="relative w-full sm:w-auto bg-yellow-400/90 hover:bg-yellow-400 border border-yellow-400/50 shadow-lg text-black font-semibold">
                    <ShoppingCart className="h-4 w-4" />
                    {totalQuantity > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500/90 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold shadow-lg border border-red-500/50">
                        {totalQuantity}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[420px] p-0 bg-black/95 backdrop-blur-xl border-white/20 max-h-[100vh] overflow-hidden">
                  <SheetHeader className="flex-shrink-0 p-4 border-b border-white/20">
                    <SheetTitle className={cn("flex items-center gap-3", getSFProTextClasses('h2', 'primary'))}>
                      <div className="p-2 rounded-xl bg-yellow-400/20 border border-yellow-400/30">
                        <ShoppingCart className="h-5 w-5 text-yellow-400" />
                      </div>
                      <span className={getSFProTextClasses('h4', 'accent')}>CARRINHO DE VENDAS</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 min-h-0 overflow-hidden h-[calc(100vh-80px)]">
                    <Cart variant={variant} glassEffect={glassEffect} saleType={saleType} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Linha 2: Seletor de Tipo de Venda - apenas para aba "new-sale" */}
          {activeTab === 'new-sale' && (
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl p-1 shadow-lg">
                <button
                  onClick={() => setSaleType('presencial')}
                  className={cn(
                    getSFProTextClasses('action', saleType === 'presencial' ? 'accent' : 'secondary'),
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                    saleType === 'presencial'
                      ? "bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Store className="h-4 w-4" />
                  Presencial
                </button>
                <button
                  onClick={() => setSaleType('delivery')}
                  className={cn(
                    getSFProTextClasses('action', saleType === 'delivery' ? 'success' : 'secondary'),
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                    saleType === 'delivery'
                      ? "bg-green-500/20 text-green-300 border border-green-400/30 shadow-lg shadow-green-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Truck className="h-4 w-4" />
                  Delivery
                </button>
                <button
                  onClick={() => setSaleType('pickup')}
                  className={cn(
                    getSFProTextClasses('action', saleType === 'pickup' ? 'purple' : 'secondary'),
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                    saleType === 'pickup'
                      ? "bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Clock className="h-4 w-4" />
                  FIADO (A Prazo)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo principal das abas - ocupa resto da altura */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'new-sale' && (
            <>
              {/* Layout para desktop */}
              <div
                className="hidden lg:grid lg:grid-cols-[1fr_420px] gap-6 h-full hero-spotlight"
                onMouseMove={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
                  (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
                }}
              >
                <div className="flex flex-col min-h-0 overflow-hidden">
                  {/* Products Grid - ocupa todo o espaço */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <ProductsGrid
                      mode="sales"
                      storeFilter="store1" // 🏪 v3.4.2 - Mostrar apenas estoque Loja 1
                      variant={variant}
                      glassEffect={glassEffect}
                      showHeader={false}
                      gridColumns={{
                        mobile: 1,
                        tablet: 2,
                        desktop: 4
                      }}
                    />
                  </div>
                </div>

                {/* Cart - largura fixa otimizada */}
                <div className="border-l border-white/20 pl-4 flex flex-col min-h-0 overflow-hidden">
                  <Cart
                    variant={variant}
                    glassEffect={glassEffect}
                    saleType={saleType}
                    onSaleComplete={handleSaleComplete}
                  />
                </div>
              </div>

              {/* Layout para mobile/tablet */}
              <div className="lg:hidden flex flex-col h-full">
                {/* Products Grid - ocupa todo o espaço */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ProductsGrid
                    mode="sales"
                    storeFilter="store1" // 🏪 v3.4.2 - Mostrar apenas estoque Loja 1
                    variant={variant}
                    glassEffect={glassEffect}
                    showHeader={false}
                    gridColumns={{
                      mobile: 2,
                      tablet: 3,
                      desktop: 4
                    }}
                  />
                </div>

                {/* Carrinho sticky no mobile - apenas quando tem itens */}
                {items.length > 0 && (
                  <div className="flex-shrink-0 border-t border-white/20 pt-3 bg-black/70 backdrop-blur-xl">
                    <Button
                      onClick={() => setIsCartOpen(true)}
                      className="w-full h-10 text-sm relative bg-yellow-400/90 text-black hover:bg-yellow-400 border border-yellow-400/50 font-semibold shadow-lg hover:shadow-yellow-400/20"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ver Carrinho ({totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'})
                      <span className="absolute -top-1 -right-1 bg-red-500/90 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center border border-red-500/50">
                        {totalQuantity}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'recent-sales' && (
            <div className="h-full flex flex-col min-h-0">
              <RecentSales />
            </div>
          )}

          {activeTab === 'charges' && (
            <div className="h-full flex flex-col min-h-0">
               <div className="flex-shrink-0 mb-4 px-2">
                  <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Contas a Receber (Fiado)
                  </h3>
                  <p className="text-sm text-gray-400">
                    Gerencie vendas com pagamento pendente.
                  </p>
               </div>
               <RecentSales filterStatus="pending" />
            </div>
          )}
        </div>
      </div>

      {/* Modal de impressão de cupom */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setCompletedSaleId(null);
        }}
        saleId={completedSaleId}
        autoClose={true}
      />
    </div>
  );
}

export default SalesPage;