
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
            <div className="flex items-center justify-between p-3 bg-gray-800/30">
                <h4 className="text-sm font-medium text-gray-200">Produtos no Carrinho</h4>
                <span className="text-xs text-gray-400">{items.length} itens</span>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-3">
                    {items.map((item) => (
                        <div key={`${item.id}-${item.variant_id}`} className="flex items-center justify-between p-3 glass-subtle rounded-lg hover:bg-primary-yellow/5 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm text-gray-100 truncate">{item.name}</h4>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${item.variant_type === 'package'
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                        }`}>
                                        {item.variant_type === 'package' ? `${item.packageUnits || 1}x` : 'Un'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    {formatCurrency(item.price)} × {item.quantity}
                                    {item.variant_type === 'package' && item.packageUnits && (
                                        <span className="ml-1 text-blue-300">
                                            ({item.units_sold} unid.)
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <div className="flex items-center space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onUpdateQuantity(item.id, item.variant_id, Math.max(0, item.quantity - 1))}
                                        className="h-6 w-6 p-0 text-gray-300 hover:text-primary-yellow hover:bg-primary-yellow/10"
                                    >
                                        -
                                    </Button>
                                    <span className="w-8 text-center text-sm text-gray-200">{item.quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onUpdateQuantity(item.id, item.variant_id, item.quantity + 1)}
                                        className="h-6 w-6 p-0 text-gray-300 hover:text-primary-yellow hover:bg-primary-yellow/10"
                                        disabled={item.quantity >= maxItems}
                                    >
                                        +
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveItem(item.id, item.variant_id)}
                                    className="h-6 w-6 p-0 text-accent-red hover:text-accent-red/80 hover:bg-accent-red/10"
                                >
                                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
