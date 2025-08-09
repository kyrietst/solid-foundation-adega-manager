import React, { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/primitives/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/primitives/popover';
import { useCustomers, CustomerProfile } from '@/features/customers/hooks/use-crm';
import { useDebounce } from '@/shared/hooks/common/use-debounce';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface CustomerSearchProps {
  selectedCustomer: CustomerProfile | null;
  onSelect: (customer: CustomerProfile | null) => void;
  onAddNew?: () => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  className?: string;
}

export function CustomerSearch({ 
  selectedCustomer, 
  onSelect, 
  onAddNew,
  variant = 'default',
  glassEffect = true,
  className = ''
}: CustomerSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: customers = [], isLoading, refetch } = useCustomers({
    search: debouncedSearchTerm,
    limit: 1000,
    enabled: open,
  });

  // Estabilizar refetch para evitar re-execuções desnecessárias
  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // When the popover opens, fetch all customers initially
  useEffect(() => {
    if (open) {
      stableRefetch();
    }
  }, [open, stableRefetch]);

  const handleSelect = useCallback((customer: CustomerProfile) => {
    onSelect(customer);
    setOpen(false);
    setSearchTerm('');
  }, [onSelect]);
  
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <div className={cn(
      'flex items-center space-x-2 p-3 rounded-lg',
      glassClasses,
      className
    )}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-gray-800/50 border-primary-yellow/30 text-gray-200 hover:bg-primary-yellow/10 hover:border-primary-yellow"
          >
            {selectedCustomer
              ? <span className="text-gray-100">{selectedCustomer.name}</span>
              : <span className="text-gray-400">Buscar cliente...</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-primary-yellow/70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(
          'w-[--radix-popover-trigger-width] p-0 border-primary-yellow/30',
          glassClasses
        )}>
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="text-gray-200 placeholder:text-gray-400"
            />
            <CommandList>
              <CommandEmpty className="text-gray-400">
                {isLoading ? 'Buscando...' : 'Nenhum cliente encontrado.'}
              </CommandEmpty>
              <CommandGroup>
                {customers?.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`${customer.name} ${customer.email}`}
                    onSelect={() => handleSelect(customer)}
                    className="text-gray-200 hover:bg-primary-yellow/10 aria-selected:bg-primary-yellow/20"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 text-primary-yellow',
                        selectedCustomer?.id === customer.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div>
                      <p className="font-medium text-gray-100">{customer.name}</p>
                      <p className="text-sm text-gray-400">{customer.email || customer.phone}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {onAddNew && (
        <Button 
          size="icon" 
          variant="outline" 
          onClick={onAddNew} 
          aria-label="Adicionar novo cliente"
          className="border-primary-yellow/30 text-primary-yellow hover:bg-primary-yellow/10 hover:border-primary-yellow"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
