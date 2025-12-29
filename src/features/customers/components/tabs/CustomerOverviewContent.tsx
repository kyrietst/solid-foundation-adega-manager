
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Mail, Phone, MapPin, Calendar, Sparkles, DollarSign, MessageSquare } from 'lucide-react';
import { cn, formatCurrency } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

import { CustomerTagDisplay } from '../CustomerTagDisplay';
import { CustomerSegmentBadge } from '../CustomerSegmentBadge';
// import { CustomerInsights } from '../CustomerInsights';

interface CustomerOverviewContentProps {
    customer: any;
    interactions: any[];
    isLoadingInteractions: boolean;
    formatDate: (date: string | null) => string;
    formatContactPreference: (pref: string | null) => string;
    formatPurchaseFrequency: (freq: string | null) => string;
}

export const CustomerOverviewContent: React.FC<CustomerOverviewContentProps> = ({
    customer,
    interactions,
    isLoadingInteractions,
    formatDate,
    formatContactPreference,
    formatPurchaseFrequency
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1: Informações Básicas */}
            <div className="space-y-4">
                {/* Informações de Contato */}
                <Card className={cn(getGlassCardClasses('default'), "bg-gray-800/30 border-gray-700/40 backdrop-blur-sm")}>
                    <CardHeader>
                        <CardTitle className="text-sm text-gray-200 font-medium">Informações de Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-adega-platinum/60" />
                            <span className="text-sm text-adega-platinum/80">{customer.email || 'Não informado'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-adega-platinum/60" />
                            <span className="text-sm text-adega-platinum/80">{customer.phone || 'Não informado'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-adega-platinum/60" />
                            <span className="text-sm text-adega-platinum/80">{customer.address || 'Não informado'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-adega-platinum/60" />
                            <span className="text-sm text-adega-platinum/80">{formatDate(customer.birthday)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Tags Personalizadas */}
                <Card className={cn(getGlassCardClasses('default'), "bg-gray-800/30 border-gray-700/40 backdrop-blur-sm")}>
                    <CardHeader>
                        <CardTitle className="text-sm text-gray-200 font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary-yellow" />
                            Tags Personalizadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomerTagDisplay tags={customer.tags} maxVisible={6} size="md" />
                    </CardContent>
                </Card>

                {/* Segmentação */}
                <Card className="bg-adega-charcoal/20 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm text-adega-platinum">Segmentação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-adega-platinum/60">Segmento:</span>
                            <CustomerSegmentBadge segment={customer.segment || ''} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-adega-platinum/60">Preferência de contato:</span>
                            <span className="text-sm text-adega-platinum/80">{formatContactPreference(customer.contact_preference)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-adega-platinum/60">Frequência de compra:</span>
                            <span className="text-sm text-adega-platinum/80">{formatPurchaseFrequency(customer.purchase_frequency)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-adega-platinum/60">Permissão de contato:</span>
                            <Badge variant={customer.contact_permission ? "default" : "secondary"}>
                                {customer.contact_permission ? 'Sim' : 'Não'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Coluna 2: Dados de Compra */}
            <div className="space-y-4">
                {/* Métricas de Compra */}
                <Card className="bg-adega-charcoal/20 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm text-adega-platinum flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Métricas de Compra
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-adega-platinum/60">Lifetime Value:</span>
                            <span className="font-semibold text-adega-gold">{formatCurrency(customer.lifetime_value || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-adega-platinum/60">Primeira compra:</span>
                            <span className="text-sm text-adega-platinum/80">{formatDate(customer.first_purchase_date)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-adega-platinum/60">Última compra:</span>
                            <span className="text-sm text-adega-platinum/80">{formatDate(customer.last_purchase_date)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-adega-platinum/60">Categoria favorita:</span>
                            <span className="text-sm text-adega-platinum/80">{customer.favorite_category || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-adega-platinum/60">Produto favorito:</span>
                            <span className="text-sm text-adega-platinum/80">{customer.favorite_product || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Histórico de Interações */}
                <Card className="bg-adega-charcoal/20 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm text-adega-platinum flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Interações Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingInteractions ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-adega-gold mx-auto"></div>
                            </div>
                        ) : interactions.length > 0 ? (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {interactions.slice(0, 5).map((interaction: any) => (
                                    <div key={interaction.id} className="p-2 rounded bg-adega-charcoal/30">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-medium text-adega-platinum">{interaction.interaction_type}</span>
                                            <span className="text-xs text-adega-platinum/40">{formatDate(interaction.created_at)}</span>
                                        </div>
                                        <p className="text-xs text-adega-platinum/70 mt-1">{interaction.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-adega-platinum/60 text-center py-4">Nenhuma interação registrada</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Coluna 3: Insights (Removido) */}
            <div>
                {/* <CustomerInsights customerId={customer.id} /> */}
                <div className="p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-gray-400">Insights não disponíveis no momento.</p>
                </div>
            </div>
        </div>
    );
};
