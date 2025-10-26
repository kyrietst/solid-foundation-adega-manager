import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/primitives/sheet";
import { Button } from "@/shared/ui/primitives/button";
import { ProductsGrid } from "./ProductsGrid";
import { Cart } from "./Cart";
import { RecentSales } from "./RecentSales";
import { ReceiptModal } from "./ReceiptModal";
import { ReceiptTestDemo } from "./ReceiptTestDemo";
import { useState } from "react";
import { ShoppingCart, Store, Truck, Package, Printer } from "lucide-react";
import { useCart, useCartItemCount } from "@/features/sales/hooks/use-cart";
import { cn } from '@/core/config/utils';
import { getGlassCardClasses, getSFProTextClasses } from '@/core/config/theme-utils';
import { text, shadows } from "@/core/config/theme";
import { PageHeader } from '@/shared/ui/composite/PageHeader';

export type SaleType = 'presencial' | 'delivery' | 'pickup';

interface SalesPageProps {
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
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
  const { items } = useCart();
  const totalQuantity = useCartItemCount();

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
                onClick={() => setActiveTab('print-test')}
                className={cn(
                  getSFProTextClasses('action', activeTab === 'print-test' ? 'accent' : 'secondary'),
                  "inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-sm px-3 py-1.5 transition-all",
                  activeTab === 'print-test'
                    ? "bg-yellow-400/20 text-yellow-400 shadow-sm"
                    : "text-gray-300 hover:text-yellow-300"
                )}
              >
                <Printer className="h-3 w-3" />
                TESTE IMPRESSÃO
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
                  <Package className="h-4 w-4" />
                  Retirada
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

          {activeTab === 'print-test' && (
            <div className="h-full flex flex-col min-h-0 p-2">
              <div className="text-center mb-6">
                <h2 className={cn(
                  getSFProTextClasses('h2', 'accent'),
                  "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]"
                )}>
                  🖨️ TESTE DE IMPRESSÃO TÉRMICA
                </h2>
                <p className={cn(getSFProTextClasses('body', 'secondary'), "mt-2")}>
                  ZPrinter Paper (58x90mm) - ULTRA COMPACTO - Zero Desperdício
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-0">
                <ReceiptTestDemo />
              </div>
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