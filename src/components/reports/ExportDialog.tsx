import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileSpreadsheet, FileType2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ExportFormat = 'pdf' | 'csv' | 'excel';

interface ExportDialogProps {
  title: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    format?: (value: any) => string;
    width?: number;
  }[];
  filters?: Record<string, any>;
  dateRange?: { from?: Date; to?: Date };
  onExport?: (format: ExportFormat, options: { includeFilters: boolean }) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ExportDialog = ({
  title,
  data = [],
  columns = [],
  filters = {},
  dateRange = {},
  onExport,
  disabled = false,
  children,
}: ExportDialogProps) => {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (data.length === 0 || !onExport) return;
    
    try {
      setIsExporting(true);
      await onExport(format, { includeFilters });
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (fmt: ExportFormat) => {
    switch (fmt) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'csv':
        return <FileType2 className="h-5 w-5" />;
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getFormatDescription = (fmt: ExportFormat) => {
    switch (fmt) {
      case 'pdf':
        return 'Ideal para impressão e compartilhamento';
      case 'csv':
        return 'Formato de texto separado por vírgulas';
      case 'excel':
        return 'Planilha do Excel (XLSX)';
      default:
        return '';
    }
  };

  const formatDateRange = () => {
    if (!dateRange?.from && !dateRange?.to) return 'Período não especificado';
    
    const formattedFrom = dateRange.from 
      ? format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
      : 'Data inicial';
      
    const formattedTo = dateRange.to 
      ? format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })
      : 'Data final';
      
    return `${formattedFrom} - ${formattedTo}`;
  };

  const activeFilters = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
    .map(([key]) => key);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" disabled={disabled}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Relatório</DialogTitle>
          <DialogDescription>
            Selecione o formato e as opções para exportação do relatório.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Formato de Exportação</Label>
            <RadioGroup 
              value={format} 
              onValueChange={(value) => setFormat(value as ExportFormat)}
              className="grid grid-cols-3 gap-4"
            >
              {(['pdf', 'excel', 'csv'] as ExportFormat[]).map((fmt) => (
                <div key={fmt}>
                  <RadioGroupItem value={fmt} id={fmt} className="peer sr-only" />
                  <Label
                    htmlFor={fmt}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    {getFormatIcon(fmt)}
                    <span className="mt-2 capitalize">{fmt}</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {getFormatDescription(fmt)}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-filters" 
                checked={includeFilters} 
                onCheckedChange={(checked) => setIncludeFilters(checked === true)}
              />
              <Label htmlFor="include-filters" className="text-sm font-medium leading-none">
                Incluir informações dos filtros
              </Label>
            </div>
            
            {includeFilters && (
              <div className="rounded-lg border p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-2">Filtros Aplicados</h4>
                <div className="space-y-2">
                  {dateRange && (dateRange.from || dateRange.to) && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium w-24 text-muted-foreground">Período:</span>
                      <span>{formatDateRange()}</span>
                    </div>
                  )}
                  
                  {activeFilters.length > 0 ? (
                    activeFilters.map((filterKey) => (
                      <div key={filterKey} className="flex items-center text-sm">
                        <span className="font-medium w-24 text-muted-foreground capitalize">
                          {filterKey.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span>{String(filters[filterKey])}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum filtro adicional aplicado</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Total de registros: {data.length.toLocaleString('pt-BR')}</p>
              <p>Gerado em: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isExporting}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || data.length === 0}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
