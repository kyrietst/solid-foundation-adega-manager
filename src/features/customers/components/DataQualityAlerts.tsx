/**
 * Alertas Inteligentes de Qualidade de Dados
 * Sistema de notificações e sugestões para melhorar completude dos dados
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/ui/primitives/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/primitives/collapsible';
import { 
  AlertTriangle,
  CheckCircle2,
  Info,
  Bell,
  X,
  ChevronDown,
  ChevronRight,
  Target,
  Users,
  Zap,
  TrendingUp,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useDataQualityAlerts } from '../hooks/useDataQuality';
import type { CustomerData } from '../utils/completeness-calculator';

interface DataQualityAlertsProps {
  customers: CustomerData[];
  onDismissAlert?: (alertIndex: number) => void;
  onTakeAction?: (action: string, data?: any) => void;
  showDismissed?: boolean;
  className?: string;
}

const DataQualityAlerts: React.FC<DataQualityAlertsProps> = ({
  customers,
  onDismissAlert,
  onTakeAction,
  showDismissed = false,
  className
}) => {
  const alerts = useDataQualityAlerts(customers);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

  const visibleAlerts = showDismissed ? alerts : alerts.filter((_, index) => !dismissedAlerts.includes(index));

  const handleDismiss = (index: number) => {
    setDismissedAlerts(prev => [...prev, index]);
    onDismissAlert?.(index);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return Bell;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'birthday': return Calendar;
      case 'general': return Target;
      default: return Zap;
    }
  };

  if (visibleAlerts.length === 0) {
    return (
      <Card className={cn("bg-black/50 backdrop-blur-sm border-white/10", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
            <h3 className="font-medium text-white">Tudo em Ordem!</h3>
            <p className="text-sm text-gray-400">
              Não há alertas críticos de qualidade de dados no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-400" />
          Alertas de Qualidade
          {visibleAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {visibleAlerts.length}
            </Badge>
          )}
        </h2>
        {dismissedAlerts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissedAlerts([])}
            className="text-xs text-gray-400"
          >
            Restaurar Dispensados ({dismissedAlerts.length})
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {visibleAlerts.map((alert, index) => {
          const AlertIcon = getAlertIcon(alert.type);
          const isExpanded = expandedAlert === index;
          
          return (
            <Card 
              key={index}
              className={cn(
                "bg-black/70 backdrop-blur-sm border transition-all duration-200",
                alert.type === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                alert.type === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' :
                'border-blue-500/30 bg-blue-500/5'
              )}
            >
              <Collapsible
                open={isExpanded}
                onOpenChange={() => setExpandedAlert(isExpanded ? null : index)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertIcon className={cn("h-5 w-5 mt-0.5", getAlertColor(alert.type))} />
                      <div className="flex-1 min-w-0">
                        <CardTitle className={cn("text-sm font-medium", getAlertColor(alert.type))}>
                          {alert.title}
                        </CardTitle>
                        <p className="text-xs text-gray-400 mt-1">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {alert.count && (
                        <Badge variant="outline" className="text-xs">
                          {alert.count}
                        </Badge>
                      )}
                      
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDismiss(index)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {alert.action && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-black/50 border border-white/10">
                          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4 text-orange-400" />
                            Ação Recomendada
                          </h4>
                          <p className="text-xs text-gray-300">{alert.action}</p>
                        </div>

                        {/* Botões de Ação Específicos */}
                        <div className="flex flex-wrap gap-2">
                          {alert.type === 'critical' && alert.title.includes('Email') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onTakeAction?.('bulk_email_collection')}
                              className="text-xs"
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Coletar Emails
                            </Button>
                          )}
                          
                          {alert.type === 'critical' && alert.title.includes('Telefone') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onTakeAction?.('bulk_phone_collection')}
                              className="text-xs"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Coletar Telefones
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onTakeAction?.('view_affected_customers', { alertType: alert.type, title: alert.title })}
                            className="text-xs"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Ver Clientes Afetados
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onTakeAction?.('create_campaign', { field: alert.title })}
                            className="text-xs"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Criar Campanha
                          </Button>
                        </div>

                        {/* Detalhes Técnicos */}
                        <div className="text-xs text-gray-500 border-t border-white/10 pt-2">
                          <div className="flex justify-between">
                            <span>Impacto Estimado:</span>
                            <span className="text-gray-400">
                              {alert.type === 'critical' ? 'Alto' : 
                               alert.type === 'warning' ? 'Médio' : 'Baixo'}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span>Tempo para Resolver:</span>
                            <span className="text-gray-400">
                              {alert.type === 'critical' ? '1-2 horas' : 
                               alert.type === 'warning' ? '2-4 horas' : '1 dia'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Resumo de Ações */}
      {visibleAlerts.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white text-sm">Resumo de Ações</h4>
                <p className="text-xs text-gray-400 mt-1">
                  {visibleAlerts.filter(a => a.type === 'critical').length} críticos, 
                  {visibleAlerts.filter(a => a.type === 'warning').length} avisos, 
                  {visibleAlerts.filter(a => a.type === 'info').length} informativos
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const criticalAlerts = visibleAlerts.filter(a => a.type === 'critical');
                  if (criticalAlerts.length > 0) {
                    onTakeAction?.('address_all_critical');
                  }
                }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Zap className="h-3 w-3 mr-1" />
                Resolver Críticos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataQualityAlerts;