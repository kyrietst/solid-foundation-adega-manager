import { cn } from "@/core/config/utils";
import { shadows } from "@/core/config/theme";
import { Sale } from "@/features/sales/types";

interface SaleStatusBadgeProps {
    sale: Sale;
    className?: string;
}

export function SaleStatusBadge({ sale, className }: SaleStatusBadgeProps) {
    const getBadgeStyle = () => {
        // Priority: Delivery Status for Delivery Orders
        if (sale.delivery_type === 'delivery' && sale.delivery_status) {
            const deliveryStatus = sale.delivery_status.toLowerCase();
            switch (deliveryStatus) {
                case 'delivered':
                    return cn('bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm', shadows.light);
                case 'cancelled':
                    return cn('bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-sm', shadows.light);
                default: // pending, preparing, out_for_delivery
                    return cn('bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm', shadows.light);
            }
        }

        // Fallback: Standard Sale Status
        const statusLower = sale.status.toLowerCase();
        switch (statusLower) {
            case 'completed':
                return cn('bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm', shadows.light);
            case 'pending':
                return cn('bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm', shadows.light);
            case 'cancelled':
            case 'canceled':
                return cn('bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-sm', shadows.light);
            case 'returned':
                return cn('bg-purple-500/20 text-purple-400 border border-purple-500/30 backdrop-blur-sm', shadows.light);
            default:
                return cn('bg-gray-500/20 text-gray-400 border border-gray-500/30 backdrop-blur-sm', shadows.light);
        }
    };

    const getLabel = () => {
        // Priority: Delivery Status Label
        if (sale.delivery_type === 'delivery' && sale.delivery_status) {
            const ds = sale.delivery_status;
            const map: Record<string, string> = {
                'pending': 'Pendente',
                'preparing': 'Em Preparo',
                'out_for_delivery': 'Em Rota',
                'delivered': 'Entregue',
                'cancelled': 'Cancelado'
            };
            return map[ds] || ds;
        }

        // Standard Status Label
        const status = sale.status.toLowerCase();
        switch (status) {
            case 'completed': return 'Concluído';
            case 'pending': return 'Pendente';
            case 'cancelled':
            case 'canceled': return 'Cancelado';
            case 'returned': return 'Devolvido';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    return (
        <span className={cn("text-xs px-2 py-1 rounded-full", getBadgeStyle(), className)}>
            {getLabel()}
        </span>
    );
}
