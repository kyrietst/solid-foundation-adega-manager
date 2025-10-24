/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/**
 * CustomerSearchPresentation.tsx - Componente de apresentação puro (REFATORADO)
 * Context7 Pattern: Componente focado apenas na apresentação visual
 * Remove toda lógica de busca e estado do componente de UI
 *
 * REFATORAÇÃO APLICADA:
 * - Componente puro sem hooks de dados
 * - Props claramente definidas
 * - Popover logic isolada na apresentação
 * - Command pattern mantido na UI
 * - Focus na apresentação visual
 *
 * @version 2.0.0 - Presentational Component (Context7)
 */

import React from 'react';
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
import { CustomerProfile } from '@/features/customers/hooks/use-crm';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

export interface CustomerSearchPresentationProps {
  // Data props
  customers: CustomerProfile[];
  isLoading: boolean;
  error: Error | null;
  hasCustomers: boolean;
  shouldShowEmpty: boolean;

  // Search state props
  searchTerm: string;
  onSearchTermChange: (term: string) => void;

  // Popover state props
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Selection props
  selectedCustomer: CustomerProfile | null;
  onSelect: (customer: CustomerProfile | null) => void;

  // Configuration props
  onAddNew?: () => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  className?: string;
}

/**
 * Componente de apresentação puro para Customer Search
 * Foca apenas na renderização visual sem lógica de negócio
 */
export const CustomerSearchPresentation: React.FC<CustomerSearchPresentationProps> = ({
  customers,
  isLoading,
  error,
  hasCustomers,
  shouldShowEmpty,
  searchTerm,
  onSearchTermChange,
  open,
  onOpenChange,
  selectedCustomer,
  onSelect,
  onAddNew,
  variant = 'default',
  glassEffect = true,
  className = '',
}) => {
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  const handleCustomerSelect = (customer: CustomerProfile) => {
    onSelect(customer);
    onOpenChange(false);
    onSearchTermChange('');
  };

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
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-black/50 backdrop-blur-sm border-amber-400/30 text-gray-200 hover:bg-amber-400/10 hover:border-amber-400/50 transition-all duration-200"
          >
            {selectedCustomer ? (
              <span className="text-white font-medium">{selectedCustomer.name}</span>
            ) : (
              <span className="text-gray-400">Buscar cliente...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-amber-400/70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-black/95 backdrop-blur-xl border border-amber-400/30 shadow-2xl shadow-amber-400/10">
          <Command className="bg-transparent text-white">
            <CommandInput
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onValueChange={onSearchTermChange}
              className={cn(
                "text-white placeholder:text-gray-400 border-amber-400/20 focus:border-amber-400/40",
                "bg-transparent h-12 px-3"
              )}
            />
            <CommandList className="bg-transparent text-white max-h-[280px]">
              <CommandEmpty className="py-6 text-center text-sm text-gray-300">
                {isLoading ? 'Buscando clientes...' : 'Nenhum cliente encontrado.'}
              </CommandEmpty>
              {hasCustomers && (
                <CommandGroup className="bg-transparent">
                  {customers.map((customer) => (
                    <CustomerItem
                      key={customer.id}
                      customer={customer}
                      isSelected={selectedCustomer?.id === customer.id}
                      onSelect={handleCustomerSelect}
                    />
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {onAddNew && <AddNewButton onAddNew={onAddNew} />}
    </div>
  );
};

/**
 * Customer item component
 */
const CustomerItem: React.FC<{
  customer: CustomerProfile;
  isSelected: boolean;
  onSelect: (customer: CustomerProfile) => void;
}> = ({ customer, isSelected, onSelect }) => (
  <CommandItem
    value={`${customer.name} ${customer.email} ${customer.phone || ''}`}
    onSelect={() => onSelect(customer)}
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
        isSelected ? 'opacity-100' : 'opacity-0'
      )}
    />
    <div
      className="flex-1 min-w-0"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(customer);
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
);

/**
 * Add new button component
 */
const AddNewButton: React.FC<{ onAddNew: () => void }> = ({ onAddNew }) => (
  <Button
    size="icon"
    variant="outline"
    onClick={onAddNew}
    aria-label="Adicionar novo cliente"
    className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/50 transition-all duration-200 bg-black/50 backdrop-blur-sm"
  >
    <UserPlus className="h-4 w-4" />
  </Button>
);