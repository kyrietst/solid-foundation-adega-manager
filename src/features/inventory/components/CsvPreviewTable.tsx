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
      <Card className="bg-zinc-900/50 border-amber-500/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mr-3" />
            <span className="text-zinc-300">Gerando prévia dos dados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!preview) {
    return (
      <Card className="bg-zinc-900/50 border-white/5">
        <CardContent className="p-8">
          <div className="text-center text-zinc-500">
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
      return <span className="text-zinc-600 italic">-</span>;
    }
    
    // Formatação específica por tipo de coluna
    if (header.includes('Preço') && header.includes('R$')) {
      const numericValue = parseMonetaryValue(value);
      return numericValue ? (
        <CurrencyDisplay 
          value={numericValue}
          className={cn(valueClasses, "text-emerald-500")}
        />
      ) : (
        <span className="text-zinc-600 italic">-</span>
      );
    }
    
    if (header === 'Volume') {
      const volumeMl = parseVolumeToMl(value);
      return volumeMl ? (
        <span className={cn(valueClasses)}>
          {volumeMl}ml
        </span>
      ) : (
        <span className="text-zinc-600 italic">N/A</span>
      );
    }
    
    if (header === 'Venda em (un/pct)') {
      const packageInfo = parsePackageInfo(value);
      return (
        <div className="flex gap-1">
          {packageInfo.sellsIndividually && (
            <Badge variant="outline" className="text-xs border-sky-500/30 text-sky-400 bg-sky-500/10">
              Unit
            </Badge>
          )}
          {packageInfo.sellsByPackage && (
            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500 bg-amber-500/10">
              {packageInfo.packageSize}un
            </Badge>
          )}
        </div>
      );
    }
    
    if (header === 'Categoria') {
      return (
        <Badge className="bg-zinc-800 text-zinc-300 border-white/5 hover:bg-zinc-700">
          {value}
        </Badge>
      );
    }
    
    if (header === 'Giro (Vende Rápido/Devagar)') {
      const turnoverClass = value.toLowerCase().includes('rapido') || value.toLowerCase().includes('rápido') 
        ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        : value.toLowerCase().includes('devagar') 
        ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
        : 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        
      return value ? (
        <Badge variant="outline" className={turnoverClass}>
          {value}
        </Badge>
      ) : (
        <span className="text-zinc-600 italic">Médio</span>
      );
    }
    
    return <span className="text-zinc-300">{value}</span>;
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
        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-zinc-800 p-2 rounded-md">
                 <FileText className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex flex-col">
                 <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total de Linhas</span>
                 <span className="text-xl font-bold text-white font-mono">{preview.totalRows}</span>
              </div>
           </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-md">
                 <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                 <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Válidos</span>
                 <span className="text-xl font-bold text-white font-mono">{preview.validationSummary.validRows}</span>
              </div>
           </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-rose-500/10 p-2 rounded-md">
                 <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <div className="flex flex-col">
                 <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Inválidos</span>
                 <span className="text-xl font-bold text-white font-mono">{preview.validationSummary.invalidRows}</span>
              </div>
           </div>
        </div>
      </div>
      
      {/* Alertas de Validação */}
      {preview.headers.some(h => !['Nome do Produto', 'Volume', 'Categoria', 'Venda em (un/pct)', 'Estoque Atual', 'Fornecedor', 'Preço de Custo', 'Preço de Venda Atual (un.)', 'Margem de Lucro (un.)', 'Preço de Venda Atual (pct)', 'Margem de Lucro (pct)', 'Giro (Vende Rápido/Devagar)'].includes(h)) && (
         <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-200">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="ml-2">
               Algumas colunas do CSV não correspondem ao formato padrão esperado. Verifique se o mapeamento está correto.
            </AlertDescription>
         </Alert>
      )}

      {preview.validationSummary.warnings > 0 && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-500">
            {preview.validationSummary.warnings} avisos encontrados durante a validação. 
            Verifique os dados antes de continuar.
          </AlertDescription>
        </Alert>
      )}
      
      {preview.validationSummary.invalidRows > 0 && (
        <Alert className="border-rose-500/50 bg-rose-500/10">
          <AlertTriangle className="h-4 w-4 text-rose-500" />
          <AlertDescription className="text-rose-500">
            {preview.validationSummary.invalidRows} linhas contêm erros e não serão importadas.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tabela de Prévia - Migrado para DataTable */}
      <Card className="bg-zinc-900/50 border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Eye className="h-5 w-5 text-amber-500" />
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
            <div className="p-4 text-center text-zinc-400 text-sm border-t border-white/10">
              Mostrando {preview.sampleData.length} de {preview.totalRows} linhas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};