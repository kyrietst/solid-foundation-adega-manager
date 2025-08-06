import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { CustomerInsight, CustomerProfile } from '@/features/customers/hooks/use-crm';
import { Badge } from '@/shared/ui/primitives/badge';
import { Lightbulb, AlertTriangle, TrendingUp, Heart } from 'lucide-react';

interface CustomerOpportunitiesProps {
  insights: CustomerInsight[];
  customers: CustomerProfile[];
  limit?: number;
}

export function CustomerOpportunities({ insights, customers, limit = 5 }: CustomerOpportunitiesProps) {
  // Filtrar apenas insights ativos
  const activeInsights = insights.filter(insight => insight.is_active);
  
  // Ordenar por tipo de insight e confiança (oportunidades e riscos primeiro)
  const sortedInsights = [...activeInsights].sort((a, b) => {
    // Priorizar oportunidades e riscos
    if (a.insight_type === 'opportunity' && b.insight_type !== 'opportunity') return -1;
    if (a.insight_type === 'risk' && b.insight_type !== 'risk' && b.insight_type !== 'opportunity') return -1;
    if (b.insight_type === 'opportunity' && a.insight_type !== 'opportunity') return 1;
    if (b.insight_type === 'risk' && a.insight_type !== 'risk' && a.insight_type !== 'opportunity') return 1;
    
    // Para o mesmo tipo, ordenar por confiança
    return b.confidence - a.confidence;
  });
  
  // Limitar ao número especificado
  const limitedInsights = sortedInsights.slice(0, limit);

  // Função para obter o nome do cliente pelo ID
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Cliente desconhecido';
  };

  // Função para obter o ícone do tipo de insight
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'preference':
        return <Heart className="h-4 w-4 text-purple-500" />;
      case 'pattern':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-500" />;
    }
  };

  // Função para obter a classe de cor do tipo de insight
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-100 text-green-700';
      case 'risk':
        return 'bg-red-100 text-red-700';
      case 'preference':
        return 'bg-purple-100 text-purple-700';
      case 'pattern':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Oportunidades de Negócio</CardTitle>
      </CardHeader>
      <CardContent>
        {limitedInsights.length > 0 ? (
          <div className="space-y-4">
            {limitedInsights.map((insight) => (
              <div key={insight.id} className="p-4 border rounded-lg">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <div className="p-2 rounded-full bg-gray-100">
                      {getInsightIcon(insight.insight_type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{getCustomerName(insight.customer_id)}</div>
                      <Badge className={getInsightColor(insight.insight_type)}>
                        {insight.insight_type === 'opportunity' && 'Oportunidade'}
                        {insight.insight_type === 'risk' && 'Risco'}
                        {insight.insight_type === 'preference' && 'Preferência'}
                        {insight.insight_type === 'pattern' && 'Padrão'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {insight.insight_value}
                    </p>
                    <div className="mt-2 flex items-center">
                      <div className="text-xs text-muted-foreground">
                        Confiança: {(insight.confidence * 100).toFixed(0)}%
                      </div>
                      <div className="ml-2 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${insight.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {insight.insight_type === 'opportunity' && (
                  <div className="mt-3 ml-10 flex justify-end">
                    <button className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                      Criar campanha
                    </button>
                  </div>
                )}
                {insight.insight_type === 'risk' && (
                  <div className="mt-3 ml-10 flex justify-end">
                    <button className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200">
                      Planejar retenção
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Nenhuma oportunidade identificada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 