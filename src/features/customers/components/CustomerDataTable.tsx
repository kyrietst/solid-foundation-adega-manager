/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DataTable, TableColumn as DataTableColumn } from "@/shared/ui/layout/DataTable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
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
import { Brain, User, Calendar, CreditCard, ArrowUpDown, ArrowUp, ArrowDown, MapPin, Gift, Shield, BarChart3, CheckCircle2, XCircle, MessageCircle, DollarSign, AlertTriangle, Eye, TrendingUp } from "lucide-react";
import ProfileCompleteness from "@/shared/ui/composite/profile-completeness";
import { useProfileCompleteness } from "../hooks/useDataQuality";
import { calculateCompleteness } from "../utils/completeness-calculator";
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
  getProfileCompletenessColor,
  getProfileCompletenessBarColor,
  getLastContactColor,
  getOutstandingAmountColor,
  CUSTOMER_SEGMENTS,
  CUSTOMER_STATUSES
} from "../types/customer-table.types";

import { CustomerStatusBadge } from "./table/CustomerStatusBadge";
import { CustomerInfoCell } from "./table/CustomerInfoCell";
import { CustomerLGPDBadge } from "./table/CustomerLGPDBadge";
import { CustomerCompletenessCell } from "./table/CustomerCompletenessCell";
import { CustomerLastContactBadge } from "./table/CustomerLastContactBadge";
import { CustomerOutstandingAmountBadge } from "./table/CustomerOutstandingAmountBadge";

