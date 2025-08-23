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
  DollarSign,
  Info
} from 'lucide-react';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { cn } from '@/core/config/utils';
import { getValueClasses } from '@/core/config/theme-utils';
import { formatCurrency } from '@/core/config/utils';
import type { ImportResult } from '../hooks/useCsvImport';

interface ImportResultsReportProps {
  result: ImportResult | null;
  onReset: () => void;
  onExportReport?: () => void;
}

export const ImportResultsReport: React.FC<ImportResultsReportProps> = ({
  result,
  onReset,
  onExportReport
}) => {
  const valueClasses = getValueClasses('sm', 'gold');
  
  if (!result) {
    return (
      <Card className="bg-gray-800/50 border-gray-600/30">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum resultado de importação disponível</p>
          </div>
        </CardContent>
      </Card>
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
        "border-2",
        result.success 
          ? "bg-accent-green/10 border-accent-green/50" 
          : "bg-accent-red/10 border-accent-red/50"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {result.success ? (
              <CheckCircle2 className="h-12 w-12 text-accent-green" />
            ) : (
              <XCircle className="h-12 w-12 text-accent-red" />
            )}
            <div>
              <h3 className={cn(
                "text-xl font-bold",
                result.success ? "text-accent-green" : "text-accent-red"
              )}>
                {result.success ? 'Importação Concluída com Sucesso!' : 'Importação Concluída com Erros'}
              </h3>
              <p className="text-gray-300 mt-1">
                {result.successCount} de {result.totalProcessed} produtos importados
                {!result.success && ` (${result.errorCount} erros)`}
              </p>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-gray-700 rounded-full w-48">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-500",
                        result.success ? "bg-accent-green" : "bg-yellow-500"
                      )}
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    result.success ? "text-accent-green" : "text-yellow-500"
                  )}>
                    {successRate.toFixed(1)}%
                  </span>
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
          subtitle={`${result.totalProcessed} processados`}
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
          subtitle="Estoque importado"
        />
        
        <StatCard
          title="Categorias"
          value={uniqueCategories.toString()}
          icon={FileText}
          variant="default"
          subtitle={`${uniqueSuppliers} fornecedores`}
        />
      </div>
      
      {/* Avisos e Erros */}
      {result.warnings.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">
            <strong>Avisos ({result.warnings.length}):</strong>
            <ul className="mt-2 space-y-1">
              {result.warnings.slice(0, 5).map((warning, index) => (
                <li key={index} className="text-sm">• {warning}</li>
              ))}
              {result.warnings.length > 5 && (
                <li className="text-sm italic">... e mais {result.warnings.length - 5} avisos</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {result.errors.length > 0 && (
        <Alert className="border-accent-red/50 bg-accent-red/10">
          <XCircle className="h-4 w-4 text-accent-red" />
          <AlertDescription className="text-accent-red">
            <strong>Erros ({result.errors.length}):</strong>
            <ul className="mt-2 space-y-1">
              {result.errors.slice(0, 5).map((error, index) => (
                <li key={index} className="text-sm">• {error}</li>
              ))}
              {result.errors.length > 5 && (
                <li className="text-sm italic">... e mais {result.errors.length - 5} erros</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Produtos Importados com Sucesso */}
      {result.insertedProducts.length > 0 && (
        <Card className="bg-gray-800/50 border-primary-yellow/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent-green" />
                Produtos Importados ({result.insertedProducts.length})
              </div>
              {onExportReport && (
                <Button
                  onClick={onExportReport}
                  variant="outline"
                  size="sm"
                  className="border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Produto</TableHead>
                    <TableHead className="text-gray-300">Categoria</TableHead>
                    <TableHead className="text-gray-300">Fornecedor</TableHead>
                    <TableHead className="text-gray-300 text-right">Preço</TableHead>
                    <TableHead className="text-gray-300 text-center">Estoque</TableHead>
                    <TableHead className="text-gray-300">Giro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.insertedProducts.slice(0, 20).map((product, index) => (
                    <TableRow key={index} className="border-gray-700 hover:bg-gray-800/30">
                      <TableCell>
                        <div>
                          <p className="text-gray-200 font-medium">{product.name}</p>
                          {product.volume_ml && (
                            <p className="text-xs text-gray-400">{product.volume_ml}ml</p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className="bg-primary-yellow/20 text-primary-yellow border-primary-yellow/50">
                          {product.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-gray-200">
                          {product.supplier || '-'}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <span className={cn(valueClasses, "text-accent-green")}>
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
                            ? 'bg-accent-green/20 text-accent-green border-accent-green/50'
                            : product.turnover_rate === 'slow'
                            ? 'bg-accent-red/20 text-accent-red border-accent-red/50'
                            : 'bg-gray-400/20 text-gray-400 border-gray-400/50'
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
              <div className="mt-4 text-center text-gray-400 text-sm">
                Mostrando 20 de {result.insertedProducts.length} produtos importados
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Resumo de Categorias e Fornecedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Categorias */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-gray-100 text-sm">
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
                      <span className="text-gray-200 text-sm">{category}</span>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
        
        {/* Fornecedores */}
        <Card className="bg-gray-800/50 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-gray-100 text-sm">
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
                      <span className="text-gray-200 text-sm">{supplier}</span>
                      <Badge variant="outline" className="text-xs">
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
          className="bg-primary-yellow text-gray-900 hover:bg-primary-yellow/90 font-semibold"
        >
          Nova Importação
        </Button>
      </div>
    </div>
  );
};