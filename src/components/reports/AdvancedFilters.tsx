import { useState, useEffect } from 'react';
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFilterOptions } from '@/hooks/reports/useFilterOptions';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  name: string;
  email?: string;
}

interface AdvancedFiltersProps {
  filters: {
    categoryId?: string;
    sellerId?: string;
    paymentMethodId?: string;
    customerId?: string;
    searchTerm?: string;
  };
  onFilterChange: (filters: {
    categoryId?: string;
    sellerId?: string;
    paymentMethodId?: string;
    customerId?: string;
    searchTerm?: string;
  }) => void;
  onReset?: () => void;
  className?: string;
}

export const AdvancedFilters = ({
  filters,
  onFilterChange,
  onReset,
  className = '',
}: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { options, isLoading, searchOptions } = useFilterOptions();
  
  // Filtros ativos (excluindo searchTerm)
  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => value && key !== 'searchTerm')
    .map(([key]) => key);
  
  // Atualiza o termo de busca local quando o filtro muda
  useEffect(() => {
    setSearchTerm(filters.searchTerm || '');
  }, [filters.searchTerm]);
  
  // Filtra as opções com base na busca
  const getFilteredOptions = (type: keyof typeof options): FilterOption[] => {
    if (!searchQuery) return options[type].slice(0, 10);
    
    const term = searchQuery.toLowerCase();
    return options[type]
      .filter(option => 
        option.name.toLowerCase().includes(term) || 
        (option as any).email?.toLowerCase().includes(term)
      )
      .slice(0, 10);
  };
  
  // Manipuladores de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, searchTerm: searchTerm.trim() || undefined });
  };
  
  const handleFilterSelect = (type: string, id: string) => {
    onFilterChange({ 
      ...filters, 
      [type]: filters[`${type}Id` as keyof typeof filters] === id ? undefined : id 
    });
    setActiveFilter(null);
    setSearchQuery('');
  };
  
  const handleReset = () => {
    onFilterChange({
      categoryId: undefined,
      sellerId: undefined,
      paymentMethodId: undefined,
      customerId: undefined,
      searchTerm: undefined,
    });
    setSearchTerm('');
    setSearchQuery('');
    onReset?.();
  };
  
  const getFilterLabel = (type: string, id: string) => {
    const option = options[`${type}s` as keyof typeof options]?.find(opt => opt.id === id);
    return option?.name || id;
  };
  
  const renderFilterDropdown = (type: string, label: string) => {
    const typeKey = type as keyof typeof options;
    const currentId = filters[`${type}Id` as keyof typeof filters];
    const filteredOptions = getFilteredOptions(typeKey);
    
    return (
      <Popover 
        open={activeFilter === type} 
        onOpenChange={(open) => {
          setActiveFilter(open ? type : null);
          if (!open) setSearchQuery('');
        }}
      >
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              'flex items-center gap-2',
              currentId && 'bg-accent text-accent-foreground'
            )}
            onClick={() => setActiveFilter(activeFilter === type ? null : type)}
          >
            <span>{label}</span>
            {currentId && (
              <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center">
                1
              </Badge>
            )}
            {activeFilter === type ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Buscar ${label.toLowerCase()}...`}
                className="pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <ScrollArea className="max-h-[300px] overflow-y-auto">
            <div className="p-1">
              {isLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Carregando...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum resultado encontrado
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div 
                    key={option.id} 
                    className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={() => handleFilterSelect(type, option.id)}
                  >
                    <Checkbox 
                      id={`${type}-${option.id}`} 
                      checked={currentId === option.id}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label 
                      htmlFor={`${type}-${option.id}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      <div>{option.name}</div>
                      {option.email && (
                        <div className="text-xs text-muted-foreground truncate">{option.email}</div>
                      )}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          {currentId && (
            <div className="p-2 border-t text-right">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleFilterSelect(type, '')}
              >
                Limpar
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Barra de busca */}
        <form onSubmit={handleSearch} className="flex-1 w-full max-w-xl">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar em todos os campos..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => {
                  setSearchTerm('');
                  onFilterChange({ ...filters, searchTerm: undefined });
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Limpar busca</span>
              </Button>
            )}
          </div>
        </form>
        
        {/* Filtros avançados */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {renderFilterDropdown('category', 'Categorias')}
            {renderFilterDropdown('seller', 'Vendedores')}
            {renderFilterDropdown('paymentMethod', 'Pagamentos')}
            {renderFilterDropdown('customer', 'Clientes')}
          </div>
          
          {(activeFilters.length > 0 || filters.searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>
      
      {/* Filtros ativos */}
      {(activeFilters.length > 0 || filters.searchTerm) && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.searchTerm && (
            <Badge variant="secondary" className="px-2 py-1 text-sm">
              Busca: "{filters.searchTerm}"
              <button
                onClick={() => {
                  setSearchTerm('');
                  onFilterChange({ ...filters, searchTerm: undefined });
                }}
                className="ml-1.5 rounded-full bg-background p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {activeFilters.map((filterKey) => {
            const type = filterKey.replace(/Id$/, '');
            const id = filters[filterKey as keyof typeof filters];
            if (!id) return null;
            
            return (
              <Badge key={filterKey} variant="secondary" className="px-2 py-1 text-sm">
                {type}: {getFilterLabel(type, id as string)}
                <button
                  onClick={() => {
                    onFilterChange({ ...filters, [filterKey]: undefined });
                  }}
                  className="ml-1.5 rounded-full bg-background p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
