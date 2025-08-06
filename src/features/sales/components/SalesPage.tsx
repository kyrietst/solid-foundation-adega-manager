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

interface CustomerProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

function SalesPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items } = useCart();
  const totalQuantity = useCartItemCount();
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-white/10/30 bg-adega-charcoal/20 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-adega-yellow mb-2">Ponto de Venda</h1>
            <p className="text-adega-platinum text-lg">Sistema POS Inteligente</p>
          </div>
          
          {/* Botão do carrinho para mobile */}
          <div className="lg:hidden">
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button className="relative bg-adega-gold hover:bg-adega-amber border-0 shadow-lg text-black font-semibold">
                  <ShoppingCart className="h-5 w-5" />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                      {totalQuantity}
                    </span>
                  )}
                  <span className="ml-2 hidden sm:inline font-medium">Carrinho</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96 p-0 bg-adega-charcoal/95 border-white/10/30">
                <SheetHeader className="p-6 border-b border-white/10/30">
                  <SheetTitle className="flex items-center gap-3 text-adega-yellow">
                    <div className="p-2 rounded-xl bg-adega-gold/20">
                      <ShoppingCart className="h-6 w-6 text-adega-gold" />
                    </div>
                    <span className="text-xl font-semibold">Carrinho de Vendas</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="h-full">
                  <Cart />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="new-sale" className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList>
              <TabsTrigger value="new-sale">Nova Venda</TabsTrigger>
              <TabsTrigger value="recent-sales">Vendas Recentes</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="new-sale" className="flex-1 overflow-hidden">
            {/* Layout para desktop */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6 h-full p-4">
              <div className="lg:col-span-2 overflow-y-auto">
                <div className="space-y-4">
                  <CustomerSearch 
                    onSelect={setSelectedCustomer} 
                    selectedCustomer={selectedCustomer} 
                  />
                  <ProductsGrid />
                </div>
              </div>
              <div className="border-l border-white/10/30 bg-adega-charcoal/10 backdrop-blur-xl">
                <Cart />
              </div>
            </div>
            
            {/* Layout para mobile/tablet */}
            <div className="lg:hidden flex flex-col h-full">
              <div className="p-4 border-b border-white/10/30 bg-adega-charcoal/10 backdrop-blur-xl">
                <CustomerSearch 
                  onSelect={setSelectedCustomer} 
                  selectedCustomer={selectedCustomer} 
                />
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ProductsGrid />
              </div>
              
              {/* Carrinho sticky no mobile - apenas quando tem itens */}
              {items.length > 0 && (
                <div className="border-t border-white/10/30 bg-adega-charcoal/10 backdrop-blur-xl p-4">
                  <Button 
                    onClick={() => setIsCartOpen(true)} 
                    className="w-full h-12 text-lg relative"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ver Carrinho ({totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'})
                    <span className="absolute -top-1 -right-1 bg-background text-foreground rounded-full text-xs w-6 h-6 flex items-center justify-center border">
                      {totalQuantity}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="recent-sales" className="flex-1 overflow-y-auto p-4">
            <RecentSales />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SalesPage;
