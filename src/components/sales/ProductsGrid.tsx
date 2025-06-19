import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

type Product = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
};

export function ProductsGrid() {
  const { addItem } = useCart();
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity, image_url")
        .order("name", { ascending: true });
        
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      if (error) throw error;
      return data as Product[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Produtos Disponíveis</h2>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Buscar produtos..." 
            className="w-64"
            // TODO: Implementar busca
          />
          <Button variant="outline" size="sm">
            Categorias
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card"
          >
            <div className="aspect-square bg-muted/30 relative">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span>Sem imagem</span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-background/90 px-2 py-1 rounded-full text-xs font-medium">
                {product.stock_quantity} em estoque
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium line-clamp-2 h-10">{product.name}</h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  }).format(product.price)}
                </span>
                <Button 
                  size="sm" 
                  onClick={() => addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    maxQuantity: product.stock_quantity
                  })}
                  disabled={product.stock_quantity === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
