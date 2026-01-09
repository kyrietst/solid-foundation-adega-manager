/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { Eye, Pencil } from "lucide-react";
import { cn } from "@/core/config/utils";
import { CustomerInfoCell } from "./table/CustomerInfoCell";
import { CustomerStatusBadge } from "./table/CustomerStatusBadge";
import { CustomerLGPDBadge } from "./table/CustomerLGPDBadge";
import { CustomerCompletenessCell } from "./table/CustomerCompletenessCell";
import { CustomerLastContactBadge } from "./table/CustomerLastContactBadge";
import { CustomerOutstandingAmountBadge } from "./table/CustomerOutstandingAmountBadge"; // Assuming this exists or using previous imports
import { useCustomerTableData } from "../hooks/useCustomerTableData";

import {
  CustomerTableRow,
  TABLE_COLUMNS,
  TableColumn,
  formatPaymentMethod,
  formatLastPurchase,
  formatNextBirthday,
} from "../types/customer-table.types";
// Removed unused imports and props related to direct customer passing
// since this component fetches its own data via useCustomerTableData

interface CustomerDataTableProps {
    searchTerm?: string;
    segmentFilter?: string;
    statusFilter?: string;
    lastPurchaseFilter?: string;
    birthdayFilter?: string;
}

type SortField = 'cliente' | 'ultimaCompra' | 'status' | 'diasParaAniversario' | 'profileCompleteness' | 'diasSemContato' | 'valorEmAberto' | null;
type SortDirection = 'asc' | 'desc';

