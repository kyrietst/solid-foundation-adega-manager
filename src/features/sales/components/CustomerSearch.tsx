/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, UserPlus, Search } from 'lucide-react';
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
  embedded = false,
  variant = 'default',
  glassEffect = true,
  className = ''
}: CustomerSearchProps & { embedded?: boolean }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: customers = [], isLoading, refetch } = useCustomers({
    search: debouncedSearchTerm,
    limit: 50,
    enabled: true,
  });

  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (open || embedded) {
      stableRefetch();
    }
  }, [open, embedded, stableRefetch]);

  const handleSelect = useCallback((customer: CustomerProfile) => {
    onSelect(customer);
    setOpen(false);
    setSearchTerm('');
  }, [onSelect]);

  const removeCustomer = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(null);
  }, [onSelect]);

  const SearchContent = (
    <Command className={cn("bg-transparent text-white", embedded ? "border-none" : "")}>
      <div className="relative border-b border-white/10 px-1">
        <CommandInput
          placeholder="Buscar cliente (Nome, CPF, Email ou Telefone)..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          name="customer_search_query"
          className={cn(
            "pl-3 text-base text-white placeholder:text-muted-foreground/60",
            "bg-transparent h-11 border-none focus:ring-0 focus:outline-none"
          )}
        />
      </div>

      <CommandList className={cn("bg-transparent text-white mt-2", embedded ? "max-h-[300px]" : "max-h-[280px]")}>
        <CommandEmpty className="py-8 text-center text-sm text-gray-500">
          {isLoading ? 'Buscando...' : 'Nenhum cliente encontrado.'}
        </CommandEmpty>
        <CommandGroup className="bg-transparent p-0">
          {customers?.map((customer) => (
            <CommandItem
              key={customer.id}
              value={`${customer.name} ${customer.email} ${customer.phone || ''} ${customer.cpf_cnpj || ''}`}
              onSelect={() => handleSelect(customer)}
              className={cn(
                "bg-transparent text-white cursor-pointer transition-all duration-200",
                "hover:bg-[#FACC15]/20 hover:text-white",
                "aria-selected:bg-[#FACC15]/20 aria-selected:text-white",
                "px-3 py-2.5 mx-1 rounded-md mb-1"
              )}
            >
              <div className="flex items-center w-full">
                <div className={cn(
                  "flex items-center justify-center size-8 rounded-full mr-3 shrink-0",
                  selectedCustomer?.id === customer.id ? "bg-[#FACC15] text-black" : "bg-white/10 text-gray-400"
                )}>
                  <Check className={cn(
                    "h-4 w-4 transition-all scale-100",
                    selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0 scale-0"
                  )} />
                  {/* If not selected, maybe show initials? But keeping simple check logic is fine */}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-tight truncate">
                    {customer.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {customer.cpf_cnpj && <span>{customer.cpf_cnpj}</span>}
                    {customer.email && <span className="truncate opacity-70">{customer.email}</span>}
                  </div>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (embedded) {
    return (
      <div className="w-full">
        {SearchContent}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-[#FACC15]/50 hover:text-white transition-all"
          >
            {selectedCustomer
              ? <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-medium truncate">{selectedCustomer.name}</span>
              </div>
              : <span className="text-muted-foreground">Buscar cliente...</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />

            {/* Quick Remove X if selected */}
            {selectedCustomer && (
              <div
                role="button"
                onClick={removeCustomer}
                className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <Check className="h-3 w-3 text-transparent" /> {/* Spacer/Hack or use X */}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#09090b] border border-white/10 backdrop-blur-xl shadow-2xl">
          {SearchContent}
        </PopoverContent>
      </Popover>

      {onAddNew && (
        <Button
          size="icon"
          variant="outline"
          onClick={onAddNew}
          className="ml-2 border-white/10 bg-white/5 text-muted-foreground hover:text-[#FACC15] hover:border-[#FACC15]/50"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
