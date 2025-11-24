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
  getInsightLevel,
  getInsightColor,
  getProfileCompletenessColor,
  getProfileCompletenessBarColor,
  getLastContactColor,
  getOutstandingAmountColor,
  CUSTOMER_SEGMENTS,
  CUSTOMER_STATUSES
} from "../types/customer-table.types";

const InsightsBadge = React.memo(({
  count,
  confidence
}: {
  count: number;
  confidence: number;
}) => {
  if (count === 0) {
    return (
      <div className="flex justify-center items-center w-full">
        <Badge variant="outline" className="flex items-center gap-1 text-sm font-bold px-3 py-1 bg-gray-600/30 text-gray-100 border-gray-500/60">
          <Brain className="w-3 h-3" />
          Sem insights
        </Badge>
      </div>
    );
  }

  const level = getInsightLevel(confidence);
  const color = getInsightColor(level);

  // Sistema de cores Adega Wine Cellar v2.1 - Insights IA
  const badgeClass = {
    green: "bg-green-500/30 text-green-100 border-green-400/60 shadow-lg shadow-green-400/20 backdrop-blur-sm font-bold",
    yellow: "bg-yellow-500/30 text-yellow-100 border-yellow-400/60 shadow-lg shadow-yellow-400/20 backdrop-blur-sm font-bold",
    red: "bg-red-500/30 text-red-100 border-red-400/60 shadow-lg shadow-red-400/20 backdrop-blur-sm lgpd-soft-pulse font-bold"
  };

  return (
    <div className="flex justify-center items-center w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={cn(
              "flex items-center gap-1 transition-all duration-200 hover:scale-105 border cursor-pointer text-sm font-semibold px-3 py-1",
              badgeClass[color]
            )}>
              <Brain className="w-3 h-3" />
              {count} insights ({Math.round(confidence * 100)}%)
            </Badge>
          </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent className="z-[50000] bg-black/95 backdrop-blur-xl border border-primary-yellow/30 shadow-2xl">
            <div className="space-y-2 p-1">
              <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                <Brain className="h-3 w-3 text-primary-yellow" />
                <span className="font-semibold text-white text-xs">Insights de IA</span>
              </div>
              
              <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-2">
                <p className="text-blue-300 font-medium text-xs">
                  {count} insights disponíveis
                </p>
                <p className="text-blue-200 text-[10px] mt-1">
                  Confiança média: {Math.round(confidence * 100)}%
                </p>
              </div>
              
              <div className="text-center pt-1 border-t border-white/10">
                <p className="text-xs text-gray-300">
                  Análises automatizadas de comportamento
                </p>
              </div>
            </div>
            </TooltipContent>
          </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
    </div>
  );
}, (prevProps, nextProps) =>
  prevProps.count === nextProps.count && prevProps.confidence === nextProps.confidence
);

// Indicadores visuais para campos críticos de relatórios
const ReportFieldIndicator = ({ 
  fieldName, 
  value, 
  isRequired = false 
}: { 
  fieldName: string; 
  value: any; 
  isRequired?: boolean; 
}) => {
  const isEmpty = !value || value === '' || value === 'Não informado' || value === 'N/A';
  
  if (!isEmpty) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center justify-center w-2 h-2 rounded-full ml-1",
            isRequired ? "bg-accent-red animate-pulse" : "bg-accent-orange"
          )} />
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent className="z-[50000] bg-black/95 backdrop-blur-xl border border-primary-yellow/30">
            <div className="space-y-1">
              <p className="text-xs font-medium text-primary-yellow">Campo faltante para relatórios</p>
              <p className="text-xs text-white">{fieldName}</p>
              <p className="text-xs text-gray-300">
                {isRequired ? "🔴 Crítico" : "🟡 Importante"}
              </p>
            </div>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

