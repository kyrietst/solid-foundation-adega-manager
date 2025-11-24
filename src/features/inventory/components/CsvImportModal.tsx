/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/**
 * Modal de Importação CSV
 * Interface completa para upload, validação e importação de produtos via CSV
 */

import React, { useState, useCallback } from 'react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Progress } from '@/shared/ui/primitives/progress';
import { Badge } from '@/shared/ui/primitives/badge';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { 
  Upload, 
  FileText, 
  Eye, 
  Play, 
  AlertTriangle, 
  CheckCircle2,
  X,
  Download,
  Info,
  Package
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useCsvImport } from '../hooks/useCsvImport';
import { CsvPreviewTable } from './CsvPreviewTable';
import { ImportResultsReport } from './ImportResultsReport';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'import' | 'results'>('upload');
  
  const {
    isUploading,
    isValidating,
    isImporting,
    progress,
    preview,
    parseResult,
    importResult,
    uploadFile,
    generatePreview,
    startImport,
    resetImport
  } = useCsvImport();
  
  // Handlers para drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);
  
  // Handler para seleção de arquivo
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setCurrentStep('preview');
    
    // Upload e validação
    await uploadFile(file);
    
    // Gerar preview
    await generatePreview(file);
  }, [uploadFile, generatePreview]);
  
  // Handler para início da importação
  const handleStartImport = useCallback(async () => {
    setCurrentStep('import');
    await startImport();
    setCurrentStep('results');
  }, [startImport]);
  
  // Handler para reset
  const handleReset = useCallback(() => {
    resetImport();
    setSelectedFile(null);
    setCurrentStep('upload');
  }, [resetImport]);
  
  // Handler para fechar modal
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);
  
  // Calcular progresso atual
  const getProgressPercentage = () => {
    if (!progress) return 0;
    if (progress.total === 0) return 0;
    return (progress.current / progress.total) * 100;
  };
  
  // Renderizar indicador de step
  const renderStepIndicator = () => {
    const steps = [
      { id: 'upload', label: 'Upload', icon: Upload },
      { id: 'preview', label: 'Prévia', icon: Eye },
      { id: 'import', label: 'Importar', icon: Play },
      { id: 'results', label: 'Resultados', icon: CheckCircle2 }
    ];
    
    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
          const StepIcon = step.icon;
          
          return (
            <React.Fragment key={step.id}>
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                isActive ? "bg-primary-yellow border-primary-yellow text-gray-900" :
                isCompleted ? "bg-accent-green border-accent-green text-white" :
                "bg-gray-800 border-gray-600 text-gray-400"
              )}>
                <StepIcon className="h-5 w-5" />
              </div>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2 transition-all",
                  isCompleted ? "bg-accent-green" : "bg-gray-600"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };
  
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          <Package className="h-6 w-6 text-primary-yellow" />
          Importação de Produtos via CSV
        </>
      }
      description="Importe produtos em massa a partir de um arquivo CSV. O sistema suporta conversões automáticas de preços, volumes e cálculos de estoque."
      size="4xl"
      className="max-h-[90vh] overflow-hidden bg-black/95 backdrop-blur-xl border-primary-yellow/30 shadow-2xl"
    >
        
        <div className="space-y-6 overflow-y-auto">
          
          {/* Indicador de Steps */}
          {renderStepIndicator()}
          
          {/* Progress Bar Global */}
          {progress && (
            <Card className="bg-gray-800/50 border-primary-yellow/30">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200 font-medium">{progress.message}</span>
                    <Badge className={cn(
                      progress.phase === 'completed' ? "bg-accent-green/20 text-accent-green" :
                      progress.phase === 'error' ? "bg-accent-red/20 text-accent-red" :
                      "bg-primary-yellow/20 text-primary-yellow"
                    )}>
                      {progress.phase === 'uploading' ? 'Carregando' :
                       progress.phase === 'validating' ? 'Validando' :
                       progress.phase === 'processing' ? 'Processando' :
                       progress.phase === 'inserting' ? 'Inserindo' :
                       progress.phase === 'completed' ? 'Concluído' :
                       progress.phase === 'error' ? 'Erro' : 'Processando'}
                    </Badge>
                  </div>
                  <Progress 
                    value={getProgressPercentage()} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-400">
                    {progress.current} de {progress.total}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Conteúdo por Step */}
          <Tabs value={currentStep} className="w-full">
            
            {/* Step 1: Upload */}
            <TabsContent value="upload" className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="text-gray-100">1. Selecionar Arquivo CSV</CardTitle>
                </CardHeader>
                <CardContent>
                  
                  {/* Zona de Upload */}
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                      dragActive || isUploading 
                        ? "border-primary-yellow bg-primary-yellow/10" 
                        : "border-gray-600 hover:border-gray-500"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.csv';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleFileSelect(file);
                      };
                      input.click();
                    }}
                  >
                    <Upload className={cn(
                      "h-12 w-12 mx-auto mb-4",
                      dragActive ? "text-primary-yellow" : "text-gray-400"
                    )} />
                    <h3 className="text-lg font-medium text-gray-200 mb-2">
                      {isUploading ? 'Carregando arquivo...' : 'Arraste seu arquivo CSV aqui'}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      ou clique para selecionar um arquivo
                    </p>
                    <p className="text-xs text-gray-500">
                      Formatos aceitos: .csv (máximo 5MB)
                    </p>
                  </div>
                  
                  {/* Instruções */}
                  <Alert className="mt-4 border-blue-500/50 bg-blue-500/10">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-500">
                      <strong>Formato esperado:</strong> O CSV deve conter as colunas: Nome do Produto, Volume, Categoria, Venda em (un/pct), Estoque Atual, Fornecedor, Preço de Custo, Preço de Venda Atual (un.), Margem de Lucro (un.), Preço de Venda Atual (pct), Margem de Lucro (pct), Giro (Vende Rápido/Devagar).
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Step 2: Preview */}
            <TabsContent value="preview" className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-100">
                    <span>2. Prévia dos Dados</span>
                    {parseResult?.isValid && (
                      <Button
                        onClick={handleStartImport}
                        disabled={isImporting}
                        className="bg-accent-green text-white hover:bg-accent-green/90"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Importação
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CsvPreviewTable 
                    preview={preview} 
                    isLoading={isValidating} 
                  />
                  
                  {/* Erros de validação */}
                  {parseResult && !parseResult.isValid && (
                    <Alert className="mt-4 border-accent-red/50 bg-accent-red/10">
                      <AlertTriangle className="h-4 w-4 text-accent-red" />
                      <AlertDescription className="text-accent-red">
                        <strong>Arquivo inválido:</strong>
                        <ul className="mt-2 space-y-1">
                          {parseResult.errors.slice(0, 5).map((error, index) => (
                            <li key={index} className="text-sm">• {error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Step 3: Import Progress */}
            <TabsContent value="import" className="space-y-4">
              <Card className="bg-gray-800/50 border-primary-yellow/30">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primary-yellow border-t-transparent rounded-full mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-200 mb-2">
                      Importando produtos...
                    </h3>
                    <p className="text-gray-400">
                      Por favor, aguarde enquanto os produtos são processados e inseridos no banco de dados.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Step 4: Results */}
            <TabsContent value="results">
              <ImportResultsReport
                result={importResult}
                onReset={handleReset}
                onExportReport={() => {
                  // TODO: Implementar exportação do relatório
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Footer Actions */}
        <div className="flex justify-between pt-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={handleClose}
            className="bg-transparent border-white/30 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-2" />
            {currentStep === 'results' ? 'Fechar' : 'Cancelar'}
          </Button>
          
          {currentStep === 'preview' && parseResult?.isValid && (
            <Button
              onClick={handleStartImport}
              disabled={isImporting}
              className="bg-accent-green text-white hover:bg-accent-green/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Confirmar Importação
            </Button>
          )}
        </div>
    </BaseModal>
  );
};