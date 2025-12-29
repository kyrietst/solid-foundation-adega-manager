
import { useState } from 'react';
import { Input } from '@/shared/ui/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DeliveryPerson {
    id: string;
    name: string;
}

interface CartDeliverySectionProps {
    cartId: string;
    deliveryAddress: string;
    deliveryFee: number;
    deliveryPersonId: string;
    deliveryPersons: DeliveryPerson[];
    onAddressChange: (val: string) => void;
    onFeeChange: (val: number) => void;
    onDeliveryPersonChange: (val: string) => void;
}

export function CartDeliverySection({
    cartId,
    deliveryAddress,
    deliveryFee,
    deliveryPersonId,
    deliveryPersons,
    onAddressChange,
    onFeeChange,
    onDeliveryPersonChange
}: CartDeliverySectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="border-b border-white/20">
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    Entrega
                    {deliveryAddress && (
                        <span className="text-xs text-orange-400 truncate max-w-32">
                            ({deliveryAddress})
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
                <div className="px-4 pb-4 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor={`${cartId}-address`} className="text-sm font-medium text-gray-200">Endereço de Entrega *</label>
                        <Input
                            id={`${cartId}-address`}
                            name="delivery_address"
                            placeholder="Ex: Rua das Flores, 123, Bela Vista"
                            value={deliveryAddress}
                            onChange={(e) => onAddressChange(e.target.value)}
                            className="text-sm bg-gray-800/50 border-orange-400/30 text-gray-200 focus:border-orange-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label htmlFor={`${cartId}-fee`} className="text-sm font-medium text-gray-200">Taxa</label>
                            <Input
                                id={`${cartId}-fee`}
                                name="delivery_fee"
                                type="number"
                                placeholder="0,00"
                                value={deliveryFee || ''}
                                onChange={(e) => onFeeChange(Math.max(0, Number(e.target.value)))}
                                className="text-sm bg-gray-800/50 border-orange-400/30 text-gray-200 focus:border-orange-400"
                                step="0.01"
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Entregador</label>
                            <Select value={deliveryPersonId} onValueChange={onDeliveryPersonChange}>
                                <SelectTrigger className="bg-gray-800/50 border-orange-400/30 text-gray-200">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-orange-400/30">
                                    {deliveryPersons.map((person) => (
                                        <SelectItem key={person.id} value={person.id} className="text-gray-200 hover:bg-orange-400/10">
                                            {person.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
