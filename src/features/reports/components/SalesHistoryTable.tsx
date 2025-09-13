/**
 * Sales History Table - Histórico completo de vendas
 * Migrado para usar o DataTable genérico (Fase 2.1 refatoração DRY)
 */

import React, { useState, useMemo } from 'react';
import { useSales } from '@/features/sales/hooks/use-sales';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DataTable } from '@/shared/ui/composite/DataTable';
import { DataTableColumn } from '@/shared/hooks/common/useDataTable';
import { CurrencyDisplay, DateDisplay } from '@/shared/ui/composite/FormatDisplay';
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

// Types
interface SaleWithRelations {
  id: string;
  created_at: string;
  total_amount: number;
  final_amount: number | null;
  status: string;
  payment_method: string;
  payment_status: string;
  customer?: {
    name: string;
  };
  seller?: {
    name: string;
  };
  items?: unknown[];
}

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

  // Filtrar vendas baseado nos filtros aplicados (agora usando lógica externa à DataTable)
  const filteredSales = useMemo(() => {
    if (!sales) return [];
    
    return sales.filter((sale: SaleWithRelations) => {
      const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || 
        sale.payment_method?.toLowerCase() === paymentFilter.toLowerCase();
      
      return matchesStatus && matchesPayment;
    });
  }, [sales, statusFilter, paymentFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPaymentMethod = (method: string) => {
    // Retorna o método de pagamento formatado para exibição
    // Dados padronizados: "PIX", "Cartão de Crédito", "Débito", "Dinheiro"
    if (!method) return 'Não informado';
    
    // Todos os métodos já estão no padrão correto após migração
    return method;
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

  // Define colunas para o DataTable
  const columns: DataTableColumn<SaleWithRelations>[] = [
    {
      id: 'id',
      label: 'ID',
      accessor: 'id',
      width: '120px',
      render: (value) => (
        <span className="text-white font-mono">
          #{String(value).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      id: 'created_at',
      label: 'Data',
      accessor: 'created_at',
      width: '180px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-400" />
          <DateDisplay 
            value={value as string}
            format="dd/MM/yyyy HH:mm"
            className="text-gray-300"
          />
        </div>
      ),
    },
    {
      id: 'customer',
      label: 'Cliente',
      accessor: (sale) => sale.customer?.name,
      width: '180px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-purple-400" />
          <span className="text-gray-300">{value || 'Não informado'}</span>
        </div>
      ),
    },
    {
      id: 'seller',
      label: 'Vendedor',
      accessor: (sale) => sale.seller?.name,
      width: '180px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-amber-400" />
          <span className="text-gray-300">{value || 'Não informado'}</span>
        </div>
      ),
    },
    {
      id: 'payment_method',
      label: 'Pagamento',
      accessor: 'payment_method',
      width: '200px',
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-green-400" />
          <span className="text-gray-300">{formatPaymentMethod(String(value))}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full", getPaymentStatusBadge(item.payment_status))}>
            {item.payment_status === 'paid' ? 'Pago' : 
             item.payment_status === 'pending' ? 'Pendente' : 'Cancelado'}
          </span>
        </div>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      width: '120px',
      render: (value) => (
        <span className={cn("text-xs px-2 py-1 rounded-full", getStatusBadge(String(value)))}>
          {String(value) === 'completed' ? 'Concluído' :
           String(value) === 'pending' ? 'Pendente' :
           String(value) === 'cancelled' ? 'Cancelado' : 'Devolvido'}
        </span>
      ),
    },
    {
      id: 'final_amount',
      label: 'Valor',
      accessor: (sale) => Number(sale.final_amount || sale.total_amount || 0),
      align: 'right',
      width: '140px',
      render: (value, item) => (
        <div className="text-right">
          <CurrencyDisplay 
            value={Number(value)}
            className="font-bold text-emerald-400"
          />
          <div className="text-xs text-gray-400">
            {item.items?.length || 0} {(item.items?.length || 0) === 1 ? 'item' : 'itens'}
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      label: 'Ações',
      accessor: () => '',
      sortable: false,
      align: 'center',
      width: '80px',
      render: (_, item) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
          onClick={() => onViewSale?.(item.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

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
            placeholder="Buscar por ID, cliente, vendedor, PIX, cartão, valor..."
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
            <SelectItem value="Cartão de Crédito" className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 focus:text-purple-300 cursor-pointer">Cartão de Crédito</SelectItem>
            <SelectItem value="Débito" className="text-white hover:bg-orange-500/20 focus:bg-orange-500/20 focus:text-orange-300 cursor-pointer">Débito</SelectItem>
            <SelectItem value="Dinheiro" className="text-white hover:bg-green-500/20 focus:bg-green-500/20 focus:text-green-300 cursor-pointer">Dinheiro</SelectItem>
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

      {/* DataTable - Substitui toda a implementação manual da tabela */}
      <DataTable
        data={filteredSales}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Buscar por ID, cliente, vendedor, método de pagamento..."
        searchFields={['id', 'customer.name', 'seller.name', 'payment_method', 'status']}
        defaultSortField="created_at"
        defaultSortDirection="desc"
        maxRows={parseInt(limitFilter)}
        empty={{
          title: 'Nenhuma venda encontrada',
          description: 'Ajuste os filtros para encontrar as vendas desejadas.',
          icon: FileText,
        }}
        caption="Histórico completo de vendas do sistema"
      />

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