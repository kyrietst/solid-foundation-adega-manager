import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { StatCard } from '@/shared/ui/composite/stat-card';
import {
  Bot,
  Zap,
  MessageSquare,
  TrendingUp,
  Users,
  Settings,
  Activity,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAutomationMetrics, useWorkflowSuggestions, useRecentExecutions } from '../hooks/useAutomationMetrics'; // Need to check where this hook is. Assuming it stays or moves. Best to keep import for now.

interface AutomationCenterProps {
  className?: string;
}

export const CampaignManager = ({ className }: AutomationCenterProps) => {
  const { data: automationMetrics, isLoading: isLoadingMetrics } = useAutomationMetrics();
  const { data: workflowSuggestions = [], isLoading: isLoadingSuggestions } = useWorkflowSuggestions();
  const { data: recentExecutions = [], isLoading: isLoadingExecutions } = useRecentExecutions(5);

  const automationStats = automationMetrics || {
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    customersImpacted: 0,
    lastExecution: null,
    upcomingTasks: 0
  };

  const automationQueue = workflowSuggestions.map((suggestion, index) => ({
    id: index + 1,
    type: suggestion.type,
    title: suggestion.title,
    description: suggestion.description,
    status: suggestion.readyToImplement ? 'ready' : 'development',
    progress: suggestion.readyToImplement ? 85 : 45,
    nextExecution: suggestion.readyToImplement ? 'Pronto para ativação' : 'Em análise',
    priority: suggestion.priority,
    estimatedImpact: suggestion.estimatedImpact
  }));

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
    <div className="w-full h-full flex flex-col">
      <PageHeader
        title="AUTOMAÇÕES & INTEGRAÇÕES"
        count={isLoadingMetrics ? undefined : automationStats.activeWorkflows}
        countLabel="workflows sugeridos"
      />

      <section 
        className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 overflow-hidden"
      >
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              layout="default"
              variant="purple"
              title="Workflows Sugeridos"
              value={isLoadingMetrics ? '...' : automationStats.activeWorkflows}
              description={`🤖 Baseado em ${automationStats.customersImpacted} clientes`}
              icon={Bot}
            />

            <StatCard
              layout="default"
              variant="default"
              title="Execuções Históricas"
              value={isLoadingMetrics ? '...' : automationStats.totalExecutions.toLocaleString()}
              description={`⚡ ${automationStats.totalExecutions > 0 ? 'Sistema ativo' : 'Nenhuma execução'}`}
              icon={Zap}
            />

            <StatCard
              layout="default"
              variant="success"
              title="Taxa de Sucesso"
              value={isLoadingMetrics ? '...' : `${automationStats.successRate}%`}
              description={`✅ ${automationStats.successRate > 0 ? 'Excelente performance' : 'Aguardando dados'}`}
              icon={TrendingUp}
            />

            <StatCard
              layout="default"
              variant="warning"
              title="Clientes Elegíveis"
              value={isLoadingMetrics ? '...' : automationStats.customersImpacted}
              description={`👥 ${automationStats.upcomingTasks || 0} tarefas pendentes`}
              icon={Users}
            />
          </div>

          <Tabs defaultValue="workflows" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-1 shadow-lg">
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <Card className="bg-gray-800/30 border-gray-700/40">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-400" />
                      Workflows Sugeridos ({workflowSuggestions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingSuggestions ? (
                      <div className="text-gray-400">Carregando...</div>
                    ) : automationQueue.length > 0 ? (
                      automationQueue.map((automation) => (
                        <div key={automation.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{automation.title}</h4>
                              <p className="text-sm text-gray-400 mt-1">{automation.description}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge className={getStatusColor(automation.status)}>
                                {getStatusLabel(automation.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <div className="text-sm text-gray-400 mb-2">Nenhum workflow sugerido</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>



             <TabsContent value="analytics" className="space-y-4">
                 <div className="grid grid-cols-1 gap-6">
                    <Card className="bg-gray-800/30 border-gray-700/40">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-400" />
                        Execuções Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoadingExecutions ? (
                             <div className="text-gray-400">Carregando...</div>
                        ) : recentExecutions.length > 0 ? (
                        recentExecutions.map((execution: any) => (
                            <div key={execution.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    execution.result === 'success' ? 'bg-green-500/20' :
                                    execution.result === 'error' ? 'bg-red-500/20' :
                                    'bg-yellow-500/20'
                                }`}>
                                   {execution.result === 'success' ? <CheckCircle className="h-4 w-4 text-green-400"/> : <AlertTriangle className="h-4 w-4 text-red-400"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{execution.workflow_name}</p>
                                    <p className="text-xs text-gray-400">{execution.trigger_event}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                    {new Date(execution.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        ))
                        ) : (
                        <div className="text-center py-8">
                            <Activity className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                            <div className="text-sm text-gray-400 mb-2">Nenhuma execução registrada</div>
                        </div>
                        )}
                    </CardContent>
                    </Card>
                 </div>
             </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};
