import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsGrid } from "./ProductsGrid";
import { Cart } from "./Cart";
import { CustomerSearch } from "./CustomerSearch";
import { RecentSales } from "./RecentSales";
import { useState } from "react";

interface CustomerProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export function SalesPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Ponto de Venda</h1>
      
      <Tabs defaultValue="new-sale" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new-sale">Nova Venda</TabsTrigger>
          <TabsTrigger value="recent-sales">Vendas Recentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new-sale" className="space-y-4">
          <CustomerSearch 
            onSelect={setSelectedCustomer} 
            selectedCustomer={selectedCustomer} 
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductsGrid />
            </div>
            <div>
              <Cart />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recent-sales">
          <RecentSales />
        </TabsContent>
      </Tabs>
    </div>
  );
}
