/**
 * Gestão Completa de Validade
 * Interface principal que combina dashboard, relatórios e workflows
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Package, 
  FileText, 
  Truck,
  BarChart3,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { ExpiryDashboard } from './ExpiryDashboard';
import { ExpiryReports } from './ExpiryReports';
import { ReceivingWorkflow } from './ReceivingWorkflow';
import { BatchList } from './BatchList';
import { useExpiryStats } from '@/features/inventory/hooks/useBatches';
import { cn } from '@/core/config/utils';

type TabValue = 'dashboard' | 'batches' | 'receiving' | 'reports';

export const ExpiryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('dashboard');
  
  // Buscar estatísticas para badges
  const { data: stats } = useExpiryStats();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <Card className="bg-gray-800/50 border-primary-yellow/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <Calendar className="h-6 w-6 text-primary-yellow" />
            Sistema de Controle de Validade
            <Badge variant="outline" className="ml-auto text-primary-yellow border-primary-yellow/50">
              FEFO Ativo
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Controle completo de prazos de validade com sistema FEFO (First Expired, First Out), 
            rastreamento hierárquico de lotes e alertas automáticos de vencimento.
          </p>
          
          {/* Status Rápido */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-800/20 rounded-lg">
              <div className="text-center">
                <p className="text-primary-yellow text-lg font-bold">{stats.total_active_batches}</p>
                <p className="text-xs text-gray-400">Lotes Ativos</p>
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-lg font-bold",
                  stats.expiring_week > 0 ? "text-yellow-500" : "text-accent-green"
                )}>
                  {stats.expiring_week}
                </p>
                <p className="text-xs text-gray-400">Vencendo 7 dias</p>
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-lg font-bold",
                  stats.critical_alerts > 0 ? "text-accent-red" : "text-accent-green"
                )}>
                  {stats.critical_alerts}
                </p>
                <p className="text-xs text-gray-400">Alertas Críticos</p>
              </div>
              <div className="text-center">
                <p className="text-primary-yellow text-lg font-bold">{stats.products_with_batches}</p>
                <p className="text-xs text-gray-400">Produtos Rastreados</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface com Abas */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="grid grid-cols-4 w-full bg-gray-800/50 border border-gray-700">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900 text-gray-400"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
            {stats && stats.critical_alerts > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 text-xs">
                {stats.critical_alerts}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="batches" 
            className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900 text-gray-400"
          >
            <Package className="h-4 w-4 mr-2" />
            Lotes
            {stats && (
              <Badge variant="secondary" className="ml-2 h-5 text-xs">
                {stats.total_active_batches}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="receiving" 
            className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900 text-gray-400"
          >
            <Truck className="h-4 w-4 mr-2" />
            Recebimento
          </TabsTrigger>
          
          <TabsTrigger 
            value="reports" 
            className="data-[state=active]:bg-primary-yellow data-[state=active]:text-gray-900 text-gray-400"
          >
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das Abas */}
        <TabsContent value="dashboard" className="mt-6">
          <ExpiryDashboard />
        </TabsContent>

        <TabsContent value="batches" className="mt-6">
          <BatchList showCreateButton={true} />
        </TabsContent>

        <TabsContent value="receiving" className="mt-6">
          <ReceivingWorkflow />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ExpiryReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};