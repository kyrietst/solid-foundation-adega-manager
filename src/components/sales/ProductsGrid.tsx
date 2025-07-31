import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useBarcode } from "@/hooks/use-barcode";
import { BarcodeInput } from "@/components/inventory/BarcodeInput";
import { useState, useMemo } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { Product } from "@/types/inventory.types";
import { formatCurrency } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { SearchInput } from "@/components/ui/search-input";
import { FilterToggle } from "@/components/ui/filter-toggle";
import { EmptySearchResults } from "@/components/ui/empty-state";
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function ProductsGrid() {
  const { addItem } = useCart();
  const { searchByBarcode } = useBarcode();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity, image_url, barcode, category")
        .order("name", { ascending: true });
        
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      return data;
    },
  });

  // Buscar categorias únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Hook de paginação reutilizável
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedItems: currentProducts,
    goToPage,
    setItemsPerPage
  } = usePagination(filteredProducts, {
    initialItemsPerPage: 12,
    resetOnItemsChange: true // Reset para página 1 quando filtros mudam
  });

  if (isLoading) {
    return <LoadingScreen text="Carregando produtos..." />;
  }

  // Handler para código de barras escaneado
  const handleBarcodeScanned = async (barcode: string) => {
    const product = await searchByBarcode(barcode);
    if (product && product.stock_quantity > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        maxQuantity: product.stock_quantity
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com busca e filtros */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-adega-yellow">Produtos Disponíveis</h2>
            <span className="px-3 py-1 bg-adega-gold/20 border border-white/10/30 rounded-full text-sm text-adega-gold font-medium">
              {filteredProducts.length} produtos
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Busca */}
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar produtos..."
              className="sm:w-64"
            />
            
            {/* Botão de filtros para mobile */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="sm:hidden">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </CollapsibleTrigger>
              
              {/* Filtros desktop */}
              <div className="hidden sm:flex items-center gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-56 h-12 bg-adega-charcoal/60 border-white/10/30 text-adega-platinum rounded-xl backdrop-blur-xl">
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-adega-charcoal/95 border-white/10/30 backdrop-blur-xl">
                    <SelectItem value="all" className="text-adega-platinum hover:bg-adega-graphite/50">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-adega-platinum hover:bg-adega-graphite/50">{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtros mobile */}
              <CollapsibleContent className="sm:hidden mt-4">
                <div className="space-y-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12 bg-adega-charcoal/60 border-white/10/30 text-adega-platinum rounded-xl backdrop-blur-xl">
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-adega-charcoal/95 border-white/10/30 backdrop-blur-xl">
                      <SelectItem value="all" className="text-adega-platinum hover:bg-adega-graphite/50">Todas as categorias</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="text-adega-platinum hover:bg-adega-graphite/50">{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        {/* Componente de código de barras */}
        <div className="max-w-md">
          <BarcodeInput
            onScan={handleBarcodeScanned}
            placeholder="Escaneie o código para adicionar ao carrinho"
            autoFocus={false}
          />
        </div>
      </div>
      
      {/* Grid de produtos paginado */}
      {currentProducts.length === 0 ? (
        <EmptySearchResults
          searchTerm={searchTerm || selectedCategory !== 'all' ? 'filtros aplicados' : undefined}
          onClearSearch={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentProducts.map((product) => (
              <div 
                key={product.id} 
                className="border border-white/10/30 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-adega-charcoal/20 backdrop-blur-xl hover:bg-adega-charcoal/30"
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
                      <span className="text-xs">Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-adega-charcoal/90 px-2 py-1 rounded-full text-xs font-medium text-adega-gold border border-white/10/30">
                    {product.stock_quantity} em estoque
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium line-clamp-2 h-10 text-sm text-adega-platinum">{product.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-adega-yellow">
                      {formatCurrency(product.price)}
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
          
          {/* Paginação */}
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            onItemsPerPageChange={(value) => setItemsPerPage(parseInt(value))}
            itemsPerPageOptions={[6, 12, 20, 30]}
            showItemsPerPage={true}
            showInfo={true}
            itemLabel="produtos"
          />
        </>
      )}
    </div>
  );
}
