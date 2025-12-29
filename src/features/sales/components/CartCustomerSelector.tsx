
import { useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { text, shadows } from "@/core/config/theme";
import { CustomerSearch } from './CustomerSearch';
import { QuickCustomerCreateModal } from './QuickCustomerCreateModal';

interface Customer {
    id: string;
    name: string;
    email?: string;
    address?: any;
}

interface CartCustomerSelectorProps {
    selectedCustomer: Customer | undefined | null;
    onSelectCustomer: (id: string | null) => void;
}

export function CartCustomerSelector({ selectedCustomer, onSelectCustomer }: CartCustomerSelectorProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex-shrink-0 border-b border-white/20">
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    Cliente
                    {selectedCustomer && (
                        <span className="text-xs text-emerald-400">
                            ({selectedCustomer.name})
                        </span>
                    )}
                </h4>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                    {selectedCustomer ? (
                        <div className="flex items-center justify-between p-3 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm rounded-lg">
                            <div>
                                <p className={cn(text.h5, shadows.light, "font-medium text-sm")}>{selectedCustomer.name}</p>
                                <p className={cn(text.h6, shadows.subtle, "text-xs")}>{selectedCustomer.email}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSelectCustomer(null)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                aria-label={`Remover cliente ${selectedCustomer.name} da venda`}
                            >
                                Remover
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <CustomerSearch
                                selectedCustomer={(selectedCustomer as any) || null}
                                onSelect={(customer) => onSelectCustomer(customer?.id || null)}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400/50 backdrop-blur-sm"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <UserPlus className="h-4 w-4 mr-2 text-yellow-400" aria-hidden="true" />
                                Cadastrar Cliente
                            </Button>

                            <QuickCustomerCreateModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                onSuccess={(newCustomerId) => onSelectCustomer(newCustomerId)}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
