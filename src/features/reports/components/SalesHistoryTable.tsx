/**
 * Sales History Table - Histórico completo de vendas
 * Tabela detalhada com todas as vendas do sistema
 */

import React, { useState } from 'react';
import { useSales } from '@/features/sales/hooks/use-sales';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download,
  Calendar,
  CreditCard,
  User,
  Package
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { text, shadows } from '@/core/config/theme';

interface SalesHistoryTableProps {
  onViewSale?: (saleId: string) => void;
}

export const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({ onViewSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [limitFilter, setLimitFilter] = useState('50');

  const { data: sales, isLoading } = useSales({ 
    limit: parseInt(limitFilter)
  });

  // Filtrar vendas baseado nos filtros aplicados
  const filteredSales = sales?.filter(sale => {
    const matchesSearch = !searchTerm || 
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || sale.payment_method === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  }) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      'PIX': 'PIX',
      'card': 'Cartão',
      'cash': 'Dinheiro',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'bank_transfer': 'Transferência',
      'other': 'Outro'
    };
    return methods[method] || method;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'returned':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" variant="gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={cn(text.h2, shadows.medium, "text-2xl font-bold tracking-tight")}>
            Histórico Completo de Vendas
          </h2>
          <p className={cn(text.h6, shadows.subtle, "text-sm")}>
            Visualize todas as transações do sistema ({filteredSales.length} de {sales?.length || 0} vendas)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-black/70 backdrop-blur-xl border border-white/20 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar venda, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/50 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-black/50 border-white/20 text-white">
            <SelectValue placeholder="Status da venda" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">Todos os status</SelectItem>
            <SelectItem value="completed" className="text-white hover:bg-green-500/20 focus:bg-green-500/20 focus:text-green-300 cursor-pointer">Concluído</SelectItem>
            <SelectItem value="pending" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/20 focus:text-amber-300 cursor-pointer">Pendente</SelectItem>
            <SelectItem value="cancelled" className="text-white hover:bg-red-500/20 focus:bg-red-500/20 focus:text-red-300 cursor-pointer">Cancelado</SelectItem>
            <SelectItem value="returned" className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 focus:text-purple-300 cursor-pointer">Devolvido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="bg-black/50 border-white/20 text-white">
            <SelectValue placeholder="Método de pagamento" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">Todos os métodos</SelectItem>
            <SelectItem value="PIX" className="text-white hover:bg-blue-500/20 focus:bg-blue-500/20 focus:text-blue-300 cursor-pointer">PIX</SelectItem>
            <SelectItem value="card" className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 focus:text-purple-300 cursor-pointer">Cartão</SelectItem>
            <SelectItem value="cash" className="text-white hover:bg-green-500/20 focus:bg-green-500/20 focus:text-green-300 cursor-pointer">Dinheiro</SelectItem>
            <SelectItem value="bank_transfer" className="text-white hover:bg-cyan-500/20 focus:bg-cyan-500/20 focus:text-cyan-300 cursor-pointer">Transferência</SelectItem>
          </SelectContent>
        </Select>

        <Select value={limitFilter} onValueChange={setLimitFilter}>
          <SelectTrigger className="bg-black/50 border-white/20 text-white">
            <SelectValue placeholder="Quantidade" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <SelectItem value="25" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">25 vendas</SelectItem>
            <SelectItem value="50" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">50 vendas</SelectItem>
            <SelectItem value="100" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">100 vendas</SelectItem>
            <SelectItem value="200" className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">200 vendas</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-black/50 border-white/20 text-white hover:bg-white/10"
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setPaymentFilter('all');
            setLimitFilter('50');
          }}
        >
          <Filter className="h-4 w-4" />
          Limpar
        </Button>
      </div>

      {/* Tabela */}
      <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50 border-b border-white/20">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Data</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Vendedor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Pagamento</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Valor</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className={cn(text.h4, shadows.medium, "text-lg font-medium")}>
                        Nenhuma venda encontrada
                      </h3>
                      <p className={cn(text.h6, shadows.subtle, "text-sm text-center max-w-md mt-1")}>
                        Ajuste os filtros para encontrar as vendas desejadas.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr 
                    key={sale.id} 
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-white font-mono">
                      #{sale.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-400" />
                        {sale.customer?.name || 'Não informado'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-amber-400" />
                        {sale.seller?.name || 'Não informado'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">{formatPaymentMethod(sale.payment_method)}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", getPaymentStatusBadge(sale.payment_status))}>
                          {sale.payment_status === 'paid' ? 'Pago' : 
                           sale.payment_status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={cn("text-xs px-2 py-1 rounded-full", getStatusBadge(sale.status))}>
                        {sale.status === 'completed' ? 'Concluído' :
                         sale.status === 'pending' ? 'Pendente' :
                         sale.status === 'cancelled' ? 'Cancelado' : 'Devolvido'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <div className="font-bold text-emerald-400">
                        {formatCurrency(Number(sale.final_amount || sale.total_amount || 0))}
                      </div>
                      <div className="text-xs text-gray-400">
                        {sale.items?.length || 0} {(sale.items?.length || 0) === 1 ? 'item' : 'itens'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        onClick={() => onViewSale?.(sale.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer com estatísticas */}
      {filteredSales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-black/50 backdrop-blur-xl border border-white/20 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {filteredSales.length}
            </div>
            <div className="text-sm text-gray-400">Vendas encontradas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {formatCurrency(
                filteredSales.reduce((sum, sale) => 
                  sum + Number(sale.final_amount || sale.total_amount || 0), 0
                )
              )}
            </div>
            <div className="text-sm text-gray-400">Total em vendas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(
                filteredSales.reduce((sum, sale) => 
                  sum + Number(sale.final_amount || sale.total_amount || 0), 0
                ) / filteredSales.length
              )}
            </div>
            <div className="text-sm text-gray-400">Ticket médio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {filteredSales.reduce((sum, sale) => sum + (sale.items?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-400">Total de itens</div>
          </div>
        </div>
      )}
    </div>
  );
};