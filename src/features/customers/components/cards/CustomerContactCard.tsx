
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { MessageSquare, AlertTriangle, Info, Phone, Mail, MapPin } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipPortal,
} from '@/shared/ui/primitives/tooltip';

interface MissingFieldAlertProps {
    field: {
        key: string;
        label: string;
        icon: React.ComponentType<any>;
        impact: string;
        required: boolean;
    };
    variant?: 'critical' | 'warning';
}

const MissingFieldAlert: React.FC<MissingFieldAlertProps> = ({
    field,
    variant = 'critical'
}) => {
    const IconComponent = field.icon || Info;

    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-flex items-center">
                        {variant === 'critical' ? (
                            <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse cursor-help" />
                        ) : (
                            <Info className="h-4 w-4 text-yellow-400 cursor-help" />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent
                        side="top"
                        className="max-w-sm z-[50000] bg-black/95 backdrop-blur-xl border border-red-400/30 shadow-2xl shadow-red-400/10"
                        sideOffset={8}
                        avoidCollisions={true}
                        collisionPadding={10}
                    >
                        <div className="space-y-2 p-1">
                            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                                <IconComponent className="h-4 w-4 text-red-400" />
                                <span className="font-semibold text-red-400">{field.label} em Falta</span>
                            </div>
                            <p className="text-xs text-gray-300">{field.impact}</p>
                            <div className="flex items-center gap-1 pt-1 border-t border-white/10">
                                <AlertTriangle className="h-3 w-3 text-red-400" />
                                <span className="text-xs text-red-400 font-medium">Impacta relatórios</span>
                            </div>
                        </div>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TooltipProvider>
    );
};

export const reportFields = [
    {
        key: 'phone',
        label: 'Telefone',
        required: true,
        icon: Phone,
        impact: 'Essencial para relatórios de WhatsApp e análises de contato.'
    },
    {
        key: 'email',
        label: 'Email',
        required: true,
        icon: Mail,
        impact: 'Necessário para campanhas de email marketing e relatórios de comunicação.'
    },
    {
        key: 'address',
        label: 'Endereço',
        required: false,
        icon: MapPin,
        impact: 'Importante para análises geográficas e relatórios de entrega.'
    }
];

interface CustomerContactCardProps {
    customer: any;
    profileCompleteness: string;
    onSendWhatsApp: () => void;
    onSendEmail: () => void;
}

export const CustomerContactCard: React.FC<CustomerContactCardProps> = ({
    customer,
    profileCompleteness,
    onSendWhatsApp,
    onSendEmail
}) => {
    return (
        <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-orange/60 hover:scale-[1.02] hover:shadow-xl hover:bg-black/80 transition-all duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="text-white font-semibold text-base flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-accent-orange" />
                    Contato & Comunicação
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between min-h-[36px]">
                        <span className="text-gray-200 font-medium text-sm">Telefone</span>
                        <div className="flex items-center gap-2">
                            {customer.phone ? (
                                <>
                                    <span className="text-accent-green text-sm font-bold">✓</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-3 text-xs text-accent-orange hover:text-white hover:bg-accent-orange/20 font-semibold"
                                        onClick={onSendWhatsApp}
                                    >
                                        WhatsApp
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <span className="text-accent-red text-xs font-bold">✗ Não cadastrado</span>
                                    <MissingFieldAlert
                                        field={reportFields.find(f => f.key === 'phone')!}
                                        variant="critical"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between min-h-[36px]">
                        <span className="text-gray-200 font-medium text-sm">Email</span>
                        <div className="flex items-center gap-2">
                            {customer.email ? (
                                <>
                                    <span className="text-accent-green text-sm font-bold">✓</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-3 text-xs text-accent-orange hover:text-white hover:bg-accent-orange/20 font-semibold"
                                        onClick={onSendEmail}
                                    >
                                        Enviar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <span className="text-accent-red text-xs font-bold">✗ Não cadastrado</span>
                                    <MissingFieldAlert
                                        field={reportFields.find(f => f.key === 'email')!}
                                        variant="critical"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-gray-200 font-medium text-sm">Completude</span>
                    <span className="text-accent-orange text-base font-bold">
                        {profileCompleteness}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
