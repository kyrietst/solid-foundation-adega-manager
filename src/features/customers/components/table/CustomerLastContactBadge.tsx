import React from "react";
import { MessageCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipPortal,
} from "@/shared/ui/primitives/tooltip";
import { cn } from "@/core/config/utils";
import { getLastContactColor, formatLastContact } from "../../types/customer-table.types";

interface CustomerLastContactBadgeProps {
    date: Date | null;
    daysAgo: number | null;
}

export const CustomerLastContactBadge = ({
    date,
    daysAgo
}: CustomerLastContactBadgeProps) => {
    const color = getLastContactColor(daysAgo);
    const text = formatLastContact(date, daysAgo);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("flex items-center gap-1", color)}>
                        <MessageCircle className="w-3 h-3" />
                        {text}
                    </div>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent className="z-[50000] bg-gray-900 border-gray-700">
                        <p>
                            {daysAgo === null
                                ? "Cliente nunca teve contato registrado"
                                : `Último contato há ${daysAgo} dia${daysAgo === 1 ? '' : 's'}`
                            }
                        </p>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TooltipProvider>
    );
};
