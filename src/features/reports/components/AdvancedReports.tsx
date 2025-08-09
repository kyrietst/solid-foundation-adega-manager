/**
 * Advanced Reports Dashboard - Sprint 2
 * Comprehensive reporting system with multiple modules
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { CalendarIcon, FileSpreadsheet, BarChart3, Users, Package, DollarSign } from 'lucide-react';
import { SalesReportsSection } from './SalesReportsSection';
import { InventoryReportsSection } from './InventoryReportsSection';
import { CrmReportsSection } from './CrmReportsSection';
import { FinancialReportsSection } from './FinancialReportsSection';

export const AdvancedReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const modules = [
    {
      id: 'sales',
      title: 'Vendas',
      icon: BarChart3,
      description: 'Análise completa de vendas, produtos e categorias',
      color: 'text-blue-400'
    },
    {
      id: 'inventory',
      title: 'Estoque',
      icon: Package,
      description: 'DOH, giro, dead stock e movimentações',
      color: 'text-green-400'
    },
    {
      id: 'crm',
      title: 'CRM',
      icon: Users,
      description: 'Clientes ativos, LTV, segmentação e churn',
      color: 'text-purple-400'
    },
    {
      id: 'financial',
      title: 'Financeiro',
      icon: DollarSign,
      description: 'Aging, DSO, métodos de pagamento',
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Relatórios Centrais</h1>
          <p className="text-adega-silver">Sistema completo de análise e relatórios - Sprint 2</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="border-white/20 text-adega-platinum hover:bg-white/10"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Período
          </Button>
          <Button 
            variant="outline"
            className="border-adega-gold/30 text-adega-gold hover:bg-adega-gold/10"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Module Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card 
              key={module.id}
              className={`border-white/10 bg-black/40 backdrop-blur-xl cursor-pointer transition-all hover:border-white/20 ${
                activeTab === module.id ? 'border-amber-400/50 bg-amber-400/5' : ''
              }`}
              onClick={() => setActiveTab(module.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${module.color}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">{module.title}</h3>
                    <p className="text-xs text-gray-400 truncate">{module.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-black/60 border border-white/10">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <TabsTrigger 
                key={module.id}
                value={module.id}
                className="data-[state=active]:bg-amber-400/20 data-[state=active]:text-amber-400"
              >
                <Icon className="h-4 w-4 mr-2" />
                {module.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <SalesReportsSection />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryReportsSection />
        </TabsContent>

        <TabsContent value="crm" className="space-y-6">
          <CrmReportsSection />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialReportsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};