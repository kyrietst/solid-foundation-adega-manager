import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Progress } from '@/shared/ui/primitives/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import {
  Bot,
  Zap,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  Gift,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Activity
} from 'lucide-react';
import { N8NPlaceholder } from './N8NPlaceholder';
import { GoogleMapsPlaceholder } from './GoogleMapsPlaceholder';

interface AutomationCenterProps {
  className?: string;
}

export const AutomationCenter = ({ className }: AutomationCenterProps) => {
  // Dados simulados de automações
  const automationStats = {
    activeWorkflows: 12,
    totalExecutions: 2847,
    successRate: 98.5,
    customersImpacted: 156
  };

  const automationQueue = [
    {
      id: 1,
      type: 'birthday',
      title: 'Campanhas de Aniversário',
      description: 'Detectar aniversários e enviar ofertas personalizadas',
      status: 'ready',
      progress: 85,
      nextExecution: '2025-08-11 09:00'
    },
    {
      id: 2,
      type: 'churn',
      title: 'Prevenção de Churn',
      description: 'Identificar clientes em risco e acionar campanhas',
      status: 'development',
      progress: 60,
      nextExecution: 'Em desenvolvimento'
    },
    {
      id: 3,
      type: 'whatsapp',
      title: 'WhatsApp Business',
      description: 'Integração completa com WhatsApp Business API',
      status: 'planning',
      progress: 30,
      nextExecution: 'Q2 2025'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-500 bg-green-500/10';
      case 'development': return 'text-yellow-500 bg-yellow-500/10';
      case 'planning': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Pronto para Deploy';
      case 'development': return 'Em Desenvolvimento';
      case 'planning': return 'Em Planejamento';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Bot className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Workflows Ativos</p>
                <p className="text-xl font-semibold text-white">{automationStats.activeWorkflows}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Execuções</p>
                <p className="text-xl font-semibold text-white">{automationStats.totalExecutions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Taxa de Sucesso</p>
                <p className="text-xl font-semibold text-white">{automationStats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Users className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Clientes Impactados</p>
                <p className="text-xl font-semibold text-white">{automationStats.customersImpacted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes tipos de automação */}
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        {/* Tab: Workflows */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Queue de Automações */}
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary-yellow" />
                  Pipeline de Desenvolvimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {automationQueue.map((automation) => (
                  <div key={automation.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{automation.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{automation.description}</p>
                      </div>
                      <Badge className={getStatusColor(automation.status)}>
                        {getStatusLabel(automation.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progresso</span>
                        <span className="text-white font-medium">{automation.progress}%</span>
                      </div>
                      <Progress value={automation.progress} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600/30">
                      <span className="text-xs text-gray-400">
                        Próxima execução: {automation.nextExecution}
                      </span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" disabled className="h-6 px-2">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sistema de Prevenção de Churn */}
            <N8NPlaceholder
              automationType="churn"
            />
          </div>
        </TabsContent>

        {/* Tab: Campanhas */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <N8NPlaceholder
              automationType="birthday"
            />
            
            <N8NPlaceholder
              automationType="whatsapp"
            />
          </div>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GoogleMapsPlaceholder
              variant="analytics"
            />
            
            <N8NPlaceholder
              automationType="recommendations"
            />
          </div>
        </TabsContent>

        {/* Tab: Integrações */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GoogleMapsPlaceholder
              variant="delivery"
            />
            
            <N8NPlaceholder
              automationType="general"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};