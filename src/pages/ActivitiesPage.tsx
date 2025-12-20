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
  return (
    <div className="h-full w-full">
      <ActivityLogsPage />
    </div>
  );
};

export default ActivitiesPage;
