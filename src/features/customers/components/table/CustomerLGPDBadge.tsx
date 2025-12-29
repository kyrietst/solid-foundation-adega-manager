import React from "react";
import { Badge } from "@/shared/ui/primitives/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipPortal,
} from "@/shared/ui/primitives/tooltip";
import { cn } from "@/core/config/utils";
import { Shield, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface CustomerLGPDBadgeProps {
    hasPermission: boolean;
}

export const CustomerLGPDBadge = React.memo(({ hasPermission }: CustomerLGPDBadgeProps) => {
    return (
        <div className="flex justify-center items-center w-full">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge
                            className={cn(
                                "flex items-center gap-1 transition-all duration-200 hover:scale-105 border backdrop-blur-sm cursor-pointer text-sm font-semibold px-3 py-1",
                                hasPermission
                                    ? "bg-green-400/20 text-green-300 border-green-400/40 shadow-lg shadow-green-400/10"
                                    : "bg-accent-red/20 text-red-300 border-accent-red/40 shadow-lg shadow-accent-red/10 lgpd-soft-pulse"
                            )}
                        >
                            {hasPermission ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 lgpd-soft-pulse" />}
                            {hasPermission ? "LGPD ✓" : "Pendente"}
                        </Badge>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent className="z-[50000] bg-black/95 backdrop-blur-xl border border-primary-yellow/30 shadow-2xl">
                            <div className="space-y-2 p-1">
                                <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                                    <Shield className="h-3 w-3 text-primary-yellow" />
                                    <span className="font-semibold text-white text-xs">Status LGPD</span>
                                </div>

                                {hasPermission ? (
                                    <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-2">
                                        <p className="text-green-300 font-medium text-xs flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Autorização Concedida
                                        </p>
                                        <p className="text-green-200 text-[10px] mt-1">
                                            Cliente pode receber comunicações de marketing
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-2">
                                        <p className="text-red-300 font-medium text-xs flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 lgpd-soft-pulse" />
                                            Autorização Pendente
                                        </p>
                                        <p className="text-red-200 text-[10px] mt-1">
                                            Necessário consentimento para marketing
                                        </p>
                                    </div>
                                )}

                                <div className="text-center pt-1 border-t border-white/10">
                                    <p className="text-xs text-gray-300">
                                        Conforme Lei Geral de Proteção de Dados
                                    </p>
                                </div>
                            </div>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}, (prevProps, nextProps) => prevProps.hasPermission === nextProps.hasPermission);
