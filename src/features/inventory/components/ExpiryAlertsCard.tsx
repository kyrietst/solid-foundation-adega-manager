/**
 * ExpiryAlertsCard.tsx - Card de alertas de produtos próximos ao vencimento
 * Para uso no dashboard principal
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { useExpiryAlerts, type ExpiryAlert } from '../hooks/useExpiryAlerts';
import { AlertTriangle, Calendar, Package, CheckCircle } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface ExpiryAlertsCardProps {
  className?: string;
  maxItems?: number;
}

export const ExpiryAlertsCard: React.FC<ExpiryAlertsCardProps> = ({ 
  className, 
  maxItems = 5 
}) => {
  const { expiryAlerts, alertStats, isLoading, getAlertText, getAlertColor } = useExpiryAlerts();

  const displayAlerts = expiryAlerts.slice(0, maxItems);

  const getUrgencyIcon = (urgency: ExpiryAlert['urgency']) => {
    switch (urgency) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <Calendar className="h-4 w-4 text-yellow-400" />;
      case 'info':
        return <Package className="h-4 w-4 text-blue-400" />;
      default:
        return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getUrgencyBadgeVariant = (urgency: ExpiryAlert['urgency']) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card className={cn(
      "bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300",
      "hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-400/30 hover:bg-gray-700/40",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-400" />
            Alertas de Validade
          </div>
          {alertStats.total > 0 && (
            <Badge 
              variant={alertStats.critical > 0 ? 'destructive' : alertStats.warning > 0 ? 'warning' : 'secondary'}
              className="text-xs"
            >
              {alertStats.total}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <LoadingSpinner size="sm" color="orange" />
          </div>
        ) : alertStats.total === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
            <p className="text-sm text-green-400 font-medium">Tudo em ordem!</p>
            <p className="text-xs text-gray-500 mt-1">
              Nenhum produto próximo ao vencimento
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Resumo dos alertas */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {alertStats.critical > 0 && (
                  <span className="text-red-400">
                    {alertStats.critical} crítico{alertStats.critical > 1 ? 's' : ''}
                  </span>
                )}
                {alertStats.warning > 0 && (
                  <span className="text-yellow-400">
                    {alertStats.warning} alerta{alertStats.warning > 1 ? 's' : ''}
                  </span>
                )}
                {alertStats.info > 0 && (
                  <span className="text-blue-400">
                    {alertStats.info} info{alertStats.info > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Lista de alertas */}
            <div className="space-y-2">
              {displayAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={cn(
                    "flex items-start justify-between p-3 rounded-lg border transition-all duration-200",
                    alert.urgency === 'critical' && "bg-red-900/20 border-red-400/30",
                    alert.urgency === 'warning' && "bg-yellow-900/20 border-yellow-400/30",
                    alert.urgency === 'info' && "bg-blue-900/20 border-blue-400/30"
                  )}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getUrgencyIcon(alert.urgency)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {alert.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-gray-600 text-gray-400"
                        >
                          {alert.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {alert.stock_quantity} unidades
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <Badge 
                      variant={getUrgencyBadgeVariant(alert.urgency)}
                      className="text-xs whitespace-nowrap"
                    >
                      {getAlertText(alert)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.expiry_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Link para ver todos os alertas */}
            {expiryAlerts.length > maxItems && (
              <div className="pt-2 border-t border-gray-700/50">
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Ver todos os {expiryAlerts.length} alertas →
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiryAlertsCard;