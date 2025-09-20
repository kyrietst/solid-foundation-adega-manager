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