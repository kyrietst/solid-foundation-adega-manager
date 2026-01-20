import { Button } from '@/shared/ui/primitives/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn, getPaginationClasses } from '@/core/config/theme-utils';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  
  // Opções de customização
  itemsPerPageOptions?: number[];
  maxVisiblePages?: number;
  showItemsPerPage?: boolean;
  showItemsCount?: boolean;
  itemLabel?: string; // singular
  itemsLabel?: string; // plural
  className?: string;
  
  // Glass Morphism & Theme
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [6, 12, 20, 50],
  maxVisiblePages = 5,
  showItemsPerPage = true,
  showItemsCount = true,
  itemLabel = 'item',
  itemsLabel = 'itens',
  className = '',
  variant = 'default',
  glassEffect = true
}: PaginationControlsProps) => {
  
  // Não mostrar paginação se houver apenas uma página
  if (totalPages <= 1) return null;

  // Calcular páginas visíveis
  const getVisiblePages = () => {
    const pages: number[] = [];
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar startPage se não temos páginas suficientes no final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  
  // Calcular itens sendo mostrados
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const handleItemsPerPageChange = (value: string) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(parseInt(value));
    }
  };

  const paginationStyles = getPaginationClasses();
  
  // Estilos baseados na variante
  const isSplit = variant === 'premium'; // Usar 'premium' como split agora, ou criar novo

  if (variant === 'premium') {
    return (
      <div className={cn("flex items-center gap-4 pointer-events-auto", className)}>
        {/* Container 1: Informações */}
        <div className="flex items-center h-10 px-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
          <div className="flex items-center space-x-2 text-xs font-medium text-zinc-400">
            {showItemsCount && (
              <span>
                Mostrando <span className="text-white">{startItem}</span> - <span className="text-white">{endItem}</span> de <span className="text-white">{totalItems}</span> {totalItems === 1 ? itemLabel : itemsLabel}
              </span>
            )}
            
            {showItemsPerPage && onItemsPerPageChange && (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-white/10">
                <span>Por pág:</span>
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-auto min-w-[60px] h-7 bg-white/5 border-white/10 text-white text-xs rounded-lg hover:bg-white/10 transition-colors focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {itemsPerPageOptions.map((option) => (
                      <SelectItem key={option} value={option.toString()} className="focus:bg-white/10 cursor-pointer text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Container 2: Navegação */}
        <div className="flex items-center h-10 px-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
           <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {visiblePages.map((page) => (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-8 min-w-[32px] rounded-full text-xs font-medium transition-all",
                  currentPage === page 
                    ? "bg-white text-black hover:bg-white/90 shadow-sm" 
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                )}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(paginationStyles.container, className)}>
      {/* Informações e seletor de itens por página */}
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        {showItemsCount && (
          <span>
            Mostrando {startItem} a {endItem} de {totalItems} {totalItems === 1 ? itemLabel : itemsLabel}
          </span>
        )}
        
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center space-x-2 ml-4">
            <span>Itens por página:</span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className={cn("w-20 bg-secondary border-border text-foreground backdrop-blur-sm")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {/* Controles de navegação */}
      <div className="flex items-center space-x-1">
        {/* Primeira página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Primeira página"
          className={paginationStyles.button}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        {/* Página anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className={paginationStyles.button}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Números das páginas */}
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={cn(
              "min-w-[40px]",
              currentPage === page ? paginationStyles.activeButton : paginationStyles.button
            )}
            aria-label={`Página ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        ))}
        
        {/* Próxima página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
          className={paginationStyles.button}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Última página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Última página"
          className={paginationStyles.button}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};