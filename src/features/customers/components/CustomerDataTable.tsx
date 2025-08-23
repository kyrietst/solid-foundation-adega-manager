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

const InsightsBadge = ({ 
  count, 
  confidence 
}: { 
  count: number; 
  confidence: number; 
}) => {
  if (count === 0) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-sm font-bold px-3 py-1 bg-gray-600/30 text-gray-100 border-gray-500/60">
        <Brain className="w-3 h-3" />
        Sem insights
      </Badge>
    );
  }
  
  const level = getInsightLevel(confidence);
  const color = getInsightColor(level);
  
  // Sistema de cores Adega Wine Cellar v2.1 - Insights IA
  const badgeClass = {
    green: "bg-green-500/30 text-green-100 border-green-400/60 shadow-lg shadow-green-400/20 backdrop-blur-sm font-bold",
    yellow: "bg-yellow-500/30 text-yellow-100 border-yellow-400/60 shadow-lg shadow-yellow-400/20 backdrop-blur-sm font-bold",
    red: "bg-red-500/30 text-red-100 border-red-400/60 shadow-lg shadow-red-400/20 backdrop-blur-sm animate-pulse font-bold"
  };
  
  return (
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
  );
};

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

const StatusBadge = ({ 
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
    red: "bg-accent-red/20 text-red-300 border-accent-red/40 shadow-lg shadow-accent-red/10 backdrop-blur-sm animate-pulse",
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
};

// Componente interativo para nome do cliente com indicadores visuais
const CustomerNameWithIndicators = ({ 
  customer 
}: { 
  customer: CustomerTableRow; 
}) => {
  const reportFields = [
    { key: 'email', label: 'Email', value: customer.email, required: true },
    { key: 'phone', label: 'Telefone', value: customer.telefone, required: true },
    { key: 'birthday', label: 'Aniversário', value: customer.aniversario, required: false },
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
};

const LGPDBadge = ({ hasPermission }: { hasPermission: boolean }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={cn(
              "flex items-center gap-1 transition-all duration-200 hover:scale-105 border backdrop-blur-sm cursor-pointer text-sm font-semibold px-3 py-1", 
              hasPermission 
                ? "bg-green-400/20 text-green-300 border-green-400/40 shadow-lg shadow-green-400/10" 
                : "bg-accent-red/20 text-red-300 border-accent-red/40 shadow-lg shadow-accent-red/10 animate-pulse"
            )}
          >
            {hasPermission ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 animate-pulse" />}
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
                    <AlertTriangle className="h-3 w-3 animate-pulse" />
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
  );
};

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
    email: null, // Será atualizado quando tivermos este campo
    phone: null, // Será atualizado quando tivermos este campo  
    address: row.cidade ? { city: row.cidade } : null,
    birthday: row.proximoAniversario,
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
      <div className="my-6 space-y-4 p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Carregando dados dos clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 space-y-4 p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-red-400">
            <p>Erro ao carregar dados dos clientes</p>
            <p className="text-sm text-gray-400 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="bg-black/40 rounded-lg border border-white/10 flex-1 min-h-0 overflow-visible relative w-full">
        <div className="h-full overflow-y-auto overflow-x-visible max-h-[60vh] scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 w-full">
          <Table className="w-full table-fixed">
          <TableHeader className="sticky top-0 z-[50] bg-black/90 backdrop-blur-xl border-b border-primary-yellow/20">
            <TableRow className="border-b border-primary-yellow/30 bg-gradient-to-r from-black/40 via-black/60 to-black/40 hover:from-black/50 hover:via-black/70 hover:to-black/50 transition-all duration-200">
            {visibleColumns.includes("Cliente") && (
              <TableHead className="w-[200px] text-gray-100 font-bold text-left px-4 py-4 shadow-sm">
                <div className="flex justify-start">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('cliente')}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-black/20 border border-gray-700/50 hover:bg-gray-800/60 text-gray-300 hover:text-yellow-400 rounded-md transition-colors duration-200 text-xs"
                  >
                    Cliente
                    {getSortIcon('cliente')}
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Categoria Favorita") && (
              <TableHead className="w-[130px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-black/20 border border-gray-700/50 hover:bg-gray-800/60 text-gray-300 hover:text-yellow-400 rounded-md transition-colors duration-200 cursor-default text-xs"
                  >
                    Categoria
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Segmento") && (
              <TableHead className="w-[120px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-black/30 border border-gray-600/50 hover:bg-primary-yellow/10 text-gray-300 hover:text-primary-yellow rounded-lg transition-all duration-200 cursor-default text-sm font-medium"
                  >
                    Segmento
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Método Preferido") && (
              <TableHead className="w-[125px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-black/30 border border-gray-600/50 hover:bg-primary-yellow/10 text-gray-300 hover:text-primary-yellow rounded-lg transition-all duration-200 cursor-default text-sm font-medium"
                  >
                    Método
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Última Compra") && (
              <TableHead className="w-[140px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('ultimaCompra')}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-black/30 border border-gray-600/50 hover:bg-primary-yellow/10 text-gray-300 hover:text-primary-yellow rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Última Compra
                    {getSortIcon('ultimaCompra')}
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Insights de IA") && (
              <TableHead className="w-[135px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('insightsCount')}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-black/30 border border-gray-600/50 hover:bg-primary-yellow/10 text-gray-300 hover:text-primary-yellow rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Insights
                    {getSortIcon('insightsCount')}
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Status") && (
              <TableHead className="w-[110px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-black/30 border border-gray-600/50 hover:bg-primary-yellow/10 text-gray-300 hover:text-primary-yellow rounded-lg transition-all duration-200 cursor-default text-sm font-medium"
                  >
                    Status
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Cidade") && (
              <TableHead className="w-[115px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('cidade')}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-black/20 border border-gray-700/50 hover:bg-gray-800/60 text-gray-300 hover:text-yellow-400 rounded-md transition-colors duration-200 text-xs"
                  >
                    Cidade
                    {getSortIcon('cidade')}
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Próximo Aniversário") && (
              <TableHead className="w-[150px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('diasParaAniversario')}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-black/20 border border-gray-700/50 hover:bg-gray-800/60 text-gray-300 hover:text-yellow-400 rounded-md transition-colors duration-200 text-xs"
                  >
                    Aniversário
                    {getSortIcon('diasParaAniversario')}
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("LGPD") && (
              <TableHead className="w-[90px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-black/20 border border-gray-700/50 hover:bg-gray-800/60 text-gray-300 hover:text-yellow-400 rounded-md transition-colors duration-200 cursor-default text-xs"
                  >
                    LGPD
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Completude") && (
              <TableHead className="w-[120px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('profileCompleteness')}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-black/20 border border-gray-700/50 hover:bg-gray-800/60 text-gray-300 hover:text-yellow-400 rounded-md transition-colors duration-200 text-xs"
                  >
                    Completude
                    {getSortIcon('profileCompleteness')}
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Último Contato") && (
              <TableHead className="w-[130px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('diasSemContato')}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-black/20 border border-gray-700/50 hover:bg-gray-800/60 text-gray-300 hover:text-yellow-400 rounded-md transition-colors duration-200 text-xs"
                  >
                    Último Contato
                    {getSortIcon('diasSemContato')}
                  </Button>
                </div>
              </TableHead>
            )}
            {visibleColumns.includes("Valor em Aberto") && (
              <TableHead className="w-[130px] text-gray-100 font-bold text-center px-3 py-4 shadow-sm">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('valorEmAberto')}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-black/20 border border-gray-700/50 hover:bg-gray-800/60 text-gray-300 hover:text-yellow-400 rounded-md transition-colors duration-200 text-xs"
                  >
                    Valor em Aberto
                    {getSortIcon('valorEmAberto')}
                  </Button>
                </div>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedData.length ? (
            filteredAndSortedData.map((customer, index) => (
              <TableRow 
                key={customer.id}
                className={cn(
                  "border-b border-primary-yellow/20 transition-all duration-300 group cursor-pointer relative",
                  "hover:bg-gradient-to-r hover:from-primary-yellow/10 hover:via-primary-yellow/5 hover:to-primary-yellow/10",
                  "hover:border-primary-yellow/40 hover:shadow-lg hover:shadow-primary-yellow/10",
                  "hover:scale-[1.01] hover:z-10",
                  index % 2 === 0 ? 'bg-black/30 backdrop-blur-sm' : 'bg-black/50 backdrop-blur-sm'
                )}
              >
                {visibleColumns.includes("Cliente") && (
                  <TableCell className="font-medium whitespace-nowrap py-4 px-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar com gradient Adega Wine Cellar */}
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-yellow/30 to-yellow-400/20 rounded-full flex items-center justify-center border border-primary-yellow/30 shadow-sm">
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
                  </TableCell>
                )}
                {visibleColumns.includes("Categoria Favorita") && (
                  <TableCell className="whitespace-nowrap text-gray-100 py-4 px-3 text-center">
                    {customer.categoriaFavorita || "Não definida"}
                  </TableCell>
                )}
                {visibleColumns.includes("Segmento") && (
                  <TableCell className="whitespace-nowrap py-4 px-3 text-center">
                    <Badge variant="outline" className="bg-gray-700/50 text-gray-100 border-gray-600/50 text-sm font-medium px-3 py-1">{customer.segmento}</Badge>
                  </TableCell>
                )}
                {visibleColumns.includes("Método Preferido") && (
                  <TableCell className="whitespace-nowrap text-gray-100 py-4 px-3 text-center">
                    {formatPaymentMethod(customer.metodoPreferido)}
                  </TableCell>
                )}
                {visibleColumns.includes("Última Compra") && (
                  <TableCell className="whitespace-nowrap text-gray-100 py-4 px-3 text-center">
                    {formatLastPurchase(customer.ultimaCompra)}
                  </TableCell>
                )}
                {visibleColumns.includes("Insights de IA") && (
                  <TableCell className="py-4 px-3 text-center">
                    <InsightsBadge 
                      count={customer.insightsCount}
                      confidence={customer.insightsConfidence}
                    />
                  </TableCell>
                )}
                {visibleColumns.includes("Status") && (
                  <TableCell className="whitespace-nowrap py-4 px-3 text-center">
                    <StatusBadge 
                      status={customer.status}
                      color={customer.statusColor}
                    />
                  </TableCell>
                )}
                {visibleColumns.includes("Cidade") && (
                  <TableCell className="whitespace-nowrap text-gray-100 py-4 px-3 text-center">
                    {customer.cidade || "Não informada"}
                  </TableCell>
                )}
                {visibleColumns.includes("Próximo Aniversário") && (
                  <TableCell className="whitespace-nowrap py-4 px-3 text-center">
                    <div className={cn("flex items-center gap-1", 
                      customer.diasParaAniversario !== null && customer.diasParaAniversario <= 7 
                        ? "text-yellow-400 font-medium" 
                        : "text-gray-100"
                    )}>
                      {formatNextBirthday(customer.proximoAniversario, customer.diasParaAniversario)}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes("LGPD") && (
                  <TableCell className="py-4 px-3 text-center">
                    <LGPDBadge hasPermission={customer.contactPermission} />
                  </TableCell>
                )}
                {visibleColumns.includes("Completude") && (
                  <TableCell className="py-4 px-3 text-center">
                    <EnhancedProfileCompleteness 
                      row={customer} 
                      onEditClick={(customerId) => {
                        // TODO: Implementar navegação para edição do cliente
                        console.log(`Editando cliente: ${customerId}`);
                      }}
                    />
                  </TableCell>
                )}
                {visibleColumns.includes("Último Contato") && (
                  <TableCell className="whitespace-nowrap py-4 px-3 text-center">
                    <LastContactBadge 
                      date={customer.ultimoContato}
                      daysAgo={customer.diasSemContato}
                    />
                  </TableCell>
                )}
                {visibleColumns.includes("Valor em Aberto") && (
                  <TableCell className="whitespace-nowrap py-4 px-3 text-center">
                    <OutstandingAmountBadge amount={customer.valorEmAberto} />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow className="border-b border-white/10">
              <TableCell colSpan={visibleColumns.length} className="text-center py-6">
                <div className="flex flex-col items-center gap-2">
                  <User className="w-8 h-8 text-gray-400" />
                  <p className="text-gray-300">Nenhum cliente encontrado.</p>
                  {(segmentFilter || statusFilter || searchTerm || lastPurchaseFilter || birthdayFilter) && (
                    <p className="text-sm text-gray-400">
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
      </div>
    </div>
  );
}