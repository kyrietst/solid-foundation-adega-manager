import React from "react";
import { DollarSign } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipPortal,
} from "@/shared/ui/primitives/tooltip";
import { cn } from "@/core/config/utils";
import { getOutstandingAmountColor, formatCurrency } from "../../types/customer-table.types";

interface CustomerOutstandingAmountBadgeProps {
    amount: number;
}

export const CustomerOutstandingAmountBadge = ({ amount }: CustomerOutstandingAmountBadgeProps) => {
    const color = getOutstandingAmountColor(amount);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("flex items-center gap-1", color)}>
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(amount)}
                    </div>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent className="z-[50000] bg-gray-900 border-gray-700">
                        <p>
                            {amount === 0
                                ? "Cliente não possui valores em aberto"
                                : `Valor total em aberto: ${formatCurrency(amount)}`
                            }
                        </p>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TooltipProvider>
    );
};
