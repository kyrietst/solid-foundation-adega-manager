/**
 * Activities Page - Histórico & Logs do Sistema
 *
 * Página unificada com 2 abas:
 * 1. Histórico de Vendas - Todas as vendas realizadas (SalesHistoryTable)
 * 2. Logs do Sistema - Atividades e ações dos usuários (ActivityLogsPage)
 *
 * @module pages/ActivitiesPage
 * @since v3.0.0 - SSoT Refactoring
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { SalesHistoryTable } from '@/features/reports/components/SalesHistoryTable';
import ActivityLogsPage from '@/shared/components/ActivityLogsPage';
import { ShoppingCart, Activity, FileText, ClipboardList } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { text } from '@/core/config/theme';

/**
 * Página de Histórico e Logs do Sistema
 *
 * Consolida visualização de:
 * - Histórico completo de vendas (transações de negócio)
 * - Logs de atividades do sistema (ações dos usuários)
 */
export const ActivitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'sales';
  const [activeTab, setActiveTab] = useState(defaultTab);

  /**
   * Atualiza URL quando muda de aba
   * Permite deep linking direto para abas específicas
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg backdrop-blur-sm">
              <ClipboardList className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className={cn(text.h1, "text-white mb-0")}>
                Histórico & Logs
              </h1>
              <p className={cn(text.muted, "text-gray-400")}>
                Visualize vendas realizadas e atividades do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              {/* Tabs List */}
              <TabsList className="bg-black/80 border border-white/10 backdrop-blur-sm">
                <TabsTrigger
                  value="sales"
                  className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-400/30 transition-all duration-300"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Histórico de Vendas
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-400/30 transition-all duration-300"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Logs do Sistema
                </TabsTrigger>
              </TabsList>

              {/* Tab: Histórico de Vendas */}
              <TabsContent value="sales" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <h2 className={cn(text.h3, "text-white mb-0")}>
                      Histórico Completo de Vendas
                    </h2>
                  </div>
                  <p className={cn(text.muted, "text-gray-400")}>
                    Todas as vendas realizadas no sistema com filtros avançados
                  </p>
                </div>

                {/* Reutiliza componente SalesHistoryTable */}
                <SalesHistoryTable />
              </TabsContent>

              {/* Tab: Logs do Sistema */}
              <TabsContent value="logs" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    <h2 className={cn(text.h3, "text-white mb-0")}>
                      Logs de Atividades do Sistema
                    </h2>
                  </div>
                  <p className={cn(text.muted, "text-gray-400")}>
                    Registro de ações dos usuários: logins, criação, edição e exclusão de registros
                  </p>
                </div>

                {/* Reutiliza componente ActivityLogsPage */}
                <ActivityLogsPage />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivitiesPage;
