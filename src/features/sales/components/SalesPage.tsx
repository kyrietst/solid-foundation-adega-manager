import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/primitives/sheet";
import { Button } from "@/shared/ui/primitives/button";
import { ProductsGrid } from "./ProductsGrid";
import { Cart } from "./Cart";
import { CustomerSearch } from "./CustomerSearch";
import { RecentSales } from "./RecentSales";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart, useCartItemCount } from "@/features/sales/hooks/use-cart";
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { text, shadows } from "@/core/config/theme";

interface CustomerProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface SalesPageProps {
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

function SalesPage({
  variant = 'premium',
  glassEffect = true
}: SalesPageProps = {}) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('new-sale');
  const { items } = useCart();
  const totalQuantity = useCartItemCount();
  
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';
  
  return (
    <div className="w-full h-full">
      <div className="space-y-6">
        {/* Header e Abas */}
        <div className="flex items-center justify-between gap-4">
          {/* Header */}
          <div 
            className="bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg p-4 rounded-2xl max-w-md hero-spotlight"
            onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
              (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <h1 className={cn(text.h1, shadows.strong, "text-xl lg:text-2xl font-bold")}>
                PONTO DE VENDA
              </h1>
              
              {/* Botão do carrinho para mobile */}
              <div className="lg:hidden">
                <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                  <SheetTrigger asChild>
                    <Button size="sm" className="relative bg-yellow-400/90 hover:bg-yellow-400 border border-yellow-400/50 shadow-lg text-black font-semibold">
                      <ShoppingCart className="h-4 w-4" />
                      {totalQuantity > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500/90 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold shadow-lg border border-red-500/50">
                          {totalQuantity}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-96 p-0 bg-black/90 backdrop-blur-xl border-white/20">
                    <SheetHeader className="p-6 border-b border-white/20">
                      <SheetTitle className={cn("flex items-center gap-3", text.h2, shadows.medium)}>
                        <div className="p-2 rounded-xl bg-yellow-400/20 border border-yellow-400/30">
                          <ShoppingCart className="h-6 w-6 text-yellow-400" />
                        </div>
                        <span className="text-xl font-semibold">CARRINHO DE VENDAS</span>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="h-full">
                      <Cart variant={variant} glassEffect={glassEffect} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
          
          {/* Abas de navegação alinhadas à direita */}
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-black/70 backdrop-blur-xl border border-yellow-400/20 p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('new-sale')}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
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
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
                activeTab === 'recent-sales' 
                  ? "bg-yellow-400/20 text-yellow-400 shadow-sm" 
                  : "text-gray-300 hover:text-yellow-300"
              )}
            >
              VENDAS RECENTES
            </button>
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="flex-1 min-h-0">
          {activeTab === 'new-sale' && (
            <>
              {/* Layout para desktop */}
              <div 
                className="hidden lg:grid lg:grid-cols-4 gap-6 h-full bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hero-spotlight p-6"
                onMouseMove={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
                  (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
                }}
              >
                <div className="lg:col-span-3 flex flex-col space-y-4 min-h-0">
                  <CustomerSearch 
                    onSelect={setSelectedCustomer} 
                    selectedCustomer={selectedCustomer}
                    variant={variant}
                    glassEffect={glassEffect}
                  />
                  <div className="flex-1 min-h-0">
                    <ProductsGrid 
                      variant={variant}
                      glassEffect={glassEffect}
                      gridColumns={{
                        mobile: 1,
                        tablet: 2,
                        desktop: 4
                      }}
                    />
                  </div>
                </div>
                <div className="border-l border-white/20 pl-6">
                  <Cart variant={variant} glassEffect={glassEffect} />
                </div>
              </div>
              
              {/* Layout para mobile/tablet */}
              <div className="lg:hidden flex flex-col h-full bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg">
                <div className="p-4 border-b border-white/20">
                  <CustomerSearch 
                    onSelect={setSelectedCustomer} 
                    selectedCustomer={selectedCustomer}
                    variant={variant}
                    glassEffect={glassEffect}
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <ProductsGrid 
                    variant={variant}
                    glassEffect={glassEffect}
                    gridColumns={{
                      mobile: 2,
                      tablet: 3,
                      desktop: 4
                    }}
                  />
                </div>
                
                {/* Carrinho sticky no mobile - apenas quando tem itens */}
                {items.length > 0 && (
                  <div className="border-t border-white/20 p-4 bg-black/70 backdrop-blur-xl">
                    <Button 
                      onClick={() => setIsCartOpen(true)} 
                      className="w-full h-12 text-lg relative bg-yellow-400/90 text-black hover:bg-yellow-400 border border-yellow-400/50 font-semibold shadow-lg hover:shadow-yellow-400/20"
                      size="lg"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Ver Carrinho ({totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'})
                      <span className="absolute -top-1 -right-1 bg-red-500/90 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center border border-red-500/50">
                        {totalQuantity}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'recent-sales' && (
            <div className="h-full bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6">
              <RecentSales />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesPage;