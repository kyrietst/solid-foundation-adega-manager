/**
 * Componente de insights individuais de cliente
 * Extraído do CustomersNew.tsx para reutilização
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Brain, TrendingUp } from 'lucide-react';
import { CustomerInsightsProps } from './types';
import { useCustomerInsightsLogic } from '@/features/customers/hooks/useCustomerInsights';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';

export const CustomerInsights: React.FC<CustomerInsightsProps> = ({
  customerId,
  insights = [],
  isLoading = false,
}) => {
  const {
    insightsByType,
    highConfidenceInsights,
    getInsightTypeColor,
    getInsightTypeIcon,
    formatConfidence,
    totalInsights,
    activeInsights
  } = useCustomerInsightsLogic(insights);

  if (isLoading) {
    return (
      <Card className="bg-adega-charcoal/20 border-white/10">
        <CardContent className="p-4">
          <LoadingScreen text="Carregando insights..." />
        </CardContent>
      </Card>
    );
  }

  if (!insights.length) {
    return (
      <Card className="bg-adega-charcoal/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-adega-platinum">
            <Brain className="h-5 w-5" />
            Insights do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-adega-platinum/40 mx-auto mb-4" />
            <p className="text-adega-platinum/60">
              Nenhum insight disponível ainda
            </p>
            <p className="text-sm text-adega-platinum/40 mt-2">
              Os insights serão gerados conforme mais dados de compra estiverem disponíveis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-adega-charcoal/20 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-adega-platinum">
            <Brain className="h-5 w-5" />
            Insights do Cliente
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-adega-platinum/80">
              {activeInsights} ativos
            </Badge>
            <Badge variant="outline" className="text-adega-platinum/60">
              {totalInsights} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Insights de Alta Confiança */}
        {highConfidenceInsights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-adega-gold" />
              <h4 className="font-medium text-adega-gold">Insights Prioritários</h4>
            </div>
            <div className="space-y-2">
              {highConfidenceInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 rounded-lg bg-adega-charcoal/30 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {getInsightTypeIcon(insight.insight_type)}
                      </span>
                      <Badge 
                        className={getInsightTypeColor(insight.insight_type)}
                        variant="outline"
                      >
                        {insight.insight_type}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-adega-gold">
                      {formatConfidence(insight.confidence)}
                    </Badge>
                  </div>
                  <p className="text-sm text-adega-platinum/80">
                    {insight.insight_value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos os Insights por Tipo */}
        {Object.entries(insightsByType).map(([type, typeInsights]) => (
          <div key={type}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">
                {getInsightTypeIcon(type)}
              </span>
              <h4 className="font-medium text-adega-platinum capitalize">
                {type} ({typeInsights.length})
              </h4>
            </div>
            <div className="space-y-2">
              {typeInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-2 rounded border ${
                    insight.is_active 
                      ? 'bg-adega-charcoal/20 border-white/10' 
                      : 'bg-gray-500/10 border-gray-500/20 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <Badge 
                      className={getInsightTypeColor(type)}
                      variant="outline"
                      size="sm"
                    >
                      {formatConfidence(insight.confidence)}
                    </Badge>
                    <span className="text-xs text-adega-platinum/40">
                      {new Date(insight.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-adega-platinum/70">
                    {insight.insight_value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};