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
    <div className="min-h-screen bg-primary-black p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black/70 backdrop-blur-xl border-white/20 rounded-lg hover:border-accent-blue/60 transition-all duration-300">
              <ClipboardList className="h-8 w-8 text-accent-blue" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-3xl mb-0">
                Histórico & Logs
              </h1>
              <p className="text-gray-200 font-medium text-sm">
                Visualize vendas realizadas e atividades do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-white/40 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              {/* Tabs List */}
              <TabsList className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-300">
                <TabsTrigger
                  value="sales"
                  className="data-[state=active]:bg-accent-blue/30 data-[state=active]:text-accent-blue data-[state=active]:border-2 data-[state=active]:border-accent-blue/60 hover:bg-accent-blue/10 transition-all duration-300"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Histórico de Vendas
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="data-[state=active]:bg-accent-purple/30 data-[state=active]:text-accent-purple data-[state=active]:border-2 data-[state=active]:border-accent-purple/60 hover:bg-accent-purple/10 transition-all duration-300"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Logs do Sistema
                </TabsTrigger>
              </TabsList>

              {/* Tab: Histórico de Vendas */}
              <TabsContent value="sales" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent-blue" />
                    <h2 className={cn(text.h3, "text-white mb-0")}>
                      Histórico Completo de Vendas
                    </h2>
                  </div>
                  <p className={cn(text.muted, "text-gray-200")}>
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
                    <Activity className="h-5 w-5 text-accent-purple" />
                    <h2 className={cn(text.h3, "text-white mb-0")}>
                      Logs de Atividades do Sistema
                    </h2>
                  </div>
                  <p className={cn(text.muted, "text-gray-200")}>
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
