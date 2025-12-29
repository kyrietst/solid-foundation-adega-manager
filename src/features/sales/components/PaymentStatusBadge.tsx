import { cn } from "@/core/config/utils";
import { shadows } from "@/core/config/theme";

interface PaymentStatusBadgeProps {
    status: string;
    className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
    const getBadgeStyle = () => {
        switch (status) {
            case 'paid':
                return cn('bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm', shadows.light);
            case 'pending':
                return cn('bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm', shadows.light);
            case 'cancelled':
                return cn('bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-sm', shadows.light);
            default:
                return cn('bg-gray-500/20 text-gray-400 border border-gray-500/30 backdrop-blur-sm', shadows.light);
        }
    };

    const getLabel = () => {
        const statusMap: Record<string, string> = {
            'pending': 'Pendente',
            'paid': 'Pago',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    return (
        <span className={cn("text-xs px-2 py-0.5 rounded-full", getBadgeStyle(), className)}>
            {getLabel()}
        </span>
    );
}
