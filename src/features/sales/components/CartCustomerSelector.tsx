import { useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { User, Search, Edit2, UserPlus } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { text, shadows } from "@/core/config/theme";
import { CustomerSearch } from './CustomerSearch';
import { QuickCustomerCreateModal } from './QuickCustomerCreateModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/primitives/popover';

interface Customer {
    id: string;
    name: string;
    email?: string;
    cpf_cnpj?: string;
    address?: any;
}

interface CartCustomerSelectorProps {
    selectedCustomer: Customer | undefined | null;
    onSelectCustomer: (id: string | null) => void;
}

export function CartCustomerSelector({ selectedCustomer, onSelectCustomer }: CartCustomerSelectorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex-shrink-0 mb-4">
            <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Cliente</h4>

            {/* Conditional Rendering: If we are editing/searching, show the search input. 
                Otherwise show the Profile Card. Creating a smooth toggle experience. 
                For simplicity and best UX in a small cart, we can use a simple state toggle 
                that replaces the card with the search input, or a Popover. 
                
                Given the 'Start' request to Remove old inputs, let's use a nice Popover 
                or just a clean state switch.
            */}

            <Popover open={isExpanded} onOpenChange={setIsExpanded}>
                <PopoverTrigger asChild>
                    <div
                        className="group relative flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all"
                    >
                        {/* Avatar */}
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            <User size={20} />
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-white truncate">
                                {selectedCustomer ? selectedCustomer.name : "Consumidor Final"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {selectedCustomer ? (selectedCustomer.cpf_cnpj || "CPF na Nota") : "Toque para identificar"}
                            </p>
                        </div>

                        {/* Action Icon */}
                        <div className="text-muted-foreground group-hover:text-primary transition-colors">
                            {selectedCustomer ? <Edit2 size={16} /> : <Search size={16} />}
                        </div>
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[380px] p-3 bg-[#121214] border border-white/10 backdrop-blur-xl shadow-2xl"
                    align="start"
                    sideOffset={5}
                >
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white">Selecionar Cliente</h4>
                            {selectedCustomer && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                                    onClick={() => {
                                        onSelectCustomer(null);
                                        setIsExpanded(false);
                                    }}
                                >
                                    Remover
                                </Button>
                            )}
                        </div>

                        <CustomerSearch
                            selectedCustomer={selectedCustomer as any} // Cast safely
                            onSelect={(c) => {
                                onSelectCustomer(c?.id || null);
                                setIsExpanded(false);
                            }}
                        />

                        <div
                            className="flex items-center gap-1 mt-2 ml-1 cursor-pointer group/new"
                            onClick={() => {
                                setIsExpanded(false);
                                setIsModalOpen(true);
                            }}
                        >
                            <div className="p-1 rounded bg-primary/10 text-primary group-hover/new:bg-primary/20 transition-colors">
                                <UserPlus size={14} />
                            </div>
                            <span className="text-xs text-primary font-medium hover:underline">
                                Cadastrar Novo Cliente
                            </span>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <QuickCustomerCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(newCustomerId) => onSelectCustomer(newCustomerId)}
            />
        </div>
    );
}