const StatusBadge = React.memo(({
  status,
  color
}: {
  status: CustomerTableRow['status'];
  color: CustomerTableRow['statusColor'];
}) => {
  // Sistema de cores Adega Wine Cellar v2.1 - Contraste otimizado
  const statusColors = {
    gold: "bg-primary-yellow/20 text-primary-yellow border-primary-yellow/40 shadow-lg shadow-primary-yellow/10 font-semibold backdrop-blur-sm",
    green: "bg-green-400/20 text-green-300 border-green-400/40 shadow-lg shadow-green-400/10 backdrop-blur-sm",
    yellow: "bg-accent-orange/20 text-orange-300 border-accent-orange/40 shadow-lg shadow-accent-orange/10 backdrop-blur-sm",
    red: "bg-accent-red/20 text-red-300 border-accent-red/40 shadow-lg shadow-accent-red/10 backdrop-blur-sm lgpd-soft-pulse",
    gray: "bg-gray-500/20 text-gray-300 border-gray-500/40 shadow-lg shadow-gray-500/10 backdrop-blur-sm",
    orange: "bg-accent-orange/20 text-orange-300 border-accent-orange/40 shadow-lg shadow-accent-orange/10 backdrop-blur-sm"
  };

  return (
    <Badge className={cn(
      "whitespace-nowrap transition-all duration-200 hover:scale-105 border text-sm font-semibold px-3 py-1",
      statusColors[color] || statusColors.gray
    )}>
      {status}
    </Badge>
  );
}, (prevProps, nextProps) =>
  prevProps.status === nextProps.status && prevProps.color === nextProps.color
);

