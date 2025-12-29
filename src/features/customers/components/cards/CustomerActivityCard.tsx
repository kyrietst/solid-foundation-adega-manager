
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Calendar } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface CustomerActivityCardProps {
    metrics: any;
    customerStatus: {
        status: string;
        className: string;
        engagementLevel: string;
    };
}

export const CustomerActivityCard: React.FC<CustomerActivityCardProps> = ({ metrics, customerStatus }) => {
    return (
        <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-white/40 hover:scale-[1.02] hover:shadow-xl hover:bg-black/80 transition-all duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="text-white font-semibold text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent-blue" />
                    Atividade & Engajamento
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between min-h-[44px]">
                    <span className="text-gray-200 font-medium text-sm">Última Compra</span>
                    <div className="text-right">
                        <div className="text-base font-bold text-white">
                            {metrics?.last_purchase_real
                                ? new Date(metrics.last_purchase_real).toLocaleDateString('pt-BR')
                                : 'Nunca'
                            }
                            {metrics && !metrics.data_sync_status.dates_synced && (
                                <span className="text-xs text-yellow-400 ml-1">⚠️</span>
                            )}
                        </div>
                        <div className="text-xs text-gray-300 font-medium">
                            {metrics?.days_since_last_purchase !== undefined
                                ? `${metrics.days_since_last_purchase} dias atrás`
                                : 'Primeira compra pendente'
                            }
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between min-h-[40px]">
                    <span className="text-gray-200 font-medium text-sm">Status</span>
                    <Badge
                        variant="outline"
                        className={cn(
                            "border-2 font-semibold",
                            customerStatus.className
                        )}
                    >
                        {customerStatus.status}
                    </Badge>
                </div>
                <div className="pt-2 border-t border-white/10">
                    <div className="text-xs text-gray-300 text-center font-medium">
                        Engajamento: {customerStatus.engagementLevel}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
