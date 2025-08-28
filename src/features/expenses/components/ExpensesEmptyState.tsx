/**
 * ExpensesEmptyState.tsx - Estado vazio inteligente para lista de despesas
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Receipt, 
  TrendingUp,
  Calendar,
  CreditCard,
  Building
} from 'lucide-react';
import { getGlassCardClasses, getGlassButtonClasses, getHoverTransformClasses } from '@/core/config/theme-utils';
import { cn } from '@/core/config/utils';

interface ExpensesEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateExpense: () => void;
}

export const ExpensesEmptyState: React.FC<ExpensesEmptyStateProps> = ({
  hasFilters,
  onClearFilters,
  onCreateExpense
}) => {
  if (hasFilters) {
    // Estado quando há filtros aplicados mas nenhum resultado
    return (
      <Card className={cn(getGlassCardClasses(), "border-dashed border-white/20")}>
        <CardContent className="py-16">
          <div className="text-center space-y-6">
            {/* Ícone com animação */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30">
              <Search className="h-8 w-8 text-orange-400" />
            </div>

            {/* Título e descrição */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white font-sf-pro">
                Nenhuma despesa encontrada
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Não encontramos nenhuma despesa com os filtros aplicados. Tente ajustar seus critérios de busca ou limpar os filtros.
              </p>
            </div>

            {/* Sugestões */}
            <div className="bg-black/40 rounded-lg p-4 max-w-sm mx-auto border border-white/10">
              <p className="text-sm text-gray-300 mb-3 font-medium">💡 Sugestões:</p>
              <ul className="text-sm text-gray-400 space-y-1 text-left">
                <li>• Altere o período de datas</li>
                <li>• Selecione outra categoria</li>
                <li>• Verifique a forma de pagamento</li>
                <li>• Experimente remover todos os filtros</li>
              </ul>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onClearFilters}
                variant="outline"
                className={cn(
                  getGlassButtonClasses('secondary'),
                  getHoverTransformClasses('scale'),
                  "flex items-center gap-2"
                )}
              >
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
              
              <Button
                onClick={onCreateExpense}
                className={cn(
                  getGlassButtonClasses('primary'),
                  getHoverTransformClasses('scale'),
                  "flex items-center gap-2 shadow-lg shadow-purple-500/25"
                )}
              >
                <Plus className="h-4 w-4" />
                Nova Despesa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado quando não há despesas cadastradas
  return (
    <Card className={cn(getGlassCardClasses(), "border-dashed border-white/20")}>
      <CardContent className="py-20">
        <div className="text-center space-y-8">
          {/* Ilustração com ícones */}
          <div className="relative mx-auto w-32 h-32">
            {/* Círculo principal */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-dashed border-purple-500/30 animate-pulse"></div>
            
            {/* Ícones flutuantes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Receipt className="h-12 w-12 text-purple-400" />
            </div>
            
            {/* Ícones menores posicionados */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-400" />
            </div>
            <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-orange-400" />
            </div>
            <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Building className="h-4 w-4 text-red-400" />
            </div>
          </div>

          {/* Título e descrição */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white font-sf-pro">
              Comece a gerenciar suas despesas
            </h3>
            <p className="text-gray-400 max-w-lg mx-auto text-lg">
              Você ainda não tem nenhuma despesa cadastrada. Que tal começar adicionando sua primeira despesa?
            </p>
          </div>

          {/* Benefícios */}
          <div className="bg-black/40 rounded-xl p-6 max-w-md mx-auto border border-white/10">
            <h4 className="text-white font-medium mb-4 flex items-center justify-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              O que você pode fazer:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Controlar gastos</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>Categorizar</span>
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  <span>Gerar relatórios</span>
                </div>
                <div className="flex items-center gap-2 text-orange-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Planejar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action principal */}
          <div className="space-y-4">
            <Button
              onClick={onCreateExpense}
              size="lg"
              className={cn(
                getGlassButtonClasses('primary'),
                getHoverTransformClasses('scale'),
                "flex items-center gap-3 px-8 py-4 text-lg font-semibold",
                "shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
                "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              )}
            >
              <Plus className="h-5 w-5" />
              Cadastrar Primeira Despesa
            </Button>
            
            <p className="text-xs text-gray-500">
              📋 Organize suas finanças de forma simples e eficiente
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};