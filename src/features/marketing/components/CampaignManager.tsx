import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { GlassCard } from '@/shared/ui/composite/GlassCard';
import {
  Bot,
  Zap,
  TrendingUp,
  Users,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useAutomationMetrics, useWorkflowSuggestions, useRecentExecutions } from '../hooks/useAutomationMetrics';

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
      case 'ready': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'development': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'planning': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
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
    <div className="w-full h-full flex flex-col space-y-6 pb-10">
      
      {/* Standard Header */}
      <header className="px-8 py-6 pt-8 pb-6">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
             <div className="flex flex-col gap-1">
               <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Módulo de Marketing</p>
               <div className="flex items-center gap-3">
                    <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight uppercase">AUTOMAÇÕES & INTEGRAÇÕES</h2>
               </div>
             </div>
             <div>
                <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-700/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-zinc-300">
                        Workflows ativos: <span className="text-white">{isLoadingMetrics ? '...' : automationStats.activeWorkflows}</span>
                    </span>
                </div>
             </div>
          </div>
      </header>

      {/* Metrics Strip */}
      <section className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-2 border-b border-white/5 pb-8">
          
          {/* Workflows Sugeridos */}
          <div className="flex items-start gap-4 flex-1 min-w-[200px]">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Bot className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-400/80">Workflows Sugeridos</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-white">
                  {isLoadingMetrics ? '...' : automationStats.activeWorkflows}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">🤖 Baseado em {automationStats.customersImpacted} clientes</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/5 mx-4" />

          {/* Execuções Históricas */}
          <div className="flex items-start gap-4 flex-1 min-w-[200px]">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-400/80">Execuções Históricas</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-white">
                  {isLoadingMetrics ? '...' : automationStats.totalExecutions.toLocaleString()}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ⚡ {automationStats.totalExecutions > 0 ? 'Sistema ativo' : 'Nenhuma execução'}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/5 mx-4" />

          {/* Taxa de Sucesso */}
          <div className="flex items-start gap-4 flex-1 min-w-[200px]">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400/80">Taxa de Sucesso</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-white">
                  {isLoadingMetrics ? '...' : `${automationStats.successRate}%`}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ✅ {automationStats.successRate > 0 ? 'Excelente performance' : 'Aguardando dados'}
              </p>
            </div>
          </div>
            
             {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/5 mx-4" />

          {/* Clientes Elegíveis */}
          <div className="flex items-start gap-4 flex-1 min-w-[200px]">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Users className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-400/80">Clientes Elegíveis</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-white">
                   {isLoadingMetrics ? '...' : automationStats.customersImpacted}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                👥 {automationStats.upcomingTasks || 0} tarefas pendentes
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Content Tabs */}
      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList className="bg-white/[0.02] border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="workflows" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Workflows</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-400" />
                    Workflows Sugeridos ({workflowSuggestions.length})
                    </h3>
                </div>
                <div className="space-y-4">
                {isLoadingSuggestions ? (
                    <div className="text-gray-400 text-center py-8">Carregando...</div>
                ) : automationQueue.length > 0 ? (
                    automationQueue.map((automation) => (
                    <div key={automation.id} className="p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h4 className="font-medium text-white text-base">{automation.title}</h4>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{automation.description}</p>
                        </div>
                        <div className="flex flex-col gap-1 ml-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(automation.status)}`}>
                                {getStatusLabel(automation.status)}
                            </span>
                        </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-white/5 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Bot className="h-8 w-8 text-gray-500" />
                        </div>
                        <div className="text-gray-400 mb-2 font-medium">Nenhum workflow sugerido</div>
                        <p className="text-sm text-gray-600">O sistema está analisando seus dados para gerar novas sugestões.</p>
                    </div>
                )}
                </div>
            </GlassCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
             <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Execuções Recentes
                    </h3>
                </div>
                <div className="space-y-3">
                    {isLoadingExecutions ? (
                         <div className="text-gray-400 text-center py-8">Carregando...</div>
                    ) : recentExecutions.length > 0 ? (
                    recentExecutions.map((execution: any) => (
                        <div key={execution.id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                                execution.result === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                execution.result === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                               {execution.result === 'success' ? <CheckCircle className="h-5 w-5"/> : <AlertTriangle className="h-5 w-5"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{execution.workflow_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Disparado por: {execution.trigger_event}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium">
                                {new Date(execution.created_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    ))
                    ) : (
                    <div className="text-center py-12">
                        <div className="bg-white/5 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Activity className="h-8 w-8 text-gray-500" />
                        </div>
                        <div className="text-gray-400 mb-2 font-medium">Nenhuma execução registrada</div>
                    </div>
                    )}
                </div>
            </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};
