
import { Button } from '@/shared/ui/primitives/button'; // Adjust based on actual path
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface CartItem {
    id: string;
    variant_id: string;
    name: string;
    variant_type?: string;
    packageUnits?: number;
    units_sold: number;
    price: number;
    quantity: number;
}

interface CartItemListProps {
    items: CartItem[];
    maxItems: number;
    onUpdateQuantity: (id: string, variantId: string, quantity: number) => void;
    onRemoveItem: (id: string, variantId: string) => void;
}

export function CartItemList({ items, maxItems, onUpdateQuantity, onRemoveItem }: CartItemListProps) {
    return (
        <div className="flex-1 min-h-[200px] flex flex-col border-b border-white/20">
            <div className="flex items-center justify-between p-3 bg-gray-800/30 border-b border-white/5">
                <h4 className="text-sm font-medium text-gray-200">Produtos no Carrinho</h4>
                <span className="text-xs text-gray-400">{items.length} itens</span>
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-[1fr_80px_80px_auto] gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-black/20">
                <div>Produto</div>
                <div className="text-right">Vlr. Unit.</div>
                <div className="text-right">Vlr. Total</div>
                <div className="w-[72px]"></div> {/* Spacer for actions */}
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 space-y-1">
                    {items.map((item) => (
                        <div key={`${item.id}-${item.variant_id}`} className="group flex flex-col p-2 glass-subtle rounded-lg hover:bg-primary-yellow/5 transition-colors border border-transparent hover:border-white/5">
                            {/* Main Row */}
                            <div className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm text-gray-100 truncate" title={item.name}>{item.name}</h4>
                                        {item.variant_type === 'package' && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                Cx {item.packageUnits}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right text-xs text-gray-400">
                                    {formatCurrency(item.price)}
                                </div>
                                <div className="text-right text-xs text-primary-yellow font-medium">
                                    {formatCurrency(item.price * item.quantity)}
                                </div>
                                
                                {/* Actions - Compact */}
                                <div className="flex items-center justify-end space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onUpdateQuantity(item.id, item.variant_id, Math.max(0, item.quantity - 1))}
                                        className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10"
                                    >
                                        -
                                    </Button>
                                    <span className="w-6 text-center text-xs font-medium text-gray-200">{item.quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onUpdateQuantity(item.id, item.variant_id, item.quantity + 1)}
                                        className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10"
                                        disabled={item.quantity >= maxItems}
                                    >
                                        +
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemoveItem(item.id, item.variant_id)}
                                        className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
