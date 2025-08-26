import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Progress } from '@/shared/ui/primitives/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { BlurIn } from '@/components/ui/blur-in';
import { StatCard } from '@/shared/ui/composite/stat-card';
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
  Activity,
  Clock,
  CheckCircle,
  Target,
  Lightbulb
} from 'lucide-react';
import { N8NPlaceholder } from './N8NPlaceholder';
import { GoogleMapsPlaceholder } from './GoogleMapsPlaceholder';
import { useAutomationMetrics, useWorkflowSuggestions, useRecentExecutions } from '../hooks/useAutomationMetrics';
import { cn } from '@/core/config/utils';
import { getSFProTextClasses } from '@/core/config/theme-utils';

interface AutomationCenterProps {
  className?: string;
}

export const AutomationCenter = ({ className }: AutomationCenterProps) => {
  // Buscar dados reais de automações
  const { data: automationMetrics, isLoading: isLoadingMetrics } = useAutomationMetrics();
  const { data: workflowSuggestions = [], isLoading: isLoadingSuggestions } = useWorkflowSuggestions();
  const { data: recentExecutions = [], isLoading: isLoadingExecutions } = useRecentExecutions(5);

  // Usar dados reais ou fallback
  const automationStats = automationMetrics || {
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    customersImpacted: 0
  };

  // Converter sugestões em queue de automação
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
    <div className="w-full h-full flex flex-col p-4">
      {/* Header padronizado */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Header com BlurIn animation */}
        <div className="relative text-center sm:text-left">
          {/* Título animado */}
          <BlurIn
            word="AUTOMAÇÕES & INTEGRAÇÕES"
            duration={1.2}
            variant={{
              hidden: { filter: "blur(15px)", opacity: 0 },
              visible: { filter: "blur(0px)", opacity: 1 }
            }}
            className={cn(
              getSFProTextClasses('h1', 'accent'),
              "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
            )}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
            }}
          />
          
          {/* Sublinhado elegante */}
          <div className="w-full h-2 relative">
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
          </div>
        </div>
        
        {/* Contador de automações com loading */}
        <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 shadow-lg">
          {isLoadingMetrics ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
              <span className="text-xs text-gray-300">carregando...</span>
            </div>
          ) : (
            <>
              <span className="text-sm font-bold text-gray-100">{automationStats.activeWorkflows}</span>
              <span className="text-xs ml-1 opacity-75 text-gray-300">workflows sugeridos</span>
            </>
          )}
        </div>
      </div>

      {/* Container principal com glassmorphism */}
      <section 
        className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 overflow-hidden"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
          {/* Métricas Principais com StatCard v2.0.0 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              layout="automation"
              variant="purple"
              title="Workflows Sugeridos"
              value={isLoadingMetrics ? '...' : automationStats.activeWorkflows}
              description={`🤖 Baseado em ${automationStats.customersImpacted} clientes`}
              icon={Bot}
            />

            <StatCard
              layout="automation"
              variant="default"
              title="Execuções Históricas"
              value={isLoadingMetrics ? '...' : automationStats.totalExecutions.toLocaleString()}
              description={`⚡ ${automationStats.totalExecutions > 0 ? 'Sistema ativo' : 'Nenhuma execução'}`}
              icon={Zap}
            />

            <StatCard
              layout="automation"
              variant="success"
              title="Taxa de Sucesso"
              value={isLoadingMetrics ? '...' : `${automationStats.successRate}%`}
              description={`✅ ${automationStats.successRate > 0 ? 'Excelente performance' : 'Aguardando dados'}`}
              icon={TrendingUp}
            />

            <StatCard
              layout="automation"
              variant="warning"
              title="Clientes Elegíveis"
              value={isLoadingMetrics ? '...' : automationStats.customersImpacted}
              description={`👥 ${automationStats.upcomingTasks || 0} tarefas pendentes`}
              icon={Users}
            />
          </div>

          {/* Tabs para diferentes tipos de automação com animações */}
          <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-1 shadow-lg">
          <TabsTrigger 
            value="workflows" 
            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-400/30 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 text-gray-400 hover:text-white transition-all duration-300 rounded-lg backdrop-blur-sm"
          >
            <Bot className="w-4 h-4 mr-2" />
            Workflows
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-orange-300 data-[state=active]:border data-[state=active]:border-orange-400/30 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 text-gray-400 hover:text-white transition-all duration-300 rounded-lg backdrop-blur-sm"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Campanhas
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-green-300 data-[state=active]:border data-[state=active]:border-green-400/30 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 text-gray-400 hover:text-white transition-all duration-300 rounded-lg backdrop-blur-sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
          <TabsTrigger 
            value="integrations" 
            className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500/20 data-[state=active]:to-amber-500/20 data-[state=active]:text-yellow-300 data-[state=active]:border data-[state=active]:border-yellow-400/30 data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/20 text-gray-400 hover:text-white transition-all duration-300 rounded-lg backdrop-blur-sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Integrações
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
          </TabsTrigger>
        </TabsList>

        {/* Tab: Workflows */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Queue de Automações Baseadas em Dados Reais */}
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                  Workflows Sugeridos ({workflowSuggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSuggestions ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 animate-pulse">
                        <div className="h-4 bg-white/10 rounded mb-2" />
                        <div className="h-3 bg-white/5 rounded w-2/3 mb-3" />
                        <div className="h-2 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
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
                          <Badge className={`text-xs ${
                            automation.priority === 'high' ? 'text-red-400 bg-red-500/10' :
                            automation.priority === 'medium' ? 'text-yellow-400 bg-yellow-500/10' :
                            'text-blue-400 bg-blue-500/10'
                          }`}>
                            {automation.priority === 'high' ? 'Alta' : 
                             automation.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Impacto Estimado</span>
                          <span className="text-emerald-400 font-medium">{automation.estimatedImpact} clientes</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Status</span>
                          <span className="text-white font-medium">{automation.nextExecution}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600/30">
                        <span className="text-xs text-gray-400">
                          🎯 Baseado em dados reais do sistema
                        </span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" disabled className="h-6 px-2 text-amber-400 hover:text-amber-300">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <div className="text-sm text-gray-400 mb-2">Nenhum workflow sugerido</div>
                    <div className="text-xs text-gray-500">
                      Adicione dados de clientes para gerar sugestões automáticas
                    </div>
                  </div>
                )}
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
            {/* Execuções Recentes */}
            <Card className="bg-gray-800/30 border-gray-700/40">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Execuções Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingExecutions ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg animate-pulse">
                        <div className="w-8 h-8 bg-white/10 rounded-full" />
                        <div className="flex-1">
                          <div className="h-3 bg-white/10 rounded mb-1" />
                          <div className="h-2 bg-white/5 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentExecutions.length > 0 ? (
                  recentExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        execution.result === 'success' ? 'bg-green-500/20' :
                        execution.result === 'error' ? 'bg-red-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        {execution.result === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : execution.result === 'error' ? (
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        )}
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
                    <div className="text-xs text-gray-500">
                      Execuções aparecerão aqui quando workflows estiverem ativos
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
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
      </section>
    </div>
  );
};