export default function CustomerDataTable({
    searchTerm = "",
    segmentFilter = "",
    statusFilter = "",
    lastPurchaseFilter = "",
    birthdayFilter = ""
}: CustomerDataTableProps) {
  /* Manual Pagination State */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* Sort State */
  const [sortField, setSortField] = useState<SortField>('ultimaCompra');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { data: tableRows = [], isLoading, error } = useCustomerTableData();

  const filteredAndSortedData = React.useMemo(() => {
    let filtered = tableRows.filter((customer) => {
      // Logic from filters
      const matchesSegment = !segmentFilter || segmentFilter === 'all' || customer.segmento === segmentFilter;
      const matchesStatus = !statusFilter || customer.status === statusFilter;
      const matchesSearch = !searchTerm ||
        customer.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.categoriaFavorita && customer.categoriaFavorita.toLowerCase().includes(searchTerm.toLowerCase()));

      // Last Purchase
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

      // Birthday
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

    // Sort Logic
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        if (sortField === 'ultimaCompra') {
          aValue = a.ultimaCompra ? new Date(a.ultimaCompra).getTime() : 0;
          bValue = b.ultimaCompra ? new Date(b.ultimaCompra).getTime() : 0;
        }
        if (sortField === 'diasParaAniversario') {
          aValue = a.diasParaAniversario ?? 999;
          bValue = b.diasParaAniversario ?? 999;
        }
        if (sortField === 'diasSemContato') {
            aValue = a.diasSemContato ?? 999;
            bValue = b.diasSemContato ?? 999;
        }
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
  }, [tableRows, segmentFilter, statusFilter, searchTerm, lastPurchaseFilter, birthdayFilter, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
    if (sortField === key) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortField(key as SortField);
        setSortDirection('desc');
    }
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
      if (sortField !== colKey) return <div className="w-4 h-4" />; // Placeholder for alignment
      return <div className="text-[#f9cb15]">{sortDirection === 'asc' ? '↑' : '↓'}</div>;
  }

  // Effect to reset page when filters change
  React.useEffect(() => {
      setCurrentPage(1);
  }, [segmentFilter, statusFilter, searchTerm, lastPurchaseFilter, birthdayFilter]);

  if (isLoading) {
      return (
          <div className="w-full h-96 flex items-center justify-center bg-white/[0.02] rounded-2xl border border-white/5">
              <div className="text-zinc-500 animate-pulse">Carregando dados...</div>
          </div>
      );
  }

  if (error) {
       return (
          <div className="w-full h-96 flex items-center justify-center bg-white/[0.02] rounded-2xl border border-white/5">
              <div className="text-red-400">Erro ao carregar dados.</div>
          </div>
      );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="text-[10px] uppercase tracking-wider text-zinc-500">
                <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-300 transition-colors"
                    onClick={() => handleSort('cliente')}
                >
                    <div className="flex items-center gap-2">Cliente <SortIcon colKey="cliente"/></div>
                </th>
                <th className="px-6 py-4 font-medium text-center">Segmento</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-center">Débito</th>
                <th 
                    className="px-6 py-4 font-medium text-center cursor-pointer hover:text-zinc-300 transition-colors"
                    onClick={() => handleSort('ultimaCompra')}
                >
                    <div className="flex items-center justify-center gap-2">Última Compra <SortIcon colKey="ultimaCompra"/></div>
                </th>
                 <th 
                    className="px-6 py-4 font-medium text-right cursor-pointer hover:text-zinc-300 transition-colors"
                    onClick={() => handleSort('profileCompleteness')}
                >
                     <div className="flex items-center justify-end gap-2">Perfil <SortIcon colKey="profileCompleteness"/></div>
                </th>
                <th className="px-6 py-4 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedData.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                        Nenhum cliente encontrado com os filtros atuais.
                    </td>
                </tr>
            ) : (
                paginatedData.map((customer) => (
                    <tr key={customer.id} className="group hover:bg-white/[0.02] transition-colors">
                        {/* Cliente */}
                        <td className="px-6 py-3 align-middle">
                           <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#f9cb15]/20 to-[#f9cb15]/10 rounded-full flex items-center justify-center border border-[#f9cb15]/30 shadow-sm flex-shrink-0 text-[#f9cb15] font-bold text-xs ring-1 ring-white/5">
                                    {customer.cliente.charAt(0).toUpperCase()}
                                </div>
                                <Link
                                    to={`/customer/${customer.id}`}
                                    className="block hover:no-underline group/link"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-zinc-100 group-hover/link:text-[#f9cb15] transition-colors">{customer.cliente}</span>
                                        <span className="text-xs text-zinc-500">{customer.email || 'Sem email'}</span>
                                    </div>
                                </Link>
                            </div>
                        </td>
                        {/* Segmento */}
                        <td className="px-6 py-3 align-middle text-center">
                            <Badge variant="outline" className="bg-zinc-800/50 border-white/10 text-zinc-400 font-normal hover:bg-zinc-800/70">
                                {customer.segmento}
                            </Badge>
                        </td>

                         {/* Status */}
                        <td className="px-6 py-3 align-middle text-center">
                            <div className="flex justify-center">
                                 <CustomerStatusBadge status={customer.status} color={customer.statusColor} />
                            </div>
                        </td>

                         {/* Valor em Aberto */}
                         <td className="px-6 py-3 align-middle text-center">
                             <div className="flex justify-center">
                                 <CustomerOutstandingAmountBadge amount={customer.valorEmAberto || 0} />
                             </div>
                         </td>

                         {/* Última Compra */}
                         <td className="px-6 py-3 align-middle text-center">
                              <span className="text-zinc-400 text-sm">{formatLastPurchase(customer.ultimaCompra)}</span>
                         </td>

                         {/* Perfil */}
                         <td className="px-6 py-3 align-middle text-right">
                              <div className="flex justify-end">
                                   <CustomerCompletenessCell row={customer} />
                              </div>
                         </td>

                         {/* Actions */}
                         <td className="px-6 py-3 align-middle text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                                        asChild
                                    >
                                        <Link to={`/customer/${customer.id}`}>
                                        <Eye className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Ver Cliente</TooltipContent>
                                </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-zinc-400 hover:text-[#f9cb15] hover:bg-[#f9cb15]/10"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            console.log("Edit", customer.id);
                                        }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar Cliente</TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            </div>
                         </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-white/[0.01] text-xs text-zinc-500">
         <div>
            {filteredAndSortedData.length > 0 ? (
                <span>
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} clientes
                </span>
            ) : (
                <span>0 clientes</span>
            )}
         </div>
         <div className="flex gap-2">
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-zinc-400 hover:text-white disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
            >
                Anterior
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-zinc-400 hover:text-white disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
            >
                Próximo
            </Button>
         </div>
      </div>
    </div>
  );
}