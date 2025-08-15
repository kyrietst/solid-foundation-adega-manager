import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Progress } from '@/shared/ui/primitives/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { BlurIn } from '@/components/ui/blur-in';
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
            className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
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
        
        {/* Contador de automações */}
        <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm font-bold text-gray-100">{automationStats.activeWorkflows}</span>
          <span className="text-xs ml-1 opacity-75 text-gray-300">automações ativas</span>
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
          {/* Stats cards movidos para área de conteúdo */}
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
      </section>
    </div>
  );
};