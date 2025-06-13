import React, { useState } from 'react';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCustomers, CustomerProfile } from '@/hooks/use-crm';
import { useDebounce } from '@/hooks/use-debounce';

interface CustomerSearchProps {
  selectedCustomer: CustomerProfile | null;
  onSelect: (customer: CustomerProfile | null) => void;
  onAddNew: () => void;
}

export function CustomerSearch({ selectedCustomer, onSelect, onAddNew }: CustomerSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: customers, isLoading } = useCustomers({
    search: debouncedSearchTerm,
    limit: 10,
    enabled: open && debouncedSearchTerm.length > 1,
  });

  const handleSelect = (customer: CustomerProfile) => {
    onSelect(customer);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedCustomer
              ? selectedCustomer.name
              : 'Buscar cliente...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Buscando...' : 'Nenhum cliente encontrado.'}
              </CommandEmpty>
              <CommandGroup>
                {customers?.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`${customer.name} ${customer.email}`}
                    onSelect={() => handleSelect(customer)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedCustomer?.id === customer.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email || customer.phone}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button size="icon" variant="outline" onClick={onAddNew} aria-label="Adicionar novo cliente">
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  );
}
