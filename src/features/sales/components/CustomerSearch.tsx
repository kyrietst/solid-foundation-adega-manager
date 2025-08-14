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
import { text, shadows } from "@/core/config/theme";

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
    <div 
      className={cn(
        'flex items-center space-x-2 p-3 rounded-lg bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg hero-spotlight',
        className
      )}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-black/50 backdrop-blur-sm border-yellow-400/30 text-gray-200 hover:bg-yellow-400/10 hover:border-yellow-400/50"
          >
            {selectedCustomer
              ? <span className={cn(text.h4, shadows.medium)}>{selectedCustomer.name}</span>
              : <span className={cn(text.h6, shadows.subtle)}>Buscar cliente...</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-yellow-400/70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-black/90 backdrop-blur-xl border border-yellow-400/30">
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className={cn(text.h5, shadows.subtle, "placeholder:text-gray-400")}
            />
            <CommandList>
              <CommandEmpty className={cn(text.h6, shadows.subtle)}>
                {isLoading ? 'Buscando...' : 'Nenhum cliente encontrado.'}
              </CommandEmpty>
              <CommandGroup>
                {customers?.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`${customer.name} ${customer.email}`}
                    onSelect={() => handleSelect(customer)}
                    className="hover:bg-yellow-400/10 aria-selected:bg-yellow-400/20"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 text-yellow-400',
                        selectedCustomer?.id === customer.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div>
                      <p className={cn(text.h4, shadows.medium, "font-medium")}>{customer.name}</p>
                      <p className={cn(text.h6, shadows.subtle, "text-sm")}>{customer.email || customer.phone}</p>
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
