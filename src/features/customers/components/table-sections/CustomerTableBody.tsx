/**
 * CustomerTableBody.tsx - Corpo da tabela de clientes com renderização de linhas
 * Context7 Pattern: Presentation Component para renderização de dados
 * Performance otimizada com memoização e virtualização
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/primitives/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from '@/shared/ui/primitives/tooltip';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import {
  Brain,
  User,
  Calendar,
  CreditCard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Gift,
  Shield,
  BarChart3,
  CheckCircle2,
  XCircle,
  MessageCircle,
  DollarSign,
  AlertTriangle,
  Eye,
  TrendingUp,
} from 'lucide-react';
import ProfileCompleteness from '@/shared/ui/composite/profile-completeness';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import {
  CustomerTableRow,
  TableColumn,
  SortField,
  SortDirection,
} from '../utils/table-types';

interface CustomerTableBodyProps {
  data: CustomerTableRow[];
  visibleColumns: TableColumn[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  isLoading?: boolean;
}

export const CustomerTableBody: React.FC<CustomerTableBodyProps> = ({
  data,
  visibleColumns,
  sortField,
  sortDirection,
  onSort,
  isLoading = false,
}) => {
  const { handleMouseMove } = useGlassmorphismEffect();

  const getSortIcon = (columnKey: string) => {
    if (sortField !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const handleSort = (columnKey: string) => {
    const field = columnKey as SortField;
    onSort(field);
  };

  // Formatação de dados - Context7 pattern: funções puras
  const formatPaymentMethod = (method?: string) => {
    if (!method) return 'N/A';
    const methodMap: Record<string, string> = {
      'credit_card': 'Cartão',
      'debit_card': 'Débito',
      'pix': 'PIX',
      'cash': 'Dinheiro',
      'bank_transfer': 'Transferência',
    };
    return methodMap[method] || method;
  };

  const formatLastPurchase = (date?: Date) => {
    if (!date) return 'Nunca';
    const daysDiff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) return 'Hoje';
    if (daysDiff === 1) return 'Ontem';
    if (daysDiff < 7) return `${daysDiff} dias`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} semanas`;
    return `${Math.floor(daysDiff / 30)} meses`;
  };

  const formatNextBirthday = (days?: number) => {
    if (days === undefined || days === null) return 'N/A';
    if (days === 0) return 'Hoje! 🎉';
    if (days === 1) return 'Amanhã';
    if (days < 7) return `${days} dias`;
    if (days < 30) return `${Math.floor(days / 7)} semanas`;
    return `${Math.floor(days / 30)} meses`;
  };

  const formatLastContact = (days?: number) => {
    if (days === undefined || days === null) return 'Nunca';
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias`;
    if (days < 30) return `${Math.floor(days / 7)} semanas`;
    return `+${Math.floor(days / 30)} meses`;
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Funções de cor - Context7 pattern: funções utilitárias
  const getInsightColor = (count: number) => {
    if (count >= 3) return 'text-green-400';
    if (count >= 1) return 'text-yellow-400';
    return 'text-gray-500';
  };

  const getProfileCompletenessColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getLastContactColor = (days?: number) => {
    if (!days) return 'text-gray-500';
    if (days <= 7) return 'text-green-400';
    if (days <= 30) return 'text-yellow-400';
    if (days <= 90) return 'text-orange-400';
    return 'text-red-400';
  };

  const getOutstandingAmountColor = (amount?: number) => {
    if (!amount || amount <= 0) return 'text-green-400';
    if (amount <= 100) return 'text-yellow-400';
    if (amount <= 500) return 'text-orange-400';
    return 'text-red-400';
  };

  // Renderizador de célula - Context7 pattern: componente condicional
  const renderCell = (customer: CustomerTableRow, column: TableColumn) => {
    switch (column.key) {
      case 'cliente':
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <Link
                to={`/customers/${customer.id}`}
                className="font-medium text-white hover:text-blue-400 transition-colors"
              >
                {customer.cliente}
              </Link>
              {customer.email && (
                <div className="text-sm text-gray-400">{customer.email}</div>
              )}
            </div>
          </div>
        );

      case 'ultimaCompra':
        return (
          <div className="text-center">
            <div className="text-sm text-white">
              {formatLastPurchase(customer.ultimaCompra)}
            </div>
            {customer.ultimaCompra && (
              <div className="text-xs text-gray-400">
                {customer.ultimaCompra.toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        );

      case 'insightsCount':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <Brain className={`h-4 w-4 mr-1 ${getInsightColor(customer.insightsCount)}`} />
                  <span className={getInsightColor(customer.insightsCount)}>
                    {customer.insightsCount}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  <p>{customer.insightsCount} insights de IA disponíveis</p>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        );

      case 'status':
        return (
          <div className="flex justify-center">
            <Badge
              variant={customer.status === 'Ativo' ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                customer.status === 'Ativo'
                  ? 'bg-green-600 text-white'
                  : customer.status === 'Inativo'
                  ? 'bg-red-600 text-white'
                  : 'bg-yellow-600 text-white'
              )}
            >
              {customer.status === 'Ativo' && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {customer.status === 'Inativo' && <XCircle className="h-3 w-3 mr-1" />}
              {customer.status === 'Pendente' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {customer.status}
            </Badge>
          </div>
        );

      case 'cidade':
        return (
          <div className="flex items-center justify-center">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            <span className="text-sm text-white">{customer.cidade || 'N/A'}</span>
          </div>
        );

      case 'diasParaAniversario':
        return (
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Gift className="h-4 w-4 mr-1 text-pink-400" />
              <span className="text-sm text-white">
                {formatNextBirthday(customer.diasParaAniversario)}
              </span>
            </div>
          </div>
        );

      case 'profileCompleteness':
        return (
          <div className="flex justify-center">
            <ProfileCompleteness
              percentage={customer.profileCompleteness}
              size="small"
              showLabel={false}
            />
          </div>
        );

      case 'diasSemContato':
        return (
          <div className="text-center">
            <div className="flex items-center justify-center">
              <MessageCircle className="h-4 w-4 mr-1 text-gray-400" />
              <span className={`text-sm ${getLastContactColor(customer.diasSemContato)}`}>
                {formatLastContact(customer.diasSemContato)}
              </span>
            </div>
          </div>
        );

      case 'valorEmAberto':
        return (
          <div className="text-right">
            <div className="flex items-center justify-end">
              <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
              <span className={`text-sm font-medium ${getOutstandingAmountColor(customer.valorEmAberto)}`}>
                {formatCurrency(customer.valorEmAberto)}
              </span>
            </div>
          </div>
        );

      default:
        return <span className="text-gray-400">N/A</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Carregando clientes...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300"
      onMouseMove={handleMouseMove}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-700/30">
            {visibleColumns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  'text-gray-300 font-semibold',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable && 'cursor-pointer hover:text-white'
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
            <TableHead className="text-gray-300 font-semibold w-16">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.length + 1}
                className="text-center py-8 text-gray-400"
              >
                Nenhum cliente encontrado com os filtros aplicados
              </TableCell>
            </TableRow>
          ) : (
            data.map((customer) => (
              <TableRow
                key={customer.id}
                className="border-gray-700 hover:bg-gray-700/30 transition-colors"
              >
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      'py-3',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {renderCell(customer, column)}
                  </TableCell>
                ))}
                <TableCell className="py-3">
                  <div className="flex justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link to={`/customers/${customer.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipPortal>
                          <TooltipContent>
                            <p>Ver perfil completo</p>
                          </TooltipContent>
                        </TooltipPortal>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerTableBody;