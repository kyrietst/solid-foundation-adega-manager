"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/primitives/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { Badge } from "@/shared/ui/primitives/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/primitives/dropdown-menu";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { SearchBar21st } from "@/shared/ui/thirdparty/search-bar-21st";
import { cn } from "@/core/config/utils";
import { Brain, User, Calendar, CreditCard, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Gift, Shield, BarChart3, CheckCircle2, XCircle, MessageCircle, DollarSign } from "lucide-react";
import { useCustomerTableData } from "../hooks/useCustomerTableData";
import { 
  CustomerTableRow, 
  TABLE_COLUMNS,
  TableColumn,
  formatPaymentMethod,
  formatLastPurchase,
  formatNextBirthday,
  formatLastContact,
  formatCurrency,
  getInsightLevel,
  getInsightColor,
  getProfileCompletenessColor,
  getProfileCompletenessBarColor,
  getLastContactColor,
  getOutstandingAmountColor,
  CUSTOMER_SEGMENTS,
  CUSTOMER_STATUSES
} from "../types/customer-table.types";

const InsightsBadge = ({ 
  count, 
  confidence 
}: { 
  count: number; 
  confidence: number; 
}) => {
  if (count === 0) {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Brain className="w-3 h-3" />
        Sem insights
      </Badge>
    );
  }
  
  const level = getInsightLevel(confidence);
  const color = getInsightColor(level);
  
  const badgeClass = {
    green: "bg-green-500/20 text-green-700 border-green-300",
    yellow: "bg-yellow-500/20 text-yellow-700 border-yellow-300", 
    red: "bg-red-500/20 text-red-700 border-red-300"
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={cn("flex items-center gap-1", badgeClass[color])}>
            <Brain className="w-3 h-3" />
            {count} ({Math.round(confidence * 100)}%)
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {count} insights de IA com {Math.round(confidence * 100)}% de confiança média
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const StatusBadge = ({ 
  status, 
  color 
}: { 
  status: CustomerTableRow['status']; 
  color: CustomerTableRow['statusColor']; 
}) => {
  const statusColors = {
    gold: "bg-yellow-500 text-white",
    green: "bg-green-500 text-white",
    yellow: "bg-yellow-400 text-gray-800",
    red: "bg-red-500 text-white",
    gray: "bg-gray-400 text-white",
    orange: "bg-orange-500 text-white"
  };
  
  return (
    <Badge className={cn("whitespace-nowrap", statusColors[color])}>
      {status}
    </Badge>
  );
};

const LGPDBadge = ({ hasPermission }: { hasPermission: boolean }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={hasPermission ? "default" : "destructive"} 
            className={cn("flex items-center gap-1", 
              hasPermission 
                ? "bg-green-500/20 text-green-700 border-green-300" 
                : "bg-red-500/20 text-red-700 border-red-300"
            )}
          >
            {hasPermission ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {hasPermission ? "✓" : "✗"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {hasPermission 
              ? "Cliente autorizou contato (LGPD conforme)" 
              : "Cliente não autorizou contato marketing"
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ProfileCompleteness = ({ percentage }: { percentage: number }) => {
  const color = getProfileCompletenessColor(percentage);
  const barColor = getProfileCompletenessBarColor(percentage);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 min-w-[80px]">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn("h-2 rounded-full transition-all duration-300", barColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <span className={cn("text-xs font-medium", color)}>
              {percentage}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Completude do perfil: {percentage}% 
            {percentage >= 80 ? " (Excelente)" : percentage >= 60 ? " (Bom)" : " (Básico)"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const LastContactBadge = ({ 
  date, 
  daysAgo 
}: { 
  date: Date | null; 
  daysAgo: number | null; 
}) => {
  const color = getLastContactColor(daysAgo);
  const text = formatLastContact(date, daysAgo);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1", color)}>
            <MessageCircle className="w-3 h-3" />
            {text}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {daysAgo === null 
              ? "Cliente nunca teve contato registrado" 
              : `Último contato há ${daysAgo} dia${daysAgo === 1 ? '' : 's'}`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const OutstandingAmountBadge = ({ amount }: { amount: number }) => {
  const color = getOutstandingAmountColor(amount);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1", color)}>
            <DollarSign className="w-3 h-3" />
            {formatCurrency(amount)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {amount === 0 
              ? "Cliente não possui valores em aberto" 
              : `Valor total em aberto: ${formatCurrency(amount)}`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

type SortField = 'cliente' | 'ultimaCompra' | 'insightsCount' | 'status' | 'cidade' | 'diasParaAniversario' | 'profileCompleteness' | 'diasSemContato' | 'valorEmAberto' | null;
type SortDirection = 'asc' | 'desc';

export default function CustomerDataTable() {
  const [visibleColumns, setVisibleColumns] = useState<TableColumn[]>([...TABLE_COLUMNS]);
  const [segmentFilter, setSegmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('ultimaCompra');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [lastPurchaseFilter, setLastPurchaseFilter] = useState("");
  const [birthdayFilter, setBirthdayFilter] = useState("");

  const { data: customers = [], isLoading, error } = useCustomerTableData();

  const filteredAndSortedData = React.useMemo(() => {
    let filtered = customers.filter((customer) => {
      const matchesSegment = !segmentFilter || customer.segmento === segmentFilter;
      const matchesStatus = !statusFilter || customer.status === statusFilter;
      const matchesSearch = !searchTerm || 
        customer.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.categoriaFavorita?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por última compra
      const matchesLastPurchase = (() => {
        if (!lastPurchaseFilter || !customer.ultimaCompra) return true;
        const daysSinceLastPurchase = Math.floor(
          (new Date().getTime() - customer.ultimaCompra.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        switch (lastPurchaseFilter) {
          case "7days": return daysSinceLastPurchase <= 7;
          case "30days": return daysSinceLastPurchase <= 30;
          case "90days": return daysSinceLastPurchase <= 90;
          case "180days": return daysSinceLastPurchase <= 180;
          case "over180": return daysSinceLastPurchase > 180;
          default: return true;
        }
      })();

      // Filtro por proximidade do aniversário  
      const matchesBirthday = (() => {
        if (!birthdayFilter || customer.diasParaAniversario === null) return true;
        
        switch (birthdayFilter) {
          case "today": return customer.diasParaAniversario === 0;
          case "week": return customer.diasParaAniversario <= 7;
          case "month": return customer.diasParaAniversario <= 30;
          case "quarter": return customer.diasParaAniversario <= 90;
          default: return true;
        }
      })();

      return matchesSegment && matchesStatus && matchesSearch && matchesLastPurchase && matchesBirthday;
    });

    // Aplicar ordenação
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: unknown = a[sortField];
        let bValue: unknown = b[sortField];

        // Tratamento especial para datas
        if (sortField === 'ultimaCompra') {
          aValue = a.ultimaCompra ? new Date(a.ultimaCompra).getTime() : 0;
          bValue = b.ultimaCompra ? new Date(b.ultimaCompra).getTime() : 0;
        }
        
        // Tratamento especial para dias até aniversário
        if (sortField === 'diasParaAniversario') {
          aValue = a.diasParaAniversario ?? 999; // Coloca sem aniversário por último
          bValue = b.diasParaAniversario ?? 999;
        }
        
        // Tratamento especial para dias sem contato
        if (sortField === 'diasSemContato') {
          aValue = a.diasSemContato ?? 999; // Coloca sem contato por último
          bValue = b.diasSemContato ?? 999;
        }
        
        // Tratamento para strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [customers, segmentFilter, statusFilter, searchTerm, lastPurchaseFilter, birthdayFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending for new fields
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const toggleColumn = (col: TableColumn) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  if (isLoading) {
    return (
      <div className="container my-6 space-y-4 p-4 border border-border rounded-lg bg-background shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Carregando dados dos clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-6 space-y-4 p-4 border border-border rounded-lg bg-background shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados dos clientes</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-6 space-y-4 p-4 border border-border rounded-lg bg-background shadow-sm overflow-x-auto">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="w-64 md:w-80">
            <SearchBar21st
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
              debounceMs={150}
              disableResizeAnimation
              suggestions={customers.map((c) => c.cliente)}
              showOnFocus
            />
          </div>
          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="">Todos os segmentos</option>
            {CUSTOMER_SEGMENTS.map((segment) => (
              <option key={segment} value={segment}>
                {segment}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="">Todos os status</option>
            {CUSTOMER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={lastPurchaseFilter}
            onChange={(e) => setLastPurchaseFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="">Última compra</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
            <option value="180days">Últimos 180 dias</option>
            <option value="over180">Mais de 180 dias</option>
          </select>
          <select
            value={birthdayFilter}
            onChange={(e) => setBirthdayFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="">Aniversários</option>
            <option value="today">Hoje 🎉</option>
            <option value="week">Próximos 7 dias 🎂</option>
            <option value="month">Próximos 30 dias 🎈</option>
            <option value="quarter">Próximos 90 dias</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredAndSortedData.length} de {customers.length} clientes
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {TABLE_COLUMNS.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {visibleColumns.includes("Cliente") && (
              <TableHead className="w-[200px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('cliente')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent"
                >
                  <User className="w-4 h-4" />
                  Cliente
                  {getSortIcon('cliente')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.includes("Categoria Favorita") && (
              <TableHead className="w-[180px]">Categoria Favorita</TableHead>
            )}
            {visibleColumns.includes("Segmento") && (
              <TableHead className="w-[150px]">Segmento</TableHead>
            )}
            {visibleColumns.includes("Método Preferido") && (
              <TableHead className="w-[150px]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Método Preferido
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Última Compra") && (
              <TableHead className="w-[140px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('ultimaCompra')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent"
                >
                  <Calendar className="w-4 h-4" />
                  Última Compra
                  {getSortIcon('ultimaCompra')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.includes("Insights de IA") && (
              <TableHead className="w-[130px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('insightsCount')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent"
                >
                  <Brain className="w-4 h-4" />
                  Insights de IA
                  {getSortIcon('insightsCount')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.includes("Status") && (
              <TableHead className="w-[120px]">Status</TableHead>
            )}
            {visibleColumns.includes("Cidade") && (
              <TableHead className="w-[120px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('cidade')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent"
                >
                  <MapPin className="w-4 h-4" />
                  Cidade
                  {getSortIcon('cidade')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.includes("Próximo Aniversário") && (
              <TableHead className="w-[160px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('diasParaAniversario')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent"
                >
                  <Gift className="w-4 h-4" />
                  Próximo Aniversário
                  {getSortIcon('diasParaAniversario')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.includes("LGPD") && (
              <TableHead className="w-[80px]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  LGPD
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Completude") && (
              <TableHead className="w-[120px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('profileCompleteness')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent"
                >
                  <BarChart3 className="w-4 h-4" />
                  Completude
                  {getSortIcon('profileCompleteness')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.includes("Último Contato") && (
              <TableHead className="w-[140px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('diasSemContato')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent"
                >
                  <MessageCircle className="w-4 h-4" />
                  Último Contato
                  {getSortIcon('diasSemContato')}
                </Button>
              </TableHead>
            )}
            {visibleColumns.includes("Valor em Aberto") && (
              <TableHead className="w-[140px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('valorEmAberto')}
                  className="flex items-center gap-2 p-0 hover:bg-transparent"
                >
                  <DollarSign className="w-4 h-4" />
                  Valor em Aberto
                  {getSortIcon('valorEmAberto')}
                </Button>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedData.length ? (
            filteredAndSortedData.map((customer) => (
              <TableRow key={customer.id}>
                {visibleColumns.includes("Cliente") && (
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {customer.cliente.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <Link 
                        to={`/customer/${customer.id}`} 
                        className="hover:underline hover:text-primary transition-colors text-white"
                        title={`Ver perfil completo de ${customer.cliente}`}
                      >
                        {customer.cliente}
                      </Link>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes("Categoria Favorita") && (
                  <TableCell className="whitespace-nowrap">
                    {customer.categoriaFavorita || "Não definida"}
                  </TableCell>
                )}
                {visibleColumns.includes("Segmento") && (
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline">{customer.segmento}</Badge>
                  </TableCell>
                )}
                {visibleColumns.includes("Método Preferido") && (
                  <TableCell className="whitespace-nowrap">
                    {formatPaymentMethod(customer.metodoPreferido)}
                  </TableCell>
                )}
                {visibleColumns.includes("Última Compra") && (
                  <TableCell className="whitespace-nowrap">
                    {formatLastPurchase(customer.ultimaCompra)}
                  </TableCell>
                )}
                {visibleColumns.includes("Insights de IA") && (
                  <TableCell>
                    <InsightsBadge 
                      count={customer.insightsCount}
                      confidence={customer.insightsConfidence}
                    />
                  </TableCell>
                )}
                {visibleColumns.includes("Status") && (
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge 
                      status={customer.status}
                      color={customer.statusColor}
                    />
                  </TableCell>
                )}
                {visibleColumns.includes("Cidade") && (
                  <TableCell className="whitespace-nowrap">
                    {customer.cidade || "Não informada"}
                  </TableCell>
                )}
                {visibleColumns.includes("Próximo Aniversário") && (
                  <TableCell className="whitespace-nowrap">
                    <div className={cn("flex items-center gap-1", 
                      customer.diasParaAniversario !== null && customer.diasParaAniversario <= 7 
                        ? "text-yellow-600 font-medium" 
                        : ""
                    )}>
                      {formatNextBirthday(customer.proximoAniversario, customer.diasParaAniversario)}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes("LGPD") && (
                  <TableCell>
                    <LGPDBadge hasPermission={customer.contactPermission} />
                  </TableCell>
                )}
                {visibleColumns.includes("Completude") && (
                  <TableCell>
                    <ProfileCompleteness percentage={customer.profileCompleteness} />
                  </TableCell>
                )}
                {visibleColumns.includes("Último Contato") && (
                  <TableCell className="whitespace-nowrap">
                    <LastContactBadge 
                      date={customer.ultimoContato}
                      daysAgo={customer.diasSemContato}
                    />
                  </TableCell>
                )}
                {visibleColumns.includes("Valor em Aberto") && (
                  <TableCell className="whitespace-nowrap">
                    <OutstandingAmountBadge amount={customer.valorEmAberto} />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns.length} className="text-center py-6">
                <div className="flex flex-col items-center gap-2">
                  <User className="w-8 h-8 text-muted-foreground" />
                  <p>Nenhum cliente encontrado.</p>
                  {(segmentFilter || statusFilter || searchTerm || lastPurchaseFilter || birthdayFilter) && (
                    <p className="text-sm text-muted-foreground">
                      Tente ajustar os filtros de busca.
                    </p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}