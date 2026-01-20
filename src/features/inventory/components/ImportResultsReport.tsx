/**
 * Relatório de Resultados da Importação CSV
 * Mostra estatísticas e detalhes dos produtos importados
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/primitives/table';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download,
  FileText,
  TrendingUp,
  Package,
  DollarSign
} from 'lucide-react';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { cn } from '@/core/config/utils';
import { getValueClasses } from '@/core/config/theme-utils';
import { formatCurrency } from '@/core/config/utils';
import { Product } from '@/core/types/inventory.types';
import type { ImportResult } from '../hooks/useCsvImport';

interface ImportResultsReportProps {
  result: ImportResult | null;
  onReset: () => void;
  onExportReport?: () => void;
  onClose?: () => void;
}

export const ImportResultsReport: React.FC<ImportResultsReportProps> = ({
  result,
  onReset,
  onExportReport,
  onClose
}) => {
  const valueClasses = getValueClasses('sm', 'gold');
  
  if (!result) {
    return (
      <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-xl flex flex-col items-center justify-center">
         <FileText className="h-12 w-12 text-zinc-600 mb-4" />
         <p className="text-zinc-400">Nenhum resultado de importação disponível</p>
      </div>
    );
  }
  
  // Calcular estatísticas adicionais
  const successRate = result.totalProcessed > 0 
    ? (result.successCount / result.totalProcessed) * 100 
    : 0;
  
  const totalValue = result.insertedProducts.reduce((sum, product) => 
    sum + ((product.price || 0) * (product.stock_quantity || 0)), 0
  );
  
  const uniqueCategories = new Set(
    result.insertedProducts.map(p => p.category).filter(Boolean)
  ).size;
  
  const uniqueSuppliers = new Set(
    result.insertedProducts.map(p => p.supplier).filter(Boolean)
  ).size;
  
  return (
    <div className="space-y-6">
      
      {/* Status Geral */}
      <Card className={cn(
        "border transition-all duration-300",
        result.success 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-rose-500/5 border-rose-500/20"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={cn(
               "p-3 rounded-full",
               result.success ? "bg-emerald-500/10" : "bg-rose-500/10"
            )}>
               {result.success ? (
                 <CheckCircle2 className="h-8 w-8 text-emerald-500" />
               ) : (
                 <XCircle className="h-8 w-8 text-rose-500" />
               )}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "text-xl font-bold flex items-center gap-2",
                result.success ? "text-emerald-500" : "text-rose-500"
              )}>
                {result.success ? 'Importação Concluída com Sucesso!' : 'Importação Concluída com Erros'}
              </h3>
              <p className="text-zinc-400 mt-1 text-sm">
                Processamento finalizado. Veja os detalhes abaixo.
              </p>
              
              <div className="mt-4 flex flex-col gap-2">
                 <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-zinc-500">
                    <span>Progresso</span>
                    <span>{successRate.toFixed(1)}% Sucesso</span>
                 </div>
                 <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                    <div 
                       className="bg-emerald-500 h-full transition-all duration-1000" 
                       style={{ width: `${successRate}%` }} 
                    />
                    <div 
                       className="bg-rose-500 h-full transition-all duration-1000" 
                       style={{ width: `${100 - successRate}%` }} 
                    />
                 </div>
                 <div className="flex gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                       <div className="h-2 w-2 rounded-full bg-emerald-500" />
                       <span className="font-mono text-white">{result.successCount}</span> importados
                    </div>
                    {result.errorCount > 0 && (
                       <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <div className="h-2 w-2 rounded-full bg-rose-500" />
                          <span className="font-mono text-white">{result.errorCount}</span> erros
                       </div>
                    )}
                 </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Produtos Importados"
          value={result.successCount.toString()}
          icon={Package}
          variant="success"
          description={`${result.totalProcessed} processados`}
        />
        
        <StatCard
          title="Taxa de Sucesso"
          value={`${successRate.toFixed(1)}%`}
          icon={TrendingUp}
          variant={successRate === 100 ? "success" : successRate >= 80 ? "warning" : "error"}
        />
        
        <StatCard
          title="Valor Total"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
          variant="purple"
          description="Estoque importado"
        />
        
        <StatCard
          title="Categorias"
          value={uniqueCategories.toString()}
          icon={FileText}
          variant="default"
          description={`${uniqueSuppliers} fornecedores`}
        />
      </div>
      
      {/* Avisos e Erros */}
      {result.warnings.length > 0 && (
        <Alert className="border-amber-500/20 bg-amber-500/5 text-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="ml-2">
            <strong>Atenção:</strong> {result.warnings.length} alertas foram gerados durante a importação.
          </AlertDescription>
        </Alert>
      )}
      
      {result.errors.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl overflow-hidden">
           <div className="px-4 py-3 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                 <XCircle className="h-4 w-4" />
                 Erros Encontrados ({result.errors.length})
              </h4>
           </div>
           <div className="max-h-40 overflow-y-auto p-4 custom-scrollbar">
              <ul className="space-y-2">
                 {result.errors.map((error, idx) => (
                    <li key={idx} className="text-xs text-rose-200 font-mono flex gap-2">
                       <span className="text-rose-500/50 select-none">•</span>
                       {error}
                    </li>
                 ))}
              </ul>
           </div>
        </div>
      )}

      {/* Tabela de Produtos Importados (Amostra) */}
      {result.insertedProducts.length > 0 && (
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <Package className="h-5 w-5 text-emerald-500" />
              Produtos Importados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-500">Produto</TableHead>
                    <TableHead className="text-zinc-500">Categoria</TableHead>
                    <TableHead className="text-zinc-500">Fornecedor</TableHead>
                    <TableHead className="text-right text-zinc-500">Preço</TableHead>
                    <TableHead className="text-center text-zinc-500">Estoque</TableHead>
                    <TableHead className="text-zinc-500">Giro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.insertedProducts.slice(0, 20).map((product: Product, idx) => (
                    <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-zinc-200">
                        {product.name}
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 text-zinc-400 bg-white/5">
                          {product.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-zinc-200">
                          {product.supplier || '-'}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <span className={cn(valueClasses, "text-emerald-500")}>
                          {formatCurrency(product.price || 0)}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className={cn(valueClasses)}>
                          {product.stock_quantity || 0}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={cn(
                          product.turnover_rate === 'fast' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : product.turnover_rate === 'slow'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20'
                        )}>
                          {product.turnover_rate === 'fast' ? 'Rápido' : 
                           product.turnover_rate === 'slow' ? 'Devagar' : 'Médio'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {result.insertedProducts.length > 20 && (
              <div className="mt-4 text-center text-zinc-400 text-sm pb-4">
                Mostrando 20 de {result.insertedProducts.length} produtos importados
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Resumo de Categorias e Fornecedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Categorias */}
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-sm">
              Categorias Importadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(result.insertedProducts.map(p => p.category).filter(Boolean)))
                .slice(0, 8)
                .map((category, index) => {
                  const count = result.insertedProducts.filter(p => p.category === category).length;
                  return (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-zinc-200 text-sm">{category}</span>
                      <Badge variant="outline" className="text-xs border-white/10 text-zinc-400">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
        
        {/* Fornecedores */}
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-sm">
              Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(result.insertedProducts.map(p => p.supplier).filter(Boolean)))
                .slice(0, 8)
                .map((supplier, index) => {
                  const count = result.insertedProducts.filter(p => p.supplier === supplier).length;
                  return (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-zinc-200 text-sm">{supplier}</span>
                      <Badge variant="outline" className="text-xs border-white/10 text-zinc-400">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Ações Finais */}
      <div className="flex justify-center">
        <Button
          onClick={onReset}
          className="bg-amber-500 text-zinc-950 hover:bg-amber-500/90 font-semibold"
        >
          Nova Importação
        </Button>
      </div>
    </div>
  );
};