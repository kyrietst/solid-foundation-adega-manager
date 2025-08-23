/**
 * Hook para importação de CSV de produtos
 * Gerencia processo completo de upload, validação e inserção
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/core/api/supabase/client';
import { 
  parseCsvText, 
  generateCsvPreview, 
  convertCsvDataToProducts,
  validateCsvFile,
  readCsvFile 
} from '../utils/csvParser';
import type { CsvParseResult, CsvImportPreview } from '../utils/csvParser';

export interface ImportProgress {
  phase: 'uploading' | 'validating' | 'processing' | 'inserting' | 'completed' | 'error';
  current: number;
  total: number;
  message: string;
}

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  warnings: string[];
  insertedProducts: any[];
}

export interface UseCsvImportReturn {
  // Estados
  isUploading: boolean;
  isValidating: boolean;
  isImporting: boolean;
  progress: ImportProgress | null;
  preview: CsvImportPreview | null;
  parseResult: CsvParseResult | null;
  importResult: ImportResult | null;
  
  // Funções
  uploadFile: (file: File) => Promise<void>;
  generatePreview: (file: File) => Promise<void>;
  startImport: () => Promise<void>;
  resetImport: () => void;
}

/**
 * Hook principal para importação CSV
 */
export const useCsvImport = (): UseCsvImportReturn => {
  const queryClient = useQueryClient();
  
  // Estados locais
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // Mutation para inserção dos produtos
  const importMutation = useMutation({
    mutationFn: async (products: any[]) => {
      const results: ImportResult = {
        success: true,
        totalProcessed: products.length,
        successCount: 0,
        errorCount: 0,
        errors: [],
        warnings: [],
        insertedProducts: []
      };
      
      // Inserir produtos em lotes para melhor performance
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < products.length; i += batchSize) {
        batches.push(products.slice(i, i + batchSize));
      }
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        // Atualizar progresso
        setProgress({
          phase: 'inserting',
          current: batchIndex * batchSize,
          total: products.length,
          message: `Inserindo lote ${batchIndex + 1} de ${batches.length}...`
        });
        
        try {
          // Inserir lote no banco
          const { data, error } = await supabase
            .from('products')
            .insert(batch)
            .select('*');
          
          if (error) {
            results.errors.push(`Erro no lote ${batchIndex + 1}: ${error.message}`);
            results.errorCount += batch.length;
          } else {
            results.successCount += batch.length;
            results.insertedProducts.push(...(data || []));
          }
          
        } catch (error) {
          results.errors.push(`Erro no lote ${batchIndex + 1}: ${error}`);
          results.errorCount += batch.length;
        }
      }
      
      results.success = results.errorCount === 0;
      return results;
    },
    onSuccess: (result) => {
      setImportResult(result);
      setProgress({
        phase: 'completed',
        current: result.totalProcessed,
        total: result.totalProcessed,
        message: `Importação concluída: ${result.successCount} sucessos, ${result.errorCount} erros`
      });
      
      // Invalidar cache dos produtos
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Toast de sucesso
      if (result.success) {
        toast.success(`${result.successCount} produtos importados com sucesso!`);
      } else {
        toast.warning(`Importação parcial: ${result.successCount} sucessos, ${result.errorCount} erros`);
      }
    },
    onError: (error) => {
      setProgress({
        phase: 'error',
        current: 0,
        total: 0,
        message: `Erro na importação: ${error}`
      });
      
      setImportResult({
        success: false,
        totalProcessed: 0,
        successCount: 0,
        errorCount: 0,
        errors: [String(error)],
        warnings: [],
        insertedProducts: []
      });
      
      toast.error('Erro durante a importação');
    }
  });
  
  /**
   * Upload e validação inicial do arquivo
   */
  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setProgress({
      phase: 'uploading',
      current: 0,
      total: 100,
      message: 'Carregando arquivo...'
    });
    
    try {
      // Validar arquivo
      const fileValidation = validateCsvFile(file);
      if (!fileValidation.isValid) {
        throw new Error(fileValidation.errors.join(', '));
      }
      
      // Ler conteúdo do arquivo
      setProgress({
        phase: 'uploading',
        current: 50,
        total: 100,
        message: 'Lendo conteúdo do arquivo...'
      });
      
      const csvContent = await readCsvFile(file);
      
      // Parse inicial do CSV
      setProgress({
        phase: 'validating',
        current: 75,
        total: 100,
        message: 'Validando estrutura do CSV...'
      });
      
      const parseResult = await parseCsvText(csvContent);
      setParseResult(parseResult);
      
      if (!parseResult.isValid) {
        throw new Error(`Arquivo CSV inválido: ${parseResult.errors.join(', ')}`);
      }
      
      setProgress({
        phase: 'validating',
        current: 100,
        total: 100,
        message: `Arquivo validado: ${parseResult.statistics.validRows} linhas válidas`
      });
      
      toast.success('Arquivo carregado e validado com sucesso!');
      
    } catch (error) {
      setProgress({
        phase: 'error',
        current: 0,
        total: 100,
        message: `Erro: ${error}`
      });
      
      toast.error(`Erro ao carregar arquivo: ${error}`);
    } finally {
      setIsUploading(false);
    }
  }, []);
  
  /**
   * Gera preview dos dados para visualização
   */
  const generatePreview = useCallback(async (file: File) => {
    setIsValidating(true);
    
    try {
      const csvContent = await readCsvFile(file);
      const previewData = await generateCsvPreview(csvContent, 10);
      setPreview(previewData);
      
    } catch (error) {
      toast.error(`Erro ao gerar preview: ${error}`);
    } finally {
      setIsValidating(false);
    }
  }, []);
  
  /**
   * Inicia o processo de importação
   */
  const startImport = useCallback(async () => {
    if (!parseResult || !parseResult.isValid) {
      toast.error('Nenhum arquivo válido para importar');
      return;
    }
    
    try {
      setProgress({
        phase: 'processing',
        current: 0,
        total: parseResult.data.length,
        message: 'Preparando dados para importação...'
      });
      
      // Converter dados CSV para formato do banco
      const products = convertCsvDataToProducts(parseResult.data);
      
      // Validar se há categorias inexistentes
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
      
      setProgress({
        phase: 'processing',
        current: products.length / 2,
        total: products.length,
        message: 'Verificando categorias...'
      });
      
      // Verificar categorias existentes
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('name')
        .in('name', categories);
      
      const existingCategoryNames = existingCategories?.map(c => c.name) || [];
      const missingCategories = categories.filter(cat => !existingCategoryNames.includes(cat));
      
      if (missingCategories.length > 0) {
        const createMissing = confirm(
          `As seguintes categorias não existem e serão criadas:\n${missingCategories.join(', ')}\n\nContinuar?`
        );
        
        if (!createMissing) {
          setProgress(null);
          return;
        }
        
        // Criar categorias faltantes
        const newCategories = missingCategories.map(name => ({
          name,
          description: `Categoria criada automaticamente durante importação CSV`,
          color: '#6B7280',
          icon: 'Package',
          is_active: true
        }));
        
        await supabase.from('categories').insert(newCategories);
        toast.success(`${missingCategories.length} categorias criadas automaticamente`);
      }
      
      setProgress({
        phase: 'processing',
        current: products.length,
        total: products.length,
        message: 'Iniciando importação...'
      });
      
      // Executar importação
      await importMutation.mutateAsync(products);
      
    } catch (error) {
      setProgress({
        phase: 'error',
        current: 0,
        total: 0,
        message: `Erro: ${error}`
      });
      
      toast.error(`Erro durante importação: ${error}`);
    }
  }, [parseResult, importMutation]);
  
  /**
   * Reset do estado da importação
   */
  const resetImport = useCallback(() => {
    setProgress(null);
    setPreview(null);
    setParseResult(null);
    setImportResult(null);
  }, []);
  
  return {
    // Estados
    isUploading,
    isValidating,
    isImporting: importMutation.isPending,
    progress,
    preview,
    parseResult,
    importResult,
    
    // Funções
    uploadFile,
    generatePreview,
    startImport,
    resetImport
  };
};