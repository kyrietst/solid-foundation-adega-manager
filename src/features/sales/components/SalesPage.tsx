/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/primitives/sheet";
import { Button } from "@/shared/ui/primitives/button";
import { ProductsGrid } from "./ProductsGrid";
import { Cart } from "./Cart";
import { RecentSales } from "./RecentSales";
import { ReceiptModal } from "./ReceiptModal";
import { CheckoutDrawer } from "./CheckoutDrawer";
import React, { useState } from "react";
import { ShoppingCart, CreditCard, Clock, Search, Wine, Menu, LogOut, Settings } from "lucide-react";
import { useCart, useCartItemCount } from "@/features/sales/hooks/use-cart";
import { cn } from '@/core/config/utils';
import { useGlobalBarcodeScanner } from '@/shared/hooks/common/useGlobalBarcodeScanner';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { Input } from "@/shared/ui/primitives/input";

import { CategoryTabs } from './CategoryTabs';

export type SaleType = 'presencial' | 'delivery' | 'pickup';

interface SalesPageProps {
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

function SalesPage({
  variant = 'premium',
  glassEffect = true
}: SalesPageProps = {}) {

  // State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // App Modes: 'pos' (Point of Sale) | 'recent' (Recent Sales) | 'charges' (Fiado/Pending)
  const [appMode, setAppMode] = useState<'pos' | 'recent' | 'charges'>('pos');

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [completedSaleId, setCompletedSaleId] = useState<string | null>(null);
  const [receiptContext, setReceiptContext] = useState<{ cpf?: string } | null>(null); // New State

  // Controlled Search State for ProductsGrid
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // 🟢 Category State

  const { items, addItem } = useCart();
  const totalQuantity = useCartItemCount();

  // 🎯 SCANNER GLOBAL: Hook para buscar produtos por código de barras
  const { searchByBarcode } = useBarcode();

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
    enabled: appMode === 'pos' && !isCheckoutOpen, // Only active if checkout is closed and in POS mode
  });

  // Handler para quando uma venda é completada
  const handleSaleComplete = (saleId: string, extraData?: { cpf: string }) => {
    setCompletedSaleId(saleId);
    setReceiptContext(extraData || null); // Store extra context
    setReceiptModalOpen(true);
    setIsCartOpen(false);
  };

  const handleCheckoutStart = () => {
    setIsCheckoutOpen(true);
    setIsCartOpen(false); // Close mobile cart sheet if open
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-[#050505] text-white overflow-hidden">
      <PremiumBackground />


      {/* 🟢 WRAPPER DE CONTEÚDO (FIX SIDEBAR OVERLAP) */}
      <div className="relative z-10 flex flex-col h-full w-full md:pl-[80px] transition-all duration-300">

        {/* 🟢 CUSTOM APP HEADER (iPad Style - Glass) */}
        <header className="h-16 flex-shrink-0 bg-[#121214]/60 backdrop-blur-xl border-b border-white/5 px-4 flex items-center justify-between z-20 shadow-sm relative -ml-0 md:-ml-[80px] pl-4 md:pl-[calc(80px+1rem)] w-full md:w-[calc(100%+80px)]">

          {/* Group 1: Brand & Logo */}
          <div className="flex items-center gap-3 w-48 md:w-64">
            <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(244,202,37,0.15)]">
              <Wine className="size-6 text-primary" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">ADEGA ANITA'S</h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider">Ponto de Venda</p>
            </div>
          </div>

          {/* Group 2: Global Search Bar (Controls Grid) */}
          <div className="flex-1 max-w-2xl px-4 relative">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Buscar produtos por nome, código ou categoria..."
                className="w-full h-11 pl-11 bg-black/40 border-white/10 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-base placeholder:text-gray-600 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-50">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400">
                  <span className="text-xs">Ctrl</span>K
                </kbd>
              </div>
            </div>
          </div>

          {/* Group 3: Actions & Modes */}
          <div className="flex items-center gap-2 justify-end w-48 md:w-64">

            {/* Mode Switcher: POS vs Recent Sales */}
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-md transition-all",
                  appMode === 'pos' ? "bg-white/10 text-primary shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                onClick={() => setAppMode('pos')}
                title="Nova Venda"
              >
                <ShoppingCart className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-md transition-all",
                  appMode === 'recent' ? "bg-white/10 text-primary shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                onClick={() => setAppMode('recent')}
                title="Histórico de Vendas"
              >
                <Clock className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-md transition-all",
                  appMode === 'charges' ? "bg-white/10 text-primary shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                onClick={() => setAppMode('charges')}
                title="Contas a Receber"
              >
                <CreditCard className="size-5" />
              </Button>
            </div>

            {/* Mobile Cart Trigger */}
            <div className="lg:hidden ml-2">
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" className="relative bg-brand text-brand-foreground hover:bg-brand/90 size-10 rounded-xl">
                    <ShoppingCart className="size-5" />
                    {totalQuantity > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full text-xs box-content w-4 h-4 p-0.5 flex items-center justify-center font-bold border-2 border-background-dark">
                        {totalQuantity}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[420px] p-0 bg-surface/95 backdrop-blur-xl border-white/20 max-h-[100vh] overflow-hidden">
                  <SheetHeader className="flex-shrink-0 p-4 border-b border-white/20">
                    <SheetTitle className={cn("flex items-center gap-3 text-2xl font-bold")}>
                      <div className="p-2 rounded-xl bg-brand/20 border border-brand/30">
                        <ShoppingCart className="h-5 w-5 text-brand" />
                      </div>
                      <span className="text-brand">CARRINHO</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 min-h-0 overflow-hidden h-[calc(100vh-80px)]">
                    <Cart
                      variant={variant}
                      glassEffect={glassEffect}
                      onCheckout={handleCheckoutStart}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

          </div>
        </header>

        {/* 🔴 MAIN CONTENT AREA */}
        <div className="flex-1 min-h-0 overflow-hidden relative z-10 p-4 lg:p-6">

          {appMode === 'pos' && (
            <div className="w-full h-full lg:grid lg:grid-cols-[1fr_420px] gap-6 relative">

              {/* 1. PRODUCT GRID (Left) - NOW A GLASS CARD */}
              <div className="h-full flex flex-col overflow-hidden rounded-xl bg-[#121214]/60 backdrop-blur-xl border border-white/5 shadow-2xl p-4 lg:p-6 transition-all hover:border-primary/20 min-w-0">
                {/* 🟢 CATEGORY TABS (FIXED SCROLL) */}
                <div className="mb-4 w-full">
                  <CategoryTabs
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                </div>

                {/* Controlled Grid */}
                <div className="flex-1 min-h-0">
                  <ProductsGrid
                    mode="sales"
                    storeFilter="store1"
                    variant={variant}
                    glassEffect={glassEffect}
                    // 🔑 KEY CHANGE: Hide internal header/filters as we use external ones
                    showHeader={false}
                    showFilters={false}
                    // 🔑 KEY CHANGE: We control the search term from outside
                    controlledSearchTerm={searchTerm}
                    onControlledSearchChange={setSearchTerm}
                    // 🔑 KEY CHANGE: We control the category from outside (CategoryTabs)
                    controlledCategory={selectedCategory}
                    onControlledCategoryChange={setSelectedCategory}
                    gridColumns={{
                      mobile: 1,
                      tablet: 2,
                      desktop: 4  // Grid 5 aligned with XL
                    }}
                  />
                </div>
              </div>

              {/* 2. CART SIDEBAR (Right) - NOW A GLASS CARD */}
              <div className="hidden lg:flex flex-col h-full rounded-xl bg-[#121214]/60 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden p-4 pt-6 transition-all hover:border-primary/20">
                <Cart
                  variant={variant}
                  glassEffect={glassEffect}
                  onCheckout={handleCheckoutStart}
                  className="h-full bg-transparent shadow-none border-none"
                />
              </div>

              {/* Mobile Floating Cart Button (Visible only if cart has items) */}
              <div className="lg:hidden absolute bottom-6 right-6 z-30">
                {/* Already handled by header trigger */}
              </div>
            </div>
          )}

          {appMode === 'recent' && (
            <div className="absolute inset-0 z-10 bg-background-dark overflow-hidden p-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="max-w-7xl mx-auto h-full flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setAppMode('pos')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <LogOut className="rotate-180 size-6 text-gray-400" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Histórico de Vendas</h2>
                    <p className="text-gray-400">Consulte vendas passadas e reimprima comprovantes.</p>
                  </div>
                </div>
                <div className="flex-1 min-h-0 bg-surface/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                  <RecentSales />
                </div>
              </div>
            </div>
          )}

          {appMode === 'charges' && (
            <div className="absolute inset-0 z-10 bg-background-dark overflow-hidden p-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="max-w-7xl mx-auto h-full flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setAppMode('pos')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <LogOut className="rotate-180 size-6 text-gray-400" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-bold text-brand tracking-tight flex items-center gap-3">
                      <CreditCard className="size-8" />
                      Contas a Receber (Fiado)
                    </h2>
                    <p className="text-gray-400">Gerencie pagamentos pendentes e clientes.</p>
                  </div>
                </div>
                <div className="flex-1 min-h-0 bg-surface/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                  <RecentSales filterStatus="pending" />
                </div>
              </div>
            </div>
          )}

        </div>
        {/* End of Main Content */}

      </div>
      {/* End of Wrapper (md:pl-[80px]) */}

      {/* MODALS */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setCompletedSaleId(null);
          setReceiptContext(null); // Reset context
        }}
        saleId={completedSaleId}
        cpfNaNota={receiptContext?.cpf} // Pass CPF
        autoClose={true}
      />

      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleSaleComplete}
      />
    </div>
  );
}

export default SalesPage;