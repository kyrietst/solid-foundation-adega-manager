import React from "react";
import { Badge } from "@/shared/ui/primitives/badge";
import { cn } from "@/core/config/utils";
import { CustomerTableRow } from "../../types/customer-table.types";

interface CustomerStatusBadgeProps {
    status: CustomerTableRow['status'];
    color: CustomerTableRow['statusColor'];
}

export const CustomerStatusBadge = React.memo(({
    status,
    color
}: CustomerStatusBadgeProps) => {
    // Sistema de cores Adega Wine Cellar v2.1 - Contraste otimizado
    const statusColors = {
        gold: "bg-primary-yellow/20 text-primary-yellow border-primary-yellow/40 shadow-lg shadow-primary-yellow/10 font-semibold backdrop-blur-sm",
        green: "bg-green-400/20 text-green-300 border-green-400/40 shadow-lg shadow-green-400/10 backdrop-blur-sm",
        yellow: "bg-accent-orange/20 text-orange-300 border-accent-orange/40 shadow-lg shadow-accent-orange/10 backdrop-blur-sm",
        red: "bg-accent-red/20 text-red-300 border-accent-red/40 shadow-lg shadow-accent-red/10 backdrop-blur-sm lgpd-soft-pulse",
        gray: "bg-gray-500/20 text-gray-300 border-gray-500/40 shadow-lg shadow-gray-500/10 backdrop-blur-sm",
        orange: "bg-accent-orange/20 text-orange-300 border-accent-orange/40 shadow-lg shadow-accent-orange/10 backdrop-blur-sm"
    };

    return (
        <Badge className={cn(
            "whitespace-nowrap transition-all duration-200 hover:scale-105 border text-sm font-semibold px-3 py-1",
            statusColors[color] || statusColors.gray
        )}>
            {status}
        </Badge>
    );
}, (prevProps, nextProps) =>
    prevProps.status === nextProps.status && prevProps.color === nextProps.color
);
