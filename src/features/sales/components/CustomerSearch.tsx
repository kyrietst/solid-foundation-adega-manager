/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
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
    limit: 50, // Limitar para performance
    enabled: true, // Sempre habilitado para busca em tempo real
  });

  // Estabilizar refetch para evitar re-execuções desnecessárias
  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // When the popover opens, ensure fresh data
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
            className="w-full justify-between font-normal bg-black/50 backdrop-blur-sm border-amber-400/30 text-gray-200 hover:bg-amber-400/10 hover:border-amber-400/50 transition-all duration-200"
          >
            {selectedCustomer
              ? <span className="text-white font-medium">{selectedCustomer.name}</span>
              : <span className="text-gray-400">Buscar cliente...</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-amber-400/70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-black/95 backdrop-blur-xl border border-amber-400/30 shadow-2xl shadow-amber-400/10">
          <Command className="bg-transparent text-white">
            <CommandInput
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className={cn(
                "text-white placeholder:text-gray-400 border-amber-400/20 focus:border-amber-400/40",
                "bg-transparent h-12 px-3"
              )}
            />
            <CommandList className="bg-transparent text-white max-h-[280px]">
              <CommandEmpty className="py-6 text-center text-sm text-gray-300">
                {isLoading ? 'Buscando clientes...' : 'Nenhum cliente encontrado.'}
              </CommandEmpty>
              <CommandGroup className="bg-transparent">
                {customers?.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`${customer.name} ${customer.email} ${customer.phone || ''}`}
                    onSelect={() => handleSelect(customer)}
                    className={cn(
                      "bg-transparent text-white cursor-pointer transition-all duration-200",
                      "hover:bg-amber-400/15 hover:shadow-md hover:shadow-amber-400/20",
                      "data-[selected=true]:bg-amber-400/20 data-[selected=true]:text-white",
                      "border-l-2 border-transparent hover:border-amber-400/50",
                      "px-3 py-3 mx-1 rounded-lg my-1"
                    )}
                  >
                    <Check
                      className={cn(
                        'mr-3 h-4 w-4 text-amber-400 transition-opacity duration-200',
                        selectedCustomer?.id === customer.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div 
                      className="flex-1 min-w-0" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(customer);
                      }}
                    >
                      <p className="font-semibold text-white text-sm leading-tight truncate">
                        {customer.name}
                      </p>
                      <p className="text-gray-300 text-xs mt-1 truncate">
                        {customer.email || customer.phone}
                      </p>
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
          className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/50 transition-all duration-200 bg-black/50 backdrop-blur-sm"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
