
import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { ShoppingBag, PhoneCall, FileText, Clock, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface TimelineItem {
    id: string;
    type: string;
    title: string;
    created_at: string;
    description: string;
    amount?: number;
}

interface CustomerTimelineProps {
    timeline: TimelineItem[];
}

export const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ timeline }) => {
    const getTimelineIcon = (activityType: string) => {
        switch (activityType) {
            case 'sale': return ShoppingBag;
            case 'interaction': return PhoneCall;
            case 'event': return FileText;
            default: return Clock;
        }
    };

    const getTimelineColor = (activityType: string) => {
        switch (activityType) {
            case 'sale': return 'text-green-400';
            case 'interaction': return 'text-blue-400';
            case 'event': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    };

    const formatTimelineDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Agora mesmo';
        if (diffHours < 24) return `${diffHours}h atrás`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;

        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                Timeline de Atividades
            </h3>
            <Card className="bg-gray-800/30 border-gray-700/40">
                <CardContent className="p-6">
                    {timeline.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma atividade encontrada</p>
                            <p className="text-xs mt-1">Histórico será exibido conforme interações ocorrem</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {timeline.slice(0, 10).map((item) => {
                                const IconComponent = getTimelineIcon(item.type);
                                const iconColor = getTimelineColor(item.type);

                                return (
                                    <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-700/30 last:border-b-0">
                                        <div className={`flex-shrink-0 p-2 rounded-full bg-gray-800/50 ${iconColor}`}>
                                            <IconComponent className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-white capitalize">
                                                    {item.title}
                                                </p>
                                                <span className="text-xs text-gray-400">
                                                    {formatTimelineDate(item.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-300 mt-1 break-words">
                                                {item.description}
                                            </p>
                                            {item.amount && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <DollarSign className="h-3 w-3 text-green-400" />
                                                    <span className="text-xs text-green-400 font-medium">
                                                        {formatCurrency(item.amount)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {timeline.length > 10 && (
                                <div className="text-center pt-2">
                                    <p className="text-xs text-gray-500">
                                        Mostrando as 10 atividades mais recentes ({timeline.length} no total)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
