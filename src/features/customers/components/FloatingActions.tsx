import React from 'react';
import { Plus, MessageSquare, Phone, Calendar } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/shared/ui/primitives/tooltip';

interface FloatingActionsProps {
    onNewSale: () => void;
    onWhatsApp: () => void;
    hasPhone: boolean;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
    onNewSale,
    onWhatsApp,
    hasPhone
}) => {
    return (
        <div className="fixed bottom-8 right-8 z-50">
            <div className="flex items-center gap-2 p-1.5 bg-zinc-800/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">

                {/* Primary Action: New Sale */}
                <Button
                    onClick={onNewSale}
                    className="h-12 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(149,19,236,0.5)] transition-all hover:scale-105"
                >
                    <Plus className="h-5 w-5" />
                    Nova Venda
                </Button>

                {/* Secondary Action: WhatsApp */}
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={onWhatsApp}
                                disabled={!hasPhone}
                                className="size-12 rounded-full bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                            >
                                <MessageSquare className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-black/90 border-zinc-800 text-zinc-200">
                            <p>{hasPhone ? 'WhatsApp' : 'Sem telefone'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Tertiary Action: Schedule/Calendar (Placeholder for future) */}
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-12 rounded-full bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                                onClick={() => { }} // Placeholder
                            >
                                <Calendar className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-black/90 border-zinc-800 text-zinc-200">
                            <p>Agendar (Em breve)</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            </div>
        </div>
    );
};