type SortField = 'cliente' | 'ultimaCompra' | 'status' | 'diasParaAniversario' | 'profileCompleteness' | 'diasSemContato' | 'valorEmAberto' | null;
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

  // Define as colunas para o DataTable SSoT
  const columns = React.useMemo<DataTableColumn<CustomerTableRow>[]>(() => {
    const allColumns: DataTableColumn<CustomerTableRow>[] = [
      {
        key: 'cliente',
        title: 'Cliente',
        sortable: true,
        width: '200px',
        render: (value, customer) => (
          <div className="flex items-center gap-3">
            {/* Avatar com gradient Adega Wine Cellar */}
            <div className="w-8 h-8 bg-gradient-to-br from-primary-yellow/30 to-yellow-400/20 rounded-full flex items-center justify-center border border-primary-yellow/30 shadow-sm flex-shrink-0">
              <span className="text-sm font-bold text-primary-yellow">
                {customer.cliente.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Link para perfil com indicadores visuais */}
            <Link
              to={`/customer/${customer.id}`}
              className="block hover:no-underline"
              title={`Ver perfil completo de ${customer.cliente}`}
            >
              <CustomerInfoCell customer={customer} />
            </Link>
          </div>
        ),
      },
      {
        key: 'categoriaFavorita',
        title: 'Categoria Favorita',
        sortable: false,
        width: '130px',
        align: 'center',
        render: (value) => (
          <span className="text-gray-100">{(value as string) || "Não definida"}</span>
        ),
      },
      {
        key: 'segmento',
        title: 'Segmento',
        sortable: false,
        width: '120px',
        align: 'center',
        render: (value) => (
          <Badge variant="outline" className="bg-gray-700/50 text-gray-100 border-gray-600/50 text-sm font-medium px-3 py-1">
            {value as string}
          </Badge>
        ),
      },
      {
        key: 'metodoPreferido',
        title: 'Método Preferido',
        sortable: false,
        width: '125px',
        align: 'center',
        render: (value) => (
          <span className="text-gray-100">{formatPaymentMethod(value as string | null)}</span>
        ),
      },
      {
        key: 'ultimaCompra',
        title: 'Última Compra',
        sortable: true,
        width: '140px',
        align: 'center',
        render: (value) => (
          <span className="text-gray-100">{formatLastPurchase(value as Date | null)}</span>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        sortable: false,
        width: '110px',
        align: 'center',
        render: (value, customer) => (
          <CustomerStatusBadge
            status={customer.status}
            color={customer.statusColor}
          />
        ),
      },
      {
        key: 'proximoAniversario',
        title: 'PRÓXIMO\nANIVERSÁRIO',
        sortable: true,
        width: '150px',
        align: 'center',
        render: (value, customer) => (
          <div className={cn("flex items-center gap-1 justify-center",
            customer.diasParaAniversario !== null && customer.diasParaAniversario <= 7
              ? "text-yellow-400 font-medium"
              : "text-gray-100"
          )}>
            {formatNextBirthday(customer.proximoAniversario, customer.diasParaAniversario)}
          </div>
        ),
      },
      {
        key: 'contactPermission',
        title: 'LGPD',
        sortable: false,
        width: '90px',
        align: 'center',
        render: (value) => (
          <CustomerLGPDBadge hasPermission={value as boolean} />
        ),
      },
      {
        key: 'profileCompleteness',
        title: 'Completude',
        sortable: true,
        width: '120px',
        align: 'center',
        render: (value, customer) => (
          <CustomerCompletenessCell
            row={customer}
            onEditClick={(customerId) => {
            }}
          />
        ),
      },
      {
        key: 'ultimoContato',
        title: 'Último Contato',
        sortable: true,
        width: '130px',
        align: 'center',
        render: (value, customer) => (
          <CustomerLastContactBadge
            date={customer.ultimoContato}
            daysAgo={customer.diasSemContato}
          />
        ),
      },
      {
        key: 'valorEmAberto',
        title: 'Valor em Aberto',
        sortable: true,
        width: '130px',
        align: 'center',
        render: (value) => (
          <CustomerOutstandingAmountBadge amount={value as number} />
        ),
      },
    ];

    // Filter columns based on visibility
    return allColumns.filter(col =>
      visibleColumns.includes(col.title as TableColumn)
    );
  }, [visibleColumns]);

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortField(key as SortField);
    setSortDirection(direction);
  };

  const toggleColumn = (col: TableColumn) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };


  return (
    <div className="space-y-4 h-full flex flex-col overflow-visible relative z-[1] w-full min-w-0">
      <div className="flex flex-wrap gap-4 items-center justify-between flex-shrink-0 relative z-[200]">
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
            className="px-3 py-2 border border-gray-600/50 rounded-md bg-gray-800/60 text-gray-100 text-sm hover:bg-gray-700/80 focus:ring-2 focus:ring-yellow-400/50"
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
            className="px-3 py-2 border border-gray-600/50 rounded-md bg-gray-800/60 text-gray-100 text-sm hover:bg-gray-700/80 focus:ring-2 focus:ring-yellow-400/50"
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
            className="px-3 py-2 border border-gray-600/50 rounded-md bg-gray-800/60 text-gray-100 text-sm hover:bg-gray-700/80 focus:ring-2 focus:ring-yellow-400/50"
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
            className="px-3 py-2 border border-gray-600/50 rounded-md bg-gray-800/60 text-gray-100 text-sm hover:bg-gray-700/80 focus:ring-2 focus:ring-yellow-400/50"
          >
            <option value="">Aniversários</option>
            <option value="today">Hoje 🎉</option>
            <option value="week">Próximos 7 dias 🎂</option>
            <option value="month">Próximos 30 dias 🎈</option>
            <option value="quarter">Próximos 90 dias</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {filteredAndSortedData.length} de {customers.length} clientes
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-800/60 border-gray-600 text-gray-100 hover:bg-gray-700/80"
              >
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-gray-800/95 border-gray-600 z-[150]">
              {TABLE_COLUMNS.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                  className="text-gray-100 hover:bg-gray-700/80 focus:bg-gray-700/80"
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* DataTable SSoT Component */}
      <DataTable<CustomerTableRow>
        data={filteredAndSortedData}
        columns={columns}
        loading={isLoading}
        error={error}
        variant="premium"
        glassEffect={true}
        virtualization={true}
        virtualizationThreshold={50}
        rowHeight={100}
        overscan={5}
        sortKey={sortField || undefined}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyTitle="Nenhum cliente encontrado"
        emptyDescription={
          (segmentFilter || statusFilter || searchTerm || lastPurchaseFilter || birthdayFilter)
            ? "Tente ajustar os filtros de busca."
            : "Não há clientes cadastrados no momento."
        }
        striped={true}
        hoverable={true}
        compact={false}
      />
    </div>
  );
}