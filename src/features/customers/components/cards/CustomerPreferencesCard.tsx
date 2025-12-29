
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface CustomerPreferencesCardProps {
    metrics: any;
    segment: string;
}

export const CustomerPreferencesCard: React.FC<CustomerPreferencesCardProps> = ({ metrics, segment }) => {
    return (
        <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-purple/60 hover:scale-[1.02] hover:shadow-xl hover:bg-black/80 transition-all duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="text-white font-semibold text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent-purple" />
                    Preferências & Perfil
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between min-h-[36px]">
                        <span className="text-gray-200 font-medium text-sm">Categoria Favorita</span>
                        <span className="text-accent-purple text-sm font-bold">
                            {metrics?.calculated_favorite_category || 'Não definida'}
                            {metrics && !metrics.data_sync_status.preferences_synced && (
                                <span className="text-xs text-yellow-400 ml-1">⚠️</span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center justify-between min-h-[36px]">
                        <span className="text-gray-200 font-medium text-sm">Produto Favorito</span>
                        <span className="text-white text-sm font-bold">
                            {metrics?.calculated_favorite_product || 'Não definido'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between min-h-[36px]">
                        <span className="text-gray-200 font-medium text-sm">Insights AI</span>
                        <span className="text-accent-blue text-sm font-bold">
                            {`${metrics?.insights_count || 0} insights`}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-gray-200 font-medium text-sm">Segmento</span>
                    <Badge
                        variant="outline"
                        className={cn(
                            "border-2 font-semibold",
                            segment === 'high_value' ? 'bg-accent-gold-100/30 text-accent-gold-100 border-accent-gold-100/60' :
                                segment === 'regular' ? 'bg-accent-blue/30 text-accent-blue border-accent-blue/60' :
                                    segment === 'new' ? 'bg-accent-green/30 text-accent-green border-accent-green/60' :
                                        'bg-gray-500/30 text-gray-200 border-gray-500/60'
                        )}
                    >
                        {segment || 'Não Classificado'}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};
