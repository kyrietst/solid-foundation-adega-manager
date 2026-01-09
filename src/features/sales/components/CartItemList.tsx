import { Button } from '@/shared/ui/primitives/button';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { OptimizedImage } from '@/shared/ui/composite/optimized-image';

interface CartItem {
    id: string;
    variant_id: string;
    name: string;
    variant_type?: string;
    packageUnits?: number;
    units_sold: number;
    price: number;
    quantity: number;
    image_url?: string; // We need to ensure this is passed or available on the item
}

interface CartItemListProps {
    items: CartItem[];
    maxItems: number;
    onUpdateQuantity: (id: string, variantId: string, quantity: number) => void;
    onRemoveItem: (id: string, variantId: string) => void;
}

export function CartItemList({ items, maxItems, onUpdateQuantity, onRemoveItem }: CartItemListProps) {
    if (items.length === 0) return null;

    return (
        <ScrollArea className="flex-1 overflow-y-auto px-4 py-2">
            <div className="space-y-3 pb-4">
                {items.map((item) => (
                    <div
                        key={`${item.id}-${item.variant_id}`}
                        className="group flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-transparent hover:border-white/10 transition-colors w-full max-w-full overflow-hidden"
                    >
                        {/* Image */}
                        <div className="h-14 w-10 bg-black/30 rounded-md shrink-0 overflow-hidden flex items-center justify-center relative">
                            {item.image_url ? (
                                <OptimizedImage
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Package className="h-5 w-5 text-gray-600" />
                            )}

                            {/* Badger for Package variant */}
                            {item.variant_type === 'package' && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] px-1 rounded-bl-md font-bold">
                                    cx
                                </div>
                            )}
                        </div>

                        {/* Info - Fixed width flex child */}
                        <div className="flex-1 min-w-0 w-0 flex flex-col justify-center">
                            <h4 className="text-white text-sm font-medium truncate w-full" title={item.name}>
                                {item.name}
                            </h4>
                            <p className="text-xs text-gray-400">
                                {formatCurrency(item.price)} un
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.variant_id, Math.max(0, item.quantity - 1))}
                                    className="size-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-6 text-center text-sm font-medium text-white">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.variant_id, item.quantity + 1)}
                                    disabled={item.quantity >= maxItems}
                                    className="size-6 flex items-center justify-center text-primary hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <p className="text-sm font-bold text-white">
                                {formatCurrency(item.price * item.quantity)}
                            </p>
                        </div>

                        {/* Trash Action */}
                        <button
                            onClick={() => onRemoveItem(item.id, item.variant_id)}
                            className="ml-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 shrink-0"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
