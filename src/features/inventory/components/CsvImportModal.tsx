/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/**
 * Modal de Importação CSV
 * Interface completa para upload, validação e importação de produtos via CSV
 * Design: Tactical Stitch (Standardized)
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/shared/ui/primitives/button';
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
  Package,
  Database
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useCsvImport } from '../hooks/useCsvImport';
import { CsvPreviewTable } from './CsvPreviewTable';
import { ImportResultsReport } from './ImportResultsReport';
import { Dialog, DialogPortal, DialogOverlay } from '@/shared/ui/primitives/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";

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
  
  // Handler para seleção de arquivo
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setCurrentStep('preview');
    
    // Upload e validação
    await uploadFile(file);
    
    // Gerar preview
    await generatePreview(file);
  }, [uploadFile, generatePreview]);

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
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
          const StepIcon = step.icon;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2 relative z-10">
                 <div className={cn(
                   "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 shadow-lg",
                   isActive ? "bg-amber-500 border-amber-500 text-zinc-950 scale-110 shadow-amber-500/20" :
                   isCompleted ? "bg-emerald-500 border-emerald-500 text-zinc-950" :
                   "bg-zinc-900 border-zinc-700 text-zinc-600"
                 )}>
                   <StepIcon className="h-5 w-5" />
                 </div>
                 <span className={cn(
                    "text-[10px] uppercase font-bold tracking-widest absolute -bottom-6 w-20 text-center transition-colors",
                    isActive ? "text-amber-500" :
                    isCompleted ? "text-emerald-500" :
                    "text-zinc-600"
                 )}>
                    {step.label}
                 </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 max-w-[80px] h-0.5 mx-2 relative">
                   <div className="absolute inset-0 bg-zinc-800" />
                   <div className={cn(
                     "absolute inset-0 transition-all duration-500 origin-left",
                     isCompleted ? "bg-emerald-500 w-full" : "bg-zinc-800 w-0"
                   )} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
       <DialogPortal>
          <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
          <DialogPrimitive.Content 
             className={cn(
               "fixed left-[50%] top-[50%] z-50 flex flex-col w-full max-w-5xl translate-x-[-50%] translate-y-[-50%]",
               "bg-zinc-950 border border-white/5 shadow-2xl rounded-xl overflow-hidden duration-200",
               "data-[state=open]:animate-in data-[state=closed]:animate-out",
               "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
               "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
               "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
               "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
             )}
          >
             {/* HEADER */}
             <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md">
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-3">
                      <Database className="h-6 w-6 text-amber-500" />
                      <DialogPrimitive.Title className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                         IMPORTAÇÃO VIA CSV
                      </DialogPrimitive.Title>
                   </div>
                   <div className="flex items-center gap-2 ml-9">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                         Data Ingestion Pipeline
                      </span>
                   </div>
                </div>
                <button 
                   onClick={handleClose} 
                   className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                >
                   <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
                </button>
             </div>

             {/* CONTENT - SCROLLABLE */}
             <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20 max-h-[70vh]">
               <div className="space-y-8">
                  
                  {/* Indicador de Steps */}
                  {renderStepIndicator()}
                  
                  {/* Progress Bar Global */}
                  {progress && (
                    <div className="bg-zinc-900/50 border border-amber-500/20 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-200 font-medium text-sm flex items-center gap-2">
                               <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                               {progress.message}
                            </span>
                            <Badge className={cn(
                              "text-xs font-mono uppercase tracking-wider",
                              progress.phase === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                              progress.phase === 'error' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                              "bg-amber-500/10 text-amber-500 border-amber-500/20"
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
                            className="h-1.5 bg-zinc-800"
                            // indicatorClassName="bg-amber-500" 
                          />
                          <div className="text-[10px] text-zinc-500 font-mono text-right">
                            {progress.current} / {progress.total} PROCESSADOS
                          </div>
                        </div>
                    </div>
                  )}
                  
                  {/* Conteúdo por Step */}
                  <Tabs value={currentStep} className="w-full">
                    
                    {/* Step 1: Upload */}
                    <TabsContent value="upload" className="space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-left-2">
                       <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                             <Upload className="h-5 w-5 text-amber-500" />
                             1. Selecionar Arquivo CSV
                          </h3>
                          
                          {/* Zona de Upload */}
                          <div
                            className={cn(
                              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300",
                              dragActive || isUploading 
                                ? "border-amber-500 bg-amber-500/5" 
                                : "border-zinc-700 hover:border-zinc-500 hover:bg-white/5"
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
                            <div className={cn(
                               "h-20 w-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors",
                               dragActive ? "bg-amber-500/20" : "bg-zinc-800"
                            )}>
                               <Upload className={cn(
                                 "h-10 w-10 transition-colors",
                                 dragActive ? "text-amber-500" : "text-zinc-400"
                               )} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {isUploading ? 'Carregando arquivo...' : 'Arraste seu arquivo CSV aqui'}
                            </h3>
                            <p className="text-zinc-400 mb-6">
                              ou clique para selecionar um arquivo do seu computador
                            </p>
                            <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-500 font-mono">
                              Formatos aceitos: .csv (máx 5MB)
                            </span>
                          </div>
                          
                          {/* Instruções */}
                          <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 flex gap-3">
                            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-200">
                              <strong className="text-blue-400 block mb-1">Formato Esperado:</strong>
                              O CSV deve conter as colunas: Nome do Produto, Volume, Categoria, Venda em (un/pct), Estoque Atual, Fornecedor, Preço de Custo, Preço de Venda Atual (un.), Margem de Lucro (un.), Preço de Venda Atual (pct), Margem de Lucro (pct), Giro (Vende Rápido/Devagar).
                            </div>
                          </div>
                      </div>
                    </TabsContent>
                    
                    {/* Step 2: Preview */}
                    <TabsContent value="preview" className="space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-right-2">
                      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-lg font-bold text-white flex items-center gap-2">
                             <Eye className="h-5 w-5 text-amber-500" />
                             2. Prévia dos Dados
                           </h3>
                           {parseResult?.isValid && (
                             <Button
                               onClick={handleStartImport}
                               disabled={isImporting}
                               className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-full px-6 transition-transform active:scale-95"
                             >
                               <Play className="h-4 w-4 mr-2 fill-current" />
                               Iniciar Importação
                             </Button>
                           )}
                        </div>

                        <CsvPreviewTable 
                          preview={preview} 
                          isLoading={isValidating} 
                        />
                        
                        {/* Erros de validação */}
                        {parseResult && !parseResult.isValid && (
                          <div className="mt-6 p-4 rounded-lg bg-rose-500/5 border border-rose-500/10 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <strong className="text-rose-500 block mb-2">Arquivo inválido:</strong>
                              <ul className="space-y-1 text-rose-200/80">
                                {parseResult.errors.slice(0, 5).map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    {/* Step 3: Import Progress */}
                    <TabsContent value="import" className="space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-50">
                       <div className="bg-zinc-900/50 border border-amber-500/20 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                          <div className="relative">
                             <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
                             <div className="relative h-24 w-24 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin mb-8" />
                             <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+32px)] text-amber-500 h-8 w-8" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Importando Produtos
                          </h3>
                          <p className="text-zinc-400 max-w-sm">
                            O sistema está processando seu arquivo e sincronizando o banco de dados. Isso pode levar alguns instantes.
                          </p>
                       </div>
                    </TabsContent>
                    
                    {/* Step 4: Results */}
                    <TabsContent value="results" className="data-[state=active]:animate-in data-[state=active]:fade-in-50">
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
             </div>

             {/* Footer Actions */}
             <div className="border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-8 py-6 flex justify-between items-center sticky bottom-0 z-50">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="rounded-full px-6 text-zinc-400 hover:text-white hover:bg-white/5 gap-2"
                >
                  <X className="h-4 w-4" />
                  {currentStep === 'results' ? 'Fechar Relatório' : 'Cancelar'}
                </Button>
                
                {currentStep === 'preview' && parseResult?.isValid && (
                  <Button
                    onClick={handleStartImport}
                    disabled={isImporting}
                    className="rounded-full px-8 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all"
                  >
                    <Play className="h-4 w-4 mr-2 fill-current" />
                    CONFIRMAR IMPORTAÇÃO
                  </Button>
                )}
             </div>
          </DialogPrimitive.Content>
       </DialogPortal>
    </Dialog>
  );
};