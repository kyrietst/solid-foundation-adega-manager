/**
 * Tabela de Preview dos Dados CSV
 * Mostra prévia dos dados antes da importação
 * Migrado para usar o DataTable genérico (Fase 2.1 refatoração DRY)
 */

import React from 'react';
import { Badge } from '@/shared/ui/primitives/badge';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Eye,
  Package
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getValueClasses } from '@/core/config/theme-utils';
import { DataTable } from '@/shared/ui/composite/DataTable';
import { DataTableColumn } from '@/shared/hooks/common/useDataTable';
import { CurrencyDisplay } from '@/shared/ui/composite/FormatDisplay';
import { parseMonetaryValue, parseVolumeToMl, parsePackageInfo } from '../utils/csvUtils';
import type { CsvImportPreview } from '../utils/csvParser';

interface CsvPreviewTableProps {
  preview: CsvImportPreview | null;
  isLoading?: boolean;
}

// Tipo para os dados da linha da tabela
type CsvRowData = Record<string, string>;

export const CsvPreviewTable: React.FC<CsvPreviewTableProps> = ({
  preview,
  isLoading = false
}) => {
  const valueClasses = getValueClasses('sm', 'gold');
  
  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-primary-yellow/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary-yellow border-t-transparent rounded-full mr-3" />
            <span className="text-gray-300">Gerando prévia dos dados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!preview) {
    return (
      <Card className="bg-gray-800/50 border-gray-600/30">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum arquivo selecionado para prévia</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Função para formatar valor da célula para exibição
  const formatCellValue = (header: string, value: string) => {
    if (!value || value === '-' || value.trim() === '') {
      return <span className="text-gray-500 italic">-</span>;
    }
    
    // Formatação específica por tipo de coluna
    if (header.includes('Preço') && header.includes('R$')) {
      const numericValue = parseMonetaryValue(value);
      return numericValue ? (
        <CurrencyDisplay 
          value={numericValue}
          className={cn(valueClasses, "text-accent-green")}
        />
      ) : (
        <span className="text-gray-500 italic">-</span>
      );
    }
    
    if (header === 'Volume') {
      const volumeMl = parseVolumeToMl(value);
      return volumeMl ? (
        <span className={cn(valueClasses)}>
          {volumeMl}ml
        </span>
      ) : (
        <span className="text-gray-500 italic">N/A</span>
      );
    }
    
    if (header === 'Venda em (un/pct)') {
      const packageInfo = parsePackageInfo(value);
      return (
        <div className="flex gap-1">
          {packageInfo.sellsIndividually && (
            <Badge variant="outline" className="text-xs border-accent-blue/50 text-accent-blue">
              Unit
            </Badge>
          )}
          {packageInfo.sellsByPackage && (
            <Badge variant="outline" className="text-xs border-primary-yellow/50 text-primary-yellow">
              {packageInfo.packageSize}un
            </Badge>
          )}
        </div>
      );
    }
    
    if (header === 'Categoria') {
      return (
        <Badge className="bg-primary-yellow/20 text-primary-yellow border-primary-yellow/50">
          {value}
        </Badge>
      );
    }
    
    if (header === 'Giro (Vende Rápido/Devagar)') {
      const turnoverClass = value.toLowerCase().includes('rapido') || value.toLowerCase().includes('rápido') 
        ? 'text-accent-green bg-accent-green/20 border-accent-green/50'
        : value.toLowerCase().includes('devagar') 
        ? 'text-accent-red bg-accent-red/20 border-accent-red/50'
        : 'text-gray-400 bg-gray-400/20 border-gray-400/50';
        
      return value ? (
        <Badge className={turnoverClass}>
          {value}
        </Badge>
      ) : (
        <span className="text-gray-500 italic">Médio</span>
      );
    }
    
    return <span className="text-gray-200">{value}</span>;
  };
  
  // Configuração das colunas para o DataTable
  const columns: DataTableColumn<CsvRowData>[] = preview.headers.map((header) => ({
    id: header,
    label: header,
    accessor: header as keyof CsvRowData,
    width: header === 'Nome do Produto' ? '200px' : 
           header.includes('Preço') ? '140px' : 
           header === 'Estoque Atual' ? '120px' : 
           undefined,
    align: header.includes('Preço') ? 'right' as const : 
           header === 'Estoque Atual' ? 'center' as const : 
           undefined,
    render: (value, _row) => formatCellValue(header, String(value || '')),
  }));
  
  return (
    <div className="space-y-6">
      
      {/* Estatísticas da Prévia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-accent-green/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-accent-green" />
              <div>
                <p className="text-accent-green text-sm font-medium">Linhas Válidas</p>
                <p className="text-accent-green text-xl font-bold">
                  {preview.validationSummary.validRows}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-accent-red/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-accent-red" />
              <div>
                <p className="text-accent-red text-sm font-medium">Linhas com Erro</p>
                <p className="text-accent-red text-xl font-bold">
                  {preview.validationSummary.invalidRows}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-primary-yellow/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Info className="h-8 w-8 text-primary-yellow" />
              <div>
                <p className="text-primary-yellow text-sm font-medium">Total de Linhas</p>
                <p className="text-primary-yellow text-xl font-bold">
                  {preview.totalRows}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alertas de Validação */}
      {preview.validationSummary.warnings > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">
            {preview.validationSummary.warnings} avisos encontrados durante a validação. 
            Verifique os dados antes de continuar.
          </AlertDescription>
        </Alert>
      )}
      
      {preview.validationSummary.invalidRows > 0 && (
        <Alert className="border-accent-red/50 bg-accent-red/10">
          <AlertTriangle className="h-4 w-4 text-accent-red" />
          <AlertDescription className="text-accent-red">
            {preview.validationSummary.invalidRows} linhas contêm erros e não serão importadas.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tabela de Prévia - Migrado para DataTable */}
      <Card className="bg-gray-800/50 border-primary-yellow/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <Eye className="h-5 w-5 text-primary-yellow" />
            Prévia dos Dados (primeiras 10 linhas)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<CsvRowData>
            data={preview.sampleData as CsvRowData[]}
            columns={columns}
            loading={false}
            searchPlaceholder="Buscar nos dados da prévia..."
            searchFields={preview.headers as (keyof CsvRowData)[]}
            maxRows={10}
            empty={{
              title: 'Nenhum dado válido encontrado',
              description: 'Nenhum dado válido encontrado para prévia',
              icon: Package,
            }}
            caption="Prévia dos dados CSV importados"
            className="border-0"
          />
          
          {/* Indicador de mais dados */}
          {preview.totalRows > preview.sampleData.length && (
            <div className="p-4 text-center text-gray-400 text-sm border-t border-white/10">
              Mostrando {preview.sampleData.length} de {preview.totalRows} linhas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};