import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Search, Filter, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useBarcode } from "@/hooks/use-barcode";
import { BarcodeInput } from "@/components/inventory/BarcodeInput";
import { useState, useMemo, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { Product } from "@/types/inventory.types";

export function ProductsGrid() {
  const { addItem } = useCart();
  const { searchByBarcode } = useBarcode();
  
  // Estados para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const itemsPerPage = 12; // Reduzido para melhor UX
  
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

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted/30 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-48 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Buscar produtos..." 
                className="pl-10 sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">Tente ajustar os filtros ou termo de busca</p>
        </div>
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
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