// Componente interativo para nome do cliente com indicadores visuais
const CustomerNameWithIndicators = React.memo(({
  customer
}: {
  customer: CustomerTableRow;
}) => {
  const reportFields = [
    { key: 'email', label: 'Email', value: customer.email, required: true },
    { key: 'phone', label: 'Telefone', value: customer.phone, required: true },
    { key: 'birthday', label: 'Aniversário', value: customer.proximoAniversario, required: false },
    { key: 'address', label: 'Endereço', value: customer.cidade, required: false },
    { key: 'category', label: 'Categoria Favorita', value: customer.categoriaFavorita, required: false }
  ];
  
  const missingFields = reportFields.filter(field => 
    !field.value || field.value === 'Não informado' || field.value === 'N/A'
  );
  
  const criticalMissing = missingFields.filter(field => field.required);
  const importantMissing = missingFields.filter(field => !field.required);
  
  const hasIssues = missingFields.length > 0;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "group flex items-center gap-2 cursor-pointer transition-all duration-200",
            hasIssues && "hover:scale-105"
          )}>
            {/* Nome do cliente */}
            <span className={cn(
              "font-medium transition-colors duration-200",
              hasIssues ? "text-white group-hover:text-primary-yellow" : "text-gray-100"
            )}>
              {customer.cliente}
            </span>
            
            {/* Indicadores visuais */}
            {criticalMissing.length > 0 && (
              <div className="relative">
                <AlertTriangle className="h-3 w-3 text-accent-red animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-red rounded-full animate-ping" />
              </div>
            )}
            
            {importantMissing.length > 0 && criticalMissing.length === 0 && (
              <div className="w-2 h-2 bg-accent-orange rounded-full animate-pulse" />
            )}
            
            {!hasIssues && (
              <CheckCircle2 className="h-3 w-3 text-green-400 opacity-60" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent className="z-[50000] bg-black/95 backdrop-blur-xl border border-primary-yellow/30 shadow-2xl max-w-sm">
            <div className="space-y-3 p-1">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-semibold text-white">Perfil para Relatórios</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-primary-yellow" />
                  <span className="text-primary-yellow text-xs font-medium">Clique para editar</span>
                </div>
              </div>
              
              {/* Campos críticos faltantes */}
              {criticalMissing.length > 0 && (
                <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-2">
                  <p className="text-accent-red font-medium text-xs flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3 w-3 animate-pulse" />
                    {criticalMissing.length} campos críticos ausentes
                  </p>
                  <div className="space-y-1">
                    {criticalMissing.map((field, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-1 h-1 bg-accent-red rounded-full animate-pulse"></span>
                        <span className="text-red-200">{field.label}</span>
                        <span className="text-accent-red/70 text-[10px]">OBRIGATÓRIO</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Campos importantes faltantes */}
              {importantMissing.length > 0 && (
                <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-lg p-2">
                  <p className="text-accent-orange font-medium text-xs flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3" />
                    {importantMissing.length} campos importantes ausentes
                  </p>
                  <div className="space-y-1">
                    {importantMissing.map((field, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-1 h-1 bg-accent-orange rounded-full"></span>
                        <span className="text-orange-200">{field.label}</span>
                        <span className="text-accent-orange/70 text-[10px]">RECOMENDADO</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Status completo */}
              {!hasIssues && (
                <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-2">
                  <p className="text-green-400 font-medium text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Perfil completo para relatórios
                  </p>
                  <p className="text-green-200 text-xs mt-1">
                    Todos os campos necessários estão preenchidos
                  </p>
                </div>
              )}
              
              {/* Footer */}
              <div className="text-center pt-1 border-t border-white/10">
                <p className="text-xs text-gray-300">
                  Campos completos melhoram a precisão dos relatórios
                </p>
              </div>
            </div>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}, (prevProps, nextProps) => prevProps.customer.id === nextProps.customer.id);

const LGPDBadge = React.memo(({ hasPermission }: { hasPermission: boolean }) => {
  return (
    <div className="flex justify-center items-center w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className={cn(
                "flex items-center gap-1 transition-all duration-200 hover:scale-105 border backdrop-blur-sm cursor-pointer text-sm font-semibold px-3 py-1",
                hasPermission
                  ? "bg-green-400/20 text-green-300 border-green-400/40 shadow-lg shadow-green-400/10"
                  : "bg-accent-red/20 text-red-300 border-accent-red/40 shadow-lg shadow-accent-red/10 lgpd-soft-pulse"
              )}
            >
              {hasPermission ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 lgpd-soft-pulse" />}
              {hasPermission ? "LGPD ✓" : "Pendente"}
            </Badge>
          </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent className="z-[50000] bg-black/95 backdrop-blur-xl border border-primary-yellow/30 shadow-2xl">
            <div className="space-y-2 p-1">
              <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                <Shield className="h-3 w-3 text-primary-yellow" />
                <span className="font-semibold text-white text-xs">Status LGPD</span>
              </div>
              
              {hasPermission ? (
                <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-2">
                  <p className="text-green-300 font-medium text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Autorização Concedida
                  </p>
                  <p className="text-green-200 text-[10px] mt-1">
                    Cliente pode receber comunicações de marketing
                  </p>
                </div>
              ) : (
                <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-2">
                  <p className="text-red-300 font-medium text-xs flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 lgpd-soft-pulse" />
                    Autorização Pendente
                  </p>
                  <p className="text-red-200 text-[10px] mt-1">
                    Necessário consentimento para marketing
                  </p>
                </div>
              )}
              
              <div className="text-center pt-1 border-t border-white/10">
                <p className="text-xs text-gray-300">
                  Conforme Lei Geral de Proteção de Dados
                </p>
              </div>
            </div>
            </TooltipContent>
          </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
    </div>
  );
}, (prevProps, nextProps) => prevProps.hasPermission === nextProps.hasPermission);

const EnhancedProfileCompleteness = ({ 
  row, 
  onEditClick 
}: { 
  row: CustomerTableRow;
  onEditClick?: (customerId: string) => void; 
}) => {
  // Converter CustomerTableRow para CustomerData format
  const customerData = {
    id: row.id,
    name: row.cliente,
    email: row.email,
    phone: row.phone,
    address: row.cidade ? { city: row.cidade } : null,
    birthday: row.proximoAniversario ? row.proximoAniversario.toISOString() : null,
    first_purchase_date: null,
    last_purchase_date: row.ultimaCompra,
    purchase_frequency: null,
    favorite_category: row.categoriaFavorita,
    favorite_product: null,
    notes: null,
    contact_permission: row.contactPermission,
    created_at: row.createdAt.toISOString()
  };

  // Usar cálculo direto em vez do hook para garantir funcionamento
  const completeness = React.useMemo(() => {
    try {
      return calculateCompleteness(customerData);
    } catch (error) {
      console.error('Erro ao calcular completude:', error);
      return null;
    }
  }, [customerData]);
  
  if (!completeness) {
    return (
      <div className="flex items-center gap-2 min-w-[80px] text-gray-400">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs">N/A</span>
      </div>
    );
  }

  // Para tabela, usar versão compacta com mais informações no tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-2 min-w-[100px] cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onEditClick?.(row.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEditClick?.(row.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Editar perfil de ${row.name}, completude: ${completeness.percentage}%`}
          >
            <div className="flex-1">
              <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                <div 
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    completeness.level === 'excellent' ? 'bg-gradient-to-r from-primary-yellow to-yellow-400' :
                    completeness.level === 'good' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                    completeness.level === 'fair' ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                    'bg-gradient-to-r from-red-500 to-red-400'
                  )}
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={cn(
                "text-xs font-medium",
                completeness.level === 'excellent' ? 'text-primary-yellow' :
                completeness.level === 'good' ? 'text-green-400' :
                completeness.level === 'fair' ? 'text-yellow-400' :
                'text-red-400'
              )}>
                {completeness.percentage}%
              </span>
              {completeness.criticalMissing.length > 0 && (
                <AlertTriangle className="h-3 w-3 text-red-400" />
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="left" className="max-w-sm z-[50000] bg-gray-900 border-gray-700">
            <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Completude do Perfil</span>
              <span className={cn(
                "font-bold",
                completeness.level === 'excellent' ? 'text-primary-yellow' :
                completeness.level === 'good' ? 'text-green-400' :
                completeness.level === 'fair' ? 'text-yellow-400' :
                'text-red-400'
              )}>
                {completeness.percentage}%
              </span>
            </div>
            
            <div className="text-xs text-gray-300">
              {completeness.presentFields.length} de {completeness.presentFields.length + completeness.missingFields.length} campos preenchidos
            </div>

            {completeness.criticalMissing.length > 0 && (
              <div className="text-xs text-red-400">
                ⚠️ {completeness.criticalMissing.length} campos críticos ausentes:
                <br />
                {completeness.criticalMissing.map(f => f.label).join(', ')}
              </div>
            )}

            {completeness.recommendations.length > 0 && (
              <div className="text-xs text-blue-400">
                💡 {completeness.recommendations[0]}
              </div>
            )}

            <div className="text-xs text-gray-400 border-t border-gray-600 pt-1">
              Clique para editar perfil
            </div>
            </div>
            </TooltipContent>
          </TooltipPortal>
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
        <TooltipPortal>
          <TooltipContent className="z-[50000] bg-gray-900 border-gray-700">
          <p>
            {daysAgo === null 
              ? "Cliente nunca teve contato registrado" 
              : `Último contato há ${daysAgo} dia${daysAgo === 1 ? '' : 's'}`
            }
          </p>
            </TooltipContent>
          </TooltipPortal>
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
        <TooltipPortal>
          <TooltipContent className="z-[50000] bg-gray-900 border-gray-700">
          <p>
            {amount === 0 
              ? "Cliente não possui valores em aberto" 
              : `Valor total em aberto: ${formatCurrency(amount)}`
            }
          </p>
            </TooltipContent>
          </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

type SortField = 'cliente' | 'ultimaCompra' | 'insightsCount' | 'status' | 'diasParaAniversario' | 'profileCompleteness' | 'diasSemContato' | 'valorEmAberto' | null;
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
              <CustomerNameWithIndicators customer={customer} />
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
          <span className="text-gray-100">{value || "Não definida"}</span>
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
            {value}
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
          <span className="text-gray-100">{formatPaymentMethod(value)}</span>
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
        key: 'insightsCount',
        title: 'Insights de IA',
        sortable: true,
        width: '135px',
        align: 'center',
        render: (value, customer) => (
          <InsightsBadge
            count={customer.insightsCount}
            confidence={customer.insightsConfidence}
          />
        ),
      },
      {
        key: 'status',
        title: 'Status',
        sortable: false,
        width: '110px',
        align: 'center',
        render: (value, customer) => (
          <StatusBadge
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
          <LGPDBadge hasPermission={value as boolean} />
        ),
      },
      {
        key: 'profileCompleteness',
        title: 'Completude',
        sortable: true,
        width: '120px',
        align: 'center',
        render: (value, customer) => (
          <EnhancedProfileCompleteness
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
          <LastContactBadge
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
          <OutstandingAmountBadge amount={value as number} />
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